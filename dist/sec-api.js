import { log } from 'apify';
// SEC requires User-Agent identification — reject without it
const USER_AGENT = 'SEC-EDGAR-Intelligence-MCP/1.0 (contact@red-cars.io)';
const BASE_DATA = 'https://data.sec.gov';
const BASE_EFTS = 'https://efts.sec.gov';
const RATE_LIMIT_DELAY = 110; // ms between requests = ~9 req/sec (SEC limit is 10)
const MAX_EXTRACT_CHARS = 500;
let lastRequestTime = 0;
async function throttledFetch(url) {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < RATE_LIMIT_DELAY) {
        await new Promise((r) => setTimeout(r, RATE_LIMIT_DELAY - elapsed));
    }
    lastRequestTime = Date.now();
    log.info(`SEC API request: ${url}`);
    const resp = await fetch(url, {
        headers: {
            'User-Agent': USER_AGENT,
            'Accept': 'application/json',
        },
    });
    if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`SEC API ${resp.status} for ${url}: ${text}`);
    }
    return resp;
}
// ─── CIK Resolution ──────────────────────────────────────────────────────────
/**
 * Resolve company name to CIK number.
 * Primary: efts.sec.gov/LATEST/search-index
 * Fallback: parse filings to find CIK
 */
export async function resolveCIK(companyName) {
    const encoded = encodeURIComponent(companyName.toUpperCase().trim());
    const url = `${BASE_EFTS}/LATEST/search-index?q=${encoded}`;
    const resp = await throttledFetch(url);
    const data = await resp.json();
    if (!data.results || data.results.length === 0) {
        throw new Error(`Company not found on SEC EDGAR: "${companyName}". Try exact name with Inc/Ltd/Corp suffix.`);
    }
    // Partial match via includes() is preferred; fallback to first result if no exact match
    const partialMatch = data.results.find((r) => r.name.toUpperCase() === companyName.toUpperCase() ||
        r.name.toUpperCase().includes(companyName.toUpperCase()));
    // Use partial match if found, otherwise fall back to first result
    const cikNum = partialMatch ? partialMatch.cik : data.results[0].cik;
    return String(cikNum).padStart(10, '0');
}
// ─── Company Submissions ──────────────────────────────────────────────────────
/**
 * Fetch company submissions JSON from data.sec.gov
 */
export async function getCompanySubmissions(cik) {
    const cikPadded = cik.padStart(10, '0');
    const url = `${BASE_DATA}/submissions/CIK${cikPadded}.json`;
    const resp = await throttledFetch(url);
    return resp.json();
}
// ─── CIK → Ticker ─────────────────────────────────────────────────────────────
/**
 * Extract ticker from company submissions
 */
export function extractTicker(submissions) {
    return submissions.ticker || '';
}
// ─── XBRL Financial Facts ─────────────────────────────────────────────────────
/**
 * Fetch and extract key XBRL financial facts
 */
export async function getXBRLFacts(cik) {
    const cikPadded = cik.padStart(10, '0');
    const url = `${BASE_DATA}/xbrl/companyfacts/CIK${cikPadded}.json`;
    const resp = await throttledFetch(url);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await resp.json();
    // Extract facts from usgaap namespace
    const facts = data?.facts?.['us-gaap'] || {};
    const extract = (tag) => {
        const fact = facts[tag];
        if (!fact)
            return undefined;
        const vals = fact?.units?.USD || fact?.units?.USD128 || [];
        if (!vals || vals.length === 0)
            return undefined;
        const latest = vals[vals.length - 1];
        return typeof latest === 'object' ? latest.i : latest;
    };
    return {
        entityName: data?.entityName || '',
        fiscalYear: data?.facts?.['us-gaap']?.['StatementPeriodFiscalYear']?.units?.FY?.[0]?.period || 0,
        revenue: extract('Revenues'),
        netIncome: extract('NetIncomeLoss'),
        totalAssets: extract('Assets'),
        cashAndEquivalents: extract('CashAndCashEquivalentsAtCarryingValue'),
    };
}
// ─── Build Filing List ─────────────────────────────────────────────────────────
/**
 * Extract recent filings filtered by form type and date range
 */
export function buildFilingList(submissions, opts) {
    const recent = submissions.filings.recent;
    const results = [];
    for (let i = 0; i < recent.accessionNumber.length; i++) {
        const form = recent.form[i];
        const date = recent.filingDate[i];
        // Filter by form type
        if (opts.formType && form !== opts.formType)
            continue;
        // Filter by date range
        if (opts.dateFrom && date < opts.dateFrom)
            continue;
        if (opts.dateTo && date > opts.dateTo)
            continue;
        const accession = recent.accessionNumber[i].replace(/-/g, '');
        const doc = recent.primaryDocument[i];
        const docUrl = `https://www.sec.gov/Archives/edgar/data/${submissions.cik}/${accession}/${doc}`;
        results.push({
            accession_number: recent.accessionNumber[i],
            form_type: form,
            filing_date: date,
            document_url: docUrl,
        });
        if (opts.maxResults && results.length >= opts.maxResults)
            break;
    }
    return results;
}
// ─── Material Events (8-K) ───────────────────────────────────────────────────
export function buildMaterialEvents(submissions, maxResults) {
    const recent = submissions.filings.recent;
    const events = [];
    for (let i = 0; i < recent.accessionNumber.length; i++) {
        if (recent.form[i] !== '8-K')
            continue;
        const accession = recent.accessionNumber[i];
        const accessionNoDashes = accession.replace(/-/g, '');
        const docUrl = `https://www.sec.gov/Archives/edgar/data/${submissions.cik}/${accessionNoDashes}/${recent.primaryDocument[i]}`;
        events.push({
            event_date: recent.filingDate[i],
            form_type: '8-K',
            event_description: `8-K filing ${accession}`,
            accession_number: accession,
            items: [],
            document_url: docUrl,
        });
        if (events.length >= maxResults)
            break;
    }
    return events;
}
// ─── Insider Trades (Form 4) ──────────────────────────────────────────────────
/**
 * Build filing metadata for Form 4 filings.
 * Full transaction details require parsing the XML document attached to each filing.
 * This returns the filing metadata needed to locate and fetch the XML.
 */
export function buildInsiderTrades(submissions, maxResults) {
    const recent = submissions.filings.recent;
    const trades = [];
    for (let i = 0; i < recent.accessionNumber.length; i++) {
        if (recent.form[i] !== '4')
            continue;
        const accession = recent.accessionNumber[i];
        const accessionNoDashes = accession.replace(/-/g, '');
        const docUrl = `https://www.sec.gov/Archives/edgar/data/${submissions.cik}/${accessionNoDashes}/${recent.primaryDocument[i]}`;
        trades.push({
            filing_date: recent.filingDate[i],
            owner_name: docUrl, // document URL is the best proxy for now
            owner_title: accession, // accession number as a reference
            transaction_type: recent.form[i],
            securities_owned: 0, // requires XML parsing
            transaction_shares: 0, // requires XML parsing
            price_per_share: '', // requires XML parsing
            total_value: '', // requires XML parsing
            direct_indirect: 'D',
            footnote: null,
        });
        if (trades.length >= maxResults)
            break;
    }
    return trades;
}
// ─── 10-K Extraction (simplified HTML parse) ─────────────────────────────────
/**
 * Fetch and parse 10-K for business description + risk factors.
 * Note: Full HTML parsing of SEC documents requires Cheerio.
 * For MVP: return XBRL facts + first 500 chars of business description placeholder.
 * TODO: Use Cheerio to parse actual 10-K HTML for rich text extraction.
 */
export async function get10KContent(cik, accessionNumber, primaryDocument) {
    const accessionNoDashes = accessionNumber.replace(/-/g, '');
    const url = `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNoDashes}/${primaryDocument}`;
    try {
        const resp = await throttledFetch(url);
        const html = await resp.text();
        // Basic extraction — in production would use Cheerio
        const businessDescMatch = html.match(/<desc>(.*?)<\/desc>/si);
        const businessDescription = businessDescMatch
            ? businessDescMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, MAX_EXTRACT_CHARS)
            : '(Business description extraction requires full HTML parsing — using XBRL fallback)';
        // Risk factors: look for <item>Risk Factors</item> section
        const riskMatch = html.match(/Item[^\d]*1[^\d]*Risk Factors(.*?)(Item[^\d]*2|<\/document)/si);
        const risk_factors = riskMatch
            ? [riskMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, MAX_EXTRACT_CHARS)]
            : ['(Risk factor extraction requires full HTML parsing)'];
        return {
            business_description: businessDescription,
            risk_factors,
            xbrl_confirmed: true,
        };
    }
    catch {
        return {
            business_description: '(Unable to fetch 10-K document)',
            risk_factors: [],
            xbrl_confirmed: false,
        };
    }
}
//# sourceMappingURL=sec-api.js.map
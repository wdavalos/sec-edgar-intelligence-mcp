import { Actor } from 'apify';
import {
    resolveCIK,
    getCompanySubmissions,
    extractTicker,
    getXBRLFacts,
    buildFilingList,
    buildMaterialEvents,
    buildInsiderTrades,
    get10KContent,
} from './sec-api.js';

const { charge } = Actor;

const TOOL_PRICES: Record<string, number> = {
    search_company_filings: 0.05,
    get_10k_annual_report: 0.10,
    get_10q_quarterly_report: 0.08,
    get_8k_material_events: 0.08,
    get_insider_trades: 0.12,
    get_company_info: 0.05,
};

async function chargePPE(toolName: string): Promise<void> {
    const price = TOOL_PRICES[toolName];
    if (!price) return;
    try {
        await Actor.charge({ eventName: toolName });
    } catch (err) {
        console.error(`[ppe] charge failed for ${toolName}:`, err);
    }
}

// ─── search_company_filings ──────────────────────────────────────────────────

export async function searchCompanyFilings(params: { company_name: string; form_type?: string; date_from?: string; date_to?: string; max_results?: number }) {
    await chargePPE('search_company_filings');
    const cik = await resolveCIK(params.company_name);
    const submissions = await getCompanySubmissions(cik);
    const ticker = extractTicker(submissions);

    const filings = buildFilingList(submissions, {
        formType: params.form_type,
        dateFrom: params.date_from,
        dateTo: params.date_to,
        maxResults: params.max_results ?? 25,
    });

    return {
        query: { company_name: params.company_name, form_type: params.form_type, date_from: params.date_from, date_to: params.date_to },
        total_filings: filings.length,
        filings,
        ticker,
        source: 'SEC EDGAR',
    };
}

// ─── get_10k_annual_report ───────────────────────────────────────────────────

export async function get10KAnnualReport(params: { company_name: string; year?: number }) {
    await chargePPE('get_10k_annual_report');
    const cik = await resolveCIK(params.company_name);
    const submissions = await getCompanySubmissions(cik);
    const ticker = extractTicker(submissions);

    // Find most recent 10-K (optionally filtered by year)
    const recent = submissions.filings.recent;
    let targetIdx = -1;
    for (let i = 0; i < recent.form.length; i++) {
        if (recent.form[i] !== '10-K') continue;
        if (params.year) {
            const filingYear = recent.filingDate[i].substring(0, 4);
            if (parseInt(filingYear) !== params.year) continue;
        }
        targetIdx = i;
        if (!params.year) break; // first 10-K is most recent if no year filter
    }

    if (targetIdx === -1) {
        return { status: 'error', error: `No 10-K filings found for ${params.company_name}${params.year ? ` in ${params.year}` : ''}` };
    }

    const accessionNumber = recent.accessionNumber[targetIdx];
    const filingDate = recent.filingDate[targetIdx];
    const primaryDocument = recent.primaryDocument[targetIdx];
    const content = await get10KContent(String(submissions.cik), accessionNumber, primaryDocument);
    const xbrl = await getXBRLFacts(String(submissions.cik));

    return {
        company_name: submissions.name,
        ticker,
        fiscal_year: filingDate.substring(0, 4),
        filing_date: filingDate,
        accession_number: accessionNumber,
        business_description: content.business_description,
        risk_factors: content.risk_factors,
        financial_highlights: {
            total_revenue: xbrl.revenue,
            net_income: xbrl.netIncome,
            total_assets: xbrl.totalAssets,
            cash_and_equivalents: xbrl.cashAndEquivalents,
        },
        xbrl_confirmed: content.xbrl_confirmed,
        source: 'SEC EDGAR',
    };
}

// ─── get_10q_quarterly_report ─────────────────────────────────────────────────

export async function get10QQuarterlyReport(params: { company_name: string; quarter?: string; year?: number }) {
    await chargePPE('get_10q_quarterly_report');
    const cik = await resolveCIK(params.company_name);
    const submissions = await getCompanySubmissions(cik);
    const ticker = extractTicker(submissions);

    // Find most recent 10-Q
    const recent = submissions.filings.recent;
    let targetIdx = -1;
    for (let i = 0; i < recent.form.length; i++) {
        if (!recent.form[i].startsWith('10-Q')) continue;
        if (params.year && !recent.filingDate[i].startsWith(String(params.year))) continue;
        targetIdx = i;
        if (!params.year) break;
    }

    if (targetIdx === -1) {
        return { status: 'error', error: `No 10-Q filings found for ${params.company_name}${params.year ? ` in ${params.year}` : ''}` };
    }

    const filingDate = recent.filingDate[targetIdx];
    const xbrl = await getXBRLFacts(String(submissions.cik));

    return {
        company_name: submissions.name,
        ticker,
        period: `${params.quarter || 'Recent'} ${filingDate.substring(0, 4)}`,
        filing_date: filingDate,
        financial_highlights: {
            revenue: xbrl.revenue,
            net_income: xbrl.netIncome,
        },
        source: 'SEC EDGAR',
    };
}

// ─── get_8k_material_events ──────────────────────────────────────────────────

export async function get8KMaterialEvents(params: { company_name: string; max_results?: number }) {
    await chargePPE('get_8k_material_events');
    const cik = await resolveCIK(params.company_name);
    const submissions = await getCompanySubmissions(cik);
    const ticker = extractTicker(submissions);

    const events = buildMaterialEvents(submissions, params.max_results ?? 10);

    return {
        company_name: submissions.name,
        ticker,
        events,
        total_events: events.length,
        source: 'SEC EDGAR',
    };
}

// ─── get_insider_trades ───────────────────────────────────────────────────────

export async function getInsiderTrades(params: { company_name: string; max_results?: number }) {
    await chargePPE('get_insider_trades');
    const cik = await resolveCIK(params.company_name);
    const submissions = await getCompanySubmissions(cik);
    const ticker = extractTicker(submissions);

    const trades = buildInsiderTrades(submissions, params.max_results ?? 20);

    return {
        company_name: submissions.name,
        ticker,
        cik: String(submissions.cik),
        trades,
        total_trades: trades.length,
        source: 'SEC EDGAR',
    };
}

// ─── get_company_info ─────────────────────────────────────────────────────────

export async function getCompanyInfo(params: { company_name: string }) {
    await chargePPE('get_company_info');
    const cik = await resolveCIK(params.company_name);
    const submissions = await getCompanySubmissions(cik);
    const ticker = extractTicker(submissions);

    // Count form types
    const recent = submissions.filings.recent;
    const counts = { tenK_count: 0, tenQ_count: 0, eightK_count: 0, four_count: 0 };
    for (const form of recent.form) {
        if (form === '10-K') counts.tenK_count++;
        else if (form.startsWith('10-Q')) counts.tenQ_count++;
        else if (form === '8-K') counts.eightK_count++;
        else if (form === '4') counts.four_count++;
    }

    // Get XBRL business description
    const xbrl = await getXBRLFacts(String(submissions.cik));

    return {
        company_name: submissions.name,
        ticker,
        cik: String(submissions.cik),
        sic: (submissions as any).sic || '',
        sic_description: (submissions as any).sicDescription || '',
        state_of_incorporation: (submissions as any).stateOfIncorporation || '',
        fiscal_year_end: (submissions as any).fiscalYearEnd || '',
        filing_history: counts,
        business_description: xbrl.entityName ? `Entity: ${xbrl.entityName}` : '(Business description from XBRL)',
        source: 'SEC EDGAR',
    };
}

// ─── Dispatcher ────────────────────────────────────────────────────────────────

export async function handleTool(toolName: string, args: Record<string, unknown>) {
    switch (toolName) {
        case 'search_company_filings':
            return searchCompanyFilings(args as Parameters<typeof searchCompanyFilings>[0]);
        case 'get_10k_annual_report':
            return get10KAnnualReport(args as Parameters<typeof get10KAnnualReport>[0]);
        case 'get_10q_quarterly_report':
            return get10QQuarterlyReport(args as Parameters<typeof get10QQuarterlyReport>[0]);
        case 'get_8k_material_events':
            return get8KMaterialEvents(args as Parameters<typeof get8KMaterialEvents>[0]);
        case 'get_insider_trades':
            return getInsiderTrades(args as Parameters<typeof getInsiderTrades>[0]);
        case 'get_company_info':
            return getCompanyInfo(args as Parameters<typeof getCompanyInfo>[0]);
        default:
            throw new Error(`Unknown tool: ${toolName}`);
    }
}

import type { CompanySubmissions, FilingDocument, XBRLCompanyFacts, InsiderTrade, MaterialEvent } from './types.js';
/**
 * Resolve company name to CIK number.
 * Primary: efts.sec.gov/LATEST/search-index
 * Fallback: parse filings to find CIK
 */
export declare function resolveCIK(companyName: string): Promise<string>;
/**
 * Fetch company submissions JSON from data.sec.gov
 */
export declare function getCompanySubmissions(cik: string): Promise<CompanySubmissions>;
/**
 * Extract ticker from company submissions
 */
export declare function extractTicker(submissions: CompanySubmissions): string;
/**
 * Fetch and extract key XBRL financial facts
 */
export declare function getXBRLFacts(cik: string): Promise<XBRLCompanyFacts>;
/**
 * Extract recent filings filtered by form type and date range
 */
export declare function buildFilingList(submissions: CompanySubmissions, opts: {
    formType?: string;
    dateFrom?: string;
    dateTo?: string;
    maxResults?: number;
}): FilingDocument[];
export declare function buildMaterialEvents(submissions: CompanySubmissions, maxResults: number): MaterialEvent[];
/**
 * Build filing metadata for Form 4 filings.
 * Full transaction details require parsing the XML document attached to each filing.
 * This returns the filing metadata needed to locate and fetch the XML.
 */
export declare function buildInsiderTrades(submissions: CompanySubmissions, maxResults: number): InsiderTrade[];
/**
 * Fetch and parse 10-K for business description + risk factors.
 * Note: Full HTML parsing of SEC documents requires Cheerio.
 * For MVP: return XBRL facts + first 500 chars of business description placeholder.
 * TODO: Use Cheerio to parse actual 10-K HTML for rich text extraction.
 */
export declare function get10KContent(cik: string, accessionNumber: string, primaryDocument: string): Promise<{
    business_description: string;
    risk_factors: string[];
    xbrl_confirmed: boolean;
}>;
//# sourceMappingURL=sec-api.d.ts.map
export declare function searchCompanyFilings(params: {
    company_name: string;
    form_type?: string;
    date_from?: string;
    date_to?: string;
    max_results?: number;
}): Promise<{
    query: {
        company_name: string;
        form_type: string | undefined;
        date_from: string | undefined;
        date_to: string | undefined;
    };
    total_filings: number;
    filings: import("./types.js").FilingDocument[];
    ticker: string;
    source: string;
}>;
export declare function get10KAnnualReport(params: {
    company_name: string;
    year?: number;
}): Promise<{
    status: string;
    error: string;
    company_name?: undefined;
    ticker?: undefined;
    fiscal_year?: undefined;
    filing_date?: undefined;
    accession_number?: undefined;
    business_description?: undefined;
    risk_factors?: undefined;
    financial_highlights?: undefined;
    xbrl_confirmed?: undefined;
    source?: undefined;
} | {
    company_name: string;
    ticker: string;
    fiscal_year: string;
    filing_date: string;
    accession_number: string;
    business_description: string;
    risk_factors: string[];
    financial_highlights: {
        total_revenue: string | undefined;
        net_income: string | undefined;
        total_assets: string | undefined;
        cash_and_equivalents: string | undefined;
    };
    xbrl_confirmed: boolean;
    source: string;
    status?: undefined;
    error?: undefined;
}>;
export declare function get10QQuarterlyReport(params: {
    company_name: string;
    quarter?: string;
    year?: number;
}): Promise<{
    status: string;
    error: string;
    company_name?: undefined;
    ticker?: undefined;
    period?: undefined;
    filing_date?: undefined;
    financial_highlights?: undefined;
    source?: undefined;
} | {
    company_name: string;
    ticker: string;
    period: string;
    filing_date: string;
    financial_highlights: {
        revenue: string | undefined;
        net_income: string | undefined;
    };
    source: string;
    status?: undefined;
    error?: undefined;
}>;
export declare function get8KMaterialEvents(params: {
    company_name: string;
    max_results?: number;
}): Promise<{
    company_name: string;
    ticker: string;
    events: import("./types.js").MaterialEvent[];
    total_events: number;
    source: string;
}>;
export declare function getInsiderTrades(params: {
    company_name: string;
    max_results?: number;
}): Promise<{
    company_name: string;
    ticker: string;
    cik: string;
    trades: import("./types.js").InsiderTrade[];
    total_trades: number;
    source: string;
}>;
export declare function getCompanyInfo(params: {
    company_name: string;
}): Promise<{
    company_name: string;
    ticker: string;
    cik: string;
    sic: string;
    sic_description: string;
    state_of_incorporation: string;
    fiscal_year_end: string;
    filing_history: {
        tenK_count: number;
        tenQ_count: number;
        eightK_count: number;
        four_count: number;
    };
    business_description: string;
    source: string;
}>;
export declare function handleTool(toolName: string, args: Record<string, unknown>): Promise<{
    query: {
        company_name: string;
        form_type: string | undefined;
        date_from: string | undefined;
        date_to: string | undefined;
    };
    total_filings: number;
    filings: import("./types.js").FilingDocument[];
    ticker: string;
    source: string;
} | {
    status: string;
    error: string;
    company_name?: undefined;
    ticker?: undefined;
    fiscal_year?: undefined;
    filing_date?: undefined;
    accession_number?: undefined;
    business_description?: undefined;
    risk_factors?: undefined;
    financial_highlights?: undefined;
    xbrl_confirmed?: undefined;
    source?: undefined;
} | {
    company_name: string;
    ticker: string;
    fiscal_year: string;
    filing_date: string;
    accession_number: string;
    business_description: string;
    risk_factors: string[];
    financial_highlights: {
        total_revenue: string | undefined;
        net_income: string | undefined;
        total_assets: string | undefined;
        cash_and_equivalents: string | undefined;
    };
    xbrl_confirmed: boolean;
    source: string;
    status?: undefined;
    error?: undefined;
} | {
    status: string;
    error: string;
    company_name?: undefined;
    ticker?: undefined;
    period?: undefined;
    filing_date?: undefined;
    financial_highlights?: undefined;
    source?: undefined;
} | {
    company_name: string;
    ticker: string;
    period: string;
    filing_date: string;
    financial_highlights: {
        revenue: string | undefined;
        net_income: string | undefined;
    };
    source: string;
    status?: undefined;
    error?: undefined;
} | {
    company_name: string;
    ticker: string;
    events: import("./types.js").MaterialEvent[];
    total_events: number;
    source: string;
} | {
    company_name: string;
    ticker: string;
    cik: string;
    trades: import("./types.js").InsiderTrade[];
    total_trades: number;
    source: string;
} | {
    company_name: string;
    ticker: string;
    cik: string;
    sic: string;
    sic_description: string;
    state_of_incorporation: string;
    fiscal_year_end: string;
    filing_history: {
        tenK_count: number;
        tenQ_count: number;
        eightK_count: number;
        four_count: number;
    };
    business_description: string;
    source: string;
}>;
//# sourceMappingURL=tool-handlers.d.ts.map
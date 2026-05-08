// SEC EDGAR API response types

export interface CompanySubmissions {
    cik: number;
    name: string;
    ticker: string;
    filings: {
        recent: {
            accessionNumber: string[];
            filingDate: string[];
            form: string[];
            primaryDocument: string[];
        };
    };
}

export interface FilingDocument {
    accession_number: string;
    form_type: string;
    filing_date: string;
    document_url: string;
    description?: string;
}

export interface XBRLCompanyFacts {
    entityName: string;
    fiscalYear: number;
    revenue?: string;
    netIncome?: string;
    totalAssets?: string;
    cashAndEquivalents?: string;
}

export interface InsiderTrade {
    filing_date: string;
    owner_name: string;
    owner_title: string;
    transaction_type: string;
    securities_owned: number;
    transaction_shares: number;
    price_per_share: string;
    total_value: string;
    direct_indirect: 'D' | 'I';
    footnote: string | null;
}

export interface MaterialEvent {
    event_date: string;
    form_type: string;
    event_description: string;
    accession_number: string;
    items: string[];
    document_url: string;
}

export interface CompanyInfo {
    name: string;
    ticker: string;
    cik: string;
    sic: string;
    sic_description: string;
    state_of_incorporation: string;
    fiscal_year_end: string;
    business_description: string;
}

export interface ToolParams {
    company_name: string;
    form_type?: string;
    date_from?: string;
    date_to?: string;
    max_results?: number;
    year?: number;
    quarter?: string;
}

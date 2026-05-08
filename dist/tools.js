export const TOOLS = [
    {
        name: 'search_company_filings',
        description: 'Search SEC EDGAR for company filings by form type and date range. Returns accession numbers, filing dates, and document URLs.',
        input_schema: {
            type: 'object',
            properties: {
                company_name: { type: 'string', description: 'Company name (e.g., "Apple" or "APPLE INC")', required: true },
                form_type: { type: 'string', description: 'Filter by form type: "10-K", "10-Q", "8-K", "4"', enum: ["10-K", "10-Q", "8-K", "4", "S-1", "S-3"] },
                date_from: { type: 'string', description: 'Start date YYYYMMDD' },
                date_to: { type: 'string', description: 'End date YYYYMMDD' },
                max_results: { type: 'integer', description: 'Maximum results (default: 25)', default: 25 }
            },
            required: ['company_name']
        },
        output_schema: {
            type: 'object',
            properties: {
                query: {
                    type: 'object',
                    properties: {
                        company_name: { type: 'string' },
                        form_type: { type: 'string' },
                        date_from: { type: 'string' },
                        date_to: { type: 'string' },
                        max_results: { type: 'integer' }
                    }
                },
                total_filings: { type: 'integer' },
                filings: { type: 'array', items: { type: 'object', properties: { accession_number: { type: 'string' }, form_type: { type: 'string' }, filing_date: { type: 'string' }, document_url: { type: 'string' } } } },
                source: { type: 'string' }
            }
        },
        price: 0.05
    },
    {
        name: 'get_10k_annual_report',
        description: 'Extract full 10-K annual report data including financial highlights from XBRL, business description, and risk factors.',
        input_schema: {
            type: 'object',
            properties: {
                company_name: { type: 'string', description: 'Company name', required: true },
                year: { type: 'integer', description: 'Fiscal year (default: most recent)' }
            },
            required: ['company_name']
        },
        output_schema: {
            type: 'object',
            properties: {
                company_name: { type: 'string' },
                ticker: { type: 'string' },
                fiscal_year: { type: 'string' },
                filing_date: { type: 'string' },
                accession_number: { type: 'string' },
                business_description: { type: 'string' },
                risk_factors: { type: 'array', items: { type: 'string' } },
                financial_highlights: { type: 'object', properties: { revenue: { type: 'string' }, net_income: { type: 'string' } } },
                xbrl_confirmed: { type: 'boolean' },
                source: { type: 'string' }
            }
        },
        price: 0.10
    },
    {
        name: 'get_10q_quarterly_report',
        description: 'Extract 10-Q quarterly report data including financial highlights from XBRL.',
        input_schema: {
            type: 'object',
            properties: {
                company_name: { type: 'string', description: 'Company name', required: true },
                quarter: { type: 'string', description: '"Q1", "Q2", "Q3", "Q4" (default: most recent)', enum: ["Q1", "Q2", "Q3", "Q4"] },
                year: { type: 'integer', description: 'Fiscal year (default: most recent)' }
            },
            required: ['company_name']
        },
        output_schema: {
            type: 'object',
            properties: {
                company_name: { type: 'string' },
                ticker: { type: 'string' },
                period: { type: 'string' },
                filing_date: { type: 'string' },
                financial_highlights: { type: 'object', properties: { revenue: { type: 'string' }, net_income: { type: 'string' } } },
                source: { type: 'string' }
            }
        },
        price: 0.08
    },
    {
        name: 'get_8k_material_events',
        description: 'Get 8-K material event filings — earnings releases, leadership changes, M&A activity, and other triggering events.',
        input_schema: {
            type: 'object',
            properties: {
                company_name: { type: 'string', description: 'Company name', required: true },
                max_results: { type: 'integer', description: 'Maximum results (default: 10)', default: 10 }
            },
            required: ['company_name']
        },
        output_schema: {
            type: 'object',
            properties: {
                company_name: { type: 'string' },
                ticker: { type: 'string' },
                events: { type: 'array', items: { type: 'object', properties: { event_date: { type: 'string' }, form_type: { type: 'string' }, event_description: { type: 'string' }, accession_number: { type: 'string' }, document_url: { type: 'string' } } } },
                total_events: { type: 'integer' },
                source: { type: 'string' }
            }
        },
        price: 0.08
    },
    {
        name: 'get_insider_trades',
        description: 'Get Form 4 insider trading history — executive purchases and sales, ownership changes.',
        input_schema: {
            type: 'object',
            properties: {
                company_name: { type: 'string', description: 'Company name', required: true },
                max_results: { type: 'integer', description: 'Maximum results (default: 20)', default: 20 }
            },
            required: ['company_name']
        },
        output_schema: {
            type: 'object',
            properties: {
                company_name: { type: 'string' },
                ticker: { type: 'string' },
                cik: { type: 'string' },
                trades: { type: 'array', items: { type: 'object', properties: { filing_date: { type: 'string' }, accession_number: { type: 'string' }, document_url: { type: 'string' }, form_type: { type: 'string' } } } },
                total_trades: { type: 'integer' },
                source: { type: 'string' }
            }
        },
        price: 0.12
    },
    {
        name: 'get_company_info',
        description: 'Get SEC EDGAR company info: CIK, SIC description, state of incorporation, fiscal year end, filing history counts, and business description.',
        input_schema: {
            type: 'object',
            properties: {
                company_name: { type: 'string', description: 'Company name', required: true }
            },
            required: ['company_name']
        },
        output_schema: {
            type: 'object',
            properties: {
                company_name: { type: 'string' },
                ticker: { type: 'string' },
                cik: { type: 'string' },
                sic: { type: 'string' },
                sic_description: { type: 'string' },
                state_of_incorporation: { type: 'string' },
                fiscal_year_end: { type: 'string' },
                filing_history: { type: 'object' },
                business_description: { type: 'string' },
                source: { type: 'string' }
            }
        },
        price: 0.05
    }
];
//# sourceMappingURL=tools.js.map
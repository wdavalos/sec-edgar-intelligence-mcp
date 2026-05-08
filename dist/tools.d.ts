export declare const TOOLS: readonly [{
    readonly name: "search_company_filings";
    readonly description: "Search SEC EDGAR for company filings by form type and date range. Returns accession numbers, filing dates, and document URLs.";
    readonly input_schema: {
        readonly type: "object";
        readonly properties: {
            readonly company_name: {
                readonly type: "string";
                readonly description: "Company name (e.g., \"Apple\" or \"APPLE INC\")";
                readonly required: true;
            };
            readonly form_type: {
                readonly type: "string";
                readonly description: "Filter by form type: \"10-K\", \"10-Q\", \"8-K\", \"4\"";
                readonly enum: readonly ["10-K", "10-Q", "8-K", "4", "S-1", "S-3"];
            };
            readonly date_from: {
                readonly type: "string";
                readonly description: "Start date YYYYMMDD";
            };
            readonly date_to: {
                readonly type: "string";
                readonly description: "End date YYYYMMDD";
            };
            readonly max_results: {
                readonly type: "integer";
                readonly description: "Maximum results (default: 25)";
                readonly default: 25;
            };
        };
        readonly required: readonly ["company_name"];
    };
    readonly output_schema: {
        readonly type: "object";
        readonly properties: {
            readonly query: {
                readonly type: "object";
                readonly properties: {
                    readonly company_name: {
                        readonly type: "string";
                    };
                    readonly form_type: {
                        readonly type: "string";
                    };
                    readonly date_from: {
                        readonly type: "string";
                    };
                    readonly date_to: {
                        readonly type: "string";
                    };
                    readonly max_results: {
                        readonly type: "integer";
                    };
                };
            };
            readonly total_filings: {
                readonly type: "integer";
            };
            readonly filings: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly accession_number: {
                            readonly type: "string";
                        };
                        readonly form_type: {
                            readonly type: "string";
                        };
                        readonly filing_date: {
                            readonly type: "string";
                        };
                        readonly document_url: {
                            readonly type: "string";
                        };
                    };
                };
            };
            readonly source: {
                readonly type: "string";
            };
        };
    };
    readonly price: 0.05;
}, {
    readonly name: "get_10k_annual_report";
    readonly description: "Extract full 10-K annual report data including financial highlights from XBRL, business description, and risk factors.";
    readonly input_schema: {
        readonly type: "object";
        readonly properties: {
            readonly company_name: {
                readonly type: "string";
                readonly description: "Company name";
                readonly required: true;
            };
            readonly year: {
                readonly type: "integer";
                readonly description: "Fiscal year (default: most recent)";
            };
        };
        readonly required: readonly ["company_name"];
    };
    readonly output_schema: {
        readonly type: "object";
        readonly properties: {
            readonly company_name: {
                readonly type: "string";
            };
            readonly ticker: {
                readonly type: "string";
            };
            readonly fiscal_year: {
                readonly type: "string";
            };
            readonly filing_date: {
                readonly type: "string";
            };
            readonly accession_number: {
                readonly type: "string";
            };
            readonly business_description: {
                readonly type: "string";
            };
            readonly risk_factors: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly financial_highlights: {
                readonly type: "object";
                readonly properties: {
                    readonly revenue: {
                        readonly type: "string";
                    };
                    readonly net_income: {
                        readonly type: "string";
                    };
                };
            };
            readonly xbrl_confirmed: {
                readonly type: "boolean";
            };
            readonly source: {
                readonly type: "string";
            };
        };
    };
    readonly price: 0.1;
}, {
    readonly name: "get_10q_quarterly_report";
    readonly description: "Extract 10-Q quarterly report data including financial highlights from XBRL.";
    readonly input_schema: {
        readonly type: "object";
        readonly properties: {
            readonly company_name: {
                readonly type: "string";
                readonly description: "Company name";
                readonly required: true;
            };
            readonly quarter: {
                readonly type: "string";
                readonly description: "\"Q1\", \"Q2\", \"Q3\", \"Q4\" (default: most recent)";
                readonly enum: readonly ["Q1", "Q2", "Q3", "Q4"];
            };
            readonly year: {
                readonly type: "integer";
                readonly description: "Fiscal year (default: most recent)";
            };
        };
        readonly required: readonly ["company_name"];
    };
    readonly output_schema: {
        readonly type: "object";
        readonly properties: {
            readonly company_name: {
                readonly type: "string";
            };
            readonly ticker: {
                readonly type: "string";
            };
            readonly period: {
                readonly type: "string";
            };
            readonly filing_date: {
                readonly type: "string";
            };
            readonly financial_highlights: {
                readonly type: "object";
                readonly properties: {
                    readonly revenue: {
                        readonly type: "string";
                    };
                    readonly net_income: {
                        readonly type: "string";
                    };
                };
            };
            readonly source: {
                readonly type: "string";
            };
        };
    };
    readonly price: 0.08;
}, {
    readonly name: "get_8k_material_events";
    readonly description: "Get 8-K material event filings — earnings releases, leadership changes, M&A activity, and other triggering events.";
    readonly input_schema: {
        readonly type: "object";
        readonly properties: {
            readonly company_name: {
                readonly type: "string";
                readonly description: "Company name";
                readonly required: true;
            };
            readonly max_results: {
                readonly type: "integer";
                readonly description: "Maximum results (default: 10)";
                readonly default: 10;
            };
        };
        readonly required: readonly ["company_name"];
    };
    readonly output_schema: {
        readonly type: "object";
        readonly properties: {
            readonly company_name: {
                readonly type: "string";
            };
            readonly ticker: {
                readonly type: "string";
            };
            readonly events: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly event_date: {
                            readonly type: "string";
                        };
                        readonly form_type: {
                            readonly type: "string";
                        };
                        readonly event_description: {
                            readonly type: "string";
                        };
                        readonly accession_number: {
                            readonly type: "string";
                        };
                        readonly document_url: {
                            readonly type: "string";
                        };
                    };
                };
            };
            readonly total_events: {
                readonly type: "integer";
            };
            readonly source: {
                readonly type: "string";
            };
        };
    };
    readonly price: 0.08;
}, {
    readonly name: "get_insider_trades";
    readonly description: "Get Form 4 insider trading history — executive purchases and sales, ownership changes.";
    readonly input_schema: {
        readonly type: "object";
        readonly properties: {
            readonly company_name: {
                readonly type: "string";
                readonly description: "Company name";
                readonly required: true;
            };
            readonly max_results: {
                readonly type: "integer";
                readonly description: "Maximum results (default: 20)";
                readonly default: 20;
            };
        };
        readonly required: readonly ["company_name"];
    };
    readonly output_schema: {
        readonly type: "object";
        readonly properties: {
            readonly company_name: {
                readonly type: "string";
            };
            readonly ticker: {
                readonly type: "string";
            };
            readonly cik: {
                readonly type: "string";
            };
            readonly trades: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly filing_date: {
                            readonly type: "string";
                        };
                        readonly accession_number: {
                            readonly type: "string";
                        };
                        readonly document_url: {
                            readonly type: "string";
                        };
                        readonly form_type: {
                            readonly type: "string";
                        };
                    };
                };
            };
            readonly total_trades: {
                readonly type: "integer";
            };
            readonly source: {
                readonly type: "string";
            };
        };
    };
    readonly price: 0.12;
}, {
    readonly name: "get_company_info";
    readonly description: "Get SEC EDGAR company info: CIK, SIC description, state of incorporation, fiscal year end, filing history counts, and business description.";
    readonly input_schema: {
        readonly type: "object";
        readonly properties: {
            readonly company_name: {
                readonly type: "string";
                readonly description: "Company name";
                readonly required: true;
            };
        };
        readonly required: readonly ["company_name"];
    };
    readonly output_schema: {
        readonly type: "object";
        readonly properties: {
            readonly company_name: {
                readonly type: "string";
            };
            readonly ticker: {
                readonly type: "string";
            };
            readonly cik: {
                readonly type: "string";
            };
            readonly sic: {
                readonly type: "string";
            };
            readonly sic_description: {
                readonly type: "string";
            };
            readonly state_of_incorporation: {
                readonly type: "string";
            };
            readonly fiscal_year_end: {
                readonly type: "string";
            };
            readonly filing_history: {
                readonly type: "object";
            };
            readonly business_description: {
                readonly type: "string";
            };
            readonly source: {
                readonly type: "string";
            };
        };
    };
    readonly price: 0.05;
}];
//# sourceMappingURL=tools.d.ts.map
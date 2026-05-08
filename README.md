# SEC EDGAR Intelligence MCP

> AI agent MCP server for SEC EDGAR corporate filings — 10-K annual reports, 10-Q quarterly filings, 8-K material events, Form 4 insider trades, and extracted XBRL financial data.

**MCP Endpoint:** https://sec-edgar-intelligence-mcp.apify.actor/mcp
**GitHub:** [red-cars-io/sec-edgar-intelligence-mcp](https://github.com/red-cars-io/sec-edgar-intelligence-mcp)
**No API key required.**

---

## What It Does

Give AI agents live access to SEC EDGAR corporate filings — the same data VCs, quant funds, and corporate development teams pay Bloomberg and Capital IQ thousands for. Extract 10-K risk factors, quarterly financials, insider trading history, and material events for any publicly traded US company. **No API key required.** SEC provides this data free.

Built on official `ts-standby` Apify template with standby mode for instant response.

---

## Why Use SEC EDGAR Intelligence MCP?

- **Due diligence at AI speed** — Full 10-K risk factor extraction + XBRL financials in seconds, not hours of manual SEC EDGAR navigation
- **Insider trade signals** — Form 4 filing history for any company executive's buying/selling patterns
- **Material event tracking** — Real-time 8-K filings for earnings releases, M&A activity, leadership changes
- **No credentials to manage** — SEC provides all data free; this MCP wraps it in LLM-ready JSON
- **Cross-sell with company-intelligence-mcp** — Use together for complete deal due diligence picture

---

## How to Use

### 1. Connect to your AI agent

Add this MCP server to Claude Desktop, Cursor, Windsurf, or any MCP-compatible client:

```json
{
  "mcpServers": {
    "sec-edgar-intelligence": {
      "url": "https://sec-edgar-intelligence-mcp.apify.actor/mcp"
    }
  }
}
```

### 2. Ask your agent

```
"Get me the latest 10-K risk factors and insider trading history for Apple"
```

### 3. Get structured financial data

Agent responds with structured JSON — no manual SEC EDGAR navigation required.

---

## Tools

### search_company_filings — $0.05
Search SEC EDGAR for company filings by form type and date range.

**Input:** `company_name` (required), `form_type`, `date_from`, `date_to`, `max_results`

```json
{
  "query": {
    "company_name": "Apple",
    "form_type": "10-K"
  },
  "total_filings": 24,
  "filings": [
    {
      "accession_number": "0000320193-24-000123",
      "form_type": "10-K",
      "filing_date": "2024-10-25",
      "document_url": "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/0000320193-24-000123-index.htm"
    }
  ],
  "ticker": "AAPL",
  "source": "SEC EDGAR"
}
```

### get_10k_annual_report — $0.10
Full 10-K annual report extraction: financial highlights from XBRL, business description, and risk factors.

**Input:** `company_name` (required), `year` (optional)

```json
{
  "company_name": "Apple Inc.",
  "ticker": "AAPL",
  "fiscal_year": "2024",
  "business_description": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide...",
  "risk_factors": [
    "The Company's competitive position depends on its ability to compete effectively in markets where... technology changes rapidly and competitors may introduce products or services that are more attractive..."
  ],
  "financial_highlights": {
    "total_revenue": "$391035000000",
    "net_income": "$97099000000",
    "total_assets": "$352583000000",
    "cash_and_equivalents": "$62004000000"
  },
  "xbrl_confirmed": true,
  "source": "SEC EDGAR"
}
```

### get_10q_quarterly_report — $0.08
10-Q quarterly report extraction with XBRL financial highlights.

**Input:** `company_name` (required), `quarter`, `year`

```json
{
  "company_name": "Apple Inc.",
  "ticker": "AAPL",
  "period": "Recent 2024",
  "filing_date": "2024-07-30",
  "financial_highlights": {
    "revenue": "$85777000000",
    "net_income": "$19328000000"
  },
  "source": "SEC EDGAR"
}
```

### get_8k_material_events — $0.08
8-K material event filings — earnings releases, leadership changes, M&A activity, and other triggering events.

**Input:** `company_name` (required), `max_results`

```json
{
  "company_name": "Apple Inc.",
  "ticker": "AAPL",
  "events": [
    {
      "event_date": "2024-11-01",
      "form_type": "8-K",
      "event_description": "8-K filing 0000320193-24-000456",
      "accession_number": "0000320193-24-000456",
      "document_url": "https://www.sec.gov/Archives/edgar/data/320193/000032019324000456/0000320193-24-000456-index.htm"
    }
  ],
  "total_events": 10,
  "source": "SEC EDGAR"
}
```

### get_insider_trades — $0.12
Form 4 insider trading history — executive purchases, sales, ownership changes.

**Input:** `company_name` (required), `max_results`

```json
{
  "company_name": "Apple Inc.",
  "ticker": "AAPL",
  "cik": "0000320193",
  "trades": [
    {
      "filing_date": "2024-11-04",
      "owner_name": "",
      "owner_title": "0000320193-24-000789",
      "transaction_type": "4",
      "document_url": "https://www.sec.gov/Archives/edgar/data/320193/000032019324000789/0000320193-24-000789-index.htm"
    }
  ],
  "total_trades": 20,
  "source": "SEC EDGAR"
}
```

### get_company_info — $0.05
CIK lookup, SIC description, state of incorporation, fiscal year end, filing history counts, and business description.

**Input:** `company_name` (required)

```json
{
  "company_name": "APPLE INC.",
  "ticker": "AAPL",
  "cik": "0000320193",
  "sic": "3571",
  "sic_description": "Electronic Computers",
  "state_of_incorporation": "CA",
  "fiscal_year_end": "0930",
  "filing_history": {
    "tenK_count": 10,
    "tenQ_count": 39,
    "eightK_count": 78,
    "four_count": 156
  },
  "business_description": "Entity: Apple Inc.",
  "source": "SEC EDGAR"
}
```

---

## Pricing

| Tool | Price |
|------|-------|
| search_company_filings | $0.05 |
| get_10k_annual_report | $0.10 |
| get_10q_quarterly_report | $0.08 |
| get_8k_material_events | $0.08 |
| get_insider_trades | $0.12 |
| get_company_info | $0.05 |

All data sourced from SEC EDGAR (free public API) — no per-call API costs = maximum margin.

---

## Comparison

| Feature | SEC EDGAR MCP | Capital IQ | Bloomberg |
|---------|--------------|------------|-----------|
| 10-K extraction | ✅ | ✅ (paid) | ✅ (paid) |
| Insider trades (Form 4) | ✅ | ✅ (paid) | ✅ (paid) |
| 8-K material events | ✅ | ✅ (paid) | ✅ (paid) |
| XBRL financials | ✅ | ✅ | ✅ |
| No API key required | ✅ | ❌ | ❌ |
| MCP-compatible | ✅ | ❌ | ❌ |
| Price | **$0.05–$0.12/call** | **$2,000+/mo** | **$2,000+/mo** |

---

## Data Sources

All data from [SEC EDGAR](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany) — the official US Securities and Exchange Commission filing database. Public and free.

---

## Known Limitations

- **Form 4 transaction details** — Full transaction details (share price, transaction type, ownership change) require parsing the Form 4 XML document. Current tool returns filing metadata. Full XML parsing is on the roadmap.
- **XBRL lag** — Financial facts extracted from XBRL have ~1-2 day lag vs raw filing
- **Company name matching** — Use exact company name with Inc/Ltd/Corp suffix for best results

---

*Built on ts-standby template | Uses apify/actor-node:20 | Last updated: 2026-05-08*
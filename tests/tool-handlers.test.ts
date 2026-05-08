import { describe, it, expect, vi } from 'vitest';

describe('handleTool', () => {
    it('throws for unknown tool', async () => {
        const { handleTool } = await import('../src/tool-handlers.js');
        await expect(handleTool('nonexistent_tool', {})).rejects.toThrow('Unknown tool: nonexistent_tool');
    });

    it('search_company_filings returns structure with filings array', async () => {
        // Mock the sec-api functions
        vi.mock('../src/sec-api.js', () => ({
            resolveCIK: vi.fn().mockResolvedValue('0000320193'),
            getCompanySubmissions: vi.fn().mockResolvedValue({
                cik: 320193,
                name: 'APPLE INC.',
                ticker: 'AAPL',
                filings: {
                    recent: {
                        accessionNumber: ['0000320193-24-000123'],
                        filingDate: ['2024-10-25'],
                        form: ['10-K'],
                        primaryDocument: ['v123.htm'],
                    }
                }
            }),
            extractTicker: vi.fn().mockReturnValue('AAPL'),
            buildFilingList: vi.fn().mockReturnValue([
                { accession_number: '0000320193-24-000123', form_type: '10-K', filing_date: '2024-10-25', document_url: 'https://www.sec.gov/...' }
            ]),
        }));

        const { handleTool } = await import('../src/tool-handlers.js');
        const result = await handleTool('search_company_filings', { company_name: 'Apple' });
        expect(result).toHaveProperty('filings');
        expect(result).toHaveProperty('ticker');
        expect(result.filings).toBeInstanceOf(Array);
    });
});

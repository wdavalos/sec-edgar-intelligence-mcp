import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('resolveCIK', () => {
    it('returns padded CIK for found company', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => ({ results: [{ cik: 320193, name: 'APPLE INC' }] })
        });

        const { resolveCIK } = await import('../src/sec-api.js');
        const cik = await resolveCIK('Apple');
        expect(cik).toBe('0000320193');
    });

    it('throws when company not found', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => ({ results: [] })
        });

        const { resolveCIK } = await import('../src/sec-api.js');
        await expect(resolveCIK('NotARealCompany12345')).rejects.toThrow('Company not found');
    });
});

describe('buildFilingList', () => {
    it('filters by form type', async () => {
        const { buildFilingList } = await import('../src/sec-api.js');
        const submissions = {
            cik: 320193,
            name: 'Apple',
            ticker: 'AAPL',
            filings: {
                recent: {
                    accessionNumber: ['0000320193-24-000123', '0000320193-24-000456'],
                    filingDate: ['2024-10-25', '2024-07-30'],
                    form: ['10-K', '10-Q'],
                    primaryDocument: ['v123.htm', 'v456.htm'],
                }
            }
        };

        const result = buildFilingList(submissions, { formType: '10-K', maxResults: 10 });
        expect(result).toHaveLength(1);
        expect(result[0].form_type).toBe('10-K');
    });

    it('respects maxResults', async () => {
        const { buildFilingList } = await import('../src/sec-api.js');
        const submissions = {
            cik: 320193,
            name: 'Apple',
            ticker: 'AAPL',
            filings: {
                recent: {
                    accessionNumber: ['0000320193-24-000001', '0000320193-24-000002', '0000320193-24-000003'],
                    filingDate: ['2024-01-01', '2024-02-01', '2024-03-01'],
                    form: ['8-K', '8-K', '8-K'],
                    primaryDocument: ['a.htm', 'b.htm', 'c.htm'],
                }
            }
        };

        const result = buildFilingList(submissions, { formType: '8-K', maxResults: 2 });
        expect(result).toHaveLength(2);
    });

    it('filters by date range', async () => {
        const { buildFilingList } = await import('../src/sec-api.js');
        const submissions = {
            cik: 320193,
            name: 'Apple',
            ticker: 'AAPL',
            filings: {
                recent: {
                    accessionNumber: ['0000320193-24-000001', '0000320193-24-000002'],
                    filingDate: ['2023-01-01', '2024-01-01'],
                    form: ['10-K', '10-K'],
                    primaryDocument: ['a.htm', 'b.htm'],
                }
            }
        };

        const result = buildFilingList(submissions, { dateFrom: '2024-01-01', maxResults: 10 });
        expect(result).toHaveLength(1);
        expect(result[0].filing_date).toBe('2024-01-01');
    });
});

describe('buildMaterialEvents', () => {
    it('extracts 8-K filings only', async () => {
        const { buildMaterialEvents } = await import('../src/sec-api.js');
        const submissions = {
            cik: 320193,
            name: 'Apple',
            ticker: 'AAPL',
            filings: {
                recent: {
                    accessionNumber: ['0000320193-24-000001', '0000320193-24-000002'],
                    filingDate: ['2024-10-25', '2024-07-30'],
                    form: ['10-K', '8-K'],
                    primaryDocument: ['v123.htm', 'v456.htm'],
                }
            }
        };

        const events = buildMaterialEvents(submissions, 10);
        expect(events).toHaveLength(1);
        expect(events[0].form_type).toBe('8-K');
    });
});

describe('buildInsiderTrades', () => {
    it('extracts Form 4 filings', async () => {
        const { buildInsiderTrades } = await import('../src/sec-api.js');
        const submissions = {
            cik: 320193,
            name: 'Apple',
            ticker: 'AAPL',
            filings: {
                recent: {
                    accessionNumber: ['0000320193-24-000001', '0000320193-24-000002'],
                    filingDate: ['2024-10-25', '2024-07-30'],
                    form: ['4', '10-K'],
                    primaryDocument: ['v123.htm', 'v456.htm'],
                }
            }
        };

        const trades = buildInsiderTrades(submissions, 10);
        expect(trades).toHaveLength(1);
    });

    it('excludes non-4 forms', async () => {
        const { buildInsiderTrades } = await import('../src/sec-api.js');
        const submissions = {
            cik: 320193,
            name: 'Apple',
            ticker: 'AAPL',
            filings: {
                recent: {
                    accessionNumber: ['0000320193-24-000001', '0000320193-24-000002'],
                    filingDate: ['2024-10-25', '2024-07-30'],
                    form: ['S-4', '13D'],  // These are NOT Form 4
                    primaryDocument: ['s4.htm', '13d.htm'],
                }
            }
        };

        const trades = buildInsiderTrades(submissions, 10);
        expect(trades).toHaveLength(0);
    });
});

describe('extractTicker', () => {
    it('returns ticker from submissions', async () => {
        const { extractTicker } = await import('../src/sec-api.js');
        const submissions = {
            cik: 320193,
            name: 'Apple',
            ticker: 'AAPL',
            filings: { recent: { accessionNumber: [], filingDate: [], form: [], primaryDocument: [] } }
        };
        expect(extractTicker(submissions)).toBe('AAPL');
    });

    it('returns empty string when no ticker', async () => {
        const { extractTicker } = await import('../src/sec-api.js');
        const submissions = {
            cik: 320193,
            name: 'Apple',
            ticker: '',
            filings: { recent: { accessionNumber: [], filingDate: [], form: [], primaryDocument: [] } }
        };
        expect(extractTicker(submissions)).toBe('');
    });
});

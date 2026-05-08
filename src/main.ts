import http from 'http';
import { Actor } from 'apify';
import { TOOLS } from './tools.js';
import { handleTool } from './tool-handlers.js';

interface McpRequest {
    toolName: string;
    arguments: Record<string, unknown>;
}

// handleRequest must be exported for MCP standby mode — defined OUTSIDE main() for ESM compatibility
export const handleRequest = async (req: McpRequest) => {
    const { toolName, arguments: args } = req;
    const tool = TOOLS.find((t) => t.name === toolName);

    if (!tool) {
        return {
            content: [{ type: 'text', text: JSON.stringify({ error: `Unknown tool: ${toolName}` }) }],
            isError: true,
        };
    }

    try {
        await Actor.charge({ eventName: tool.name });
        const result = await handleTool(toolName, args);
        return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
        };
    } catch (err) {
        return {
            content: [{ type: 'text', text: JSON.stringify({ error: String(err) }) }],
            isError: true,
        };
    }
};

async function main() {
    await Actor.init();

    const server = http.createServer((req, res) => {
        if (req.headers['x-apify-container-server-readiness-probe']) {
            res.writeHead(200);
            res.end('ok');
            return;
        }

        if (req.method === 'POST' && req.url === '/mcp') {
            let body = '';
            req.on('data', (chunk: string) => { body += chunk; });
            req.on('end', async () => {
                try {
                    const jsonBody = JSON.parse(body);
                    const id = jsonBody.id ?? null;

                    const reply = (result: unknown) => {
                        const resp = id !== null
                            ? { jsonrpc: '2.0', id, result }
                            : result;
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(resp));
                    };

                    const replyError = (code: number, message: string) => {
                        const resp = id !== null
                            ? { jsonrpc: '2.0', id, error: { code, message } }
                            : { status: 'error', error: message };
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(resp));
                    };

                    const method = jsonBody.method;
                    const params = jsonBody.params || {};

                    if (method === 'initialize') {
                        return reply({
                            protocolVersion: '2024-11-05',
                            capabilities: { tools: {} },
                            serverInfo: { name: 'sec-edgar-intelligence-mcp', version: '0.0.1' }
                        });
                    }

                    if (method === 'tools/list' || (!method && jsonBody.tool === 'list')) {
                        return reply({ tools: TOOLS });
                    }

                    if (method === 'tools/call') {
                        const toolName = params.name;
                        const toolArgs = params.arguments || {};
                        if (!toolName) return replyError(-32602, 'Missing params.name');
                        const result = await handleTool(toolName, toolArgs);
                        return reply({ content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });
                    }

                    if (method && method.startsWith('tools/')) {
                        const toolName = method.slice(6);
                        const toolArgs = params || {};
                        const result = await handleTool(toolName, toolArgs);
                        return reply({ content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });
                    }

                    if (jsonBody.tool) {
                        const result = await handleTool(jsonBody.tool, jsonBody.params || {});
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'success', result }));
                        return;
                    }

                    replyError(-32601, `Method not found: ${method}`);
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : String(error);
                    console.error('MCP error:', message);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'error', error: message }));
                }
            });
            return;
        }

        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    });

    const PORT = Actor.config.get('standbyPort') || 3000;
    server.listen(PORT, () => {
        console.log(`SEC EDGAR Intelligence MCP listening on port ${PORT}`);
    });

    process.on('SIGTERM', () => { server.close(() => process.exit(0)); });

    // Batch mode
    const input = await Actor.getInput() as { tool?: string; params?: Record<string, unknown> } | null;
    if (input) {
        const { tool, params = {} } = input;
        if (tool) {
            console.log(`Running tool: ${tool}`);
            const result = await handleTool(tool, params);
            await Actor.setValue('OUTPUT', result);
        }
    }
    await Actor.exit();
}

main().catch(console.error);
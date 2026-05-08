interface McpRequest {
    toolName: string;
    arguments: Record<string, unknown>;
}
export declare const handleRequest: (req: McpRequest) => Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
}>;
export {};
//# sourceMappingURL=main.d.ts.map
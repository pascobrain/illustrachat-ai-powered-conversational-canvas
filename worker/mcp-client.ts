import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
interface MCPServerConfig {
  name: string;
  sseUrl: string;
}
const MCP_SERVERS: MCPServerConfig[] = [];
export class MCPManager {
  private clients: Map<string, Client> = new Map();
  private toolMap: Map<string, string> = new Map();
  private initialized = false;
  async initialize() {
    if (this.initialized) return;
    const connectionPromises = MCP_SERVERS.map(async (serverConfig) => {
      try {
        const transport = new SSEClientTransport(new URL(serverConfig.sseUrl));
        const client = new Client({ name: 'illustra-agent', version: '1.0.0' }, { capabilities: {} });
        // Timeout protection for connection
        await Promise.race([
          client.connect(transport),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ]);
        this.clients.set(serverConfig.name, client);
        const toolsResult = await client.listTools();
        toolsResult?.tools?.forEach(tool => this.toolMap.set(tool.name, serverConfig.name));
      } catch (error) {
        console.error(`[MCP] Failed to connect to ${serverConfig.name}:`, error);
      }
    });
    await Promise.allSettled(connectionPromises);
    this.initialized = true;
  }
  async getToolDefinitions() {
    await this.initialize();
    const allTools = [];
    for (const [serverName, client] of this.clients.entries()) {
      try {
        const toolsResult = await client.listTools();
        toolsResult?.tools?.forEach(tool => {
          allTools.push({
            type: 'function' as const,
            function: {
              name: tool.name,
              description: tool.description || '',
              parameters: tool.inputSchema || { type: 'object', properties: {}, required: [] }
            }
          });
        });
      } catch (e) { console.error(`[MCP] Tool fetch error for ${serverName}`, e); }
    }
    return allTools;
  }
  async executeTool(toolName: string, args: Record<string, unknown>): Promise<string> {
    await this.initialize();
    const serverName = this.toolMap.get(toolName);
    const client = serverName ? this.clients.get(serverName) : null;
    if (!client) throw new Error(`Tool ${toolName} unavailable`);
    try {
      const result = await client.callTool({ name: toolName, arguments: args });
      if (result.isError) throw new Error('Tool error');
      return Array.isArray(result.content) ? result.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n') : 'No response';
    } catch (e) { throw new Error(`Execution failed: ${e}`); }
  }
}
export const mcpManager = new MCPManager();
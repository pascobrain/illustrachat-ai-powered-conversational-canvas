# Illustrachat

[cloudflarebutton]

A powerful AI chat application built with Cloudflare Workers, Durable Objects, and React. Features real-time streaming responses, tool integrations, session management, and MCP support.

## Features

- **AI-Powered Chat**: Seamless conversations with Google Gemini models via Cloudflare AI Gateway
- **Tool Integration**: Built-in tools for weather lookups and web search with SerpAPI
- **MCP Support**: Extend functionality with Model Context Protocol servers
- **Session Management**: Persistent chat sessions with title customization and activity tracking
- **Streaming Responses**: Real-time token streaming for responsive user experience
- **Modern UI**: Built with React, Tailwind CSS, and shadcn/ui components
- **Type-Safe**: Full TypeScript support across frontend and worker code

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Cloudflare Workers, Durable Objects, Hono
- **AI**: OpenAI SDK (compatible with Cloudflare AI), Google Gemini models
- **State Management**: React Query, Immer, Zustand
- **Routing**: React Router
- **Deployment**: Cloudflare Workers + Assets

## Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Cloudflare account
- Cloudflare AI Gateway account and API key
- Optional: SerpAPI key for web search

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd illustrachat-e_jm75laugun7lwpullyl

# Install dependencies
bun install
```

### Environment Configuration

Update `wrangler.jsonc` with your credentials:

```jsonc
"vars": {
  "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai",
  "CF_AI_API_KEY": "your-cloudflare-api-key"
}
```

Optionally set `SERPAPI_KEY` for web search functionality.

### Development

```bash
# Start the development server
bun dev
```

The application will be available at `http://localhost:3000`.

### Building

```bash
# Create a production build
bun run build
```

## Usage

- Navigate to the home page to view the demo interface
- Start new chat sessions via the sidebar or API
- Send messages and interact with AI responses
- Use tools by asking natural language questions (e.g., "What's the weather in London?")
- Manage sessions through the sessions API endpoints

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/client-errors` - Client error reporting
- `GET/POST/DELETE /api/sessions` - Session management
- `POST /api/chat/:sessionId/chat` - Send chat messages (streaming supported)
- `GET /api/chat/:sessionId/messages` - Retrieve conversation history

## Deployment

[cloudflarebutton]

### Deploy to Cloudflare

```bash
# Deploy to Cloudflare Workers
bun run deploy
```

Or manually:

```bash
bun run build
wrangler deploy
```

Ensure your `wrangler.jsonc` includes the correct account details and Durable Object migrations are applied on first deploy.

## Scripts

- `bun dev` - Start development server
- `bun run build` - Production build
- `bun run deploy` - Build and deploy
- `bun run lint` - Run ESLint
- `bun run cf-typegen` - Generate Cloudflare types

## License

This project is provided as-is for educational and production use.

## Contributing

Contributions are welcome. Please open issues or pull requests for improvements to the chat interface, tool integrations, or infrastructure.
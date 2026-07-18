import type { NextApiRequest, NextApiResponse } from 'next';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { mcpServer, activeTransports } from '@/lib/mcp';

// Generate a random session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic Auth (Optional but highly recommended)
  // Claude Custom Connectors support sending standard HTTP Headers or OAuth.
  // For simplicity, you can pass a bearer token.
  // const authHeader = req.headers.authorization;
  // if (authHeader !== `Bearer ${process.env.MCP_SECRET}`) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  const sessionId = req.query.sessionId?.toString() || generateSessionId();

  console.log(`[MCP] Starting SSE session: ${sessionId}`);

  // Create an SSE transport wrapping the Next.js/Node.js response
  const transport = new SSEServerTransport("/api/mcp/messages?sessionId=" + sessionId, res as any);
  
  activeTransports.set(sessionId, transport);

  // When connection closes, clean up
  req.on('close', () => {
    console.log(`[MCP] Closing SSE session: ${sessionId}`);
    activeTransports.delete(sessionId);
  });

  // Connect the server to this transport instance
  await mcpServer.connect(transport);
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { mcpServer, activeTransports } from '@/lib/mcp';

export const config = {
  api: {
    externalResolver: true,
  },
};

// Generate a random session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

  // Construct absolute URL for Claude
  const messagesUrl = `https://zsdecor.pk/api/mcp/messages?sessionId=${sessionId}`;

  // Create an SSE transport wrapping the Next.js/Node.js response
  const transport = new SSEServerTransport(messagesUrl, res as any);
  
  activeTransports.set(sessionId, transport);

  // When connection closes, clean up
  req.on('close', () => {
    console.log(`[MCP] Closing SSE session: ${sessionId}`);
    activeTransports.delete(sessionId);
  });

  // Connect the server to this transport instance
  await mcpServer.connect(transport);

  // Keep the Next.js API route from resolving and auto-closing the connection
  await new Promise((resolve) => {
    req.on('close', resolve);
  });
}

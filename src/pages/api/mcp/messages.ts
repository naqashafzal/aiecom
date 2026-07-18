import type { NextApiRequest, NextApiResponse } from 'next';
import { activeTransports } from '@/lib/mcp';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = req.query.sessionId?.toString();

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  const transport = activeTransports.get(sessionId);

  if (!transport) {
    return res.status(404).json({ error: 'Session not found or expired' });
  }

  try {
    // The MCP SSE transport expects to handle incoming POST messages natively.
    // In Express, we would pass req/res directly to handlePostMessage.
    // Next.js Pages router passes standard Node req/res.
    await transport.handlePostMessage(req, res as any);
  } catch (error) {
    console.error(`[MCP] Error handling message for session ${sessionId}:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

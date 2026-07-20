const http = require('http');
const https = require('https');

async function testMCP() {
  const url = 'https://zsdecor.pk/api/mcp';
  console.log('Connecting to', url);

  const req = https.request(url, { method: 'GET' }, (res) => {
    console.log('GET STATUS:', res.statusCode);
    console.log('GET HEADERS:', res.headers);

    let messagesEndpoint = '';

    res.on('data', async (chunk) => {
      const data = chunk.toString();
      console.log('SSE EVENT RECEIVED:\n' + data);
      
      if (data.includes('event: endpoint')) {
        const lines = data.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            messagesEndpoint = line.substring(6).trim();
            console.log('EXTRACTED ENDPOINT:', messagesEndpoint);
            
            // Wait 1 second just in case
            await new Promise(r => setTimeout(r, 1000));
            
            // Now send POST request
            const postBody = JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "initialize",
              params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: { name: "test-client", version: "1.0" }
              }
            });

            console.log('Sending POST to', messagesEndpoint);
            
            // URL might be absolute or relative
            let postUrl = messagesEndpoint;
            if (postUrl.startsWith('/')) {
              postUrl = 'https://zsdecor.pk' + postUrl;
            }

            const parsedUrl = new URL(postUrl);
            const postReq = https.request(parsedUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postBody)
              }
            }, (postRes) => {
              console.log('POST STATUS:', postRes.statusCode);
              let postResponseData = '';
              postRes.on('data', d => postResponseData += d.toString());
              postRes.on('end', () => {
                console.log('POST RESPONSE BODY:', postResponseData);
                // process.exit(0);
              });
            });

            postReq.on('error', e => console.error('POST Error:', e));
            postReq.write(postBody);
            postReq.end();
          }
        }
      }
    });

    res.on('error', e => console.error('SSE Error:', e));
  });

  req.on('error', e => console.error('Request Error:', e));
  req.end();
}

testMCP();

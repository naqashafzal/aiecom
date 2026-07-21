import { AutoLink } from "@prisma/client";

export function autoLinkify(html: string, autoLinks: AutoLink[] = []): string {
  if (!html) return html;

  // Safe regex to find URLs
  const urlRegex = /(https?:\/\/[^\s<"'()]+)/gi;

  // Split by HTML tags to avoid modifying attributes or inside tags
  const tokens = html.split(/(<[^>]+>)/g);
  
  const ignoreTags = ['a', 'script', 'style', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  let ignoreTagStack: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token.startsWith('<')) {
      const isClosing = token.startsWith('</');
      const match = token.match(/<\/?([a-z0-9]+)/i);
      const tagName = match ? match[1].toLowerCase() : null;

      if (tagName && ignoreTags.includes(tagName)) {
        if (isClosing) {
          ignoreTagStack.pop();
        } else if (!token.endsWith('/>')) {
          ignoreTagStack.push(tagName);
        }
      }
    } else {
      // It's text content, safely replace if not inside an ignored tag
      if (ignoreTagStack.length === 0) {
        let processedText = token;

        // 1. First linkify raw URLs
        processedText = processedText.replace(urlRegex, (url) => {
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-bold underline hover:text-blue-500">${url}</a>`;
        });

        // 2. Then linkify auto internal links (only on words not already inside <a> tags created in step 1)
        const subTokens = processedText.split(/(<a\b[^>]*>.*?<\/a>)/gi);
        for (let j = 0; j < subTokens.length; j++) {
          if (!subTokens[j].toLowerCase().startsWith('<a')) {
            // Apply all keyword replacements to this plain text chunk
            let chunk = subTokens[j];
            autoLinks.forEach(link => {
              if (!link.isActive) return;
              // \b ensures we only match whole words
              const keywordRegex = new RegExp(`\\b(${escapeRegExp(link.keyword)})\\b`, 'gi');
              chunk = chunk.replace(keywordRegex, (match) => {
                return `<a href="${link.url}" class="text-green-600 font-bold hover:underline transition-colors">${match}</a>`;
              });
            });
            subTokens[j] = chunk;
          }
        }
        processedText = subTokens.join('');

        tokens[i] = processedText;
      }
    }
  }

  return tokens.join('');
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

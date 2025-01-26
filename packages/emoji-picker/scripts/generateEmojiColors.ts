import emojiData from 'unicode-emoji-json';
import sharp from 'sharp';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { serve } from 'bun';
import { isCompatibleEmoji } from '../src/utils/emojiFilters';

const skinToneModifiers = ['🏻', '🏼', '🏽', '🏾', '🏿'];

// Filter emojis that are too recent and add skin tone variants
export function filterEmojis(emojiData: Record<string, any>): Record<string, any> {
  const filteredEntries = Object.entries(emojiData)
    .filter(([emoji, data]) => {
      const { isCompatible } = isCompatibleEmoji({ emoji, ...data });
      return isCompatible;
    })
    .flatMap(([emoji, data]) => {
      if (data.skin_tone_support) {
        // Add default version and all skin tone variants
        return [
          [emoji, data],
          ...skinToneModifiers.map((modifier) => {
            const emojiWithTone = emoji + modifier;
            return [emojiWithTone, { ...data, skin_tone_variant: true }];
          }),
        ];
      }
      return [[emoji, data]];
    });

  return Object.fromEntries(filteredEntries);
}

// Helper function to create an SVG with the emoji
function createEmojiSVG(emoji: string) {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <foreignObject width="64" height="64">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: 48px; line-height: 64px; text-align: center; font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji';">
          ${emoji}
        </div>
      </foreignObject>
    </svg>
  `;
}

function rgbaToHex(r: number, g: number, b: number, opacity: number = 0.12): string {
  const hex =
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('');

  // Add opacity as hex
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return hex + alpha;
}

// Main function to generate and save emoji colors
async function main() {
  const filteredEmojis = filterEmojis(emojiData);
  const emojis = Object.keys(filteredEmojis);
  const colorMap: Record<string, string> = {};

  for (const emoji of emojis) {
    try {
      // Create SVG with emoji and convert to PNG buffer
      const svg = createEmojiSVG(emoji);
      const { dominant } = await sharp(Buffer.from(svg)).ensureAlpha().png().stats();

      // Convert dominant color to hex with opacity
      colorMap[emoji] = rgbaToHex(dominant.r, dominant.g, dominant.b);
    } catch (error) {
      console.error(`Error processing emoji ${emoji}:`, error);
    }
  }

  // Save color map to file
  const outputPath = join(process.cwd(), 'src/utils/emojiColors.ts');
  const fileContent = `// Generated file - do not edit
export const emojiColors: Record<string, string> = ${JSON.stringify(colorMap, null, 2)};
`;
  writeFileSync(outputPath, fileContent);
  console.log('Emoji colors generated successfully!');
}

main().catch(console.error);

const port = 3456;
const url = `http://localhost:${port}`;

console.log(`Starting server on ${url}`);

// Function to open browser based on platform
async function openBrowser(url: string) {
  const platform = process.platform;

  switch (platform) {
    case 'darwin':
      // macOS
      Bun.spawn(['open', url]);
      break;
    case 'win32':
      // Windows
      Bun.spawn(['cmd', '/c', 'start', url]);
      break;
    default:
      // Linux and others
      Bun.spawn(['xdg-open', url]);
  }
}

// Start server
serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve the HTML file
    if (url.pathname === '/') {
      return new Response(Bun.file('scripts/generateEmojiColors.html'));
    }

    // Serve the emoji data
    if (url.pathname === '/emoji-data') {
      return new Response(JSON.stringify(filterEmojis(emojiData)), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle saving the results
    if (url.pathname === '/save' && req.method === 'POST') {
      const data = await req.text();
      const outputPath = join(import.meta.dir, '../src/utils/emojiColors.ts');
      writeFileSync(outputPath, data);
      return new Response('Colors saved successfully!');
    }

    return new Response('Not found', { status: 404 });
  },
});

// Open browser after a short delay to ensure server is ready
setTimeout(() => {
  openBrowser(url);
}, 500);

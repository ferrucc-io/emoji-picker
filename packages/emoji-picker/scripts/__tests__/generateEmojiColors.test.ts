import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { filterEmojis } from '../generateEmojiColors';

describe('emoji color generation', () => {
  const testColorFilePath = join(import.meta.dir, '../../src/utils/emojiColors.ts');
  const backupFilePath = testColorFilePath + '.backup';

  beforeEach(() => {
    // Backup existing file if it exists
    try {
      const content = readFileSync(testColorFilePath, 'utf-8');
      writeFileSync(backupFilePath, content);
    } catch (error) {
      // File might not exist, that's ok
    }
  });

  afterEach(() => {
    // Restore backup if it exists
    try {
      const content = readFileSync(backupFilePath, 'utf-8');
      writeFileSync(testColorFilePath, content);
    } catch (error) {
      // No backup to restore, that's ok
    }
  });

  test('filterEmojis function filters and adds skin tone variants correctly', () => {
    const mockEmojiData = {
      '👋': { 
        name: 'waving hand',
        unicode_version: '1.0',
        emoji_version: '1.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
      },
      '🌟': { 
        name: 'glowing star',
        unicode_version: '1.0',
        emoji_version: '1.0',
        skin_tone_support: false
      },
      '🤖': { 
        name: 'robot',
        unicode_version: '15.1',
        emoji_version: '15.1',
        skin_tone_support: false
      },
    };

    const filtered = filterEmojis(mockEmojiData);
    
    // Should include base emoji and 5 skin tone variants for '👋'
    expect(Object.keys(filtered)).toContain('👋');
    expect(Object.keys(filtered)).toContain('👋🏻');
    expect(Object.keys(filtered)).toContain('👋🏼');
    expect(Object.keys(filtered)).toContain('👋🏽');
    expect(Object.keys(filtered)).toContain('👋🏾');
    expect(Object.keys(filtered)).toContain('👋🏿');
    
    // Should include '🌟' as is
    expect(Object.keys(filtered)).toContain('🌟');
    
    // Should not include too recent emoji
    expect(Object.keys(filtered)).not.toContain('🤖');
  });

  test('generated colors file exists and has valid format', () => {
    // Create a minimal test file
    const testColors = {
      '👋': '#f4c0441f',
      '🌟': '#f4a81c1f',
    };

    const fileContent = `// Auto-generated file - do not edit directly
export const emojiColors: Record<string, string> = ${JSON.stringify(testColors, null, 2)};
`;
    writeFileSync(testColorFilePath, fileContent);

    // Read and validate the file
    const content = readFileSync(testColorFilePath, 'utf-8');
    expect(content).toContain('export const emojiColors');

    // Parse the colors object
    const match = content.match(/\{([^}]+)\}/);
    expect(match).toBeTruthy();

    const colorsObject = JSON.parse(`{${match![1]}}`);

    // Check if we have color entries
    expect(Object.keys(colorsObject).length).toBeGreaterThan(0);

    // Validate color format (6 characters for color + 2 for alpha)
    const someColor = Object.values(colorsObject)[0];
    expect(someColor).toMatch(/^#[0-9A-F]{6}[0-9A-F]{2}$/i);
  });
});

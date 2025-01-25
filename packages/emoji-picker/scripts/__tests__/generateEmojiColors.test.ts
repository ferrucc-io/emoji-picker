import { join } from 'path';
import { readFileSync } from 'fs';
import { describe, expect, test } from 'bun:test';

describe("emoji color generation", () => {
  test("generated colors file exists and has valid format", async () => {
    // Run the generation script
    await import("../generateEmojiColors.ts");
    
    // Check if the file was created
    const colorFilePath = join(import.meta.dir, "../../src/utils/emojiColors.ts");
    const fileContent = readFileSync(colorFilePath, "utf-8");
    
    // Basic validation
    expect(fileContent).toContain("export const emojiColors");
    
    // Parse the colors object
    const match = fileContent.match(/\{([^}]+)\}/);
    expect(match).toBeTruthy();
    
    const colorsObject = JSON.parse(`{${match![1]}}`);
    
    // Check if we have color entries
    expect(Object.keys(colorsObject).length).toBeGreaterThan(0);
    
    // Validate color format (6 characters for color + 2 for alpha)
    const someColor = Object.values(colorsObject)[0];
    expect(someColor).toMatch(/^#[0-9A-F]{6}[0-9A-F]{2}$/i);
  });
}); 
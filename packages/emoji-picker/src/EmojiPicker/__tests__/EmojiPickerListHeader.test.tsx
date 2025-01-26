import { describe, expect, test } from 'bun:test';
import { render } from '@testing-library/react';
import { EmojiPickerListHeader } from '../EmojiPickerListHeader';

describe("EmojiPickerListHeader", () => {
  test("renders with small emoji size (≤ 32)", () => {
    const { container } = render(<EmojiPickerListHeader content="Small Header" emojiSize={32} />);
    const headerContainer = container.firstChild as HTMLElement;
    const textElement = headerContainer.firstChild as HTMLElement;
    expect(textElement.className).toInclude("text-xs");
    expect(textElement.className).not.toInclude("text-sm");
    expect(textElement.textContent).toBe("Small Header");
  });

  test("renders with large emoji size (> 32)", () => {
    const { container } = render(<EmojiPickerListHeader content="Large Header" emojiSize={33} />);
    const headerContainer = container.firstChild as HTMLElement;
    const textElement = headerContainer.firstChild as HTMLElement;
    expect(textElement.className).toInclude("text-sm");
    expect(textElement.className).not.toInclude("text-xs");
    expect(textElement.textContent).toBe("Large Header");
  });

  test("applies correct styling classes", () => {
    const { container } = render(
      <EmojiPickerListHeader content="Test Header" emojiSize={24} />
    );
    
    const headerContainer = container.firstChild as HTMLElement;
    const className = headerContainer.className;
    
    const expectedClasses = [
      "relative",
      "bg-white/90",
      "dark:bg-zinc-950/90",
      "supports-[backdrop-filter]:bg-white/50",
      "supports-[backdrop-filter]:dark:bg-zinc-950/50",
      "supports-[backdrop-filter]:backdrop-blur-sm"
    ];

    expectedClasses.forEach(className => {
      expect(headerContainer.className).toInclude(className);
    });
  });

  test("renders content correctly", () => {
    const { container } = render(<EmojiPickerListHeader content="Test Content" emojiSize={24} />);
    const headerContainer = container.firstChild as HTMLElement;
    const textElement = headerContainer.firstChild as HTMLElement;
    expect(textElement.textContent).toBe("Test Content");
  });
}); 

import React from 'react';
import { describe, expect, test, mock } from 'bun:test';
import { render } from '@testing-library/react';

// Mock the virtualizer
mock.module('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [],
    getTotalSize: () => 0,
    scrollToIndex: () => {},
  }),
  defaultRangeExtractor: (range: any) => range,
}));

mock.module('unicode-emoji-json/data-by-group.json', () => ({
  'Smileys & Emotion': {
    name: 'Smileys & Emotion',
    slug: 'smileys-emotion',
    emojis: [],
  },
}));

import { EmojiPicker } from '../EmojiPicker';

describe('EmojiPicker', () => {
  test('renders children inside provider wrapper', () => {
    const { container } = render(
      <EmojiPicker>
        <span data-testid="child">Hello</span>
      </EmojiPicker>
    );

    const child = container.querySelector('[data-testid="child"]');
    expect(child).toBeDefined();
    expect(child?.textContent).toBe('Hello');
  });

  test('applies custom className', () => {
    const { container } = render(
      <EmojiPicker className="my-custom-class">
        <div>Content</div>
      </EmojiPicker>
    );

    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toInclude('my-custom-class');
  });

  test('has tabIndex={0} for focus support', () => {
    const { container } = render(
      <EmojiPicker>
        <div>Content</div>
      </EmojiPicker>
    );

    const wrapper = container.firstElementChild;
    expect(wrapper?.getAttribute('tabindex')).toBe('0');
  });

  test('uses default values when no props provided', () => {
    const { container } = render(
      <EmojiPicker>
        <div>Content</div>
      </EmojiPicker>
    );

    // Should render without errors
    expect(container.firstElementChild).toBeDefined();
  });

  test('compound component static properties exist', () => {
    expect(EmojiPicker.Header).toBeDefined();
    expect(EmojiPicker.Input).toBeDefined();
    expect(EmojiPicker.List).toBeDefined();
    expect(EmojiPicker.Preview).toBeDefined();
    expect(EmojiPicker.SkinTone).toBeDefined();
    expect(EmojiPicker.Content).toBeDefined();
    expect(EmojiPicker.Group).toBeDefined();
  });

  test('renders with default flex-col layout classes', () => {
    const { container } = render(
      <EmojiPicker>
        <div>Content</div>
      </EmojiPicker>
    );

    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toInclude('flex');
    expect(wrapper?.className).toInclude('flex-col');
  });
});

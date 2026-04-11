import React from 'react';
import { atom, createStore, Provider } from 'jotai';
import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { render } from '@testing-library/react';
import { EmojiPickerProvider } from '../EmojiPickerContext';

import type { EmojiMetadata } from '../../types/emoji';

const testHoveredEmojiAtom = atom<EmojiMetadata | null>(null);
const testSkinToneAtom = atom<string>('default');

mock.module('unicode-emoji-json/data-by-group.json', () => ({
  'Smileys & Emotion': {
    name: 'Smileys & Emotion',
    slug: 'smileys-emotion',
    emojis: [],
  },
}));

mock.module('../../atoms/emoji', () => ({
  hoveredEmojiAtom: testHoveredEmojiAtom,
  skinToneAtom: testSkinToneAtom,
  skinToneOnlyAtom: atom((get) => get(testSkinToneAtom)),
  searchAtom: atom(''),
  filteredEmojisAtom: atom([]),
  selectedEmojiAtom: atom(null),
  selectedPositionAtom: atom(null),
}));

import { EmojiPickerPreview } from '../EmojiPickerPreview';

describe('EmojiPickerPreview', () => {
  const store = createStore();

  const renderWithProviders = (ui: React.ReactNode, emojiSize = 32) => {
    return render(
      <Provider store={store}>
        <EmojiPickerProvider emojisPerRow={8} emojiSize={emojiSize} maxUnicodeVersion={16.0}>
          {ui}
        </EmojiPickerProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    store.set(testHoveredEmojiAtom, null);
    store.set(testSkinToneAtom, 'default');
  });

  test('calls render prop children with null when no emoji hovered', () => {
    const childFn = mock(({ previewedEmoji }: { previewedEmoji: EmojiMetadata | null }) => (
      <span>{previewedEmoji ? previewedEmoji.emoji : 'none'}</span>
    ));

    const { container } = renderWithProviders(<EmojiPickerPreview>{childFn}</EmojiPickerPreview>);

    expect(childFn).toHaveBeenCalled();
    expect(container.textContent).toInclude('none');
  });

  test('calls render prop children with emoji metadata when hovered', () => {
    const emoji: EmojiMetadata = {
      emoji: '😀',
      name: 'grinning face',
      slug: 'grinning-face',
      skin_tone_support: false,
    };
    store.set(testHoveredEmojiAtom, emoji);

    const { container } = renderWithProviders(
      <EmojiPickerPreview>
        {({ previewedEmoji }) => <span>{previewedEmoji ? previewedEmoji.emoji : 'none'}</span>}
      </EmojiPickerPreview>
    );

    expect(container.textContent).toInclude('😀');
  });

  test('applies skin tone to previewed emoji', () => {
    const emoji: EmojiMetadata = {
      emoji: '✋',
      name: 'raised hand',
      slug: 'raised-hand',
      skin_tone_support: true,
    };
    store.set(testHoveredEmojiAtom, emoji);
    store.set(testSkinToneAtom, 'dark');

    const { container } = renderWithProviders(
      <EmojiPickerPreview>
        {({ previewedEmoji }) => (
          <span data-testid="preview">{previewedEmoji ? previewedEmoji.emoji : 'none'}</span>
        )}
      </EmojiPickerPreview>
    );

    const preview = container.querySelector('[data-testid="preview"]');
    // With dark skin tone applied, the emoji should contain the dark skin tone modifier
    expect(preview?.textContent).toInclude('✋🏿');
  });

  test('applies custom className', () => {
    const { container } = renderWithProviders(
      <EmojiPickerPreview className="my-custom-class">
        {() => <span>Preview</span>}
      </EmojiPickerPreview>
    );

    const outerDiv = container.firstElementChild;
    expect(outerDiv?.className).toInclude('my-custom-class');
  });

  test('container height based on emoji size (minimum 44px)', () => {
    // With emojiSize=32, containerHeight = Math.max(32 * 1.1, 44) = 44
    const { container } = renderWithProviders(
      <EmojiPickerPreview>{() => <span>Preview</span>}</EmojiPickerPreview>,
      32
    );

    const innerDiv = container.querySelector('[style]');
    expect(innerDiv?.getAttribute('style')).toInclude('height: 44px');
  });

  test('container height scales with large emoji size', () => {
    // With emojiSize=60, containerHeight = Math.max(60 * 1.1, 44) = 66
    const { container } = renderWithProviders(
      <EmojiPickerPreview>{() => <span>Preview</span>}</EmojiPickerPreview>,
      60
    );

    const innerDiv = container.querySelector('[style]');
    expect(innerDiv?.getAttribute('style')).toInclude('height: 66px');
  });
});

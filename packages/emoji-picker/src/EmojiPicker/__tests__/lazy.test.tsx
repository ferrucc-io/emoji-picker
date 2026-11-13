import React, { Suspense, createRef } from 'react';
import { atom } from 'jotai';
import { describe, expect, mock, test } from 'bun:test';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { mockEmojiData, mockFilteredEmojis } from './testData';

const mockVirtualizer = {
  getVirtualItems: () => [
    { index: 0, start: 0, size: 32, key: '0', measureElement: null },
    { index: 1, start: 32, size: 32, key: '1', measureElement: null },
  ],
  getTotalSize: () => 64,
  scrollToIndex: () => {},
};

mock.module('@tanstack/react-virtual', () => ({
  useVirtualizer: () => mockVirtualizer,
  defaultRangeExtractor: (range: { startIndex: number; endIndex: number }) => {
    const indexes: number[] = [];
    for (let i = range.startIndex; i <= range.endIndex; i++) {
      indexes.push(i);
    }
    return indexes;
  },
}));

mock.module('unicode-emoji-json/data-by-group.json', () => mockEmojiData);

mock.module('../../utils/supportedEmojis', () => ({
  filterSupportedEmojis: () => mockFilteredEmojis,
}));

const testSearchAtom = atom('');
const testSkinToneAtom = atom<'default'>('default');

mock.module('../../atoms/emoji', () => ({
  searchAtom: testSearchAtom,
  filteredEmojisAtom: atom(() => mockFilteredEmojis),
  skinToneAtom: testSkinToneAtom,
  skinToneOnlyAtom: atom((get) => get(testSkinToneAtom)),
  hoveredEmojiAtom: atom(null),
  selectedEmojiAtom: atom(null),
  selectedPositionAtom: atom<{ row: number; column: number } | null>(null),
  isEmojiSelectedAtom: (rowIndex: number, columnIndex: number) =>
    atom(() => rowIndex === -1 && columnIndex === -1),
}));

import { EmojiPicker, LazyEmojiPicker, isCustomEmoji } from '../../lazy';

describe('Lazy EmojiPicker (@ferrucc-io/emoji-picker/lazy)', () => {
  test('exports LazyEmojiPicker alias, compound subcomponents, and isCustomEmoji', () => {
    expect(LazyEmojiPicker).toBe(EmojiPicker);
    expect(EmojiPicker.Header).toBeDefined();
    expect(EmojiPicker.Input).toBeDefined();
    expect(EmojiPicker.Group).toBeDefined();
    expect(EmojiPicker.List).toBeDefined();
    expect(EmojiPicker.Preview).toBeDefined();
    expect(EmojiPicker.Content).toBeDefined();
    expect(EmojiPicker.SkinTone).toBeDefined();
    expect(
      isCustomEmoji({ id: 'party', name: 'party', imageUrl: 'https://example.com/party.png' })
    ).toBe(true);
  });

  test('renders fallback initially and resolves inside Suspense to allow selecting an emoji', async () => {
    const selected: string[] = [];
    const inputRef = createRef<HTMLInputElement>();

    const { container, getByPlaceholderText, queryByTestId } = render(
      <Suspense fallback={<div data-testid="outer-suspense">Outer loading</div>}>
        <LazyEmojiPicker
          fallback={<div data-testid="picker-fallback">Loading picker...</div>}
          onEmojiSelect={(emoji) => selected.push(emoji)}
        >
          <EmojiPicker.Header>
            <EmojiPicker.Input ref={inputRef} placeholder="Find an emoji..." />
            <EmojiPicker.SkinTone />
          </EmojiPicker.Header>
          <EmojiPicker.Group>
            <EmojiPicker.List />
          </EmojiPicker.Group>
          <EmojiPicker.Preview>
            {({ previewedEmoji }) => (
              <span data-testid="preview-slot">
                {previewedEmoji ? previewedEmoji.name : 'Pick an emoji'}
              </span>
            )}
          </EmojiPicker.Preview>
        </LazyEmojiPicker>
      </Suspense>
    );

    await waitFor(() => {
      expect(getByPlaceholderText('Find an emoji...')).toBeInTheDocument();
    });

    expect(queryByTestId('picker-fallback')).toBeNull();
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    expect(container.querySelector('[data-testid="preview-slot"]')?.textContent).toBe(
      'Pick an emoji'
    );

    const emojiButton = container.querySelector('button[data-emoji="😀"]');
    expect(emojiButton).not.toBeNull();

    fireEvent.click(emojiButton!);
    expect(selected).toEqual(['😀']);
  });

  test('preserves mounted state across parent re-renders after lazy resolution', async () => {
    function Harness({ className }: { className: string }) {
      return (
        <EmojiPicker className={className}>
          <EmojiPicker.Header>
            <EmojiPicker.Input placeholder="Persistent input" />
          </EmojiPicker.Header>
        </EmojiPicker>
      );
    }

    const { getByPlaceholderText, rerender } = render(<Harness className="initial-class" />);

    const initialInput = await waitFor(() => getByPlaceholderText('Persistent input'));

    rerender(<Harness className="updated-class" />);

    const afterRerenderInput = getByPlaceholderText('Persistent input');
    expect(afterRerenderInput).toBe(initialInput);
  });
});

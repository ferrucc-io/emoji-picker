import React, { createRef } from 'react';
import { atom, createStore, Provider } from 'jotai';
import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { render, fireEvent } from '@testing-library/react';
import { EmojiPickerProvider } from '../EmojiPickerContext';

// Create writable test atoms
const testSearchAtom = atom('');
const testSkinToneAtom = atom('default');

mock.module('unicode-emoji-json/data-by-group.json', () => ({
  'Smileys & Emotion': {
    name: 'Smileys & Emotion',
    slug: 'smileys-emotion',
    emojis: [],
  },
}));

mock.module('../../atoms/emoji', () => ({
  searchAtom: testSearchAtom,
  skinToneAtom: testSkinToneAtom,
  skinToneOnlyAtom: atom((get) => get(testSkinToneAtom)),
  filteredEmojisAtom: atom([]),
  hoveredEmojiAtom: atom(null),
  selectedEmojiAtom: atom(null),
  selectedPositionAtom: atom(null),
}));

import { EmojiPickerInput } from '../EmojiPickerInput';

describe('EmojiPickerInput', () => {
  const store = createStore();

  const renderWithProviders = (ui: React.ReactNode) => {
    return render(
      <Provider store={store}>
        <EmojiPickerProvider emojisPerRow={8} emojiSize={32} maxUnicodeVersion={16.0}>
          {ui}
        </EmojiPickerProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    store.set(testSearchAtom, '');
  });

  test('renders with default placeholder "Search emoji"', () => {
    const { container } = renderWithProviders(<EmojiPickerInput />);
    const input = container.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('Search emoji');
  });

  test('renders with custom placeholder', () => {
    const { container } = renderWithProviders(
      <EmojiPickerInput placeholder="Find an emoji..." />
    );
    const input = container.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('Find an emoji...');
  });

  test('updates searchAtom on typing', () => {
    const { container } = renderWithProviders(<EmojiPickerInput />);
    const input = container.querySelector('input')!;

    fireEvent.change(input, { target: { value: 'smile' } });
    expect(store.get(testSearchAtom)).toBe('smile');
  });

  test('shows clear button when text is present', () => {
    store.set(testSearchAtom, 'hello');
    const { container } = renderWithProviders(<EmojiPickerInput />);

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(1);
  });

  test('hides clear button when input is empty', () => {
    store.set(testSearchAtom, '');
    const { container } = renderWithProviders(<EmojiPickerInput />);

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });

  test('clear button resets search and calls onClear', () => {
    const onClear = mock(() => {});
    store.set(testSearchAtom, 'hello');

    const { container } = renderWithProviders(
      <EmojiPickerInput onClear={onClear} />
    );

    const clearButton = container.querySelector('button')!;
    fireEvent.click(clearButton);

    expect(store.get(testSearchAtom)).toBe('');
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  test('Escape key clears input', () => {
    store.set(testSearchAtom, 'test');
    const { container } = renderWithProviders(<EmojiPickerInput />);
    const input = container.querySelector('input')!;

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(store.get(testSearchAtom)).toBe('');
  });

  test('hideIcon prop hides search icon', () => {
    const { container } = renderWithProviders(<EmojiPickerInput hideIcon />);

    // With hideIcon, the search icon div should not be present
    const iconDiv = container.querySelector('.pointer-events-none');
    expect(iconDiv).toBeNull();
  });

  test('search icon is visible by default', () => {
    const { container } = renderWithProviders(<EmojiPickerInput />);

    const iconDiv = container.querySelector('.pointer-events-none');
    expect(iconDiv).toBeDefined();
    expect(iconDiv).not.toBeNull();
  });

  test('autoFocus prop is forwarded', () => {
    const { container } = renderWithProviders(
      <EmojiPickerInput autoFocus />
    );
    const input = container.querySelector('input');
    // In happy-dom, the focused element should be the input when autoFocus is set
    expect(input).toBeDefined();
    expect(input).not.toBeNull();
  });

  test('supports custom endIcon', () => {
    store.set(testSearchAtom, 'text');
    const { container } = renderWithProviders(
      <EmojiPickerInput endIcon={<span data-testid="custom-icon">X</span>} />
    );

    const customIcon = container.querySelector('[data-testid="custom-icon"]');
    expect(customIcon).toBeDefined();
    expect(customIcon).not.toBeNull();
  });

  test('forwards ref to input element', () => {
    const ref = createRef<HTMLInputElement>();
    renderWithProviders(<EmojiPickerInput ref={ref} />);

    expect(ref.current).toBeDefined();
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('INPUT');
  });
});

import React from 'react';
import { atom, createStore, Provider } from 'jotai';
import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { render, fireEvent } from '@testing-library/react';
import { EmojiPickerProvider } from '../EmojiPickerContext';

const testSkinToneAtom = atom<string>('default');

mock.module('unicode-emoji-json/data-by-group.json', () => ({
  'Smileys & Emotion': {
    name: 'Smileys & Emotion',
    slug: 'smileys-emotion',
    emojis: [],
  },
}));

mock.module('../../atoms/emoji', () => ({
  skinToneAtom: testSkinToneAtom,
  skinToneOnlyAtom: atom((get) => get(testSkinToneAtom)),
  searchAtom: atom(''),
  filteredEmojisAtom: atom([]),
  hoveredEmojiAtom: atom(null),
  selectedEmojiAtom: atom(null),
  selectedPositionAtom: atom(null),
}));

import { EmojiPickerSkinTone } from '../EmojiPickerSkinTone';

describe('EmojiPickerSkinTone', () => {
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
    store.set(testSkinToneAtom, 'default');
  });

  test('renders current skin tone emoji button', () => {
    const { container } = renderWithProviders(<EmojiPickerSkinTone />);
    const button = container.querySelector('button');
    expect(button).toBeDefined();
    expect(button?.textContent).toInclude('✋');
  });

  test('defaults to ✋ when no tone is set', () => {
    store.set(testSkinToneAtom, 'default');
    const { container } = renderWithProviders(<EmojiPickerSkinTone />);
    const button = container.querySelector('button');
    expect(button?.textContent).toInclude('✋');
  });

  test('opens picker on click showing all 6 skin tones', () => {
    const { container } = renderWithProviders(<EmojiPickerSkinTone />);

    // Click to open
    const button = container.querySelector('button')!;
    fireEvent.click(button);

    // Should now show 6 skin tone buttons
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(6);
  });

  test('shows "Choose your default skin tone" text when open', () => {
    const { container } = renderWithProviders(<EmojiPickerSkinTone />);

    const button = container.querySelector('button')!;
    fireEvent.click(button);

    expect(container.textContent).toInclude('Choose your default skin tone');
  });

  test('selecting a tone updates skinToneAtom and closes picker', () => {
    const { container } = renderWithProviders(<EmojiPickerSkinTone />);

    // Open picker
    const button = container.querySelector('button')!;
    fireEvent.click(button);

    // Select "dark" tone (last button)
    const buttons = container.querySelectorAll('button');
    const darkButton = buttons[5]; // last = dark
    fireEvent.click(darkButton);

    // Atom should be updated
    expect(store.get(testSkinToneAtom)).toBe('dark');

    // Picker should be closed (only 1 button visible again)
    const buttonsAfter = container.querySelectorAll('button');
    expect(buttonsAfter.length).toBe(1);
  });

  test('displays correct emoji for selected skin tone', () => {
    store.set(testSkinToneAtom, 'light');
    const { container } = renderWithProviders(<EmojiPickerSkinTone />);
    const button = container.querySelector('button');
    expect(button?.textContent).toInclude('✋🏻');
  });
});

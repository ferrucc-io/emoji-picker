import React from 'react';
import { atom, createStore, Provider } from 'jotai';
import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { act, fireEvent, render } from '@testing-library/react';
import { mockEmojiData, mockFilteredEmojis } from './testData';
import '../../atoms/emoji';
import type { CustomSection, EmojiMetadata, SkinTone } from '../../types/emoji';

const mockScrollToIndex = mock(() => {});

let latestVirtualizerOpts: { count: number; estimateSize: (index: number) => number } = {
  count: 0,
  estimateSize: () => 32,
};

const mockVirtualizer = {
  getVirtualItems: () => {
    let offset = 0;
    return Array.from({ length: latestVirtualizerOpts.count }, (_, index) => {
      const size = latestVirtualizerOpts.estimateSize(index);
      const item = { index, start: offset, size, key: String(index), measureElement: null };
      offset += size;
      return item;
    });
  },
  getTotalSize: () => {
    let offset = 0;
    for (let i = 0; i < latestVirtualizerOpts.count; i++) {
      offset += latestVirtualizerOpts.estimateSize(i);
    }
    return offset;
  },
  scrollToIndex: mockScrollToIndex,
};

mock.module('@tanstack/react-virtual', () => ({
  useVirtualizer: (opts: { count: number; estimateSize: (index: number) => number }) => {
    latestVirtualizerOpts = opts;
    return mockVirtualizer;
  },
  defaultRangeExtractor: (range: any) => range,
}));

mock.module('unicode-emoji-json/data-by-group.json', () => mockEmojiData);
mock.module('../../utils/supportedEmojis', () => ({
  filterSupportedEmojis: () => mockFilteredEmojis,
}));

const testHoveredEmojiAtom = atom<EmojiMetadata | null>(null);
const testSelectedEmojiAtom = atom<string | null>(null);
const testSelectedPositionAtom = atom<{ row: number; column: number } | null>(null);
const testSearchAtom = atom<string>('');
const testSkinToneAtom = atom<SkinTone>('default');
const testSkinToneOnlyAtom = atom((get) => get(testSkinToneAtom));
const testFilteredEmojisAtom = atom((get) => {
  const search = get(testSearchAtom).trim().toLowerCase();
  if (!search) {
    return mockFilteredEmojis;
  }
  return mockFilteredEmojis
    .map((group) => ({
      category: group.category,
      emojis: group.emojis.filter((emoji) => emoji.name.toLowerCase().includes(search)),
    }))
    .filter((group) => group.emojis.length > 0);
});

mock.module('../../atoms/emoji', () => ({
  hoveredEmojiAtom: testHoveredEmojiAtom,
  selectedEmojiAtom: testSelectedEmojiAtom,
  selectedPositionAtom: testSelectedPositionAtom,
  searchAtom: testSearchAtom,
  skinToneAtom: testSkinToneAtom,
  skinToneOnlyAtom: testSkinToneOnlyAtom,
  filteredEmojisAtom: testFilteredEmojisAtom,
}));

import { EmojiPickerProvider } from '../EmojiPickerContext';
import { EmojiPickerList } from '../EmojiPickerList';
import { EmojiPickerInput } from '../EmojiPickerInput';
import { EmojiPickerSkinTone } from '../EmojiPickerSkinTone';

const customSectionsFixture: CustomSection[] = [
  {
    id: 'custom',
    name: 'Custom',
    emojis: [
      {
        id: 'party-parrot',
        name: 'party-parrot',
        imageUrl: '/custom/party-parrot.gif',
      },
    ],
  },
];

const EMPTY_CUSTOM_SECTIONS: CustomSection[] = [];
const EMPTY_FREQUENT_EMOJIS: string[] = [];

describe('Accessibility (WAI-ARIA Grid, Roving TabIndex, Live Announcer, Form Safety)', () => {
  const store = createStore();

  const renderWithProviders = (
    ui: React.ReactNode,
    options?: {
      emojisPerRow?: number;
      customSections?: CustomSection[];
      frequentlyUsedEmojis?: string[];
    }
  ) => {
    return render(
      <Provider store={store}>
        <EmojiPickerProvider
          emojisPerRow={options?.emojisPerRow ?? 2}
          emojiSize={32}
          maxUnicodeVersion={16.0}
          customSections={options?.customSections ?? EMPTY_CUSTOM_SECTIONS}
          frequentlyUsedEmojis={options?.frequentlyUsedEmojis ?? EMPTY_FREQUENT_EMOJIS}
        >
          {ui}
        </EmojiPickerProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    store.set(testHoveredEmojiAtom, null);
    store.set(testSelectedEmojiAtom, null);
    store.set(testSelectedPositionAtom, null);
    store.set(testSearchAtom, '');
    store.set(testSkinToneAtom, 'default');
    mockScrollToIndex.mockClear();
  });

  describe('1. WAI-ARIA 1-based Grid & Row roles', () => {
    test('standard categories grid has role="grid", aria-colcount, and 1-based aria-rowindex starting at 1', () => {
      // mockFilteredEmojis has 2 categories with 2 emojis each; emojisPerRow=1 => 4 emoji rows + 2 headers
      const { container, getByRole, getAllByRole } = renderWithProviders(<EmojiPickerList />, {
        emojisPerRow: 1,
      });

      const grid = getByRole('grid', { name: 'Emoji picker' });
      expect(grid.getAttribute('aria-colcount')).toBe('1');
      expect(grid.getAttribute('aria-rowcount')).toBe('4');

      const rows = getAllByRole('row');
      expect(rows.length).toBe(4);

      const rowIndices = rows.map((row) => Number(row.getAttribute('aria-rowindex')));
      expect(rowIndices).toEqual([1, 2, 3, 4]);
      expect(rowIndices).not.toContain(0);

      // Category headers keep data-type="header" and data-testid="emoji-picker-list-header"
      const headerWrappers = container.querySelectorAll('[data-type="header"]');
      expect(headerWrappers.length).toBe(2);
      headerWrappers.forEach((wrapper) => {
        expect(wrapper.getAttribute('role')).toBe('presentation');
      });
      expect(container.querySelectorAll('[data-testid="emoji-picker-list-header"]').length).toBe(2);
    });

    test('custom emoji categories grid has contiguous 1-based aria-rowindex matching aria-rowcount', () => {
      const { getByRole, getAllByRole } = renderWithProviders(<EmojiPickerList />, {
        emojisPerRow: 2,
        customSections: customSectionsFixture,
        frequentlyUsedEmojis: ['😀'],
      });

      const grid = getByRole('grid', { name: 'Emoji picker' });
      expect(grid.getAttribute('aria-colcount')).toBe('2');
      // 1 frequently used row + 1 custom row + 2 standard category rows = 4
      expect(grid.getAttribute('aria-rowcount')).toBe('4');

      const rows = getAllByRole('row');
      const rowIndices = rows.map((row) => Number(row.getAttribute('aria-rowindex')));
      expect(rowIndices).toEqual([1, 2, 3, 4]);
    });

    test('search results grid has 1-based aria-rowindex starting at 1', () => {
      store.set(testSearchAtom, 'hand');
      const { getByRole, getAllByRole } = renderWithProviders(<EmojiPickerList />, {
        emojisPerRow: 1,
      });

      const grid = getByRole('grid', { name: 'Emoji picker' });
      expect(grid.getAttribute('aria-colcount')).toBe('1');
      expect(grid.getAttribute('aria-rowcount')).toBe('2');

      const rows = getAllByRole('row');
      const rowIndices = rows.map((row) => Number(row.getAttribute('aria-rowindex')));
      expect(rowIndices).toEqual([1, 2]);
    });
  });

  describe('2. Gridcell roles, 1-based aria-colindex, labels, and roving tabIndex', () => {
    test('emoji cells have role="gridcell", 1-based aria-colindex, aria-label, and roving tabIndex', () => {
      const { getAllByRole } = renderWithProviders(<EmojiPickerList />, {
        emojisPerRow: 2,
        customSections: customSectionsFixture,
      });

      const cells = getAllByRole('gridcell');
      expect(cells.length).toBe(5);

      // Custom emoji cell is first
      expect(cells[0].getAttribute('aria-label')).toBe('Custom emoji: party-parrot');
      expect(cells[0].getAttribute('aria-colindex')).toBe('1');

      // Standard emoji cells in row 2 have 1-based aria-colindex 1..2 and emoji name labels
      expect(cells[1].getAttribute('aria-label')).toBe('grinning face');
      expect(cells[1].getAttribute('aria-colindex')).toBe('1');
      expect(cells[2].getAttribute('aria-label')).toBe('grinning face with big eyes');
      expect(cells[2].getAttribute('aria-colindex')).toBe('2');

      // When unselected, all cells have tabIndex={-1} and no aria-selected / data-active
      cells.forEach((cell) => {
        expect(cell.getAttribute('tabindex')).toBe('-1');
        expect(cell.getAttribute('aria-selected')).toBeNull();
        expect(cell.hasAttribute('data-active')).toBe(false);
      });

      // Navigate with ArrowDown to select first cell (Custom emoji)
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      });

      expect(cells[0].getAttribute('tabindex')).toBe('0');
      expect(cells[0].getAttribute('aria-selected')).toBe('true');
      expect(cells[0].hasAttribute('data-active')).toBe(true);
      expect(cells[1].getAttribute('tabindex')).toBe('-1');

      // Navigate down to standard emoji cell
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      });

      expect(cells[0].getAttribute('tabindex')).toBe('-1');
      expect(cells[0].getAttribute('aria-selected')).toBeNull();
      expect(cells[0].hasAttribute('data-active')).toBe(false);

      expect(cells[1].getAttribute('tabindex')).toBe('0');
      expect(cells[1].getAttribute('aria-selected')).toBe('true');
      expect(cells[1].hasAttribute('data-active')).toBe(true);
    });
  });

  describe('3. Polite Screen Reader Live Announcer', () => {
    test('announces active emoji name on hover and keyboard navigation', () => {
      const { getByTestId, getAllByRole } = renderWithProviders(<EmojiPickerList />, {
        emojisPerRow: 2,
      });

      const announcer = getByTestId('emoji-picker-live-announcer');
      expect(announcer.getAttribute('aria-live')).toBe('polite');
      expect(announcer.getAttribute('role')).toBe('status');
      expect(announcer.textContent).toBe('');

      const cells = getAllByRole('gridcell');

      // Hover an emoji cell
      fireEvent.mouseEnter(cells[1]);
      expect(announcer.textContent).toBe('grinning face with big eyes');

      fireEvent.mouseLeave(cells[1]);
      expect(announcer.textContent).toBe('');

      // Keyboard navigation updates live announcer
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      });
      expect(announcer.textContent).toBe('grinning face');

      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      });
      expect(announcer.textContent).toBe('raised hand');
    });
  });

  describe('4. Auxiliary Button Semantics & Form Safety', () => {
    test('search input has accessible label, autocomplete="off", spellcheck="false", and clear button does not submit form', () => {
      const handleSubmit = mock((e: React.FormEvent) => e.preventDefault());
      store.set(testSearchAtom, 'grin');

      const { getByRole } = renderWithProviders(
        <form onSubmit={handleSubmit}>
          <EmojiPickerInput />
        </form>
      );

      const input = getByRole('textbox', { name: 'Search emoji' });
      expect(input.getAttribute('autocomplete')).toBe('off');
      expect(input.getAttribute('spellcheck')).toBe('false');

      const clearButton = getByRole('button', { name: 'Clear search' });
      expect(clearButton.getAttribute('type')).toBe('button');

      fireEvent.click(clearButton);
      expect(handleSubmit).not.toHaveBeenCalled();
      expect(store.get(testSearchAtom)).toBe('');
    });

    test('skin tone trigger and option buttons have type="button", aria-label, aria-expanded, aria-pressed, and do not submit form', () => {
      const handleSubmit = mock((e: React.FormEvent) => e.preventDefault());

      const { getByRole, getAllByRole } = renderWithProviders(
        <form onSubmit={handleSubmit}>
          <EmojiPickerSkinTone />
        </form>
      );

      const trigger = getByRole('button', { name: 'Change skin tone (Default skin tone)' });
      expect(trigger.getAttribute('type')).toBe('button');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');

      // Click trigger inside <form>: opens options without submitting form
      fireEvent.click(trigger);
      expect(handleSubmit).not.toHaveBeenCalled();

      const optionButtons = getAllByRole('button');
      expect(optionButtons.length).toBe(6);

      const expectedLabels = [
        'Default skin tone',
        'Light skin tone',
        'Medium-light skin tone',
        'Medium skin tone',
        'Medium-dark skin tone',
        'Dark skin tone',
      ];

      optionButtons.forEach((btn, idx) => {
        expect(btn.getAttribute('type')).toBe('button');
        expect(btn.getAttribute('aria-label')).toBe(expectedLabels[idx]);
        expect(btn.getAttribute('aria-pressed')).toBe(idx === 0 ? 'true' : 'false');
      });

      // Click "Medium skin tone" option inside <form>: updates tone without submitting form
      fireEvent.click(optionButtons[3]);
      expect(handleSubmit).not.toHaveBeenCalled();
      expect(store.get(testSkinToneAtom)).toBe('medium');

      // Trigger now reflects updated tone label
      const updatedTrigger = getByRole('button', { name: 'Change skin tone (Medium skin tone)' });
      expect(updatedTrigger.getAttribute('type')).toBe('button');
    });
  });

  describe('5. Empty State Semantics', () => {
    test('empty state has role="status" and aria-hidden="true" on decorative icon', () => {
      store.set(testSearchAtom, 'zzzznonexistentemoji');

      const { container } = renderWithProviders(<EmojiPickerList />);

      const statusRegions = container.querySelectorAll('[role="status"]');
      const emptyStatus = Array.from(statusRegions).find((el) =>
        el.textContent?.includes('No emojis found')
      );
      expect(emptyStatus).toBeDefined();

      const svgIcon = emptyStatus?.querySelector('svg');
      expect(svgIcon).toBeDefined();
      expect(svgIcon?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('6. Smarter Scroll Alignment on Keyboard Navigation', () => {
    test('uses { align: "auto" } on keyboard navigation instead of jarring center jumps', () => {
      renderWithProviders(<EmojiPickerList />, { emojisPerRow: 2 });

      // Initial ArrowDown selects row 1 right below header 0 -> scrolls index 0 into view with align: 'auto'
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      });
      expect(mockScrollToIndex).toHaveBeenLastCalledWith(0, { align: 'auto' });

      // Moving down to next emoji row uses align: 'auto'
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      });
      expect(mockScrollToIndex).toHaveBeenLastCalledWith(3, { align: 'auto' });
    });
  });
});

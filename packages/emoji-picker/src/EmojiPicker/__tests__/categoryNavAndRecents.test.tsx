import React from 'react';
import { atom } from 'jotai';
import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { act, fireEvent, render } from '@testing-library/react';
import '../../atoms/emoji';
import type { CustomEmoji, CustomSection, EmojiMetadata, SkinTone } from '../../types/emoji';

const scrollToIndexCalls: Array<{
  index: number;
  options?: { align?: 'start' | 'center' | 'end' };
}> = [];

mock.module('@tanstack/react-virtual', () => ({
  useVirtualizer: (opts: { count: number; estimateSize: (index: number) => number }) => {
    const optsRef = React.useRef(opts);
    optsRef.current = opts;

    return React.useMemo(
      () => ({
        getVirtualItems: () => {
          let start = 0;
          return Array.from({ length: optsRef.current.count }, (_, index) => {
            const size = optsRef.current.estimateSize(index);
            const item = { index, start, size, key: String(index), measureElement: null };
            start += size;
            return item;
          });
        },
        getTotalSize: () => {
          let total = 0;
          for (let i = 0; i < optsRef.current.count; i++) {
            total += optsRef.current.estimateSize(i);
          }
          return total;
        },
        scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' }) => {
          scrollToIndexCalls.push({ index, options });
        },
      }),
      []
    );
  },
  defaultRangeExtractor: (range: { startIndex: number; endIndex: number }) => {
    const out: number[] = [];
    for (let i = range.startIndex; i <= range.endIndex; i++) {
      out.push(i);
    }
    return out;
  },
}));

const mockCategories = [
  {
    category: 'Smileys & Emotion',
    emojis: [
      {
        emoji: '😀',
        name: 'grinning face',
        slug: 'grinning_face',
        skin_tone_support: false,
      },
      {
        emoji: '😃',
        name: 'grinning face with big eyes',
        slug: 'grinning_face_with_big_eyes',
        skin_tone_support: false,
      },
      {
        emoji: '🔥',
        name: 'fire',
        slug: 'fire',
        skin_tone_support: false,
      },
    ],
  },
  {
    category: 'People & Body',
    emojis: [
      {
        emoji: '👍',
        name: 'thumbs up',
        slug: 'thumbs_up',
        skin_tone_support: true,
      },
      {
        emoji: '👋',
        name: 'waving hand',
        slug: 'waving_hand',
        skin_tone_support: true,
      },
    ],
  },
  {
    category: 'Animals & Nature',
    emojis: [
      {
        emoji: '🐶',
        name: 'dog face',
        slug: 'dog_face',
        skin_tone_support: false,
      },
      {
        emoji: '🐱',
        name: 'cat face',
        slug: 'cat_face',
        skin_tone_support: false,
      },
    ],
  },
];

mock.module('../../utils/supportedEmojis', () => ({
  filterSupportedEmojis: () => mockCategories,
}));

const testHoveredEmojiAtom = atom<EmojiMetadata | null>(null);
const testSelectedEmojiAtom = atom<string | null>(null);
const testSelectedPositionAtom = atom<{ row: number; column: number } | null>(null);
const testSearchAtom = atom<string>('');
const testSkinToneAtom = atom<SkinTone>('default');

mock.module('../../atoms/emoji', () => ({
  hoveredEmojiAtom: testHoveredEmojiAtom,
  selectedEmojiAtom: testSelectedEmojiAtom,
  selectedPositionAtom: testSelectedPositionAtom,
  searchAtom: testSearchAtom,
  skinToneAtom: testSkinToneAtom,
  skinToneOnlyAtom: atom((get) => get(testSkinToneAtom)),
  filteredEmojisAtom: atom((get) => {
    const q = get(testSearchAtom).trim().toLowerCase();
    if (!q) {
      return mockCategories;
    }
    return mockCategories
      .map((group) => ({
        category: group.category,
        emojis: group.emojis.filter((e) => e.name.toLowerCase().includes(q)),
      }))
      .filter((group) => group.emojis.length > 0);
  }),
}));

import {
  EmojiPicker,
  clearFrequentlyUsedEmojis,
  getFrequentlyUsedEmojis,
  useCategoryNavigation,
  useEmojiCategories,
} from '../../index';
import { DEFAULT_FREQUENTLY_USED_KEY } from '../../utils/frequentlyUsedStorage';

const customParrot: CustomEmoji = {
  id: 'parrot-1',
  name: 'party_parrot',
  imageUrl: 'https://example.com/party_parrot.gif',
};

const customShipit: CustomEmoji = {
  id: 'shipit-1',
  name: 'shipit',
  imageUrl: 'https://example.com/shipit.png',
};

const sampleCustomSections: CustomSection[] = [
  {
    id: 'slack-team',
    name: 'Team Emojis',
    emojis: [customParrot, customShipit],
    icon: <span data-testid="custom-team-icon">⚡</span>,
  },
  {
    id: 'no-icon-section',
    name: 'Community',
    emojis: [customShipit],
  },
];

describe('EmojiPicker.CategoryNav & useCategoryNavigation', () => {
  beforeEach(() => {
    scrollToIndexCalls.length = 0;
    window.localStorage.clear();
  });

  test('renders buttons for all active categories including Frequently Used and CustomSection with custom icon', () => {
    const { getByRole, getByTestId } = render(
      <EmojiPicker
        emojisPerRow={8}
        frequentlyUsedEmojis={['👍']}
        customSections={sampleCustomSections}
      >
        <EmojiPicker.CategoryNav />
        <EmojiPicker.List />
      </EmojiPicker>
    );

    const nav = getByRole('navigation', { name: 'Emoji categories' });
    expect(nav).toBeInTheDocument();

    const freqBtn = getByRole('button', { name: 'Frequently Used' });
    const customBtn = getByRole('button', { name: 'Team Emojis' });
    const defaultIconCustomBtn = getByRole('button', { name: 'Community' });
    const smileysBtn = getByRole('button', { name: 'Smileys & Emotion' });
    const peopleBtn = getByRole('button', { name: 'People & Body' });
    const animalsBtn = getByRole('button', { name: 'Animals & Nature' });

    expect(freqBtn).toHaveAttribute('aria-label', 'Frequently Used');
    expect(freqBtn).toHaveAttribute('aria-current', 'true');
    expect(freqBtn).toHaveAttribute('data-active', '');

    expect(customBtn).toHaveAttribute('aria-label', 'Team Emojis');
    expect(customBtn).not.toHaveAttribute('aria-current');
    expect(getByTestId('custom-team-icon')).toBeInTheDocument();
    expect(defaultIconCustomBtn.querySelector('svg')).not.toBeNull();

    expect(smileysBtn).toBeInTheDocument();
    expect(peopleBtn).toBeInTheDocument();
    expect(animalsBtn).toBeInTheDocument();
  });

  test('clicking a category button updates active state and scrolls virtualizer to header row index', () => {
    const { getByRole } = render(
      <EmojiPicker
        emojisPerRow={8}
        frequentlyUsedEmojis={['👍']}
        customSections={sampleCustomSections}
      >
        <EmojiPicker.CategoryNav
          hideLabel={false}
          buttonClassName="custom-btn"
          activeButtonClassName="custom-active-btn"
        />
        <EmojiPicker.List />
      </EmojiPicker>
    );

    // Row layout with emojisPerRow = 8:
    // 0: Header "Frequently Used", 1: emojis
    // 2: Header "Team Emojis", 3: emojis
    // 4: Header "Community", 5: emojis
    // 6: Header "Smileys & Emotion", 7: emojis
    // 8: Header "People & Body", 9: emojis
    // 10: Header "Animals & Nature", 11: emojis
    const peopleBtn = getByRole('button', { name: 'People & Body' });
    expect(peopleBtn.textContent).toInclude('People & Body');
    expect(peopleBtn.className).toInclude('custom-btn');

    fireEvent.click(peopleBtn);

    expect(peopleBtn).toHaveAttribute('aria-current', 'true');
    expect(peopleBtn).toHaveAttribute('data-active', '');
    expect(peopleBtn.className).toInclude('custom-active-btn');
    expect(getByRole('button', { name: 'Frequently Used' })).not.toHaveAttribute('aria-current');
    expect(scrollToIndexCalls).toContainEqual({
      index: 8,
      options: { align: 'start' },
    });
  });

  test('clicking a category button while searching clears search and scrolls to that category', () => {
    const { getByRole, container } = render(
      <EmojiPicker emojisPerRow={8}>
        <EmojiPicker.Header>
          <EmojiPicker.Input />
        </EmojiPicker.Header>
        <EmojiPicker.CategoryNav />
        <EmojiPicker.List />
      </EmojiPicker>
    );

    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'dog' } });
    expect(input.value).toBe('dog');

    // While searching, no category button should be marked active
    const animalsBtn = getByRole('button', { name: 'Animals & Nature' });
    expect(animalsBtn).not.toHaveAttribute('aria-current');

    scrollToIndexCalls.length = 0;
    fireEvent.click(animalsBtn);

    // Search should be cleared and virtualizer scrolled to "Animals & Nature" (row 4: 0=Smileys,1=row,2=People,3=row,4=Animals)
    expect(input.value).toBe('');
    expect(animalsBtn).toHaveAttribute('aria-current', 'true');
    expect(scrollToIndexCalls).toContainEqual({
      index: 4,
      options: { align: 'start' },
    });
  });

  test('scrolling the virtualized list updates active category automatically', () => {
    const { getByRole, container } = render(
      <EmojiPicker emojisPerRow={8} emojiSize={28}>
        <EmojiPicker.CategoryNav />
        <EmojiPicker.List />
      </EmojiPicker>
    );

    const smileysBtn = getByRole('button', { name: 'Smileys & Emotion' });
    const peopleBtn = getByRole('button', { name: 'People & Body' });
    const animalsBtn = getByRole('button', { name: 'Animals & Nature' });

    expect(smileysBtn).toHaveAttribute('aria-current', 'true');

    // Row 0: header (32px), Row 1: emojis (28px) -> People & Body starts at 60px, Animals starts at 120px
    const scrollContainer = container.querySelector('.overflow-y-auto') as HTMLDivElement;
    scrollContainer.scrollTop = 65;
    fireEvent.scroll(scrollContainer);
    expect(peopleBtn).toHaveAttribute('aria-current', 'true');

    scrollContainer.scrollTop = 125;
    fireEvent.scroll(scrollContainer);
    expect(animalsBtn).toHaveAttribute('aria-current', 'true');
  });

  test('supports custom renderCategory prop and useCategoryNavigation / useEmojiCategories hooks', () => {
    function CustomHud() {
      const nav = useCategoryNavigation();
      const aliasNav = useEmojiCategories();
      expect(aliasNav.categories.length).toBe(nav.categories.length);

      return (
        <div data-testid="hud">
          <span data-testid="active-id">{nav.activeCategoryId}</span>
          <button
            type="button"
            data-testid="jump-animals"
            onClick={() => nav.scrollToCategory('animals-nature')}
          >
            Jump
          </button>
        </div>
      );
    }

    const { getByTestId } = render(
      <EmojiPicker emojisPerRow={8}>
        <EmojiPicker.CategoryNav
          renderCategory={({ category, isActive, onSelect }) => (
            <button
              type="button"
              data-testid={`custom-cat-${category.id}`}
              data-is-active={String(isActive)}
              onClick={onSelect}
            >
              {category.name} ({category.rowIndex})
            </button>
          )}
        />
        <CustomHud />
        <EmojiPicker.List />
      </EmojiPicker>
    );

    expect(getByTestId('active-id').textContent).toBe('smileys-emotion');
    expect(getByTestId('custom-cat-smileys-emotion')).toHaveAttribute('data-is-active', 'true');
    expect(getByTestId('custom-cat-people-body').textContent).toBe('People & Body (2)');

    fireEvent.click(getByTestId('custom-cat-people-body'));
    expect(getByTestId('active-id').textContent).toBe('people-body');
    expect(getByTestId('custom-cat-people-body')).toHaveAttribute('data-is-active', 'true');

    fireEvent.click(getByTestId('jump-animals'));
    expect(getByTestId('active-id').textContent).toBe('animals-nature');
    expect(scrollToIndexCalls).toContainEqual({
      index: 4,
      options: { align: 'start' },
    });
  });
});

describe('persistFrequentlyUsed & Frequently Used metadata resolution', () => {
  beforeEach(() => {
    scrollToIndexCalls.length = 0;
    window.localStorage.clear();
  });

  test('persists Unicode and Custom emojis, ranks frequently clicked emojis higher under frecency, survives remount, and resolves real Unicode metadata', () => {
    const selected: string[] = [];

    const { container, unmount } = render(
      <EmojiPicker
        emojisPerRow={8}
        persistFrequentlyUsed={true}
        customSections={sampleCustomSections}
        onEmojiSelect={(e) => selected.push(e)}
      >
        <EmojiPicker.CategoryNav />
        <EmojiPicker.List />
        <EmojiPicker.Preview>{() => <EmojiPicker.Content />}</EmojiPicker.Preview>
      </EmojiPicker>
    );

    // Click custom emoji once, 😀 once, and 👍 three times so 👍 has highest frecency
    fireEvent.click(container.querySelector('button[data-emoji=":party_parrot:"]')!);
    fireEvent.click(container.querySelector('button[data-emoji="😀"]')!);

    const thumbsButtons = container.querySelectorAll('button[data-emoji="👍"]');
    fireEvent.click(thumbsButtons[thumbsButtons.length - 1]);
    fireEvent.click(thumbsButtons[thumbsButtons.length - 1]);
    fireEvent.click(thumbsButtons[thumbsButtons.length - 1]);

    expect(selected).toEqual([':party_parrot:', '😀', '👍', '👍', '👍']);

    const stored = getFrequentlyUsedEmojis();
    expect(stored).toHaveLength(3);
    expect(stored[0]).toBe('👍');
    expect(stored[1]).toBe('😀');
    expect(stored[2]).toEqual(customParrot);

    // Unmount and remount a fresh EmojiPicker instance
    unmount();

    const remounted = render(
      <EmojiPicker
        emojisPerRow={8}
        persistFrequentlyUsed={true}
        customSections={sampleCustomSections}
      >
        <EmojiPicker.CategoryNav />
        <EmojiPicker.List />
        <EmojiPicker.Preview>{() => <EmojiPicker.Content />}</EmojiPicker.Preview>
      </EmojiPicker>
    );

    // Frequently Used header and nav button should exist on remount
    expect(remounted.getByRole('button', { name: 'Frequently Used' })).toHaveAttribute(
      'aria-current',
      'true'
    );

    // Hovering 👍 in the Frequently Used row (first emoji row, index 1) should resolve real Unicode metadata
    const firstRowButtons = remounted.container.querySelectorAll(
      '[data-type="custom-emojis"] button'
    );
    expect(firstRowButtons[0]).toHaveAttribute('data-emoji', '👍');
    fireEvent.mouseEnter(firstRowButtons[0]);

    expect(remounted.container.textContent).toInclude('thumbs up');
    expect(remounted.container.textContent).toInclude(':thumbs_up:');
    expect(remounted.container.textContent).not.toInclude('frequently-used-👍');

    // clearFrequentlyUsedEmojis resets both localStorage and live picker state
    act(() => {
      clearFrequentlyUsedEmojis();
    });
    expect(getFrequentlyUsedEmojis()).toEqual([]);
    expect(window.localStorage.getItem(DEFAULT_FREQUENTLY_USED_KEY)).toBeNull();
    expect(remounted.queryByRole('button', { name: 'Frequently Used' })).toBeNull();
  });

  test('supports custom key, maxEmojis cap, and recent strategy ordering', () => {
    const customKey = 'custom-key';

    const { container, unmount } = render(
      <EmojiPicker
        emojisPerRow={8}
        customSections={sampleCustomSections}
        persistFrequentlyUsed={{ key: customKey, maxEmojis: 4, strategy: 'recent' }}
      >
        <EmojiPicker.List />
      </EmojiPicker>
    );

    const clickEmoji = (emojiAttr: string) => {
      const buttons = container.querySelectorAll(`button[data-emoji="${emojiAttr}"]`);
      fireEvent.click(buttons[buttons.length - 1]);
    };

    // Select 5 distinct items with maxEmojis: 4 and strategy: 'recent'
    clickEmoji('😀');
    clickEmoji('😃');
    clickEmoji('🔥');
    clickEmoji(':shipit:');
    clickEmoji('🐶');

    const stored = getFrequentlyUsedEmojis(customKey);
    expect(stored).toHaveLength(4);
    expect(stored).toEqual(['🐶', customShipit, '🔥', '😃']);

    // Re-selecting '🔥' moves it to the front under 'recent' even with fewer clicks than if others were clicked more
    clickEmoji('🔥');
    expect(getFrequentlyUsedEmojis(customKey)).toEqual(['🔥', '🐶', customShipit, '😃']);

    unmount();
    clearFrequentlyUsedEmojis(customKey);
    expect(getFrequentlyUsedEmojis(customKey)).toEqual([]);
  });

  test('seeds initial items from frequentlyUsedEmojis fallback when localStorage is empty', () => {
    const { container, getByRole } = render(
      <EmojiPicker
        emojisPerRow={8}
        persistFrequentlyUsed={{ key: 'seeded-key', maxEmojis: 4, strategy: 'frecency' }}
        frequentlyUsedEmojis={['🐶', '👋']}
      >
        <EmojiPicker.CategoryNav />
        <EmojiPicker.List />
      </EmojiPicker>
    );

    expect(getByRole('button', { name: 'Frequently Used' })).toHaveAttribute(
      'aria-current',
      'true'
    );

    const freqButtons = container.querySelectorAll('[data-type="custom-emojis"] button');
    expect(freqButtons[0]).toHaveAttribute('data-emoji', '🐶');
    expect(freqButtons[1]).toHaveAttribute('data-emoji', '👋');

    // Selecting a new emoji places it ahead of unclicked seed items and persists merged list
    const smileButtons = container.querySelectorAll('button[data-emoji="😀"]');
    fireEvent.click(smileButtons[smileButtons.length - 1]);
    expect(getFrequentlyUsedEmojis('seeded-key')).toEqual(['😀', '🐶', '👋']);
  });

  test('handles keyboard selection and SSR/SecurityError storage exceptions gracefully without throwing', () => {
    const originalGetItem = Storage.prototype.getItem;
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;

    Storage.prototype.getItem = () => {
      const err = new DOMException('Blocked by sandbox', 'SecurityError');
      throw err;
    };
    Storage.prototype.setItem = () => {
      const err = new DOMException('Blocked by sandbox', 'SecurityError');
      throw err;
    };
    Storage.prototype.removeItem = () => {
      const err = new DOMException('Blocked by sandbox', 'SecurityError');
      throw err;
    };

    try {
      expect(() => getFrequentlyUsedEmojis()).not.toThrow();
      expect(getFrequentlyUsedEmojis()).toEqual([]);
      expect(() => clearFrequentlyUsedEmojis()).not.toThrow();

      const onSelect = mock(() => {});
      const { container } = render(
        <EmojiPicker emojisPerRow={8} persistFrequentlyUsed={true} onEmojiSelect={onSelect}>
          <EmojiPicker.CategoryNav />
          <EmojiPicker.List />
        </EmojiPicker>
      );

      // Click selection does not throw even when setItem throws SecurityError
      expect(() => {
        fireEvent.click(container.querySelector('button[data-emoji="😀"]')!);
      }).not.toThrow();
      expect(onSelect).toHaveBeenCalledWith('😀');

      // Keyboard Enter selection also updates live Frequently Used state without throwing
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(onSelect.mock.calls.length).toBeGreaterThanOrEqual(2);
    } finally {
      Storage.prototype.getItem = originalGetItem;
      Storage.prototype.setItem = originalSetItem;
      Storage.prototype.removeItem = originalRemoveItem;
    }
  });
});

import React, { useRef, useState } from 'react';
import { atom } from 'jotai';
import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { render, fireEvent, act } from '@testing-library/react';
import { mockEmojiData, mockFilteredEmojis } from './testData';
import type {
  CustomEmoji,
  CustomSection,
  EmojiMetadata,
  EmojiSelectDetails,
  SkinTone,
} from '../../types/emoji';

mock.module('@tanstack/react-virtual', () => ({
  useVirtualizer: (options: { count: number; estimateSize: (index: number) => number }) => {
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const virtualizerRef = useRef({
      getVirtualItems: () =>
        Array.from({ length: optionsRef.current.count }, (_, index) => ({
          index,
          start: index * 32,
          size: optionsRef.current.estimateSize(index),
          key: String(index),
          measureElement: () => {},
        })),
      getTotalSize: () => optionsRef.current.count * 32,
      scrollToIndex: () => {},
    });

    return virtualizerRef.current;
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
const testIsEmojiSelectedAtom = (rowIndex: number, columnIndex: number) =>
  atom((get) => {
    const pos = get(testSelectedPositionAtom);
    return pos?.row === rowIndex && pos?.column === columnIndex;
  });
const testFilteredEmojisAtom = atom((get) => {
  const query = get(testSearchAtom).trim().toLowerCase();
  if (!query) {
    return mockFilteredEmojis;
  }
  return mockFilteredEmojis
    .map((group) => ({
      category: group.category,
      emojis: group.emojis.filter((emoji) => emoji.name.toLowerCase().includes(query)),
    }))
    .filter((group) => group.emojis.length > 0);
});
const testCombinedEmojiStateAtom = atom((get) => ({
  hoveredEmoji: get(testHoveredEmojiAtom),
  selectedEmoji: get(testSelectedEmojiAtom),
  skinTone: get(testSkinToneAtom),
}));

mock.module('../../atoms/emoji', () => ({
  hoveredEmojiAtom: testHoveredEmojiAtom,
  selectedEmojiAtom: testSelectedEmojiAtom,
  selectedPositionAtom: testSelectedPositionAtom,
  searchAtom: testSearchAtom,
  skinToneAtom: testSkinToneAtom,
  skinToneOnlyAtom: testSkinToneOnlyAtom,
  isEmojiSelectedAtom: testIsEmojiSelectedAtom,
  filteredEmojisAtom: testFilteredEmojisAtom,
  combinedEmojiStateAtom: testCombinedEmojiStateAtom,
}));

import { EmojiPicker, useActiveEmoji, useSkinTone } from '../../index';
import { DEFAULT_SKIN_TONE_STORAGE_KEY } from '../../constants';

describe('Controlled state, persistence, rich onEmojiSelect, EmojiPicker.Empty & hooks', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('1. Controlled, default, and persisted skinTone', () => {
    test('defaultSkinTone initializes uncontrolled skin tone and updates on selection', () => {
      const onSkinToneChange = mock((_tone: SkinTone) => {});

      const { container } = render(
        <EmojiPicker defaultSkinTone="medium" onSkinToneChange={onSkinToneChange}>
          <EmojiPicker.Header>
            <EmojiPicker.SkinTone />
          </EmojiPicker.Header>
          <EmojiPicker.Group>
            <EmojiPicker.List />
          </EmojiPicker.Group>
        </EmojiPicker>
      );

      // SkinTone trigger shows medium skin tone ✋🏽, and list shows 👋🏽
      const triggerButton = container.querySelector('button')!;
      expect(triggerButton.textContent).toBe('✋🏽');
      expect(container.querySelector('[data-emoji="👋🏽"]')).not.toBeNull();

      // Open skin tone picker and choose "dark" (index 5)
      fireEvent.click(triggerButton);
      const toneButtons = container.querySelectorAll('button');
      fireEvent.click(toneButtons[5]);

      expect(onSkinToneChange).toHaveBeenCalledWith('dark');
      expect(container.querySelector('[data-emoji="👋🏿"]')).not.toBeNull();
    });

    test('controlled skinTone respects external prop and calls onSkinToneChange', () => {
      const onSkinToneChange = mock((_tone: SkinTone) => {});

      function ControlledSkinToneHarness() {
        const [tone, setTone] = useState<SkinTone>('light');
        return (
          <EmojiPicker
            skinTone={tone}
            onSkinToneChange={(next) => {
              onSkinToneChange(next);
              setTone(next);
            }}
          >
            <EmojiPicker.Header>
              <EmojiPicker.SkinTone />
            </EmojiPicker.Header>
            <EmojiPicker.Group>
              <EmojiPicker.List />
            </EmojiPicker.Group>
          </EmojiPicker>
        );
      }

      const { container, rerender } = render(<ControlledSkinToneHarness />);
      expect(container.querySelector('[data-emoji="👋🏻"]')).not.toBeNull();

      // Open skin tone selector and click medium-dark (index 4)
      fireEvent.click(container.querySelector('button')!);
      const toneButtons = container.querySelectorAll('button');
      fireEvent.click(toneButtons[4]);

      expect(onSkinToneChange).toHaveBeenCalledWith('medium-dark');
      expect(container.querySelector('[data-emoji="👋🏾"]')).not.toBeNull();

      // Also verify locked controlled prop does not drift when parent holds value
      rerender(
        <EmojiPicker skinTone="light" onSkinToneChange={onSkinToneChange}>
          <EmojiPicker.Header>
            <EmojiPicker.SkinTone />
          </EmojiPicker.Header>
          <EmojiPicker.Group>
            <EmojiPicker.List />
          </EmojiPicker.Group>
        </EmojiPicker>
      );
      fireEvent.click(container.querySelector('button')!);
      fireEvent.click(container.querySelectorAll('button')[5]);
      expect(onSkinToneChange).toHaveBeenLastCalledWith('dark');
      expect(container.querySelector('[data-emoji="👋🏻"]')).not.toBeNull();
    });

    test('persistSkinTone persists and restores skin tone across unmount/remount with default and custom keys', () => {
      const firstMount = render(
        <EmojiPicker persistSkinTone>
          <EmojiPicker.Header>
            <EmojiPicker.SkinTone />
          </EmojiPicker.Header>
          <EmojiPicker.Group>
            <EmojiPicker.List />
          </EmojiPicker.Group>
        </EmojiPicker>
      );

      // Select dark skin tone
      fireEvent.click(firstMount.container.querySelector('button')!);
      fireEvent.click(firstMount.container.querySelectorAll('button')[5]);

      expect(window.localStorage.getItem(DEFAULT_SKIN_TONE_STORAGE_KEY)).toBe('dark');

      // Simulate closing Popover (unmount) and re-opening (remount)
      firstMount.unmount();

      const secondMount = render(
        <EmojiPicker persistSkinTone>
          <EmojiPicker.Header>
            <EmojiPicker.SkinTone />
          </EmojiPicker.Header>
          <EmojiPicker.Group>
            <EmojiPicker.List />
          </EmojiPicker.Group>
        </EmojiPicker>
      );

      expect(secondMount.container.querySelector('button')?.textContent).toBe('✋🏿');
      expect(secondMount.container.querySelector('[data-emoji="👋🏿"]')).not.toBeNull();
      secondMount.unmount();

      // Custom storage key
      window.localStorage.setItem('my-app:emoji-tone', 'medium-light');
      const customKeyMount = render(
        <EmojiPicker persistSkinTone="my-app:emoji-tone">
          <EmojiPicker.Header>
            <EmojiPicker.SkinTone />
          </EmojiPicker.Header>
        </EmojiPicker>
      );
      expect(customKeyMount.container.querySelector('button')?.textContent).toBe('✋🏼');
    });

    test('persistSkinTone gracefully no-ops when localStorage throws', () => {
      const originalGetItem = window.localStorage.getItem.bind(window.localStorage);
      const originalSetItem = window.localStorage.setItem.bind(window.localStorage);

      window.localStorage.getItem = () => {
        throw new Error('SecurityError: Access is denied');
      };
      window.localStorage.setItem = () => {
        throw new Error('SecurityError: Access is denied');
      };

      try {
        const { container } = render(
          <EmojiPicker persistSkinTone defaultSkinTone="light">
            <EmojiPicker.Header>
              <EmojiPicker.SkinTone />
            </EmojiPicker.Header>
          </EmojiPicker>
        );

        expect(container.querySelector('button')?.textContent).toBe('✋🏻');

        fireEvent.click(container.querySelector('button')!);
        fireEvent.click(container.querySelectorAll('button')[5]);

        expect(container.querySelector('button')?.textContent).toBe('✋🏿');
      } finally {
        window.localStorage.getItem = originalGetItem;
        window.localStorage.setItem = originalSetItem;
      }
    });
  });

  describe('2. Controlled search on EmojiPicker & EmojiPicker.Input', () => {
    test('controlled search prop on EmojiPicker filters results WITHOUT mounting EmojiPicker.Input', () => {
      const { container, rerender } = render(
        <EmojiPicker search="grin">
          <EmojiPicker.Group>
            <EmojiPicker.List />
          </EmojiPicker.Group>
        </EmojiPicker>
      );

      // No input mounted
      expect(container.querySelector('input')).toBeNull();

      // Only grinning emojis match ("😀", "😃"), waving hand ("👋") is filtered out
      expect(container.querySelector('[data-emoji="😀"]')).not.toBeNull();
      expect(container.querySelector('[data-emoji="😃"]')).not.toBeNull();
      expect(container.querySelector('[data-emoji="👋"]')).toBeNull();

      // Update search prop dynamically to "waving"
      rerender(
        <EmojiPicker search="waving">
          <EmojiPicker.Group>
            <EmojiPicker.List />
          </EmojiPicker.Group>
        </EmojiPicker>
      );

      expect(container.querySelector('[data-emoji="👋"]')).not.toBeNull();
      expect(container.querySelector('[data-emoji="😀"]')).toBeNull();
    });

    test('controlled value and onChange / onValueChange on EmojiPicker.Input drive search', () => {
      const onChangeSpy = mock((_val: string) => {});
      const onValueChangeSpy = mock((_val: string) => {});

      function ControlledInputHarness() {
        const [query, setQuery] = useState('waving');
        return (
          <EmojiPicker>
            <EmojiPicker.Header>
              <EmojiPicker.Input
                value={query}
                onChange={(e) => {
                  onChangeSpy(e.target.value);
                  setQuery(e.target.value);
                }}
                onValueChange={onValueChangeSpy}
              />
            </EmojiPicker.Header>
            <EmojiPicker.Group>
              <EmojiPicker.List />
            </EmojiPicker.Group>
          </EmojiPicker>
        );
      }

      const { container } = render(<ControlledInputHarness />);
      const input = container.querySelector('input')!;
      expect(input.value).toBe('waving');
      expect(container.querySelector('[data-emoji="👋"]')).not.toBeNull();
      expect(container.querySelector('[data-emoji="😀"]')).toBeNull();

      fireEvent.change(input, { target: { value: 'grin' } });
      expect(onChangeSpy).toHaveBeenCalledWith('grin');
      expect(onValueChangeSpy).toHaveBeenCalledWith('grin');
      expect(input.value).toBe('grin');
      expect(container.querySelector('[data-emoji="😀"]')).not.toBeNull();
      expect(container.querySelector('[data-emoji="👋"]')).toBeNull();

      // Clear button also invokes controlled onChange & onValueChange with ""
      const clearButton = container.querySelector('button')!;
      fireEvent.click(clearButton);
      expect(onChangeSpy).toHaveBeenLastCalledWith('');
      expect(onValueChangeSpy).toHaveBeenLastCalledWith('');
      expect(input.value).toBe('');
    });

    test('defaultSearch and onSearchChange work on EmojiPicker', () => {
      const onSearchChange = mock((_val: string) => {});

      const { container } = render(
        <EmojiPicker defaultSearch="waving" onSearchChange={onSearchChange}>
          <EmojiPicker.Header>
            <EmojiPicker.Input />
          </EmojiPicker.Header>
          <EmojiPicker.Group>
            <EmojiPicker.List />
          </EmojiPicker.Group>
        </EmojiPicker>
      );

      const input = container.querySelector('input')!;
      expect(input.value).toBe('waving');
      expect(container.querySelector('[data-emoji="👋"]')).not.toBeNull();
      expect(container.querySelector('[data-emoji="😀"]')).toBeNull();

      fireEvent.change(input, { target: { value: 'grin' } });
      expect(onSearchChange).toHaveBeenCalledWith('grin');
      expect(container.querySelector('[data-emoji="😀"]')).not.toBeNull();
    });
  });

  describe('3. Backwards-compatible rich onEmojiSelect(emoji, details)', () => {
    const partyParrot: CustomEmoji = {
      id: 'parrot-1',
      name: 'party-parrot',
      imageUrl: 'https://example.com/party-parrot.gif',
      category: 'Slack',
    };
    const customSections: CustomSection[] = [
      {
        id: 'slack',
        name: 'Slack',
        emojis: [partyParrot],
      },
    ];

    test('passes rich EmojiSelectDetails for Unicode emojis (with skinTone) on click and Enter', () => {
      const calls: Array<{ emoji: string; details: EmojiSelectDetails }> = [];

      const { container } = render(
        <EmojiPicker
          skinTone="dark"
          search="waving"
          onEmojiSelect={(emoji, details) => {
            calls.push({ emoji, details });
          }}
        >
          <EmojiPicker.Group>
            <EmojiPicker.List />
          </EmojiPicker.Group>
        </EmojiPicker>
      );

      // 1. Click selection
      const waveButton = container.querySelector('[data-emoji="👋🏿"]')!;
      expect(waveButton).not.toBeNull();
      fireEvent.click(waveButton);

      expect(calls.length).toBe(1);
      expect(calls[0]).toEqual({
        emoji: '👋🏿',
        details: {
          emoji: '👋🏿',
          name: 'waving hand',
          slug: 'waving-hand',
          skinTone: 'dark',
          isCustom: false,
        },
      });

      // 2. Keyboard Enter selection (search auto-selected first match)
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });

      expect(calls.length).toBe(2);
      expect(calls[1]).toEqual({
        emoji: '👋🏿',
        details: {
          emoji: '👋🏿',
          name: 'waving hand',
          slug: 'waving-hand',
          skinTone: 'dark',
          isCustom: false,
        },
      });
    });

    test('passes rich EmojiSelectDetails for CustomEmoji on click and Enter', () => {
      const calls: Array<{ emoji: string; details: EmojiSelectDetails }> = [];

      const { container } = render(
        <EmojiPicker
          skinTone="medium"
          search="party-parrot"
          customSections={customSections}
          onEmojiSelect={(emoji, details) => {
            calls.push({ emoji, details });
          }}
        >
          <EmojiPicker.Group>
            <EmojiPicker.List />
          </EmojiPicker.Group>
        </EmojiPicker>
      );

      // 1. Click selection on custom emoji
      const customBtn = container.querySelector('[data-emoji=":party-parrot:"]')!;
      expect(customBtn).not.toBeNull();
      fireEvent.click(customBtn);

      expect(calls.length).toBe(1);
      expect(calls[0]).toEqual({
        emoji: ':party-parrot:',
        details: {
          emoji: ':party-parrot:',
          name: 'party-parrot',
          slug: 'party-parrot',
          skinTone: 'medium',
          isCustom: true,
          customEmoji: partyParrot,
        },
      });

      // 2. Keyboard Enter selection on custom emoji
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });

      expect(calls.length).toBe(2);
      expect(calls[1]).toEqual({
        emoji: ':party-parrot:',
        details: {
          emoji: ':party-parrot:',
          name: 'party-parrot',
          slug: 'party-parrot',
          skinTone: 'medium',
          isCustom: true,
          customEmoji: partyParrot,
        },
      });
    });
  });

  describe('4. Composable EmojiPicker.Empty and emptyState', () => {
    test('renders custom EmojiPicker.Empty render-prop with search query and hides when results exist', () => {
      const { container, rerender } = render(
        <EmojiPicker search="zzzz-no-match">
          <EmojiPicker.Group>
            <EmojiPicker.Empty>
              {({ search }) => (
                <div data-testid="custom-empty">{`Nothing matched "${search}"`}</div>
              )}
            </EmojiPicker.Empty>
            <EmojiPicker.List />
          </EmojiPicker.Group>
        </EmojiPicker>
      );

      const customEmpty = container.querySelector('[data-testid="custom-empty"]');
      expect(customEmpty).not.toBeNull();
      expect(customEmpty?.textContent).toBe('Nothing matched "zzzz-no-match"');
      // Default "No emojis found" must not be duplicated alongside custom EmojiPicker.Empty
      expect(container.textContent).not.toInclude('No emojis found');

      // When search matches emojis, EmojiPicker.Empty renders nothing
      rerender(
        <EmojiPicker search="grin">
          <EmojiPicker.Group>
            <EmojiPicker.Empty>
              {({ search }) => (
                <div data-testid="custom-empty">{`Nothing matched "${search}"`}</div>
              )}
            </EmojiPicker.Empty>
            <EmojiPicker.List />
          </EmojiPicker.Group>
        </EmojiPicker>
      );

      expect(container.querySelector('[data-testid="custom-empty"]')).toBeNull();
      expect(container.querySelector('[data-emoji="😀"]')).not.toBeNull();
    });

    test('renders default "No emojis found" empty state when EmojiPicker.Empty is omitted', () => {
      const { container } = render(
        <EmojiPicker search="unmatched-query">
          <EmojiPicker.Group>
            <EmojiPicker.List />
          </EmojiPicker.Group>
        </EmojiPicker>
      );

      expect(container.textContent).toInclude('No emojis found');
    });

    test('supports emptyState prop on EmojiPicker.List', () => {
      const { container } = render(
        <EmojiPicker search="missing-shortcode">
          <EmojiPicker.Group>
            <EmojiPicker.List
              emptyState={({ search }) => <span data-testid="list-empty">Zero for {search}</span>}
            />
          </EmojiPicker.Group>
        </EmojiPicker>
      );

      expect(container.querySelector('[data-testid="list-empty"]')?.textContent).toBe(
        'Zero for missing-shortcode'
      );
      expect(container.textContent).not.toInclude('No emojis found');
    });
  });

  describe('5. Public hooks (useActiveEmoji, useSkinTone) + ActiveEmoji + CustomEmoji dominantColor', () => {
    test('useSkinTone("👋") returns active skinTone, setter, and all 6 toned variations', () => {
      const onSkinToneChange = mock((_tone: SkinTone) => {});

      function SkinToneHookConsumer() {
        const [skinTone, setSkinTone, variations] = useSkinTone('👋');
        return (
          <div>
            <span data-testid="current-tone">{skinTone}</span>
            <div data-testid="variations">
              {variations.map((v) => (
                <button
                  key={v.skinTone}
                  type="button"
                  data-tone={v.skinTone}
                  onClick={() => setSkinTone(v.skinTone)}
                >
                  {v.emoji}
                </button>
              ))}
            </div>
          </div>
        );
      }

      const { container } = render(
        <EmojiPicker defaultSkinTone="light" onSkinToneChange={onSkinToneChange}>
          <SkinToneHookConsumer />
        </EmojiPicker>
      );

      expect(container.querySelector('[data-testid="current-tone"]')?.textContent).toBe('light');

      const variationButtons = Array.from(
        container.querySelectorAll('[data-testid="variations"] button')
      );
      expect(variationButtons.map((b) => b.textContent)).toEqual([
        '👋',
        '👋🏻',
        '👋🏼',
        '👋🏽',
        '👋🏾',
        '👋🏿',
      ]);

      // Clicking medium-dark updates picker skinTone and triggers onSkinToneChange
      fireEvent.click(container.querySelector('[data-tone="medium-dark"]')!);
      expect(container.querySelector('[data-testid="current-tone"]')?.textContent).toBe(
        'medium-dark'
      );
      expect(onSkinToneChange).toHaveBeenCalledWith('medium-dark');
    });

    test('useActiveEmoji() and EmojiPicker.ActiveEmoji reflect hovered Unicode (with skinTone) and CustomEmoji', () => {
      const customRocket: CustomEmoji = {
        id: 'shipit-1',
        name: 'shipit',
        imageUrl: 'https://example.com/shipit.png',
      };

      function ActiveReadout() {
        const active = useActiveEmoji();
        return (
          <div
            data-testid="hook-active"
            data-is-custom={active ? String(Boolean(active.isCustom)) : 'none'}
            data-image-url={active?.imageUrl ?? ''}
          >
            {active ? `${active.emoji}|${active.name}` : 'idle'}
          </div>
        );
      }

      const { container } = render(
        <EmojiPicker
          skinTone="dark"
          customSections={[{ id: 'team', name: 'Team', emojis: [customRocket] }]}
        >
          <EmojiPicker.Group>
            <EmojiPicker.List />
          </EmojiPicker.Group>
          <ActiveReadout />
          <EmojiPicker.ActiveEmoji>
            {({ emoji }) => <div data-testid="compound-active">{emoji ? emoji.emoji : 'none'}</div>}
          </EmojiPicker.ActiveEmoji>
        </EmojiPicker>
      );

      expect(container.querySelector('[data-testid="hook-active"]')?.textContent).toBe('idle');
      expect(container.querySelector('[data-testid="compound-active"]')?.textContent).toBe('none');

      // Hover skin-tone-capable Unicode emoji 👋 -> active emoji has dark skin tone 👋🏿
      const waveBtn = container.querySelector('[data-emoji="👋🏿"]')!;
      fireEvent.mouseEnter(waveBtn);

      expect(container.querySelector('[data-testid="hook-active"]')?.textContent).toBe(
        '👋🏿|waving hand'
      );
      expect(
        container.querySelector('[data-testid="hook-active"]')?.getAttribute('data-is-custom')
      ).toBe('false');
      expect(container.querySelector('[data-testid="compound-active"]')?.textContent).toBe('👋🏿');

      // Hover custom emoji :shipit: -> active emoji includes isCustom: true and imageUrl
      const shipitBtn = container.querySelector('[data-emoji=":shipit:"]')!;
      fireEvent.mouseEnter(shipitBtn);

      expect(container.querySelector('[data-testid="hook-active"]')?.textContent).toBe(
        ':shipit:|shipit'
      );
      expect(
        container.querySelector('[data-testid="hook-active"]')?.getAttribute('data-is-custom')
      ).toBe('true');
      expect(
        container.querySelector('[data-testid="hook-active"]')?.getAttribute('data-image-url')
      ).toBe('https://example.com/shipit.png');
      expect(container.querySelector('[data-testid="compound-active"]')?.textContent).toBe(
        ':shipit:'
      );

      fireEvent.mouseLeave(shipitBtn);
      expect(container.querySelector('[data-testid="hook-active"]')?.textContent).toBe('idle');
    });

    test('CustomEmoji dominantColor sets --emoji-hover-color CSS variable and hover/ring classes, while falling back cleanly when omitted', () => {
      const coloredEmoji: CustomEmoji = {
        id: 'brand-1',
        name: 'brand-star',
        imageUrl: 'https://example.com/star.png',
        dominantColor: 'rgba(99, 102, 241, 0.2)',
      };
      const plainEmoji: CustomEmoji = {
        id: 'plain-1',
        name: 'plain-star',
        imageUrl: 'https://example.com/plain.png',
      };

      const { container } = render(
        <EmojiPicker
          customSections={[
            {
              id: 'brand',
              name: 'Brand',
              emojis: [coloredEmoji, plainEmoji],
            },
          ]}
        >
          <EmojiPicker.Group>
            <EmojiPicker.List />
          </EmojiPicker.Group>
        </EmojiPicker>
      );

      const coloredBtn = container.querySelector(
        '[data-emoji=":brand-star:"]'
      ) as HTMLButtonElement;
      const plainBtn = container.querySelector('[data-emoji=":plain-star:"]') as HTMLButtonElement;

      expect(coloredBtn).not.toBeNull();
      expect(coloredBtn.style.getPropertyValue('--emoji-hover-color')).toBe(
        'rgba(99, 102, 241, 0.2)'
      );
      expect(coloredBtn.className).toInclude('hover:bg-[var(--emoji-hover-color)]');
      expect(coloredBtn.className).toInclude('focus:ring-[var(--emoji-hover-color)]');

      expect(plainBtn).not.toBeNull();
      expect(plainBtn.style.getPropertyValue('--emoji-hover-color')).toBe('');
      expect(plainBtn.className).toInclude('hover:bg-slate-100');
    });
  });
});

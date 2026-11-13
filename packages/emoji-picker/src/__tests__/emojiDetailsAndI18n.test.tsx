import React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, mock, test } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { Emoji, EmojiPicker, formatShortcode, getEmojiDetails, useEmojiDetails } from '../index';

import type { CustomEmoji, CustomSection, EmojiLocaleData } from '../index';

describe('SSR Emoji Details, <Emoji />, i18n, and Curation', () => {
  beforeAll(() => {
    mock.module('@tanstack/react-virtual', () => ({
      useVirtualizer: (options: { count: number; estimateSize?: (index: number) => number }) => {
        const optionsRef = React.useRef(options);
        optionsRef.current = options;

        const instanceRef = React.useRef({
          getVirtualItems: () => {
            const opts = optionsRef.current;
            const count = Math.min(opts.count ?? 0, 80);
            return Array.from({ length: count }, (_, index) => {
              const size = opts.estimateSize ? opts.estimateSize(index) : 32;
              return {
                index,
                start: index * 32,
                size,
                key: String(index),
                measureElement: null,
              };
            });
          },
          getTotalSize: () => (optionsRef.current.count ?? 0) * 32,
          scrollToIndex: () => {},
        });

        return instanceRef.current;
      },
      defaultRangeExtractor: (range: { startIndex: number; endIndex: number }) => {
        const result: number[] = [];
        for (let i = range.startIndex; i <= range.endIndex; i++) {
          result.push(i);
        }
        return result;
      },
    }));
  });

  afterEach(() => {
    cleanup();
  });

  describe('formatShortcode()', () => {
    test('formats slugs, names, and already-colonized shortcodes consistently', () => {
      expect(formatShortcode('thumbs_up')).toBe(':thumbs_up:');
      expect(formatShortcode(':thumbs_up:')).toBe(':thumbs_up:');
      expect(formatShortcode('Thumbs Up')).toBe(':thumbs_up:');
      expect(formatShortcode('mic-drop')).toBe(':mic-drop:');
      expect(formatShortcode('')).toBe('');
    });
  });

  describe('getEmojiDetails() and useEmojiDetails()', () => {
    const customEmojis: CustomEmoji[] = [
      {
        id: 'shipit',
        name: 'shipit',
        imageUrl: 'https://example.com/shipit.png',
        category: 'Engineering',
      },
    ];

    const customSections: CustomSection[] = [
      {
        id: 'parrots',
        name: 'Parrots',
        emojis: [
          {
            id: 'shipitparrot',
            name: 'shipitparrot',
            imageUrl: 'https://example.com/shipitparrot.gif',
          },
        ],
      },
    ];

    test('resolves base emoji, variation selectors, skin tones, shortcodes, and custom emojis', () => {
      // Base emoji
      const grinning = getEmojiDetails('😀');
      expect(grinning).toBeDefined();
      expect(grinning?.emoji).toBe('😀');
      expect(grinning?.baseEmoji).toBe('😀');
      expect(grinning?.name).toBe('grinning face');
      expect(grinning?.slug).toBe('grinning_face');
      expect(grinning?.shortcode).toBe(':grinning_face:');
      expect(grinning?.category).toBe('Smileys & Emotion');
      expect(grinning?.skinToneSupport).toBe(false);
      expect(grinning?.skinTone).toBe('default');
      expect(grinning?.isCustom).toBe(false);

      // Emoji with and without \uFE0F / \uFE0E variation selectors
      const heartWithVS = getEmojiDetails('❤️');
      const heartWithoutVS = getEmojiDetails('❤');
      const heartWithTextVS = getEmojiDetails('❤\uFE0E');
      expect(heartWithVS).toBeDefined();
      expect(heartWithoutVS).toEqual(heartWithVS);
      expect(heartWithTextVS).toEqual(heartWithVS);
      expect(heartWithoutVS?.baseEmoji).toBe('❤️');
      expect(heartWithoutVS?.shortcode).toBe(':red_heart:');

      // Skin-toned emoji variants
      const darkThumbsUp = getEmojiDetails('👍🏿');
      expect(darkThumbsUp).toBeDefined();
      expect(darkThumbsUp?.emoji).toBe('👍🏿');
      expect(darkThumbsUp?.baseEmoji).toBe('👍');
      expect(darkThumbsUp?.name).toBe('thumbs up');
      expect(darkThumbsUp?.slug).toBe('thumbs_up');
      expect(darkThumbsUp?.shortcode).toBe(':thumbs_up:');
      expect(darkThumbsUp?.skinToneSupport).toBe(true);
      expect(darkThumbsUp?.skinTone).toBe('dark');
      expect(darkThumbsUp?.isCustom).toBe(false);

      const mediumWave = getEmojiDetails('👋🏽');
      expect(mediumWave?.baseEmoji).toBe('👋');
      expect(mediumWave?.skinTone).toBe('medium');

      const holdingHandsDark = getEmojiDetails('🧑🏿‍🤝‍🧑🏿');
      expect(holdingHandsDark?.baseEmoji).toBe('🧑‍🤝‍🧑');
      expect(holdingHandsDark?.slug).toBe('people_holding_hands');
      expect(holdingHandsDark?.skinTone).toBe('dark');

      const splayedHand = getEmojiDetails('🖐🏽');
      expect(splayedHand?.baseEmoji).toBe('🖐️');
      expect(splayedHand?.skinTone).toBe('medium');

      // Shortcode and slug variants
      const partyPopper = getEmojiDetails(':party_popper:');
      expect(partyPopper).toBeDefined();
      expect(partyPopper?.emoji).toBe('🎉');
      expect(partyPopper?.baseEmoji).toBe('🎉');
      expect(partyPopper?.name).toBe('party popper');
      expect(partyPopper?.shortcode).toBe(':party_popper:');

      expect(getEmojiDetails('thumbs_up')?.emoji).toBe('👍');
      expect(getEmojiDetails('thumbs-up')?.emoji).toBe('👍');

      // CustomEmoji via customEmojis and customSections
      const shipit = getEmojiDetails(':shipit:', { customEmojis });
      expect(shipit).toEqual({
        emoji: ':shipit:',
        baseEmoji: ':shipit:',
        name: 'shipit',
        slug: 'shipit',
        shortcode: ':shipit:',
        category: 'Engineering',
        unicodeVersion: '',
        emojiVersion: '',
        skinToneSupport: false,
        skinTone: 'default',
        isCustom: true,
        imageUrl: 'https://example.com/shipit.png',
      });

      const parrot = getEmojiDetails('shipitparrot', { customSections });
      expect(parrot?.isCustom).toBe(true);
      expect(parrot?.shortcode).toBe(':shipitparrot:');
      expect(parrot?.category).toBe('Parrots');
      expect(parrot?.imageUrl).toBe('https://example.com/shipitparrot.gif');

      // Localized name & category via localeData
      const frenchLocale: EmojiLocaleData = {
        locale: 'fr',
        categories: { 'People & Body': 'Personnes et corps' },
        emojis: { '👍': { name: 'pouce vers le haut', keywords: ['oui'] } },
      };
      const localizedThumbs = getEmojiDetails('👍🏿', { localeData: frenchLocale });
      expect(localizedThumbs?.name).toBe('pouce vers le haut');
      expect(localizedThumbs?.category).toBe('Personnes et corps');
      expect(localizedThumbs?.skinTone).toBe('dark');

      // Unknown / empty
      expect(getEmojiDetails('')).toBeUndefined();
      expect(getEmojiDetails(':unknown_shortcode:')).toBeUndefined();
    });

    test('useEmojiDetails works synchronously on client AND in SSR renderToString with zero throws', () => {
      function DetailsProbe({ query, custom }: { query: string; custom?: CustomEmoji[] }) {
        const details = useEmojiDetails(query, { customEmojis: custom });
        if (!details) return <span>missing</span>;
        return (
          <span data-skin={details.skinTone} data-base={details.baseEmoji}>
            {`${details.emoji}|${details.name}|${details.shortcode}`}
          </span>
        );
      }

      // Simulated SSR via renderToString — must NOT throw or suspend!
      const ssrBase = renderToString(<DetailsProbe query="😀" />);
      expect(ssrBase).toContain('😀|grinning face|:grinning_face:');

      const ssrHeartNoVS = renderToString(<DetailsProbe query="❤" />);
      expect(ssrHeartNoVS).toContain('❤️|red heart|:red_heart:');

      const ssrSkinTone = renderToString(<DetailsProbe query="👍🏿" />);
      expect(ssrSkinTone).toContain('data-skin="dark"');
      expect(ssrSkinTone).toContain('data-base="👍"');
      expect(ssrSkinTone).toContain('👍🏿|thumbs up|:thumbs_up:');

      const ssrShortcode = renderToString(<DetailsProbe query=":party_popper:" />);
      expect(ssrShortcode).toContain('🎉|party popper|:party_popper:');

      const ssrCustom = renderToString(<DetailsProbe query=":shipit:" custom={customEmojis} />);
      expect(ssrCustom).toContain(':shipit:|shipit|:shipit:');

      // Client render verification
      const { container } = render(<DetailsProbe query="👍🏿" />);
      expect(container.textContent).toBe('👍🏿|thumbs up|:thumbs_up:');
    });
  });

  describe('<Emoji /> component', () => {
    const customEmojis: CustomEmoji[] = [
      {
        id: 'mic-drop',
        name: 'mic-drop',
        imageUrl: 'https://example.com/mic-drop.gif',
      },
    ];

    test('renders Unicode emoji with accessible role and aria-label, size, and skinTone override', () => {
      const { container, rerender } = render(<Emoji emoji="😀" size={24} />);
      const span = container.querySelector('[role="img"]') as HTMLSpanElement;
      expect(span).not.toBeNull();
      expect(span.getAttribute('aria-label')).toBe('grinning face');
      expect(span.style.fontSize).toBe('24px');
      expect(span.textContent).toBe('😀');

      // Applies skinTone prop to skin-tone-capable emoji
      rerender(<Emoji emoji="👍" skinTone="dark" />);
      expect(container.querySelector('[role="img"]')?.textContent).toBe('👍🏿');

      // Resolves :thumbs_up: shortcode to 👍 (and supports skinTone override too)
      rerender(<Emoji emoji=":thumbs_up:" />);
      const resolved = container.querySelector('[role="img"]');
      expect(resolved?.textContent).toBe('👍');
      expect(resolved?.getAttribute('aria-label')).toBe('thumbs up');

      rerender(<Emoji emoji=":thumbs_up:" skinTone="medium" />);
      expect(container.querySelector('[role="img"]')?.textContent).toBe('👍🏽');
    });

    test('renders CustomEmoji <img> and switches to fallback on image load error or unknown shortcode', () => {
      const { container } = render(
        <Emoji
          emoji=":mic-drop:"
          customEmojis={customEmojis}
          size={28}
          fallback={(raw, details) => (
            <span data-testid="custom-fallback">{details?.shortcode ?? raw}</span>
          )}
        />
      );

      const img = container.querySelector('img') as HTMLImageElement;
      expect(img).not.toBeNull();
      expect(img.getAttribute('src')).toBe('https://example.com/mic-drop.gif');
      expect(img.getAttribute('alt')).toBe('mic-drop');
      expect(img.getAttribute('width')).toBe('28');
      expect(img.style.width).toBe('28px');

      // Trigger image error -> renders fallback
      fireEvent.error(img);
      expect(container.querySelector('img')).toBeNull();
      const fallbackEl = container.querySelector('[data-testid="custom-fallback"]');
      expect(fallbackEl?.textContent).toBe(':mic-drop:');

      // Unknown shortcode renders fallback when provided
      const unknownRender = render(
        <Emoji
          emoji=":unknown_shortcode:"
          fallback={<span data-testid="unknown-fb">fallback</span>}
        />
      );
      expect(unknownRender.container.querySelector('[data-testid="unknown-fb"]')?.textContent).toBe(
        'fallback'
      );
    });

    test('renders cleanly in SSR renderToString for Unicode, shortcodes, and CustomEmoji without hydration mismatch', () => {
      const unicodeHtml = renderToString(<Emoji emoji=":thumbs_up:" skinTone="light" size={20} />);
      expect(unicodeHtml).toContain('role="img"');
      expect(unicodeHtml).toContain('aria-label="thumbs up"');
      expect(unicodeHtml).toContain('👍🏻');

      const customHtml = renderToString(
        <Emoji emoji=":mic-drop:" customEmojis={customEmojis} size={24} />
      );
      expect(customHtml).toContain('<img');
      expect(customHtml).toContain('https://example.com/mic-drop.gif');

      // With checkSupport={true}, SSR still renders the emoji cleanly so hydration never mismatches,
      // while client checkSupport replaces unsupported Unicode 16.0 emojis (e.g. 🫩) with fallback/:shortcode:
      const unsupportedSsrHtml = renderToString(<Emoji emoji="🫩" checkSupport />);
      expect(unsupportedSsrHtml).toContain('🫩');

      const { container } = render(<Emoji emoji="🫩" checkSupport />);
      expect(container.textContent).toBe(':face_with_bags_under_eyes:');
    });
  });

  describe('Localization (labels, localeData, englishSearchFallback)', () => {
    const frenchLocaleData: EmojiLocaleData = {
      locale: 'fr',
      categories: {
        'Smileys & Emotion': 'Émoticônes et émotion',
        'People & Body': 'Personnes et corps',
      },
      emojis: {
        '😀': {
          name: 'visage souriant',
          keywords: ['heureux', 'sourire'],
        },
        '🎉': {
          name: 'cotillons',
          keywords: ['fête', 'célébration'],
        },
      },
      labels: {
        searchPlaceholder: 'Rechercher un emoji...',
        searchResultsHeader: 'Résultats de recherche',
        emptyState: 'Aucun emoji trouvé',
        frequentlyUsedHeader: 'Fréquemment utilisés',
        chooseSkinTone: 'Choisissez votre teint par défaut',
      },
    };

    const spanishLocaleData: EmojiLocaleData = {
      locale: 'es',
      categories: {
        'Smileys & Emotion': 'Emoticonos y emociones',
      },
      emojis: {
        '❤️': {
          name: 'corazón rojo',
          keywords: ['amor', 'cariño'],
        },
      },
      labels: {
        searchResultsHeader: 'Resultados de búsqueda',
        emptyState: 'No se encontraron emojis',
      },
    };

    test('translates category headers, input placeholder, skin tone prompt, preview names, search header, and empty state', () => {
      const { container } = render(
        <EmojiPicker
          localeData={frenchLocaleData}
          frequentlyUsedEmojis={['👍']}
          categories={['Smileys & Emotion', 'People & Body']}
        >
          <EmojiPicker.Header>
            <EmojiPicker.Input />
            <EmojiPicker.SkinTone />
          </EmojiPicker.Header>
          <EmojiPicker.List />
          <EmojiPicker.Preview>
            {({ previewedEmoji }) => (
              <div data-testid="preview-name">{previewedEmoji?.name ?? 'idle'}</div>
            )}
          </EmojiPicker.Preview>
        </EmojiPicker>
      );

      // Translated placeholder
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.getAttribute('placeholder')).toBe('Rechercher un emoji...');

      // Translated category headers + frequently used header
      const headers = Array.from(
        container.querySelectorAll('[data-testid="emoji-picker-list-header"]')
      ).map((el) => el.textContent);
      expect(headers).toContain('Fréquemment utilisés');
      expect(headers).toContain('Émoticônes et émotion');

      // Translated skin tone prompt when skin tone selector is opened
      const skinToneTrigger = container.querySelectorAll('button')[0] as HTMLButtonElement;
      fireEvent.click(skinToneTrigger);
      expect(container.textContent).toContain('Choisissez votre teint par défaut');

      // Hover 😀 button -> preview shows French name
      const grinningBtn = container.querySelector('button[data-emoji="😀"]') as HTMLButtonElement;
      expect(grinningBtn).not.toBeNull();
      fireEvent.mouseEnter(grinningBtn);
      expect(container.querySelector('[data-testid="preview-name"]')?.textContent).toBe(
        'visage souriant'
      );

      // Explicit labels prop overrides localeData.labels
      const overrideRender = render(
        <EmojiPicker
          localeData={frenchLocaleData}
          labels={{
            searchPlaceholder: 'Chercher...',
            emptyState: 'Rien ici',
            searchResultsHeader: 'Résultats personnalisés',
          }}
        >
          <EmojiPicker.Header>
            <EmojiPicker.Input />
          </EmojiPicker.Header>
          <EmojiPicker.List />
        </EmojiPicker>
      );

      const overrideInput = overrideRender.container.querySelector('input') as HTMLInputElement;
      expect(overrideInput.getAttribute('placeholder')).toBe('Chercher...');

      fireEvent.change(overrideInput, { target: { value: 'zzzz_no_match_999' } });
      expect(overrideRender.container.textContent).toContain('Résultats personnalisés');
      expect(overrideRender.container.textContent).toContain('Rien ici');
    });

    test('matches BOTH localized French/Spanish terms AND English fallback terms unless englishSearchFallback={false}', () => {
      const { container, rerender } = render(
        <EmojiPicker localeData={frenchLocaleData}>
          <EmojiPicker.Header>
            <EmojiPicker.Input />
          </EmojiPicker.Header>
          <EmojiPicker.List />
        </EmojiPicker>
      );

      const input = container.querySelector('input') as HTMLInputElement;

      // 1. Matches French name
      fireEvent.change(input, { target: { value: 'visage souriant' } });
      expect(container.textContent).toContain('Résultats de recherche');
      expect(container.querySelector('button[data-emoji="😀"]')).not.toBeNull();

      // 2. Matches French keyword
      fireEvent.change(input, { target: { value: 'célébration' } });
      expect(container.querySelector('button[data-emoji="🎉"]')).not.toBeNull();

      // 3. Matches English fallback name & shortcode by default (englishSearchFallback = true)
      fireEvent.change(input, { target: { value: 'grinning face' } });
      expect(container.querySelector('button[data-emoji="😀"]')).not.toBeNull();

      fireEvent.change(input, { target: { value: ':party_popper:' } });
      expect(container.querySelector('button[data-emoji="🎉"]')).not.toBeNull();

      // 4. With englishSearchFallback={false}, English terms no longer match while French terms still do
      rerender(
        <EmojiPicker localeData={frenchLocaleData} englishSearchFallback={false}>
          <EmojiPicker.Header>
            <EmojiPicker.Input />
          </EmojiPicker.Header>
          <EmojiPicker.List />
        </EmojiPicker>
      );

      fireEvent.change(input, { target: { value: 'grinning face' } });
      expect(container.querySelector('button[data-emoji="😀"]')).toBeNull();
      expect(container.textContent).toContain('Aucun emoji trouvé');

      fireEvent.change(input, { target: { value: 'heureux' } });
      expect(container.querySelector('button[data-emoji="😀"]')).not.toBeNull();

      // 5. Spanish localeData works for both Spanish keywords and English fallback
      const esRender = render(
        <EmojiPicker localeData={spanishLocaleData}>
          <EmojiPicker.Header>
            <EmojiPicker.Input />
          </EmojiPicker.Header>
          <EmojiPicker.List />
        </EmojiPicker>
      );
      const esInput = esRender.container.querySelector('input') as HTMLInputElement;
      fireEvent.change(esInput, { target: { value: 'corazón' } });
      expect(esRender.container.textContent).toContain('Resultados de búsqueda');
      expect(esRender.container.querySelector('button[data-emoji="❤️"]')).not.toBeNull();

      fireEvent.change(esInput, { target: { value: 'red heart' } });
      expect(esRender.container.querySelector('button[data-emoji="❤️"]')).not.toBeNull();
    });
  });

  describe('Emoji curation (filterEmoji and categories)', () => {
    test('filterEmoji hides specific emojis across both category list and search results', () => {
      const { container } = render(
        <EmojiPicker
          categories={['Smileys & Emotion']}
          filterEmoji={(emoji) =>
            emoji.emoji !== '😀' && emoji.slug !== 'grinning_face_with_big_eyes'
          }
        >
          <EmojiPicker.Header>
            <EmojiPicker.Input />
          </EmojiPicker.Header>
          <EmojiPicker.List />
        </EmojiPicker>
      );

      // Hidden in category view while other Smileys remain visible
      expect(container.querySelector('button[data-emoji="😀"]')).toBeNull();
      expect(container.querySelector('button[data-emoji="😃"]')).toBeNull();
      expect(container.querySelector('button[data-emoji="😄"]')).not.toBeNull();

      // Hidden in search results too
      const input = container.querySelector('input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'grinning face' } });
      expect(container.querySelector('button[data-emoji="😀"]')).toBeNull();
      expect(container.querySelector('button[data-emoji="😃"]')).toBeNull();
      expect(container.querySelector('button[data-emoji="😄"]')).not.toBeNull();
    });

    test('categories filters and reorders displayed categories and scopes search results', () => {
      const { container } = render(
        <EmojiPicker
          categories={['Activities', 'Smileys & Emotion']}
          filterEmoji={(emoji) => emoji.emoji === '🎃' || emoji.emoji === '😀'}
        >
          <EmojiPicker.Header>
            <EmojiPicker.Input />
          </EmojiPicker.Header>
          <EmojiPicker.List />
        </EmojiPicker>
      );

      const headers = Array.from(
        container.querySelectorAll('[data-testid="emoji-picker-list-header"]')
      ).map((el) => el.textContent);

      // Reordered: Activities appears BEFORE Smileys & Emotion, and all other categories are excluded
      expect(headers).toEqual(['Activities', 'Smileys & Emotion']);
      expect(container.querySelector('button[data-emoji="🎃"]')).not.toBeNull();
      expect(container.querySelector('button[data-emoji="😀"]')).not.toBeNull();

      // Searching an emoji from an excluded category (e.g. Flags / People & Body) returns empty
      const input = container.querySelector('input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'thumbs up' } });
      expect(container.querySelector('button[data-emoji="👍"]')).toBeNull();
      expect(container.textContent).toContain('No emojis found');
    });
  });
});

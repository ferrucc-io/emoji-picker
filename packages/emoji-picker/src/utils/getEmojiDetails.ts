import rawEmojiData from 'unicode-emoji-json/data-by-group.json';
import { useMemo } from 'react';
import { loadJsonData } from './loadJsonData';
import { isCustomEmoji } from '../types/emoji';

import type {
  CustomEmoji,
  EmojiDetails,
  EmojiGroupData,
  EmojiLocaleData,
  EmojiPickerLabels,
  GetEmojiDetailsOptions,
  SkinTone,
} from '../types/emoji';

export type { EmojiDetails, GetEmojiDetailsOptions } from '../types/emoji';

const SKIN_TONE_BY_MODIFIER: Record<string, SkinTone> = {
  '\u{1F3FB}': 'light',
  '\u{1F3FC}': 'medium-light',
  '\u{1F3FD}': 'medium',
  '\u{1F3FE}': 'medium-dark',
  '\u{1F3FF}': 'dark',
};

const ZWJ_BASE_ALIASES: Array<[string, string]> = [
  ['👩‍🤝‍👩', '👭'],
  ['👩‍🤝‍👨', '👫'],
  ['👨‍🤝‍👨', '👬'],
  ['🫱‍🫲', '🤝'],
];

interface IndexedEmojiEntry {
  emoji: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  unicodeVersion: string;
  emojiVersion: string;
  skinToneSupport: boolean;
}

interface EmojiLookupIndex {
  groups: EmojiGroupData[];
  byEmoji: Map<string, IndexedEmojiEntry>;
  bySlug: Map<string, IndexedEmojiEntry>;
}

let cachedIndex: EmojiLookupIndex | null = null;

export function stripVariationSelectors(value: string): string {
  return value.replace(/[\uFE0E\uFE0F]/g, '');
}

export function stripSkinToneModifiers(value: string): string {
  return value.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '');
}

export function detectSkinTone(value: string): SkinTone {
  const match = value.match(/[\u{1F3FB}-\u{1F3FF}]/u);
  if (!match) {
    return 'default';
  }
  return SKIN_TONE_BY_MODIFIER[match[0]] ?? 'default';
}

export function formatShortcode(slugOrName: string): string {
  if (!slugOrName || typeof slugOrName !== 'string') {
    return '';
  }

  const trimmed = slugOrName
    .trim()
    .replace(/^:+|:+$/g, '')
    .trim();
  if (!trimmed) {
    return '';
  }

  const normalized = /\s/.test(trimmed)
    ? trimmed
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '')
    : trimmed.toLowerCase();

  return normalized ? `:${normalized}:` : '';
}

export function getCanonicalEmojiGroups(): EmojiGroupData[] {
  return getEmojiIndex().groups;
}

function getEmojiIndex(): EmojiLookupIndex {
  if (cachedIndex) {
    return cachedIndex;
  }

  const groups = loadJsonData(
    rawEmojiData as unknown as EmojiGroupData[],
    'unicode-emoji-json/data-by-group.json',
    (data) => !Array.isArray(data) || data.length === 0
  );

  const byEmoji = new Map<string, IndexedEmojiEntry>();
  const bySlug = new Map<string, IndexedEmojiEntry>();

  if (Array.isArray(groups)) {
    for (const group of groups) {
      if (!group || !Array.isArray(group.emojis)) continue;

      for (const item of group.emojis) {
        if (!item?.emoji || !item?.name) continue;

        const slug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const entry: IndexedEmojiEntry = {
          emoji: item.emoji,
          name: item.name,
          slug,
          category: group.name,
          categorySlug: group.slug || group.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          unicodeVersion: item.unicode_version || '',
          emojiVersion: item.emoji_version || '',
          skinToneSupport: Boolean(item.skin_tone_support),
        };

        byEmoji.set(entry.emoji, entry);

        const strippedVariation = stripVariationSelectors(entry.emoji);
        if (!byEmoji.has(strippedVariation)) {
          byEmoji.set(strippedVariation, entry);
        }

        const normalizedSlug = slug.toLowerCase();
        if (!bySlug.has(normalizedSlug)) {
          bySlug.set(normalizedSlug, entry);
        }
      }
    }

    for (const [zwjAlias, canonicalEmoji] of ZWJ_BASE_ALIASES) {
      const target =
        byEmoji.get(canonicalEmoji) ?? byEmoji.get(stripVariationSelectors(canonicalEmoji));
      if (target) {
        if (!byEmoji.has(zwjAlias)) {
          byEmoji.set(zwjAlias, target);
        }
        const strippedAlias = stripVariationSelectors(zwjAlias);
        if (!byEmoji.has(strippedAlias)) {
          byEmoji.set(strippedAlias, target);
        }
      }
    }
  }

  cachedIndex = { groups: Array.isArray(groups) ? groups : [], byEmoji, bySlug };
  return cachedIndex;
}

export function getLocalizedEmojiEntry(
  emojiChar: string,
  localeData?: EmojiLocaleData
): { name: string; keywords?: string[] } | undefined {
  const emojisMap = localeData?.emojis;
  if (!emojisMap || !emojiChar) {
    return undefined;
  }

  const direct = emojisMap[emojiChar] ?? emojisMap[stripVariationSelectors(emojiChar)];
  if (direct) {
    return direct;
  }

  const base = stripSkinToneModifiers(emojiChar);
  return emojisMap[base] ?? emojisMap[stripVariationSelectors(base)];
}

export function resolveCategoryLabel(
  categoryName: string,
  labels?: EmojiPickerLabels,
  localeData?: EmojiLocaleData,
  categorySlug?: string
): string {
  const derivedSlug =
    categorySlug ||
    categoryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  const hyphenSlug = derivedSlug.replace(/_/g, '-');

  return (
    labels?.categories?.[categoryName] ??
    labels?.categories?.[derivedSlug] ??
    labels?.categories?.[hyphenSlug] ??
    localeData?.categories?.[categoryName] ??
    localeData?.categories?.[derivedSlug] ??
    localeData?.categories?.[hyphenSlug] ??
    localeData?.labels?.categories?.[categoryName] ??
    localeData?.labels?.categories?.[derivedSlug] ??
    localeData?.labels?.categories?.[hyphenSlug] ??
    categoryName
  );
}

function findCustomEmojiDetails(
  query: string,
  options?: GetEmojiDetailsOptions
): EmojiDetails | undefined {
  const customEmojis = options?.customEmojis;
  const customSections = options?.customSections;

  if (
    (!customEmojis || customEmojis.length === 0) &&
    (!customSections || customSections.length === 0)
  ) {
    return undefined;
  }

  const stripped = query
    .replace(/^:+|:+$/g, '')
    .trim()
    .toLowerCase();
  if (!stripped) {
    return undefined;
  }

  const candidates: Array<{ emoji: CustomEmoji; sectionName?: string }> = [];

  if (customEmojis) {
    for (const item of customEmojis) {
      candidates.push({ emoji: item, sectionName: item.category });
    }
  }

  if (customSections) {
    for (const section of customSections) {
      for (const item of section.emojis) {
        if (isCustomEmoji(item)) {
          candidates.push({ emoji: item, sectionName: item.category ?? section.name });
        }
      }
    }
  }

  const match = candidates.find(
    ({ emoji }) => emoji.name.toLowerCase() === stripped || emoji.id.toLowerCase() === stripped
  );

  if (!match) {
    return undefined;
  }

  const rawCategory = match.sectionName || 'Custom';
  const category = resolveCategoryLabel(
    rawCategory,
    options?.localeData?.labels,
    options?.localeData
  );
  const shortcode = formatShortcode(match.emoji.name);

  return {
    emoji: shortcode,
    baseEmoji: shortcode,
    name: match.emoji.name,
    slug: match.emoji.name,
    shortcode,
    category,
    unicodeVersion: '',
    emojiVersion: '',
    skinToneSupport: false,
    skinTone: 'default',
    isCustom: true,
    imageUrl: match.emoji.imageUrl,
  };
}

export function getEmojiDetails(
  emojiOrShortcode: string,
  options?: GetEmojiDetailsOptions
): EmojiDetails | undefined {
  if (!emojiOrShortcode || typeof emojiOrShortcode !== 'string') {
    return undefined;
  }

  const trimmed = emojiOrShortcode.trim();
  if (!trimmed) {
    return undefined;
  }

  const customMatch = findCustomEmojiDetails(trimmed, options);
  if (customMatch) {
    return customMatch;
  }

  const index = getEmojiIndex();

  const detectedSkinTone = detectSkinTone(trimmed);
  const withoutSkinTone = stripSkinToneModifiers(trimmed);
  const emojiMatch =
    index.byEmoji.get(withoutSkinTone) ??
    index.byEmoji.get(stripVariationSelectors(withoutSkinTone));

  if (emojiMatch) {
    if (detectedSkinTone !== 'default' && !emojiMatch.skinToneSupport) {
      return undefined;
    }

    const localized = getLocalizedEmojiEntry(emojiMatch.emoji, options?.localeData);
    const category = resolveCategoryLabel(
      emojiMatch.category,
      options?.localeData?.labels,
      options?.localeData,
      emojiMatch.categorySlug
    );

    return {
      emoji: detectedSkinTone !== 'default' ? trimmed : emojiMatch.emoji,
      baseEmoji: emojiMatch.emoji,
      name: localized?.name ?? emojiMatch.name,
      slug: emojiMatch.slug,
      shortcode: `:${emojiMatch.slug}:`,
      category,
      unicodeVersion: emojiMatch.unicodeVersion,
      emojiVersion: emojiMatch.emojiVersion,
      skinToneSupport: emojiMatch.skinToneSupport,
      skinTone: detectedSkinTone,
      isCustom: false,
    };
  }

  const strippedShortcode = trimmed.replace(/^:+|:+$/g, '').trim();
  if (!strippedShortcode) {
    return undefined;
  }

  const normalizedSlug = strippedShortcode.toLowerCase().replace(/[-\s]+/g, '_');
  const slugMatch = index.bySlug.get(normalizedSlug);

  if (!slugMatch) {
    return undefined;
  }

  const localized = getLocalizedEmojiEntry(slugMatch.emoji, options?.localeData);
  const category = resolveCategoryLabel(
    slugMatch.category,
    options?.localeData?.labels,
    options?.localeData,
    slugMatch.categorySlug
  );

  return {
    emoji: slugMatch.emoji,
    baseEmoji: slugMatch.emoji,
    name: localized?.name ?? slugMatch.name,
    slug: slugMatch.slug,
    shortcode: `:${slugMatch.slug}:`,
    category,
    unicodeVersion: slugMatch.unicodeVersion,
    emojiVersion: slugMatch.emojiVersion,
    skinToneSupport: slugMatch.skinToneSupport,
    skinTone: 'default',
    isCustom: false,
  };
}

export function useEmojiDetails(
  emojiOrShortcode: string,
  options?: GetEmojiDetailsOptions
): EmojiDetails | undefined {
  const customEmojis = options?.customEmojis;
  const customSections = options?.customSections;
  const localeData = options?.localeData;

  return useMemo(
    () =>
      getEmojiDetails(emojiOrShortcode, {
        customEmojis,
        customSections,
        localeData,
      }),
    [emojiOrShortcode, customEmojis, customSections, localeData]
  );
}

import { filterSupportedEmojis } from './supportedEmojis';
import { isEmojiFullySupported } from './emojiSupport';
import { emojiKeywords } from './emojiKeywords';
import { isCustomEmoji } from '../types/emoji';

import type {
  CustomEmoji,
  CustomSection,
  EmojiData,
  EmojiGroupData as EmojiGroup,
  EmojiMetadata,
  EmojiDataItem,
} from '../types/emoji';

type GroupedEmojis = {
  category: string;
  emojis: EmojiMetadata[];
};

interface NormalizedKeyword {
  raw: string;
  space: string;
  slug: string;
}

interface IndexedEmojiFields {
  nameLower: string;
  nameNormalized: string;
  nameWords: string[];
  slug: string;
  keywords: NormalizedKeyword[];
}

interface ParsedSearchQuery {
  raw: string;
  space: string;
  slug: string;
  tokens: string[];
}

const indexedEmojiCache = new WeakMap<object, IndexedEmojiFields>();
const canonicalEmojiOrder = new Map<string, number>();

const normalizeSeparators = (value: string): string =>
  value
    .replace(/_+/g, ' ')
    .replace(/(?<=[a-z0-9])-+(?=[a-z0-9])/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Normalizes a user search query by trimming whitespace, lowercasing, and
 * stripping surrounding Slack/GitHub shortcode colons (e.g. `:thumbs_up:` -> `thumbs_up`).
 */
export const normalizeSearchQuery = (rawQuery: string): string =>
  rawQuery
    .trim()
    .toLowerCase()
    .replace(/^:+|:+$/g, '')
    .trim();

const parseSearchQuery = (rawQuery: string): ParsedSearchQuery | null => {
  const raw = normalizeSearchQuery(rawQuery);
  if (!raw) {
    return null;
  }

  const space = normalizeSeparators(raw);
  const slug = space.replace(/\s+/g, '_');
  const tokens = space.split(/\s+/).filter(Boolean);

  return { raw, space, slug, tokens };
};

const lookupEmojiKeywords = (emojiChar: string): string[] => {
  const direct = emojiKeywords[emojiChar];
  if (direct) return direct;

  const withVs16 = emojiKeywords[`${emojiChar}\uFE0F`];
  if (withVs16) return withVs16;

  const stripped = emojiChar.replace(/\uFE0F/g, '');
  return emojiKeywords[stripped] ?? [];
};

const getIndexedEmoji = (
  emoji: Pick<EmojiData, 'emoji' | 'name'> & { slug?: string }
): IndexedEmojiFields => {
  const cached = indexedEmojiCache.get(emoji);
  if (cached) {
    return cached;
  }

  const nameLower = emoji.name.toLowerCase();
  const nameNormalized = normalizeSeparators(nameLower);
  const nameWords = nameNormalized.split(/[\s:,()]+/).filter(Boolean);
  const slug = (emoji.slug ? emoji.slug.toLowerCase() : '') || nameNormalized.replace(/\s+/g, '_');
  const rawKeywords = lookupEmojiKeywords(emoji.emoji);
  const keywords: NormalizedKeyword[] = rawKeywords.map((kw) => {
    const space = normalizeSeparators(kw);
    return {
      raw: kw,
      space,
      slug: space.replace(/\s+/g, '_'),
    };
  });

  const indexed: IndexedEmojiFields = {
    nameLower,
    nameNormalized,
    nameWords,
    slug,
    keywords,
  };

  indexedEmojiCache.set(emoji, indexed);
  return indexed;
};

const scoreContiguousPhrase = (
  raw: string,
  spaceQuery: string,
  slugQuery: string,
  indexed: IndexedEmojiFields
): number => {
  const { nameLower, nameNormalized, nameWords, slug, keywords } = indexed;

  // 1. Exact Unicode name or slug match
  if (nameLower === raw || nameNormalized === spaceQuery || slug === raw || slug === slugQuery) {
    return 120;
  }

  // 2. Exact shortcode / keyword / alias match
  for (const kw of keywords) {
    if (kw.raw === raw || kw.space === spaceQuery || kw.slug === slugQuery) {
      return 100;
    }
  }

  // 3. Name or slug starts with query
  if (
    nameLower.startsWith(raw) ||
    nameNormalized.startsWith(spaceQuery) ||
    slug.startsWith(slugQuery)
  ) {
    return 80;
  }

  // 4. Word in name starts with query
  if (
    nameWords.some((word) => word.startsWith(spaceQuery)) ||
    nameNormalized.includes(` ${spaceQuery}`)
  ) {
    return 60;
  }

  // 5. Keyword / alias starts with query
  for (const kw of keywords) {
    if (
      kw.raw.startsWith(raw) ||
      kw.space.startsWith(spaceQuery) ||
      kw.space.includes(` ${spaceQuery}`)
    ) {
      return 45;
    }
  }

  // 6. Name contains substring
  if (nameLower.includes(raw) || nameNormalized.includes(spaceQuery)) {
    return 30;
  }

  // 7. Keyword / alias contains substring
  for (const kw of keywords) {
    if (kw.raw.includes(raw) || kw.space.includes(spaceQuery)) {
      return 15;
    }
  }

  return 0;
};

const scoreParsedQuery = (
  parsed: ParsedSearchQuery,
  emoji: Pick<EmojiData, 'emoji' | 'name'> & { slug?: string }
): number => {
  const indexed = getIndexedEmoji(emoji);
  const phraseScore = scoreContiguousPhrase(parsed.raw, parsed.space, parsed.slug, indexed);
  if (phraseScore > 0) {
    return phraseScore;
  }

  if (parsed.tokens.length > 1) {
    let totalTokenScore = 0;
    for (const token of parsed.tokens) {
      const tokenScore = scoreContiguousPhrase(token, token, token, indexed);
      if (tokenScore === 0) {
        return 0;
      }
      totalTokenScore += tokenScore;
    }
    return Math.max(10, Math.round((totalTokenScore / parsed.tokens.length) * 0.5));
  }

  return 0;
};

/**
 * Computes a deterministic relevance score for how well an emoji matches a search query.
 * Returns `0` when the emoji does not match.
 */
export const scoreEmojiMatch = (
  emoji: Pick<EmojiData, 'emoji' | 'name'> & { slug?: string },
  rawQuery: string
): number => {
  const parsed = parseSearchQuery(rawQuery);
  if (!parsed) {
    return 0;
  }
  return scoreParsedQuery(parsed, emoji);
};

export const processEmojiData = (emojiData: any): EmojiData[] => {
  const processed: EmojiData[] = [];

  // Process each category
  for (const group of Object.values(emojiData)) {
    if (!group || typeof group !== 'object') continue;

    const { name: groupName, emojis } = group as any;
    if (!groupName || !emojis || typeof emojis !== 'object') continue;

    // Process emojis in this group
    for (const emoji of Object.values(emojis)) {
      if (!emoji || typeof emoji !== 'object') continue;

      const {
        emoji: char,
        name,
        skin_tone_support,
        skin_tone_support_unicode_version,
        unicode_version,
        emoji_version,
      } = emoji as any;
      if (char && name) {
        if (!canonicalEmojiOrder.has(char)) {
          canonicalEmojiOrder.set(char, canonicalEmojiOrder.size);
        }

        const item: EmojiData = {
          emoji: char,
          name: name.toLowerCase(),
          group: groupName,
          skin_tone_support: !!skin_tone_support,
          skin_tone_support_unicode_version,
          unicode_version,
          emoji_version,
        };

        processed.push(item);
      }
    }
  }

  return processed;
};

export const groupEmojisByCategory = (emojiData: any): GroupedEmojis[] => {
  if (!emojiData || typeof emojiData !== 'object') {
    return [];
  }

  const groups: EmojiGroup[] = [];

  for (const group of Object.values(emojiData)) {
    if (!group || typeof group !== 'object') continue;

    const { name, slug, emojis } = group as any;
    if (!name || !emojis || typeof emojis !== 'object') continue;

    const emojiItems: EmojiDataItem[] = [];
    for (const emoji of Object.values(emojis)) {
      if (!emoji || typeof emoji !== 'object') continue;

      const {
        emoji: char,
        name: emojiName,
        slug: emojiSlug,
        skin_tone_support,
        skin_tone_support_unicode_version,
        unicode_version,
        emoji_version,
      } = emoji as any;

      if (char && emojiName) {
        emojiItems.push({
          emoji: char,
          name: emojiName,
          slug: emojiSlug || emojiName.toLowerCase().replace(/\s+/g, '_'),
          skin_tone_support: !!skin_tone_support,
          skin_tone_support_unicode_version,
          unicode_version: unicode_version || '',
          emoji_version: emoji_version || '',
        });
      }
    }

    if (emojiItems.length > 0) {
      groups.push({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '_'),
        emojis: emojiItems,
      });
    }
  }

  return filterSupportedEmojis(groups);
};

export const sortCustomSectionsByPriority = (customSections: CustomSection[]): CustomSection[] =>
  [...customSections].sort((a, b) => (a.priority || 999) - (b.priority || 999));

const scoreCustomEmojiMatch = (emoji: CustomEmoji, parsed: ParsedSearchQuery): number => {
  const nameLower = emoji.name
    .trim()
    .toLowerCase()
    .replace(/^:+|:+$/g, '')
    .trim();
  if (!nameLower) {
    return 0;
  }

  const nameNorm = normalizeSeparators(nameLower);
  const nameSlug = nameNorm.replace(/\s+/g, '_');
  const nameWords = nameNorm.split(/\s+/).filter(Boolean);

  if (nameLower === parsed.raw || nameNorm === parsed.space || nameSlug === parsed.slug) {
    return 120;
  }

  if (
    nameLower.startsWith(parsed.raw) ||
    nameNorm.startsWith(parsed.space) ||
    nameSlug.startsWith(parsed.slug)
  ) {
    return 80;
  }

  if (
    nameWords.some((word) => word.startsWith(parsed.space)) ||
    nameNorm.includes(` ${parsed.space}`)
  ) {
    return 60;
  }

  if (nameLower.includes(parsed.raw) || nameNorm.includes(parsed.space)) {
    return 30;
  }

  if (
    parsed.tokens.length > 1 &&
    parsed.tokens.every((token) => nameLower.includes(token) || nameNorm.includes(token))
  ) {
    return 20;
  }

  return 0;
};

export const searchCustomEmojis = (
  searchTerm: string,
  customSections: CustomSection[]
): CustomEmoji[] => {
  const parsed = parseSearchQuery(searchTerm);
  if (!parsed) {
    return [];
  }

  const scored: { emoji: CustomEmoji; score: number; index: number }[] = [];

  sortCustomSectionsByPriority(customSections)
    .flatMap((section) => section.emojis)
    .forEach((emoji, index) => {
      if (!isCustomEmoji(emoji)) return;
      const score = scoreCustomEmojiMatch(emoji, parsed);
      if (score > 0) {
        scored.push({ emoji, score, index });
      }
    });

  return scored.sort((a, b) => b.score - a.score || a.index - b.index).map((entry) => entry.emoji);
};

interface ScoredEmojiMatch {
  emoji: EmojiData;
  metadata: EmojiMetadata;
  score: number;
  index: number;
}

const getScoredEmojiMatches = (
  searchTerm: string,
  processedData: EmojiData[]
): ScoredEmojiMatch[] => {
  const parsed = parseSearchQuery(searchTerm);
  if (!parsed) {
    return [];
  }

  const matches: ScoredEmojiMatch[] = [];

  for (let index = 0; index < processedData.length; index++) {
    const emoji = processedData[index];
    const score = scoreParsedQuery(parsed, emoji);
    if (score === 0) {
      continue;
    }

    const slug = emoji.name.replace(/\s+/g, '_');
    const isSupported = isEmojiFullySupported({
      emoji: emoji.emoji,
      name: emoji.name,
      unicode_version: emoji.unicode_version,
      emoji_version: emoji.emoji_version,
      skin_tone_support: emoji.skin_tone_support,
      skin_tone_support_unicode_version: emoji.skin_tone_support_unicode_version,
      slug,
    });

    if (!isSupported) {
      continue;
    }

    matches.push({
      emoji,
      metadata: {
        emoji: emoji.emoji,
        name: emoji.name,
        slug,
        skin_tone_support: emoji.skin_tone_support,
        skin_tone_support_unicode_version: emoji.skin_tone_support_unicode_version,
      },
      score,
      index,
    });
  }

  return matches;
};

/**
 * Searches emojis and returns a flat list sorted by descending relevance score,
 * breaking ties deterministically by original dataset order.
 */
export const searchEmojisRanked = (
  searchTerm: string,
  processedData: EmojiData[]
): EmojiMetadata[] =>
  getScoredEmojiMatches(searchTerm, processedData)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.metadata);

/**
 * Ranks an existing flat list of emoji metadata by relevance for a search query,
 * preserving original/canonical dataset order on ties.
 */
export const rankEmojisByRelevance = <
  T extends Pick<EmojiMetadata, 'emoji' | 'name'> & { slug?: string },
>(
  searchTerm: string,
  emojis: T[]
): T[] => {
  const parsed = parseSearchQuery(searchTerm);
  if (!parsed || emojis.length <= 1) {
    return emojis;
  }

  return emojis
    .map((emoji, index) => ({
      emoji,
      score: scoreParsedQuery(parsed, emoji),
      order: canonicalEmojiOrder.get(emoji.emoji) ?? Number.MAX_SAFE_INTEGER,
      index,
    }))
    .sort((a, b) => b.score - a.score || a.order - b.order || a.index - b.index)
    .map((entry) => entry.emoji);
};

export const searchEmojis = (searchTerm: string, processedData: EmojiData[]): GroupedEmojis[] => {
  const matches = getScoredEmojiMatches(searchTerm, processedData);
  if (matches.length === 0) {
    return [];
  }

  // Group matching emojis by category while tracking max score & first dataset index
  const groupedResults = new Map<
    string,
    { maxScore: number; firstIndex: number; items: ScoredEmojiMatch[] }
  >();

  for (const match of matches) {
    const group = groupedResults.get(match.emoji.group);
    if (!group) {
      groupedResults.set(match.emoji.group, {
        maxScore: match.score,
        firstIndex: match.index,
        items: [match],
      });
    } else {
      if (match.score > group.maxScore) {
        group.maxScore = match.score;
      }
      group.items.push(match);
    }
  }

  return Array.from(groupedResults.entries())
    .sort(([, a], [, b]) => b.maxScore - a.maxScore || a.firstIndex - b.firstIndex)
    .map(([category, group]) => ({
      category,
      emojis: group.items
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .map((item) => item.metadata),
    }));
};

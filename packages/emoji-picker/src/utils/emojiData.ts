import {
  getCanonicalEmojiGroups,
  getLocalizedEmojiEntry,
  resolveCategoryLabel,
} from './getEmojiDetails';
import { isCompatibleSkinTone } from './emojiFilters';
import { isEmojiFullySupported } from './emojiSupport';

import type {
  EmojiGroupData,
  EmojiLocaleData,
  EmojiMetadata,
  EmojiPickerLabels,
} from '../types/emoji';

export { resolveCategoryLabel };

export interface CuratedCategoryGroup {
  category: string;
  slug: string;
  emojis: EmojiMetadata[];
}

export interface EmojiCurationOptions {
  localeData?: EmojiLocaleData;
  englishSearchFallback?: boolean;
  filterEmoji?: (emoji: EmojiMetadata) => boolean;
  categories?: string[];
}

export function resolveLabel(
  key: keyof Omit<EmojiPickerLabels, 'categories'>,
  defaultValue: string,
  labels?: EmojiPickerLabels,
  localeData?: EmojiLocaleData
): string {
  return labels?.[key] ?? localeData?.labels?.[key] ?? defaultValue;
}

export function getLocalizedEmojiName(
  emojiChar: string,
  fallbackName: string,
  localeData?: EmojiLocaleData
): string {
  if (!localeData) {
    return fallbackName;
  }
  return getLocalizedEmojiEntry(emojiChar, localeData)?.name ?? fallbackName;
}

function normalizeCategorySpec(spec: string): string {
  return spec
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function filterAndOrderGroups(
  groups: EmojiGroupData[],
  categories?: string[]
): EmojiGroupData[] {
  if (!categories) {
    return groups;
  }

  const groupLookup = new Map<string, EmojiGroupData>();
  for (const group of groups) {
    const slug = (group.slug || normalizeCategorySpec(group.name)).toLowerCase();
    groupLookup.set(group.name.toLowerCase(), group);
    groupLookup.set(slug, group);
    groupLookup.set(slug.replace(/_/g, '-'), group);
    groupLookup.set(normalizeCategorySpec(group.name), group);
  }

  const ordered: EmojiGroupData[] = [];
  const seen = new Set<EmojiGroupData>();

  for (const spec of categories) {
    if (!spec || typeof spec !== 'string') continue;
    const rawKey = spec.trim().toLowerCase();
    const matched = groupLookup.get(rawKey) ?? groupLookup.get(normalizeCategorySpec(spec));
    if (matched && !seen.has(matched)) {
      seen.add(matched);
      ordered.push(matched);
    }
  }

  return ordered;
}

export function getCuratedEmojiCategories(options: EmojiCurationOptions): CuratedCategoryGroup[] {
  const { localeData, filterEmoji, categories } = options;
  const groups = filterAndOrderGroups(getCanonicalEmojiGroups(), categories);

  const result: CuratedCategoryGroup[] = [];

  for (const group of groups) {
    const emojis: EmojiMetadata[] = [];

    for (const item of group.emojis) {
      if (!isEmojiFullySupported(item)) {
        continue;
      }

      const localized = getLocalizedEmojiEntry(item.emoji, localeData);
      const metadata: EmojiMetadata = {
        emoji: item.emoji,
        name: localized?.name ?? item.name,
        slug: item.slug,
        skin_tone_support: isCompatibleSkinTone(item),
        skin_tone_support_unicode_version: item.skin_tone_support_unicode_version,
      };

      if (filterEmoji && !filterEmoji(metadata)) {
        continue;
      }

      emojis.push(metadata);
    }

    if (emojis.length > 0) {
      result.push({
        category: group.name,
        slug: group.slug,
        emojis,
      });
    }
  }

  return result;
}

export function searchCuratedEmojis(
  searchTerm: string,
  options: EmojiCurationOptions
): CuratedCategoryGroup[] {
  const trimmed = searchTerm.trim();
  if (!trimmed) {
    return [];
  }

  const { localeData, englishSearchFallback = true, filterEmoji, categories } = options;
  const rawQuery = trimmed.toLowerCase();
  const strippedColons = rawQuery.replace(/^:+|:+$/g, '').trim();
  const slugQuery = strippedColons.replace(/[-\s]+/g, '_');

  if (!strippedColons && !rawQuery) {
    return [];
  }

  const allowEnglish = !localeData || englishSearchFallback !== false;
  const groups = filterAndOrderGroups(getCanonicalEmojiGroups(), categories);
  const results: CuratedCategoryGroup[] = [];

  for (const group of groups) {
    const matchingEmojis: EmojiMetadata[] = [];

    for (const item of group.emojis) {
      const localized = getLocalizedEmojiEntry(item.emoji, localeData);

      let isMatch = false;

      if (localized) {
        const localizedNameLower = localized.name.toLowerCase();
        if (
          localizedNameLower.includes(rawQuery) ||
          (strippedColons.length > 0 && localizedNameLower.includes(strippedColons))
        ) {
          isMatch = true;
        } else if (localized.keywords && localized.keywords.length > 0) {
          isMatch = localized.keywords.some((kw) => {
            const kwLower = kw.toLowerCase();
            return (
              kwLower.includes(rawQuery) ||
              (strippedColons.length > 0 && kwLower.includes(strippedColons))
            );
          });
        }
      }

      if (!isMatch && allowEnglish) {
        const englishNameLower = item.name.toLowerCase();
        const itemSlugLower = item.slug.toLowerCase();
        if (
          englishNameLower.includes(rawQuery) ||
          (strippedColons.length > 0 && englishNameLower.includes(strippedColons)) ||
          (slugQuery.length > 0 && itemSlugLower.includes(slugQuery))
        ) {
          isMatch = true;
        }
      }

      if (!isMatch) {
        continue;
      }

      if (!isEmojiFullySupported(item)) {
        continue;
      }

      const metadata: EmojiMetadata = {
        emoji: item.emoji,
        name: localized?.name ?? item.name.toLowerCase(),
        slug: item.slug,
        skin_tone_support: isCompatibleSkinTone(item),
        skin_tone_support_unicode_version: item.skin_tone_support_unicode_version,
      };

      if (filterEmoji && !filterEmoji(metadata)) {
        continue;
      }

      matchingEmojis.push(metadata);
    }

    if (matchingEmojis.length > 0) {
      results.push({
        category: group.name,
        slug: group.slug,
        emojis: matchingEmojis,
      });
    }
  }

  return results;
}

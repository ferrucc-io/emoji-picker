import rawEmojiData from 'unicode-emoji-json/data-by-group.json';
import { isCompatibleSkinTone } from './emojiFilters';
import { loadJsonData } from './loadJsonData';
import type { EmojiMetadata } from '../types/emoji';

let metadataLookupCache: Map<string, EmojiMetadata> | null = null;

function indexEmojiGroupCollection(collection: unknown, map: Map<string, EmojiMetadata>) {
  if (!collection || typeof collection !== 'object') {
    return;
  }

  for (const group of Object.values(collection as Record<string, unknown>)) {
    if (!group || typeof group !== 'object') {
      continue;
    }

    const emojis = (group as { emojis?: unknown }).emojis;
    if (!emojis || typeof emojis !== 'object') {
      continue;
    }

    for (const item of Object.values(emojis as Record<string, unknown>)) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      const raw = item as {
        emoji?: string;
        name?: string;
        slug?: string;
        skin_tone_support?: boolean;
        skin_tone_support_unicode_version?: string;
        unicode_version?: string;
      };

      if (!raw.emoji || !raw.name) {
        continue;
      }

      const metadata: EmojiMetadata = {
        emoji: raw.emoji,
        name: raw.name,
        slug: raw.slug || raw.name.toLowerCase().replace(/\s+/g, '_'),
        skin_tone_support: isCompatibleSkinTone({
          emoji: raw.emoji,
          skin_tone_support: Boolean(raw.skin_tone_support),
          skin_tone_support_unicode_version: raw.skin_tone_support_unicode_version,
          unicode_version: raw.unicode_version,
        }),
        skin_tone_support_unicode_version: raw.skin_tone_support_unicode_version,
      };

      map.set(raw.emoji, metadata);
      const stripped = raw.emoji.replace(/\uFE0F/g, '');
      if (stripped !== raw.emoji && !map.has(stripped)) {
        map.set(stripped, metadata);
      }
    }
  }
}

function getMetadataLookup(): Map<string, EmojiMetadata> {
  if (metadataLookupCache) {
    return metadataLookupCache;
  }

  const map = new Map<string, EmojiMetadata>();

  if (!Array.isArray(rawEmojiData) || rawEmojiData.length === 0) {
    const diskData = loadJsonData<unknown>(
      [],
      'unicode-emoji-json/data-by-group.json',
      (data) => Array.isArray(data) && data.length === 0
    );
    indexEmojiGroupCollection(diskData, map);
  }

  indexEmojiGroupCollection(rawEmojiData, map);
  metadataLookupCache = map;
  return map;
}

export function resolveUnicodeEmojiMetadata(emoji: string): EmojiMetadata {
  const lookup = getMetadataLookup();

  const exact = lookup.get(emoji) ?? lookup.get(emoji.replace(/\uFE0F/g, ''));
  if (exact) {
    return exact.emoji === emoji ? exact : { ...exact, emoji };
  }

  if (/\p{Emoji_Modifier}/u.test(emoji)) {
    const base = emoji.replace(/\p{Emoji_Modifier}/gu, '');
    const baseMatch = lookup.get(base) ?? lookup.get(base.replace(/\uFE0F/g, ''));
    if (baseMatch) {
      return {
        ...baseMatch,
        emoji,
      };
    }
  }

  return {
    emoji,
    name: emoji,
    slug: emoji,
    skin_tone_support: false,
  };
}

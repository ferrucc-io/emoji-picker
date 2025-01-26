import { filterSupportedEmojis } from './supportedEmojis';
import { isCompatibleEmoji } from './emojiFilters';

import type {
  EmojiData,
  EmojiGroupData as EmojiGroup,
  EmojiMetadata,
  EmojiDataItem,
} from '../types/emoji';

type GroupedEmojis = {
  category: string;
  emojis: EmojiMetadata[];
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
        processed.push({
          emoji: char,
          name: name.toLowerCase(),
          group: groupName,
          skin_tone_support: !!skin_tone_support,
          skin_tone_support_unicode_version,
          unicode_version,
          emoji_version,
        });
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

export const searchEmojis = (searchTerm: string, processedData: EmojiData[]): GroupedEmojis[] => {
  // Return empty array for empty search
  if (!searchTerm.trim()) {
    return [];
  }

  const normalizedSearch = searchTerm.toLowerCase();
  const matchingEmojis = processedData.filter(
    (emoji) =>
      emoji.name.includes(normalizedSearch) &&
      isCompatibleEmoji({
        emoji: emoji.emoji,
        name: emoji.name,
        unicode_version: emoji.unicode_version || '',
        emoji_version: emoji.emoji_version || '',
        skin_tone_support: emoji.skin_tone_support,
        skin_tone_support_unicode_version: emoji.skin_tone_support_unicode_version,
        slug: emoji.name.replace(/\s+/g, '_'),
      }).isCompatible
  );

  if (matchingEmojis.length === 0) {
    return [];
  }

  // Group matching emojis by category
  const groupedResults = new Map<string, EmojiMetadata[]>();

  matchingEmojis.forEach((emoji) => {
    const metadata: EmojiMetadata = {
      emoji: emoji.emoji,
      name: emoji.name,
      slug: emoji.name.replace(/\s+/g, '_'),
      skin_tone_support: emoji.skin_tone_support,
      skin_tone_support_unicode_version: emoji.skin_tone_support_unicode_version,
    };

    if (!groupedResults.has(emoji.group)) {
      groupedResults.set(emoji.group, []);
    }
    groupedResults.get(emoji.group)!.push(metadata);
  });

  return Array.from(groupedResults.entries()).map(([category, emojis]) => ({
    category,
    emojis,
  }));
};

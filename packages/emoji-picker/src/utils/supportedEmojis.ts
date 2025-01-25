import { isCompatibleEmoji, isCompatibleSkinTone } from './emojiFilters';

export type EmojiGroup = {
  name: string;
  slug: string;
  emojis: EmojiDataItem[];
};

export interface EmojiDataItem {
  emoji: string;
  name: string;
  slug: string;
  skin_tone_support: boolean;
  skin_tone_support_unicode_version?: string;
  unicode_version: string;
  emoji_version: string;
}

export type EmojiMetadata = {
  emoji: string;
  name: string;
  slug: string;
  skin_tone_support: boolean;
  skin_tone_support_unicode_version?: string;
};

export type GroupedEmojis = {
  category: string;
  emojis: EmojiMetadata[];
};

export type EmojiData = {
  emoji: string;
  name: string;
  group: string;
  skin_tone_support: boolean;
  skin_tone_support_unicode_version?: string;
  unicode_version?: string;
  emoji_version?: string;
};

export function filterSupportedEmojis(emojiGroups: EmojiGroup[]): GroupedEmojis[] {
  if (!Array.isArray(emojiGroups)) {
    return [];
  }
  
  return emojiGroups
    .map(group => ({
      category: group.name,
      emojis: group.emojis
        .filter(emoji => isCompatibleEmoji(emoji).isCompatible)
        .map(emoji => ({
          emoji: emoji.emoji,
          name: emoji.name,
          slug: emoji.slug,
          skin_tone_support: isCompatibleSkinTone(emoji),
          skin_tone_support_unicode_version: emoji.skin_tone_support_unicode_version
        }))
    }))
    .filter(category => category.emojis.length > 0);
} 
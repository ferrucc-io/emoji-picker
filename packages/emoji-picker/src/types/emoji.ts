export type SkinTone = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark' | 'default';

export interface EmojiMetadata {
  emoji: string;
  name: string;
  slug: string;
  skin_tone_support: boolean;
  skin_tone_support_positions?: number[];
  skin_tone_support_unicode_version?: string;
}

export interface EmojiDataItem {
  emoji: string;
  name: string;
  unicode_version: string;
  emoji_version: string;
  skin_tone_support: boolean;
  skin_tone_support_unicode_version?: string;
  slug: string;
}

export interface SkinToneData {
  emoji: string;
  skin_tone_support: boolean;
  skin_tone_support_unicode_version?: string;
  unicode_version?: string;
}

export interface EmojiGroupData {
  name: string;
  slug: string;
  emojis: EmojiDataItem[];
}

export type EmojiData = {
  emoji: string;
  name: string;
  group: string;
  skin_tone_support: boolean;
  skin_tone_support_unicode_version?: string;
  unicode_version: string;
  emoji_version: string;
};

export interface CustomEmoji {
  id: string;
  name: string;
  imageUrl: string;
  category?: string;
}

export interface CustomSection {
  id: string;
  name: string;
  emojis: (EmojiMetadata | CustomEmoji)[];
  priority?: number;
}

export const isCustomEmoji = (emoji: EmojiMetadata | CustomEmoji): emoji is CustomEmoji => {
  return 'imageUrl' in emoji && typeof emoji.imageUrl === 'string';
};

export interface HeaderRendererProps {
  content: string;
  emojiSize: number;
  isSticky?: boolean;
  sectionId?: string;
}

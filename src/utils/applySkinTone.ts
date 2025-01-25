import type { SkinTone } from "@/types/emoji";

export interface EmojiMetadata {
  emoji: string;
  name: string;
  slug: string;
  skin_tone_support: boolean;
  skin_tone_support_positions?: number[];
}

// Unicode Emoji 15.0
// https://unicode.org/Public/emoji/15.0/emoji-sequences.txt

export function applySkinTone(emoji: EmojiMetadata, skinTone: SkinTone): EmojiMetadata {
  if (!skinTone || !emoji.skin_tone_support) {
    return emoji;
  }
  const skinTonMap = {
    default: '',
    light: '\u{1F3FB}',
    'medium-light': '\u{1F3FC}',
    medium: '\u{1F3FD}',
    'medium-dark': '\u{1F3FE}',
    dark: '\u{1F3FF}',
  };

  let zwj = '\u200D';

  // Hand Shake 🧑‍🤝‍🧑
  if (emoji.emoji.includes('\u200d\ud83e\udd1d\u200d')) {
    zwj = '\u200d\ud83e\udd1d\u200d';
  }

  const parts = emoji.emoji.split(zwj);
  const modifiedParts = parts.map((part) => {
    const basePart = part.replace(/\p{Emoji_Modifier}/gu, '');

    if (/\p{Emoji_Modifier_Base}/u.test(basePart)) {
      return basePart.replace(/(\p{Extended_Pictographic}+)(\uFE0F?)/u, `$1${skinTonMap[skinTone]}`);
    }
    return part;
  });

  const newEmoji = modifiedParts.join(zwj);
  
  return {
    ...emoji,
    emoji: newEmoji,
    name: `${emoji.name}`,
    slug: `${emoji.slug}`
  };
}
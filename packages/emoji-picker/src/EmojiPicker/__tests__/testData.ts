import type { EmojiMetadata } from '../../types/emoji';

export const mockEmojiData = {
  'Smileys & Emotion': {
    name: 'Smileys & Emotion',
    slug: 'smileys-emotion',
    emojis: [
      {
        emoji: '😀',
        name: 'grinning face',
        slug: 'grinning-face',
        skin_tone_support: false,
      },
      {
        emoji: '😃',
        name: 'grinning face with big eyes',
        slug: 'grinning-face-with-big-eyes',
        skin_tone_support: false,
      },
    ],
  },
  'People & Body': {
    name: 'People & Body',
    slug: 'people-body',
    emojis: [
      {
        emoji: '✋',
        name: 'raised hand',
        slug: 'raised-hand',
        skin_tone_support: true,
      },
      {
        emoji: '👋',
        name: 'waving hand',
        slug: 'waving-hand',
        skin_tone_support: true,
      },
    ],
  },
};

export const mockFilteredEmojis = [
  {
    category: 'Smileys & Emotion',
    emojis: mockEmojiData['Smileys & Emotion'].emojis,
  },
  {
    category: 'People & Body',
    emojis: mockEmojiData['People & Body'].emojis,
  },
];

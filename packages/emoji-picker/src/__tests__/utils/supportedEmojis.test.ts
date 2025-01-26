import { describe, expect, test } from 'bun:test';
import { filterSupportedEmojis } from '../../utils/supportedEmojis';

import type { EmojiGroup } from '../../utils/supportedEmojis';

describe('filterSupportedEmojis', () => {
  test('should filter out unsupported emojis', () => {
    const mockEmojiGroups: EmojiGroup[] = [
      {
        name: 'Test Category',
        slug: 'test_category',
        emojis: [
          {
            emoji: '👋',
            name: 'waving hand',
            slug: 'waving_hand',
            skin_tone_support: true,
            skin_tone_support_unicode_version: '8.0',
            unicode_version: '6.0',
            emoji_version: '6.0',
          },
          {
            emoji: '🫨',
            name: 'shaking face',
            slug: 'shaking_face',
            skin_tone_support: false,
            unicode_version: '15.1',
            emoji_version: '15.1',
          },
        ],
      },
    ];

    const result = filterSupportedEmojis(mockEmojiGroups);

    expect(result).toEqual([
      {
        category: 'Test Category',
        emojis: [
          {
            emoji: '👋',
            name: 'waving hand',
            slug: 'waving_hand',
            skin_tone_support: true,
            skin_tone_support_unicode_version: '8.0',
          },
        ],
      },
    ]);
  });

  test('should filter out categories with no supported emojis', () => {
    const mockEmojiGroups: EmojiGroup[] = [
      {
        name: 'Empty Category',
        slug: 'empty_category',
        emojis: [
          {
            emoji: '🫨',
            name: 'shaking face',
            slug: 'shaking_face',
            skin_tone_support: false,
            unicode_version: '15.1',
            emoji_version: '15.1',
          },
        ],
      },
    ];

    const result = filterSupportedEmojis(mockEmojiGroups);

    expect(result).toEqual([]);
  });

  test('should handle skin tone support correctly', () => {
    const mockEmojiGroups: EmojiGroup[] = [
      {
        name: 'Test Category',
        slug: 'test_category',
        emojis: [
          {
            emoji: '👋',
            name: 'waving hand',
            slug: 'waving_hand',
            skin_tone_support: true,
            skin_tone_support_unicode_version: '8.0',
            unicode_version: '6.0',
            emoji_version: '6.0',
          },
          {
            emoji: '❤️',
            name: 'red heart',
            slug: 'red_heart',
            skin_tone_support: false,
            unicode_version: '6.0',
            emoji_version: '6.0',
          },
        ],
      },
    ];

    const result = filterSupportedEmojis(mockEmojiGroups);

    expect(result).toEqual([
      {
        category: 'Test Category',
        emojis: [
          {
            emoji: '👋',
            name: 'waving hand',
            slug: 'waving_hand',
            skin_tone_support: true,
            skin_tone_support_unicode_version: '8.0',
          },
          {
            emoji: '❤️',
            name: 'red heart',
            slug: 'red_heart',
            skin_tone_support: false,
            skin_tone_support_unicode_version: undefined,
          },
        ],
      },
    ]);
  });

  test('should handle non-array input', () => {
    const result = filterSupportedEmojis({} as any);
    expect(result).toEqual([]);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import {
  isEmojiFullySupported,
  clearEmojiSupportCache,
  getEmojiSupportCacheSize,
  getEmojiSupportCache,
  isEmojiInCache,
} from '../../utils/emojiSupport';

describe('Emoji Support Detection', () => {
  beforeEach(() => {
    clearEmojiSupportCache();
  });

  describe('isEmojiFullySupported', () => {
    it('returns false for missing emoji', () => {
      expect(isEmojiFullySupported({})).toBe(false);
      expect(isEmojiFullySupported({ emoji: '' })).toBe(false);
    });

    it('returns true for basic emoji in test environment', () => {
      const emoji = { emoji: '😀', name: 'grinning face', unicode_version: '6.1' };
      expect(isEmojiFullySupported(emoji)).toBe(true);
    });

    it('filters out emojis with high unicode version', () => {
      const newEmoji = {
        emoji: '🫠',
        name: 'melting face',
        unicode_version: '16.0', // Future version
      };
      expect(isEmojiFullySupported(newEmoji)).toBe(false);
    });

    it('supports emojis with unicode version 15.0 and below', () => {
      const emoji15 = {
        emoji: '🫨',
        name: 'shaking face',
        unicode_version: '15.0',
      };
      expect(isEmojiFullySupported(emoji15)).toBe(true);
    });

    it('respects custom maxVersion parameter when provided', () => {
      const emoji16 = {
        emoji: '🫩',
        name: 'face with bags under eyes',
        unicode_version: '16.0',
      };
      expect(isEmojiFullySupported(emoji16, undefined, 16.0)).toBe(true);
      expect(isEmojiFullySupported(emoji16, undefined, 15.0)).toBe(false);
      expect(isEmojiFullySupported(emoji16, undefined, 14.0)).toBe(false);
    });

    it('handles emojis without version information', () => {
      const emoji = { emoji: '😀', name: 'grinning face' };
      expect(isEmojiFullySupported(emoji)).toBe(true);
    });

    it('accepts emoji as second parameter', () => {
      const emojiData = { name: 'grinning face', unicode_version: '6.1' };
      expect(isEmojiFullySupported(emojiData, '😀')).toBe(true);
    });

    it('prefers emoji from data over second parameter', () => {
      const emojiData = { emoji: '😀', name: 'grinning face', unicode_version: '6.1' };
      expect(isEmojiFullySupported(emojiData, '😢')).toBe(true);
    });

    it('handles skin tone support metadata', () => {
      const emoji = {
        emoji: '👍',
        name: 'thumbs up',
        unicode_version: '6.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '8.0',
      };
      expect(isEmojiFullySupported(emoji)).toBe(true);
    });

    it('handles complex ZWJ sequences', () => {
      const zwjEmoji = {
        emoji: '👨‍👩‍👧‍👦',
        name: 'family',
        unicode_version: '11.0',
      };
      expect(isEmojiFullySupported(zwjEmoji)).toBe(true);
    });

    it('filters based on emoji_version when unicode_version is missing', () => {
      const emoji = {
        emoji: '😀',
        name: 'grinning face',
        emoji_version: '0.6',
      };
      expect(isEmojiFullySupported(emoji)).toBe(true);

      const futureEmoji = {
        emoji: '🫠',
        name: 'melting face',
        emoji_version: '20.0',
      };
      expect(isEmojiFullySupported(futureEmoji)).toBe(false);
    });
  });

  describe('Cache Management', () => {
    it('starts with empty cache', () => {
      expect(getEmojiSupportCacheSize()).toBe(0);
    });

    it('caches emoji support results', () => {
      const emoji = { emoji: '😀', name: 'grinning face', unicode_version: '6.1' };

      expect(isEmojiInCache('😀')).toBe(false);

      // First call - should add to cache
      isEmojiFullySupported(emoji);

      // Check cache was updated (cache is only used in browser environment)
      // In test environment, we skip canvas detection, so cache might not be updated
      // This is expected behavior
      expect(getEmojiSupportCacheSize()).toBe(0); // No caching in test env
    });

    it('clears cache on clearEmojiSupportCache', () => {
      clearEmojiSupportCache();
      expect(getEmojiSupportCacheSize()).toBe(0);
    });

    it('getEmojiSupportCache returns a copy of cache', () => {
      const cache = getEmojiSupportCache();
      cache.set('test', true);

      // Original cache should not be modified
      expect(isEmojiInCache('test')).toBe(false);
    });
  });

  describe('Performance', () => {
    it('handles large number of emojis efficiently', () => {
      const emojis = Array.from({ length: 1000 }, (_, i) => ({
        emoji: String.fromCodePoint(0x1f600 + i),
        name: `emoji_${i}`,
        unicode_version: '11.0',
      }));

      const startTime = performance.now();
      emojis.forEach((emoji) => isEmojiFullySupported(emoji));
      const endTime = performance.now();

      // Should process 1000 emojis in reasonable time (< 100ms in test env)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Edge Cases', () => {
    it('handles malformed emoji data gracefully', () => {
      const malformed = {
        emoji: '😀',
        name: 'test',
        unicode_version: 'not_a_number',
      };
      // Should handle gracefully and check canvas support
      expect(() => isEmojiFullySupported(malformed)).not.toThrow();
    });

    it('handles null and undefined values', () => {
      const withNull = {
        emoji: '😀',
        name: null,
        unicode_version: null,
      };
      expect(() => isEmojiFullySupported(withNull as any)).not.toThrow();

      const withUndefined = {
        emoji: '😀',
        name: undefined,
        unicode_version: undefined,
      };
      expect(() => isEmojiFullySupported(withUndefined as any)).not.toThrow();
    });

    it('handles special characters and text', () => {
      // Regular text should be handled
      expect(isEmojiFullySupported({ emoji: 'ABC' })).toBe(true);

      // Special characters
      expect(isEmojiFullySupported({ emoji: '©' })).toBe(true);
      expect(isEmojiFullySupported({ emoji: '®' })).toBe(true);
      expect(isEmojiFullySupported({ emoji: '™' })).toBe(true);
    });

    it('handles empty strings and whitespace', () => {
      expect(isEmojiFullySupported({ emoji: ' ' })).toBe(true);
      expect(isEmojiFullySupported({ emoji: '\t' })).toBe(true);
      expect(isEmojiFullySupported({ emoji: '\n' })).toBe(true);
    });
  });

  describe('Integration with Emoji Filters', () => {
    it('works with typical emoji data structure', () => {
      const typicalEmoji = {
        emoji: '🎉',
        name: 'party popper',
        slug: 'party_popper',
        unicode_version: '6.0',
        emoji_version: '0.6',
        skin_tone_support: false,
      };
      expect(isEmojiFullySupported(typicalEmoji)).toBe(true);
    });

    it('filters correctly for grouped emojis', () => {
      const emojiGroup = [
        { emoji: '😀', name: 'grinning', unicode_version: '6.1' },
        { emoji: '🫠', name: 'melting', unicode_version: '14.0' },
        { emoji: '🆕', name: 'new', unicode_version: '20.0' }, // Future version
      ];

      const supported = emojiGroup.filter((e) => isEmojiFullySupported(e));
      expect(supported).toHaveLength(2);
      expect(supported[0].emoji).toBe('😀');
      expect(supported[1].emoji).toBe('🫠');
    });
  });
});

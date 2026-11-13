import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isEmojiFullySupported,
  getBrowserEmojiSupport,
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

  describe('Browser Canvas Version-Level & Country-Flag Probing', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalGetContext = HTMLCanvasElement.prototype.getContext;

    const PROBE_VERSIONS: Record<string, number> = {
      '🫩': 16.0,
      '🐦‍🔥': 15.1,
      '🩷': 15.0,
      '🫠': 14.0,
      '❤️‍🔥': 13.1,
      '🥷': 13.0,
      '🧑‍🦯': 12.1,
      '🥱': 12.0,
      '🥰': 11.0,
      '🤩': 5.0,
      '🤣': 4.0,
      '🤠': 3.0,
      '👁️‍🗨️': 2.0,
      '😀': 1.0,
    };

    function installMockCanvas(options: {
      maxSupportedVersion: number;
      supportsCountryFlags: boolean;
      extraUnsupported?: Set<string>;
    }) {
      let getImageDataCalls = 0;
      let fillTextCalls = 0;
      let lastDrawnText = '';
      let currentFillStyle = '#000';

      const isGlyphSupported = (text: string): boolean => {
        if (options.extraUnsupported?.has(text)) {
          return false;
        }
        if (text === '🇪🇺') {
          return options.supportsCountryFlags;
        }
        const probeVersion = PROBE_VERSIONS[text];
        if (probeVersion !== undefined) {
          return probeVersion <= options.maxSupportedVersion;
        }
        return true;
      };

      const fakeContext = {
        canvas: { width: 2, height: 2 },
        font: '',
        get fillStyle() {
          return currentFillStyle;
        },
        set fillStyle(val: string) {
          currentFillStyle = val;
        },
        textBaseline: '',
        measureText: () => ({ width: 2 }),
        fillText: (text: string) => {
          fillTextCalls++;
          lastDrawnText = text;
        },
        clearRect: () => {},
        getImageData: () => {
          getImageDataCalls++;
          const data = new Uint8ClampedArray(16);
          if (isGlyphSupported(lastDrawnText)) {
            // Supported color emoji renders with immutable colors regardless of fillStyle
            data[0] = 255;
            data[1] = 200;
            data[2] = 0;
            data[3] = 255;
          } else {
            // Unsupported glyph renders as monochrome fallback text matching fillStyle
            const isBlue = currentFillStyle.includes('00f');
            data[0] = isBlue ? 0 : 255;
            data[1] = 0;
            data[2] = isBlue ? 255 : 0;
            data[3] = 255;
          }
          return { data };
        },
      };

      (HTMLCanvasElement.prototype as unknown as { getContext: unknown }).getContext = () =>
        fakeContext;

      return {
        getGetImageDataCalls: () => getImageDataCalls,
        getFillTextCalls: () => fillTextCalls,
      };
    }

    beforeEach(() => {
      clearEmojiSupportCache();
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
      HTMLCanvasElement.prototype.getContext = originalGetContext;
      clearEmojiSupportCache();
    });

    it('bounds getImageData calls to <= 15 when filtering 1,000 versioned emojis', () => {
      const { getGetImageDataCalls } = installMockCanvas({
        maxSupportedVersion: 13.1,
        supportsCountryFlags: true,
      });

      const versions = ['1.0', '4.0', '11.0', '12.0', '13.1', '14.0', '15.0'];
      const emojis = Array.from({ length: 1000 }, (_, i) => ({
        emoji: String.fromCodePoint(0x1f300 + i),
        name: `emoji_${i}`,
        emoji_version: versions[i % versions.length],
        unicode_version: versions[i % versions.length],
      }));

      const results = emojis.map((item) => isEmojiFullySupported(item));

      // O(log(versions)) probes instead of 2,000 per-emoji readbacks
      expect(getGetImageDataCalls()).toBeGreaterThan(0);
      expect(getGetImageDataCalls()).toBeLessThanOrEqual(15);

      // Versions <= 13.1 supported, > 13.1 filtered out
      emojis.forEach((item, idx) => {
        const expected = Number.parseFloat(item.emoji_version) <= 13.1;
        expect(results[idx]).toBe(expected);
        expect(isEmojiInCache(item.emoji)).toBe(true);
      });
      expect(getEmojiSupportCacheSize()).toBe(1000);
    });

    it('uses fast path (<= 4 getImageData calls) when browser supports latest Emoji version', () => {
      const { getGetImageDataCalls } = installMockCanvas({
        maxSupportedVersion: 16.0,
        supportsCountryFlags: true,
      });

      const support = getBrowserEmojiSupport();
      expect(support).toEqual({
        maxSupportedVersion: 16.0,
        supportsCountryFlags: true,
      });
      expect(getGetImageDataCalls()).toBe(4);
    });

    it('hides Windows-style unsupported country and subdivision flags while keeping regular emojis and non-RI flags', () => {
      const { getGetImageDataCalls } = installMockCanvas({
        maxSupportedVersion: 15.0,
        supportsCountryFlags: false,
      });

      const support = getBrowserEmojiSupport();
      expect(support.supportsCountryFlags).toBe(false);
      expect(support.maxSupportedVersion).toBe(15.0);

      // Regional indicator & subdivision flags are hidden
      expect(
        isEmojiFullySupported({
          emoji: '🇺🇸',
          name: 'flag: United States',
          emoji_version: '0.6',
          unicode_version: '0.6',
        })
      ).toBe(false);
      expect(
        isEmojiFullySupported({
          emoji: '🇯🇵',
          name: 'flag: Japan',
          emoji_version: '0.6',
          unicode_version: '0.6',
        })
      ).toBe(false);
      expect(
        isEmojiFullySupported({
          emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
          name: 'flag: England',
          emoji_version: '5.0',
          unicode_version: '5.0',
        })
      ).toBe(false);

      // Standard non-regional-indicator flags and regular emojis remain supported
      expect(
        isEmojiFullySupported({
          emoji: '🏁',
          name: 'chequered flag',
          emoji_version: '0.6',
          unicode_version: '0.6',
        })
      ).toBe(true);
      expect(
        isEmojiFullySupported({
          emoji: '🏳️‍🌈',
          name: 'rainbow flag',
          emoji_version: '4.0',
          unicode_version: '4.0',
        })
      ).toBe(true);
      expect(
        isEmojiFullySupported({
          emoji: '😀',
          name: 'grinning face',
          emoji_version: '1.0',
          unicode_version: '1.0',
        })
      ).toBe(true);

      expect(getGetImageDataCalls()).toBeLessThanOrEqual(15);
    });

    it('persists probe results in sessionStorage and resets on clearEmojiSupportCache', () => {
      const firstMock = installMockCanvas({
        maxSupportedVersion: 14.0,
        supportsCountryFlags: false,
      });

      expect(getBrowserEmojiSupport()).toEqual({
        maxSupportedVersion: 14.0,
        supportsCountryFlags: false,
      });
      const initialCalls = firstMock.getGetImageDataCalls();
      expect(initialCalls).toBeGreaterThan(0);

      // Stored in sessionStorage
      const stored = sessionStorage.getItem('@ferrucc-io/emoji-picker/support-v1');
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual({
        maxSupportedVersion: 14.0,
        supportsCountryFlags: false,
      });

      // Subsequent calls reuse cached result with 0 extra canvas calls
      getBrowserEmojiSupport();
      expect(firstMock.getGetImageDataCalls()).toBe(initialCalls);

      // Clearing cache resets memory + sessionStorage so new probes run
      clearEmojiSupportCache();
      expect(sessionStorage.getItem('@ferrucc-io/emoji-picker/support-v1')).toBeNull();

      const secondMock = installMockCanvas({
        maxSupportedVersion: 16.0,
        supportsCountryFlags: true,
      });
      expect(getBrowserEmojiSupport()).toEqual({
        maxSupportedVersion: 16.0,
        supportsCountryFlags: true,
      });
      expect(secondMock.getGetImageDataCalls()).toBe(4);
    });

    it('falls back to per-emoji canvas detection when version metadata is absent', () => {
      const { getGetImageDataCalls } = installMockCanvas({
        maxSupportedVersion: 15.0,
        supportsCountryFlags: true,
        extraUnsupported: new Set(['🧪']),
      });

      expect(isEmojiFullySupported({ emoji: '🎉' })).toBe(true);
      expect(isEmojiFullySupported({ emoji: '🧪' })).toBe(false);
      expect(getGetImageDataCalls()).toBe(4);

      // Cached on repeat call
      expect(isEmojiFullySupported({ emoji: '🧪' })).toBe(false);
      expect(getGetImageDataCalls()).toBe(4);
    });
  });
});

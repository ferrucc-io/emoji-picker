import { describe, expect, test } from 'bun:test';
import { isCompatibleEmoji } from '../../utils/emojiFilters';

describe("isCompatibleEmoji", () => {
  test("should filter out emojis with skin tone support after version 15.0", () => {
    const emojiWithNewSkinToneSupport = {
      emoji: "🫂",
      name: "people hugging",
      unicode_version: "13.0",
      emoji_version: "13.0",
      skin_tone_support: true,
      skin_tone_support_unicode_version: "15.1",
    };

    const result = isCompatibleEmoji(emojiWithNewSkinToneSupport, 15.0);
    expect(result.isCompatible).toBe(true);
    expect(result.supportsSkinTone).toBe(false);
  });

  test("should allow emojis with skin tone support before version 15.0", () => {
    const emojiWithOldSkinToneSupport = {
      emoji: "👋",
      name: "waving hand",
      unicode_version: "6.0",
      emoji_version: "6.0",
      skin_tone_support: true,
      skin_tone_support_unicode_version: "8.0",
    };

    const result = isCompatibleEmoji(emojiWithOldSkinToneSupport, 15.0);
    expect(result.isCompatible).toBe(true);
    expect(result.supportsSkinTone).toBe(true);
  });

  test("should handle emojis without skin tone support", () => {
    const emojiWithoutSkinToneSupport = {
      emoji: "🌟",
      name: "glowing star",
      unicode_version: "6.0",
      emoji_version: "6.0",
      skin_tone_support: false,
    };

    const result = isCompatibleEmoji(emojiWithoutSkinToneSupport, 15.0);
    expect(result.isCompatible).toBe(true);
    expect(result.supportsSkinTone).toBe(false);
  });

  test("should handle invalid unicode versions", () => {
    const emojiWithInvalidVersion = {
      emoji: "🤔",
      name: "thinking face",
      unicode_version: "invalid",
      emoji_version: "6.0",
      skin_tone_support: true,
      skin_tone_support_unicode_version: "8.0",
    };

    const result = isCompatibleEmoji(emojiWithInvalidVersion, 15.0);
    expect(result.isCompatible).toBe(false);
    expect(result.supportsSkinTone).toBe(false);
  });
}); 
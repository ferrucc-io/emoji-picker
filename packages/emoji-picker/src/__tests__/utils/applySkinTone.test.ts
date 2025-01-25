import { describe, expect, test } from 'bun:test';
import { applySkinTone } from '../../utils/applySkinTone';

import type { EmojiMetadata } from '../../utils/applySkinTone';

describe('applySkinTone()', () => {
  test('applies skin tone to basic emoji', () => {
    const emoji: EmojiMetadata = {
      emoji: "👋",
      name: "waving hand",
      slug: "waving_hand",
      skin_tone_support: true
    };

    const result = applySkinTone(emoji, "medium");
    expect(result.emoji).toBe("👋🏽");
    expect(result.name).toBe("waving hand");
    expect(result.slug).toBe("waving_hand");
  });

  test('does not apply skin tone when skin tone is not supported', () => {
    const emoji: EmojiMetadata = {
      emoji: "❤️",
      name: "red heart",
      slug: "red_heart",
      skin_tone_support: false
    };

    const result = applySkinTone(emoji, "medium");
    expect(result).toEqual(emoji);
  });

  test('applies skin tone to emoji with variation selector', () => {
    const emoji: EmojiMetadata = {
      emoji: "💁‍♀️",
      name: "woman tipping hand",
      slug: "woman_tipping_hand",
      skin_tone_support: true
    };

    const result = applySkinTone(emoji, "medium");
    expect(result.emoji).toBe("💁🏽‍♀️");
  });

  test('applies skin tone to complex ZWJ sequence', () => {
    const emoji: EmojiMetadata = {
      emoji: "🧑‍🤝‍🧑",
      name: "people holding hands",
      slug: "people_holding_hands",
      skin_tone_support: true
    };

    const result = applySkinTone(emoji, "dark");
    expect(result.emoji).toBe("🧑🏿‍🤝‍🧑🏿");
    expect(result.name).toBe("people holding hands");
    expect(result.slug).toBe("people_holding_hands");
  });

  test('applies skin tone to emoji with multiple variation selectors', () => {
    const emoji: EmojiMetadata = {
      emoji: "🖐️",
      name: "hand with fingers splayed",
      slug: "hand_with_fingers_splayed",
      skin_tone_support: true
    };

    const result = applySkinTone(emoji, "medium");
    expect(result.emoji).toBe("🖐🏽");
  });

  test('returns original emoji when skin tone is default', () => {
    const emoji: EmojiMetadata = {
      emoji: "👋",
      name: "waving hand",
      slug: "waving_hand",
      skin_tone_support: true
    };

    const result = applySkinTone(emoji, "default");
    expect(result).toEqual(emoji);
  });

  test('applies skin tone to person running right', () => {
    const emoji: EmojiMetadata = {
      emoji: "🏃",
      name: "person running",
      slug: "person_running",
      skin_tone_support: true
    };

    const result = applySkinTone(emoji, "medium");
    expect(result.emoji).toBe("🏃🏽");
    expect(result.name).toBe("person running");
    expect(result.slug).toBe("person_running");
  });

  test('applies skin tone to person running left', () => {
    const emoji: EmojiMetadata = {
      emoji: "🏃‍♂️",
      name: "man running",
      slug: "man_running",
      skin_tone_support: true
    };

    const result = applySkinTone(emoji, "medium");
    expect(result.emoji).toBe("🏃🏽‍♂️");
    expect(result.name).toBe("man running");
    expect(result.slug).toBe("man_running");
  });

  test('applies skin tone to person in manual wheelchair right', () => {
    const emoji: EmojiMetadata = {
      emoji: "🧑‍🦽",
      name: "person in manual wheelchair",
      slug: "person_in_manual_wheelchair",
      skin_tone_support: true
    };

    const result = applySkinTone(emoji, "medium");
    expect(result.emoji).toBe("🧑🏽‍🦽");
    expect(result.name).toBe("person in manual wheelchair");
    expect(result.slug).toBe("person_in_manual_wheelchair");
  });

  test('applies skin tone to person in manual wheelchair left', () => {
    const emoji: EmojiMetadata = {
      emoji: "👨‍🦽",
      name: "man in manual wheelchair",
      slug: "man_in_manual_wheelchair",
      skin_tone_support: true
    };

    const result = applySkinTone(emoji, "dark");
    expect(result.emoji).toBe("👨🏿‍🦽");
    expect(result.name).toBe("man in manual wheelchair");
    expect(result.slug).toBe("man_in_manual_wheelchair");
  });

  test('applies skin tone only to supported positions', () => {
    const emoji: EmojiMetadata = {
      emoji: "👨‍🦽",
      name: "man in manual wheelchair",
      slug: "man_in_manual_wheelchair",
      skin_tone_support: true,
      skin_tone_support_positions: [0]  // Only apply to the person, not the wheelchair
    };

    const result = applySkinTone(emoji, "medium-dark");
    expect(result.emoji).toBe("👨🏾‍🦽");
    expect(result.name).toBe("man in manual wheelchair");
    expect(result.slug).toBe("man_in_manual_wheelchair");
  });

  test('applies skin tone to person in motorized wheelchair right', () => {
    const emoji: EmojiMetadata = {
      emoji: "👨‍🦼",
      name: "man in motorised wheelchair",
      slug: "man_in_motorised_wheelchair",
      skin_tone_support: true,
      skin_tone_support_positions: [0]  // Only apply to the person, not the wheelchair
    };

    const result = applySkinTone(emoji, "medium-dark");
    expect(result.emoji).toBe("👨🏾‍🦼");
    expect(result.name).toBe("man in motorised wheelchair");
    expect(result.slug).toBe("man_in_motorised_wheelchair");
  });

  test('applies skin tone to person in motorized wheelchair with direction', () => {
    const emoji: EmojiMetadata = {
      emoji: "🧑‍🦼‍➡️",
      name: "person in motorised wheelchair facing right",
      slug: "person_in_motorised_wheelchair_facing_right",
      skin_tone_support: true
    };

    const result = applySkinTone(emoji, "medium-dark");
    expect(result.emoji).toBe("🧑🏾‍🦼‍➡️");
    expect(result.name).toBe("person in motorised wheelchair facing right");
    expect(result.slug).toBe("person_in_motorised_wheelchair_facing_right");
  });

  test('applies skin tone to woman detective emoji', () => {
    const emoji: EmojiMetadata = {
      emoji: "🕵️‍♀️",
      name: "woman detective",
      slug: "woman_detective",
      skin_tone_support: true
    };

    const result = applySkinTone(emoji, "dark");
    expect(result.emoji).toBe("🕵🏿‍♀️");
    expect(result.name).toBe("woman detective");
    expect(result.slug).toBe("woman_detective");
  });

  test('does not apply skin tone to family emoji', () => {
    const emoji: EmojiMetadata = {
      emoji: "👨‍👩‍👦",
      name: "family man, woman, boy",
      slug: "family_man_woman_boy",
      skin_tone_support: false
    };

    const result = applySkinTone(emoji, "medium");
    expect(result.emoji).toBe("👨‍👩‍👦");
    expect(result.name).toBe("family man, woman, boy");
    expect(result.slug).toBe("family_man_woman_boy");
  });
}); 

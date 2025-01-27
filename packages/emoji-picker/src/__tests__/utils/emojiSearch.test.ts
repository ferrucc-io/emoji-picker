import { describe, expect, test } from 'bun:test';
import { processEmojiData, searchEmojis } from '../../utils/emojiSearch';

describe('Emoji Search', () => {
  const mockEmojiData = {
    'Smileys & Emotion': {
      name: 'Smileys & Emotion',
      slug: 'smileys_emotion',
      emojis: {
        grinning: {
          emoji: '😀',
          name: 'grinning face',
          slug: 'grinning_face',
          unicode_version: '6.1',
          emoji_version: '6.0',
          skin_tone_support: false,
        },
        grin: {
          emoji: '😁',
          name: 'beaming face with smiling eyes',
          slug: 'beaming_face_with_smiling_eyes',
          unicode_version: '6.0',
          emoji_version: '6.0',
          skin_tone_support: false,
        },
        new_emoji: {
          emoji: '🫨',
          name: 'shaking face',
          slug: 'shaking_face',
          unicode_version: '15.1',
          emoji_version: '15.1',
          skin_tone_support: false,
        },
      },
    },
  };

  test('processEmojiData processes emoji data correctly', () => {
    const processed = processEmojiData(mockEmojiData);
    expect(processed).toHaveLength(3);
    expect(processed[0]).toEqual({
      emoji: '😀',
      name: 'grinning face',
      group: 'Smileys & Emotion',
      skin_tone_support: false,
      skin_tone_support_unicode_version: undefined,
      unicode_version: '6.1',
      emoji_version: '6.0',
    });
  });

  test('searchEmojis finds emojis by name', () => {
    const processed = processEmojiData(mockEmojiData);
    const results = searchEmojis('grinning', processed);
    expect(results).toHaveLength(1);
    expect(results[0].emojis[0].emoji).toBe('😀');
  });

  test('searchEmojis finds emojis by partial match', () => {
    const processed = processEmojiData(mockEmojiData);
    const results = searchEmojis('beam', processed);
    expect(results).toHaveLength(1);
    expect(results[0].emojis[0].emoji).toBe('😁');
  });

  test('searchEmojis returns empty array for no matches', () => {
    const processed = processEmojiData(mockEmojiData);
    const results = searchEmojis('xyz', processed);
    expect(results).toHaveLength(0);
  });

  test('searchEmojis returns empty array for empty search', () => {
    const processed = processEmojiData(mockEmojiData);
    const results = searchEmojis('', processed);
    expect(results).toHaveLength(0);
  });

  test('searchEmojis does not return emojis that are not compatible with version 15.0', () => {
    const processed = processEmojiData(mockEmojiData);
    const results = searchEmojis('shaking', processed);
    expect(results).toHaveLength(0);
  });
});

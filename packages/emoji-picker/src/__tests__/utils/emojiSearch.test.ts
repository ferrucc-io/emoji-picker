import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { describe, expect, test } from 'bun:test';
import {
  normalizeSearchQuery,
  processEmojiData,
  rankEmojisByRelevance,
  scoreEmojiMatch,
  searchCustomEmojis,
  searchEmojis,
  searchEmojisRanked,
} from '../../utils/emojiSearch';

import type { CustomSection } from '../../types/emoji';

const requireFromHere = createRequire(import.meta.url);
const realEmojiDataByGroup = JSON.parse(
  readFileSync(requireFromHere.resolve('unicode-emoji-json/data-by-group.json'), 'utf8')
);
const fullProcessedEmojiData = processEmojiData(realEmojiDataByGroup);

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

  describe('normalizeSearchQuery', () => {
    test('trims whitespace, lowercases, and strips surrounding colons', () => {
      expect(normalizeSearchQuery('  :Thumbs_Up:  ')).toBe('thumbs_up');
      expect(normalizeSearchQuery(':joy')).toBe('joy');
      expect(normalizeSearchQuery('joy:')).toBe('joy');
      expect(normalizeSearchQuery('::tada::')).toBe('tada');
      expect(normalizeSearchQuery(':+1:')).toBe('+1');
      expect(normalizeSearchQuery(':-1:')).toBe('-1');
      expect(normalizeSearchQuery('   ')).toBe('');
      expect(normalizeSearchQuery('::')).toBe('');
    });
  });

  describe('colloquial keywords and Slack/GitHub shortcodes', () => {
    test.each([
      ['tada', '🎉'],
      ['sob', '😭'],
      ['+1', '👍'],
      ['-1', '👎'],
      ['lit', '🔥'],
      ['poop', '💩'],
      ['hankey', '💩'],
      ['pray', '🙏'],
      ['100', '💯'],
      ['clap', '👏'],
      ['wave', '👋'],
      ['eyes', '👀'],
      ['check', '✅'],
      ['white_check_mark', '✅'],
      ['x', '❌'],
      ['warning', '⚠️'],
      ['bulb', '💡'],
      ['idea', '💡'],
      ['bug', '🐛'],
      ['sparkles', '✨'],
      ['star', '⭐'],
      ['broken_heart', '💔'],
      ['thinking', '🤔'],
      ['shrug', '🤷'],
      ['salute', '🫡'],
      ['melting', '🫠'],
      ['skull', '💀'],
      ['dead', '💀'],
      ['goat', '🐐'],
      ['crown', '👑'],
      ['rocket', '🚀'],
    ])('"%s" finds %s as the top ranked result', (query, expectedEmoji) => {
      const ranked = searchEmojisRanked(query, fullProcessedEmojiData);
      expect(ranked.length).toBeGreaterThan(0);
      expect(ranked[0].emoji).toBe(expectedEmoji);

      const grouped = searchEmojis(query, fullProcessedEmojiData);
      expect(grouped.length).toBeGreaterThan(0);
      expect(grouped[0].emojis[0].emoji).toBe(expectedEmoji);
    });

    test('"lol" and "lmao" find laughing emojis (😂 / 🤣)', () => {
      const lolEmojis = searchEmojisRanked('lol', fullProcessedEmojiData).map((e) => e.emoji);
      expect(lolEmojis.slice(0, 3)).toContain('😂');
      expect(lolEmojis.slice(0, 3)).toContain('🤣');

      const lmaoEmojis = searchEmojisRanked('lmao', fullProcessedEmojiData).map((e) => e.emoji);
      expect(lmaoEmojis.slice(0, 3)).toContain('😂');
      expect(lmaoEmojis.slice(0, 3)).toContain('🤣');
    });

    test('"happy" and "shipit" find expected colloquial matches', () => {
      const happyEmojis = searchEmojisRanked('happy', fullProcessedEmojiData).map((e) => e.emoji);
      expect(happyEmojis).toContain('😀');
      expect(happyEmojis).toContain('😄');
      expect(happyEmojis).toContain('😊');

      const shipitEmojis = searchEmojisRanked('shipit', fullProcessedEmojiData).map((e) => e.emoji);
      expect(shipitEmojis).toContain('🚀');
    });
  });

  describe('colon and separator normalization', () => {
    test('handles colon-wrapped and underscore/hyphen-separated queries', () => {
      expect(searchEmojisRanked(':joy:', fullProcessedEmojiData)[0]?.emoji).toBe('😂');
      expect(searchEmojisRanked(':thumbs_up:', fullProcessedEmojiData)[0]?.emoji).toBe('👍');
      expect(searchEmojisRanked('thumbs_up', fullProcessedEmojiData)[0]?.emoji).toBe('👍');
      expect(searchEmojisRanked('thumbs-up', fullProcessedEmojiData)[0]?.emoji).toBe('👍');
      expect(searchEmojisRanked('party-popper', fullProcessedEmojiData)[0]?.emoji).toBe('🎉');
      expect(searchEmojisRanked(':white-check-mark:', fullProcessedEmojiData)[0]?.emoji).toBe('✅');
    });
  });

  describe('multi-word queries', () => {
    test('matches non-adjacent multi-token queries across name and keywords', () => {
      const grinningEyes = searchEmojisRanked('grinning eyes', fullProcessedEmojiData).map(
        (e) => e.emoji
      );
      expect(grinningEyes).toContain('😄');
      expect(grinningEyes).toContain('😃');
      expect(grinningEyes).not.toContain('😀');

      const smilingEyes = searchEmojisRanked('smiling eyes', fullProcessedEmojiData).map(
        (e) => e.emoji
      );
      expect(smilingEyes).toContain('😄');
      expect(smilingEyes).toContain('😊');

      const redHeart = searchEmojisRanked('red heart', fullProcessedEmojiData);
      expect(redHeart[0]?.emoji).toBe('❤️');
    });
  });

  describe('relevance ranking', () => {
    test('"fire" ranks 🔥 ahead of compound fire items like 🚒 and 🧯', () => {
      const ranked = searchEmojisRanked('fire', fullProcessedEmojiData).map((e) => e.emoji);
      const fireIdx = ranked.indexOf('🔥');
      const engineIdx = ranked.indexOf('🚒');
      const extinguisherIdx = ranked.indexOf('🧯');

      expect(fireIdx).toBe(0);
      expect(engineIdx).toBeGreaterThan(fireIdx);
      expect(extinguisherIdx).toBeGreaterThan(fireIdx);
    });

    test('"heart" ranks ❤️ ahead of compound heart items', () => {
      const ranked = searchEmojisRanked('heart', fullProcessedEmojiData).map((e) => e.emoji);
      const redHeartIdx = ranked.indexOf('❤️');
      const anatomicalIdx = ranked.indexOf('🫀');
      const exclamationIdx = ranked.indexOf('❣️');

      expect(redHeartIdx).toBe(0);
      expect(anatomicalIdx).toBeGreaterThan(redHeartIdx);
      expect(exclamationIdx).toBeGreaterThan(redHeartIdx);
    });

    test('scoreEmojiMatch orders exact name > exact keyword > prefix > word prefix > substring', () => {
      expect(scoreEmojiMatch({ emoji: '🔥', name: 'fire' }, 'fire')).toBe(120);
      expect(scoreEmojiMatch({ emoji: '🎉', name: 'party popper' }, 'tada')).toBe(100);
      expect(scoreEmojiMatch({ emoji: '🚒', name: 'fire engine' }, 'fire')).toBe(80);
      expect(scoreEmojiMatch({ emoji: '💔', name: 'broken heart' }, 'heart')).toBe(60);
      expect(scoreEmojiMatch({ emoji: '🌻', name: 'sunflower' }, 'flower')).toBe(30);
    });

    test('rankEmojisByRelevance sorts flattened category results globally by score', () => {
      const unranked = [
        { emoji: '🚒', name: 'fire engine', slug: 'fire_engine', skin_tone_support: false },
        {
          emoji: '🧯',
          name: 'fire extinguisher',
          slug: 'fire_extinguisher',
          skin_tone_support: false,
        },
        { emoji: '🔥', name: 'fire', slug: 'fire', skin_tone_support: false },
      ];

      const ranked = rankEmojisByRelevance('fire', unranked);
      expect(ranked.map((e) => e.emoji)).toEqual(['🔥', '🚒', '🧯']);
    });
  });

  describe('searchCustomEmojis', () => {
    const customSections: CustomSection[] = [
      {
        id: 'team',
        name: 'Team',
        priority: 1,
        emojis: [
          { id: '1', name: 'afterparty', imageUrl: 'https://example.com/afterparty.png' },
          { id: '2', name: 'party-parrot', imageUrl: 'https://example.com/party-parrot.png' },
          { id: '3', name: 'party', imageUrl: 'https://example.com/party.png' },
          { id: '4', name: 'mic-drop', imageUrl: 'https://example.com/mic-drop.png' },
        ],
      },
    ];

    test('normalizes colons and separators for custom emojis like :mic-drop:', () => {
      expect(searchCustomEmojis(':mic-drop:', customSections).map((e) => e.name)).toEqual([
        'mic-drop',
      ]);
      expect(searchCustomEmojis('mic_drop', customSections).map((e) => e.name)).toEqual([
        'mic-drop',
      ]);
      expect(searchCustomEmojis('mic drop', customSections).map((e) => e.name)).toEqual([
        'mic-drop',
      ]);
    });

    test('ranks exact matches ahead of prefix matches and substring matches', () => {
      const results = searchCustomEmojis('party', customSections);
      expect(results.map((e) => e.name)).toEqual(['party', 'party-parrot', 'afterparty']);
    });
  });
});

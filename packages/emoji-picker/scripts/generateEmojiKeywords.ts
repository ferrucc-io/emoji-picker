import unicodeEmojiData from 'unicode-emoji-json/data-by-emoji.json';
import prettier from 'prettier';
import emojilibData from 'emojilib/emojis.json';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

interface UnicodeEmojiEntry {
  name: string;
  slug?: string;
  group: string;
  emoji_version: string;
  unicode_version: string;
  skin_tone_support?: boolean;
}

interface EmojilibEntry {
  char?: string;
  keywords?: string[];
  category?: string;
}

const stripVariationSelectors = (value: string): string => value.replace(/\uFE0F/g, '');

const NOISE_KEYWORDS = new Set([
  'banner',
  'nation',
  'country',
  'islands',
  'blue-square',
  'purple-square',
  'green-square',
  'red-square',
  'orange-square',
  'yellow-square',
  'white-square',
  'black-square',
  'red-circle',
  'blue-circle',
  'white-circle',
  'black-circle',
  'orange-diamond',
  'blue-diamond',
  'human',
  'people',
  'nature',
  'animal',
  'plant',
  'food',
  'fruit',
  'vegetable',
  'transportation',
  'vehicle',
  'places',
  'building',
  'stationery',
  'accessories',
  'fashion',
  'alphabet',
  'words',
  'numbers',
  'shape',
  'sign',
  'symbol',
  'icon',
  'schedule',
  'early',
  'late',
  'evening',
  'twilight',
  'night',
  'summer',
  'spring',
  'winter',
  'autumn',
  'woman',
  'man',
  'female',
  'male',
  'boy',
  'girl',
  'face',
  'hand',
  'hands',
  'person',
  'sports',
  'exercise',
  'play',
  'photo',
  'communication',
  'technology',
  'business',
  'japanese',
  'chinese',
  'kanji',
  'astrology',
  'zodiac',
  'direction',
  'weather',
  'shipit',
]);

/**
 * Curated Slack/GitHub shortcodes and high-signal colloquial aliases.
 * Included even when a word partially overlaps with the Unicode CLDR name
 * so canonical shortcodes (e.g. "heart" -> ❤️, "joy" -> 😂, "bulb" -> 💡)
 * receive an exact shortcode/keyword match score.
 */
export const CURATED_EMOJI_KEYWORDS: Record<string, string[]> = {
  '👍': ['+1', 'thumbsup', 'yes', 'approve', 'ok', 'like'],
  '👎': ['-1', 'thumbsdown', 'no', 'disapprove', 'dislike'],
  '🎉': ['tada', 'party', 'congrats', 'congratulations', 'celebrate', 'hooray'],
  '😭': ['sob', 'cry', 'tears', 'sad', 'bawl'],
  '😂': ['joy', 'lol', 'lmao', 'haha', 'laugh', 'happy'],
  '🤣': ['rofl', 'lol', 'lmao', 'haha', 'laugh'],
  '😀': ['grinning', 'happy'],
  '😃': ['smiley', 'happy'],
  '😄': ['smile', 'happy'],
  '😁': ['grin', 'happy'],
  '😊': ['blush', 'happy', 'warm'],
  '🙂': ['slightly_smiling_face', 'happy'],
  '😆': ['laughing', 'satisfied', 'haha', 'xd'],
  '😅': ['sweat_smile', 'phew', 'relief'],
  '😉': ['wink'],
  '😍': ['heart_eyes', 'love', 'crush', 'adore'],
  '🥰': ['smiling_face_with_three_hearts', 'love', 'hearts', 'adore', 'affection'],
  '😘': ['kissing_heart', 'kiss', 'xoxo'],
  '😎': ['sunglasses', 'cool', 'chill'],
  '🥳': ['partying_face', 'partying', 'party', 'celebrate', 'woohoo'],
  '😢': ['cry', 'tear', 'sad'],
  '😡': ['rage', 'angry', 'mad', 'furious'],
  '😠': ['angry', 'mad'],
  '🤬': ['swearing', 'cursing', 'wtf', 'angry'],
  '🤯': ['exploding_head', 'mindblown', 'shocked', 'wow'],
  '😱': ['scream', 'omg', 'shocked', 'scared'],
  '😴': ['sleeping', 'zzz', 'tired', 'sleep'],
  '🥱': ['yawn', 'tired', 'bored', 'sleepy'],
  '🤮': ['vomit', 'puke', 'gross', 'sick'],
  '🤢': ['nauseated', 'sick', 'gross'],
  '🥵': ['hot_face', 'hot', 'sweating', 'heat'],
  '🥶': ['cold_face', 'cold', 'freezing'],
  '🥴': ['woozy', 'drunk', 'dizzy'],
  '🙏': ['pray', 'please', 'thanks', 'thankyou', 'namaste', 'highfive'],
  '💩': ['poop', 'hankey', 'shit', 'turd', 'crap'],
  '🔥': ['lit', 'hot', 'flame'],
  '✨': ['shiny', 'magic', 'ai'],
  '💯': ['100', 'perfect', 'score'],
  '👏': ['clap', 'applause', 'bravo', 'congrats'],
  '👋': ['wave', 'hello', 'hi', 'hey', 'bye', 'goodbye'],
  '🙌': ['raised_hands', 'hooray', 'yay', 'praise', 'woohoo'],
  '🤝': ['deal', 'agree'],
  '✌️': ['v', 'peace', 'victory'],
  '🤞': ['luck', 'hope', 'fingers_crossed'],
  '💪': ['muscle', 'strong', 'flex', 'strength', 'workout'],
  '👀': ['look', 'see', 'peek', 'lgtm'],
  '✅': ['check', 'white_check_mark', 'done', 'yes', 'ok'],
  '☑️': ['ballot_box_with_check', 'check'],
  '✔️': ['heavy_check_mark', 'check'],
  '❌': ['x', 'cross', 'no', 'cancel', 'delete', 'error'],
  '⚠️': ['alert', 'caution', 'wip'],
  '💡': ['bulb', 'idea', 'tip'],
  '🐛': ['insect', 'defect'],
  '⭐': ['favorite', 'fav'],
  '🌟': ['star2', 'glowing', 'shine'],
  '❤️': ['heart', 'love', 'like'],
  '💔': ['heartbreak'],
  '❤️‍🔥': ['passion'],
  '🤔': ['thinking', 'hmm', 'hmmm', 'wonder'],
  '🤷': ['shrug', 'idk', 'whatever'],
  '🤦': ['facepalm', 'smh', 'doh'],
  '🫡': ['salute', 'aye', 'respect', 'yessir'],
  '🫠': ['melting', 'melt', 'awkward'],
  '💀': ['dead', 'dying', 'rip', 'lmao'],
  '🐐': ['greatest'],
  '👑': ['king', 'queen', 'royalty'],
  '🚀': ['shipit', 'launch', 'deploy', 'ship'],
  '🐿️': ['shipit'],
  '🥹': ['touched', 'grateful', 'proud', 'aww', 'tears'],
  '🥺': ['pleading', 'puppy', 'please', 'beg'],
  '🫶': ['love', 'support'],
  '🥲': ['bittersweet', 'relieved', 'pain'],
  '🫣': ['peeking', 'peek', 'shy', 'scared'],
  '🫢': ['gasp', 'oops', 'whoops', 'shocked'],
  '🫥': ['invisible', 'disappear', 'hide'],
  '🤌': ['italian', 'chefs_kiss', 'perfection'],
  '🥷': ['stealth'],
  '🤖': ['bot', 'ai'],
  '🧑‍💻': ['coder', 'developer', 'dev', 'engineer', 'programmer'],
  '🎊': ['party', 'celebrate'],
  '🎁': ['gift', 'present', 'birthday'],
  '🎂': ['birthday', 'cake', 'party'],
  '🍻': ['beers', 'cheers', 'drinks'],
  '🥂': ['cheers', 'toast', 'champagne'],
  '☕': ['coffee', 'cafe', 'espresso', 'morning'],
  '💰': ['moneybag', 'money', 'rich', 'cash'],
  '💸': ['expensive', 'spend', 'cash'],
  '📈': ['stonks', 'growth', 'up', 'chart'],
  '📉': ['down', 'loss', 'chart'],
  '🚨': ['rotating_light', 'alert', 'siren', 'emergency'],
  '🚧': ['wip'],
  '🔒': ['lock', 'secure', 'private', 'closed'],
  '🔓': ['unlock', 'open'],
  '🔑': ['password', 'auth'],
  '🗑️': ['trash', 'delete', 'garbage'],
  '📌': ['pin'],
  '📎': ['attachment'],
  '🔍': ['mag', 'search', 'find', 'zoom'],
  '📣': ['mega', 'announcement', 'shout'],
  '💬': ['speech_balloon', 'chat', 'comment', 'message'],
  '⚡': ['zap', 'lightning', 'fast', 'bolt', 'electric'],
  '🌈': ['pride', 'lgbt'],
  '☀️': ['sunny'],
  '🌙': ['moon', 'sleep'],
  '🏆': ['winner', 'champion', 'award'],
  '🥇': ['gold', 'first', 'winner'],
  '🎯': ['dart', 'bullseye', 'target', 'goal'],
  '💎': ['gem'],
  '🧠': ['smart', 'genius', 'mind'],
  '🚗': ['car', 'red_car', 'auto', 'drive'],
  '📱': ['iphone', 'smartphone', 'cell', 'phone'],
  '💻': ['computer', 'pc', 'mac', 'code'],
  '🇺🇸': ['us', 'usa', 'america'],
  '🇬🇧': ['uk', 'gb', 'britain'],
  '🇯🇵': ['jp', 'jpn'],
  '🇰🇷': ['kr', 'kor'],
  '🇩🇪': ['de', 'ger'],
  '🇫🇷': ['fr', 'fra'],
  '🇨🇦': ['ca', 'can'],
  '🇦🇺': ['au', 'aus'],
  '🇪🇺': ['eu'],
};

export function buildEmojiKeywordMap(
  unicodeData: Record<string, UnicodeEmojiEntry> = unicodeEmojiData as Record<
    string,
    UnicodeEmojiEntry
  >,
  emojilib: Record<string, EmojilibEntry> = emojilibData as Record<string, EmojilibEntry>
): Record<string, string[]> {
  const primaryOwner = new Map<string, string>();

  for (const [emoji, meta] of Object.entries(unicodeData)) {
    const nameLower = meta.name.toLowerCase();
    if (!nameLower.includes(' ')) {
      primaryOwner.set(nameLower, stripVariationSelectors(emoji));
    }
  }

  const byChar = new Map<string, { shortcode: string; keywords: string[] }[]>();
  for (const [shortcode, info] of Object.entries(emojilib)) {
    if (!info.char) continue;
    const stripped = stripVariationSelectors(info.char);
    const scLower = shortcode.toLowerCase();
    if (!primaryOwner.has(scLower)) {
      primaryOwner.set(scLower, stripped);
    }
    const existing = byChar.get(stripped);
    const item = { shortcode, keywords: info.keywords ?? [] };
    if (existing) {
      existing.push(item);
    } else {
      byChar.set(stripped, [item]);
    }
  }

  const keywordMap: Record<string, string[]> = {};

  for (const [emoji, meta] of Object.entries(unicodeData)) {
    if (parseFloat(meta.unicode_version) > 15.0) continue;

    const stripped = stripVariationSelectors(emoji);
    const nameLower = meta.name.toLowerCase();
    const nameWords = new Set(nameLower.split(/[\s\-_:,()]+/).filter(Boolean));
    const slug = meta.slug || nameLower.replace(/\s+/g, '_');
    const entries = byChar.get(stripped) ?? [];
    const curated = CURATED_EMOJI_KEYWORDS[emoji] ?? [];
    const terms = new Set<string>();

    for (const alias of curated) {
      const normalized = alias.toLowerCase().trim();
      if (normalized && normalized !== nameLower && normalized !== slug) {
        terms.add(normalized);
      }
    }

    const isClock = /^clock\d+$/.test(entries[0]?.shortcode ?? '');
    const isFlag = meta.group === 'Flags' && nameLower.startsWith('flag ');
    const isMoonPhase = nameLower.includes('moon') && emoji !== '🌙';
    const isGenderOrFamilyZwj =
      emoji.includes('\u200D') &&
      (/^(man|woman|person|family)\b/.test(nameLower) || nameLower.includes('facing right'));

    const isAllWordsInName = (term: string): boolean => {
      const parts = term.split(/[\s\-_]+/).filter(Boolean);
      return parts.length > 0 && parts.every((part) => nameWords.has(part));
    };

    if (!isFlag && !isClock && !isGenderOrFamilyZwj) {
      for (const { shortcode, keywords } of entries) {
        const sc = shortcode.toLowerCase().trim();
        if (
          sc &&
          (sc.length >= 2 || sc === 'x' || sc === 'v') &&
          !NOISE_KEYWORDS.has(sc) &&
          sc !== nameLower &&
          sc !== slug &&
          !nameWords.has(sc) &&
          !isAllWordsInName(sc) &&
          !(sc.length >= 4 && [...nameWords].some((word) => word.startsWith(sc)))
        ) {
          terms.add(sc);
        }

        for (const rawKeyword of keywords) {
          const k = rawKeyword.toLowerCase().trim();
          if (!k || (k.length < 2 && k !== 'x')) continue;
          if (/^[:;8x][-o]?[d()p/\\|]$/i.test(k)) continue;
          if (NOISE_KEYWORDS.has(k)) continue;
          if (isMoonPhase && k === 'sleep') continue;

          const owner = primaryOwner.get(k);
          if (owner && owner !== stripped) continue;

          if (k === nameLower || k === slug || nameWords.has(k) || isAllWordsInName(k)) continue;
          if (k.length >= 4 && [...nameWords].some((word) => word.startsWith(k))) continue;

          terms.add(k);
        }
      }
    }

    const maxTerms = curated.length > 0 ? Math.max(curated.length, 5) : 3;
    const list = [...terms].slice(0, maxTerms);
    if (list.length > 0) {
      keywordMap[emoji] = list;
    }
  }

  return keywordMap;
}

async function main() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const outputPath = join(scriptDir, '../src/utils/emojiKeywords.ts');
  const keywordMap = buildEmojiKeywordMap();

  const rawSource = `// Generated by scripts/generateEmojiKeywords.ts - do not edit manually
export const emojiKeywords: Record<string, string[]> = ${JSON.stringify(keywordMap)};
`;

  const formatted = await prettier.format(rawSource, {
    parser: 'typescript',
    printWidth: 100,
    singleQuote: true,
    trailingComma: 'es5',
    tabWidth: 2,
    semi: true,
  });

  writeFileSync(outputPath, formatted, 'utf-8');
  const rawBytes = Buffer.byteLength(formatted, 'utf-8');
  console.log(
    `Generated ${Object.keys(keywordMap).length} emoji keyword entries (${(rawBytes / 1024).toFixed(1)} KB) -> ${outputPath}`
  );
}

if (import.meta.main) {
  main().catch((error) => {
    console.error('Failed to generate emoji keywords:', error);
    process.exit(1);
  });
}

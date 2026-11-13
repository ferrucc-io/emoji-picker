import { isCompatibleEmoji } from './emojiFilters';

export const EMOJI_FONT_FAMILY =
  "'Apple Color Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', 'Android Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', EmojiSymbols, sans-serif";
const CANVAS_SIZE = 2;
const SUPPORT_STORAGE_KEY = '@ferrucc-io/emoji-picker/support-v1';

// Representative probe emojis per Emoji version (descending from newest to oldest).
// Emoji versions jumped from 5.0 directly to 11.0 to align with Unicode versions.
const VERSION_PROBES: ReadonlyArray<readonly [version: number, emoji: string]> = [
  [16.0, '🫩'],
  [15.1, '🐦‍🔥'],
  [15.0, '🩷'],
  [14.0, '🫠'],
  [13.1, '❤️‍🔥'],
  [13.0, '🥷'],
  [12.1, '🧑‍🦯'],
  [12.0, '🥱'],
  [11.0, '🥰'],
  [5.0, '🤩'],
  [4.0, '🤣'],
  [3.0, '🤠'],
  [2.0, '👁️‍🗨️'],
  [1.0, '😀'],
];

// Country flag probe (Windows fonts render regional indicator pairs as two-letter codes instead of flags)
const COUNTRY_FLAG_PROBE = '🇪🇺';

// Matches two-letter regional indicator flags (U+1F1E6..U+1F1FF) and subdivision tag flags (England/Scotland/Wales)
const COUNTRY_FLAG_REGEX = /^(?:[\u{1F1E6}-\u{1F1FF}]{2}|\u{1F3F4}[\u{E0060}-\u{E007F}]+)$/u;

export interface BrowserEmojiSupport {
  maxSupportedVersion: number;
  supportsCountryFlags: boolean;
}

let context: CanvasRenderingContext2D | null = null;
let cachedBrowserSupport: BrowserEmojiSupport | null = null;

// Cache for emoji support detection results to avoid repeated lookups/canvas operations
const supportCache = new Map<string, boolean>();

/**
 * Detects if an emoji is supported by the current browser/system using canvas rendering.
 * Works by rendering the emoji on a canvas in different colors and checking if
 * the pixels remain unchanged (emojis have immutable colors).
 */
function detectEmojiSupportViaCanvas(emoji: string): boolean {
  try {
    context ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  } catch {
    // Non-browser environments - assume supported to avoid over-filtering
    return true;
  }

  // If we can't get a canvas context, assume supported rather than filtering everything out
  if (!context) {
    return true;
  }

  // Schedule to dispose of the context after all microtasks
  queueMicrotask(() => {
    if (context) {
      context = null;
    }
  });

  context.canvas.width = CANVAS_SIZE;
  context.canvas.height = CANVAS_SIZE;
  context.font = `2px ${EMOJI_FONT_FAMILY}`;
  context.textBaseline = 'middle';

  // Unsupported ZWJ sequence emojis show up as separate emojis
  // They will be wider than expected
  if (context.measureText(emoji).width >= CANVAS_SIZE * 2) {
    return false;
  }

  // First render in blue
  context.fillStyle = '#00f';
  context.fillText(emoji, 0, 0);

  const blue = context.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;

  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Then render in red
  context.fillStyle = '#f00';
  context.fillText(emoji, 0, 0);

  const red = context.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;

  // Emojis have an immutable color so they should look the same regardless of the text color
  // If the emoji is not supported, it will be rendered as text and will change color
  for (let i = 0; i < CANVAS_SIZE * CANVAS_SIZE * 4; i += 4) {
    if (
      blue[i] !== red[i] || // R
      blue[i + 1] !== red[i + 1] || // G
      blue[i + 2] !== red[i + 2] // B
    ) {
      return false;
    }
  }

  return true;
}

function readStoredBrowserSupport(): BrowserEmojiSupport | null {
  try {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    const raw = sessionStorage.getItem(SUPPORT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<BrowserEmojiSupport>;
    if (
      typeof parsed.maxSupportedVersion === 'number' &&
      Number.isFinite(parsed.maxSupportedVersion) &&
      typeof parsed.supportsCountryFlags === 'boolean'
    ) {
      return {
        maxSupportedVersion: parsed.maxSupportedVersion,
        supportsCountryFlags: parsed.supportsCountryFlags,
      };
    }
  } catch {
    // Ignore storage access or JSON parse errors (e.g. private browsing / strict CSP)
  }
  return null;
}

function writeStoredBrowserSupport(support: BrowserEmojiSupport): void {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(support));
    }
  } catch {
    // Ignore storage quota or security errors
  }
}

function probeMaxSupportedEmojiVersion(): number {
  // Fast path: modern browsers typically support the newest Emoji version on the first check
  if (detectEmojiSupportViaCanvas(VERSION_PROBES[0][1])) {
    return VERSION_PROBES[0][0];
  }

  // Binary search across remaining descending versions (at most 4 canvas checks)
  let resultVersion = 0;
  let low = 1;
  let high = VERSION_PROBES.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const [version, probeEmoji] = VERSION_PROBES[mid];

    if (detectEmojiSupportViaCanvas(probeEmoji)) {
      resultVersion = version;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return resultVersion;
}

/**
 * Computes and caches the current browser's maximum supported Emoji version
 * and country-flag rendering support using at most ~6 canvas probes total.
 */
export function getBrowserEmojiSupport(): BrowserEmojiSupport {
  if (typeof window === 'undefined') {
    return {
      maxSupportedVersion: Number.POSITIVE_INFINITY,
      supportsCountryFlags: true,
    };
  }

  if (cachedBrowserSupport) {
    return cachedBrowserSupport;
  }

  const stored = readStoredBrowserSupport();
  if (stored) {
    cachedBrowserSupport = stored;
    return stored;
  }

  const computed: BrowserEmojiSupport = {
    maxSupportedVersion: probeMaxSupportedEmojiVersion(),
    supportsCountryFlags: detectEmojiSupportViaCanvas(COUNTRY_FLAG_PROBE),
  };

  cachedBrowserSupport = computed;
  writeStoredBrowserSupport(computed);
  return computed;
}

function normalizeToEmojiVersion(emojiVersion?: string, unicodeVersion?: string): number {
  if (emojiVersion) {
    return Number.parseFloat(emojiVersion);
  }
  if (!unicodeVersion) {
    return Number.NaN;
  }
  const version = Number.parseFloat(unicodeVersion);
  // Pre-11.0 Unicode standard versions (6.0..10.0) correspond to Emoji versions 0.6..5.0
  if (version >= 6.0 && version < 11.0) {
    if (version < 6.1) return 0.6;
    if (version < 7.0) return 0.7;
    if (version < 8.0) return 1.0;
    if (version < 9.0) return 2.0;
    if (version < 10.0) return 3.0;
    return 5.0;
  }
  return version;
}

export function isEmojiFullySupported(
  emojiData: {
    emoji?: string;
    unicode_version?: string;
    emoji_version?: string;
    skin_tone_support?: boolean;
    skin_tone_support_unicode_version?: string;
    name?: string;
    slug?: string;
  },
  emoji?: string
): boolean {
  const emojiChar = emojiData.emoji || emoji;

  if (!emojiChar) {
    return false;
  }

  // Check Unicode version compatibility
  if (emojiData.unicode_version || emojiData.emoji_version) {
    const { isCompatible } = isCompatibleEmoji(
      {
        emoji: emojiChar,
        name: emojiData.name || '',
        unicode_version: emojiData.unicode_version || emojiData.emoji_version || '',
        emoji_version: emojiData.emoji_version || emojiData.unicode_version || '',
        skin_tone_support: emojiData.skin_tone_support || false,
        skin_tone_support_unicode_version: emojiData.skin_tone_support_unicode_version,
        slug: emojiData.slug,
      },
      15.0 // Max Unicode version (Emoji 15.0)
    );

    if (!isCompatible) {
      return false;
    }
  }

  // In test environments, skip canvas detection
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return true;
  }

  // Check runtime support in browser environments
  if (typeof window !== 'undefined') {
    if (supportCache.has(emojiChar)) {
      return supportCache.get(emojiChar)!;
    }

    const parsedVersion = normalizeToEmojiVersion(
      emojiData.emoji_version,
      emojiData.unicode_version
    );

    if (!Number.isNaN(parsedVersion)) {
      const { maxSupportedVersion, supportsCountryFlags } = getBrowserEmojiSupport();
      const isSupported = COUNTRY_FLAG_REGEX.test(emojiChar)
        ? supportsCountryFlags && parsedVersion <= maxSupportedVersion
        : parsedVersion <= maxSupportedVersion;
      supportCache.set(emojiChar, isSupported);
      return isSupported;
    }

    const isSupported = detectEmojiSupportViaCanvas(emojiChar);
    supportCache.set(emojiChar, isSupported);
    return isSupported;
  }

  // Default to supported in non-browser environments
  return true;
}

export function clearEmojiSupportCache(): void {
  supportCache.clear();
  cachedBrowserSupport = null;
  context = null;
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SUPPORT_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function getEmojiSupportCacheSize(): number {
  return supportCache.size;
}

export function getEmojiSupportCache(): Map<string, boolean> {
  return new Map(supportCache);
}

export function isEmojiInCache(emoji: string): boolean {
  return supportCache.has(emoji);
}

import { isCompatibleEmoji } from './emojiFilters';

export const EMOJI_FONT_FAMILY = "'Apple Color Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', 'Android Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', EmojiSymbols, sans-serif";
const CANVAS_SIZE = 2;

let context: CanvasRenderingContext2D | null = null;

// Cache for emoji support detection results to avoid repeated canvas operations
const supportCache = new Map<string, boolean>();

/**
 * Detects if an emoji is supported by the current browser/system using canvas rendering.
 * Works by rendering the emoji on a canvas in different colors and checking if
 * the pixels remain unchanged (emojis have immutable colors).
 */
function detectEmojiSupportViaCanvas(emoji: string): boolean {
  try {
    context ??= document
      .createElement("canvas")
      .getContext("2d", { willReadFrequently: true });
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
  context.textBaseline = "middle";

  // Unsupported ZWJ sequence emojis show up as separate emojis
  // They will be wider than expected
  if (context.measureText(emoji).width >= CANVAS_SIZE * 2) {
    return false;
  }

  // First render in blue
  context.fillStyle = "#00f";
  context.fillText(emoji, 0, 0);

  const blue = context.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;

  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Then render in red
  context.fillStyle = "#f00";
  context.fillText(emoji, 0, 0);

  const red = context.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;

  // Emojis have an immutable color so they should look the same regardless of the text color
  // If the emoji is not supported, it will be rendered as text and will change color
  for (let i = 0; i < CANVAS_SIZE * CANVAS_SIZE * 4; i += 4) {
    if (
      blue[i] !== red[i] ||         // R
      blue[i + 1] !== red[i + 1] || // G
      blue[i + 2] !== red[i + 2]    // B
    ) {
      return false;
    }
  }

  return true;
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
  const emojiChar = emoji || emojiData.emoji;

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

  // Check runtime support using canvas (cached)
  // This is copied from: https://github.com/liveblocks/frimousse/blob/main/src/utils/is-emoji-supported.ts
  if (typeof window !== 'undefined') {
    if (supportCache.has(emojiChar)) {
      return supportCache.get(emojiChar)!;
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
  context = null;
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
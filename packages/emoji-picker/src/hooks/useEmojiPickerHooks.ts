import { useCallback, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useOptionalEmojiPicker } from '../EmojiPicker/EmojiPickerContext';
import { applySkinTone } from '../utils/applySkinTone';
import { hoveredEmojiAtom, skinToneAtom } from '../atoms/emoji';
import { isCustomEmoji } from '../types/emoji';
import type { CustomEmoji, EmojiMetadata, SkinTone } from '../types/emoji';

export type ActiveEmoji = EmojiMetadata & {
  isCustom?: boolean;
  imageUrl?: string;
};

export interface SkinToneVariation {
  skinTone: SkinTone;
  emoji: string;
}

export type UseSkinToneReturn = [
  skinTone: SkinTone,
  setSkinTone: (skinTone: SkinTone | ((prev: SkinTone) => SkinTone)) => void,
  skinToneVariations: SkinToneVariation[],
];

const SKIN_TONE_ORDER: readonly SkinTone[] = [
  'default',
  'light',
  'medium-light',
  'medium',
  'medium-dark',
  'dark',
];

export function useActiveEmoji(): ActiveEmoji | null {
  const hoveredEmoji = useAtomValue(hoveredEmojiAtom);
  const skinTone = useAtomValue(skinToneAtom);
  const context = useOptionalEmojiPicker();
  const customSections = context?.customSections;
  const frequentlyUsedEmojis = context?.frequentlyUsedEmojis;

  const customEmojiByName = useMemo(() => {
    const map = new Map<string, CustomEmoji>();
    if (!customSections && !frequentlyUsedEmojis) {
      return map;
    }
    for (const item of [
      ...(customSections ?? []).flatMap((section) => section.emojis),
      ...(frequentlyUsedEmojis ?? []),
    ]) {
      if (typeof item !== 'string' && isCustomEmoji(item)) {
        map.set(item.name, item);
      }
    }
    return map;
  }, [customSections, frequentlyUsedEmojis]);

  return useMemo(() => {
    if (!hoveredEmoji) {
      return null;
    }

    const isShortcode = hoveredEmoji.emoji.startsWith(':') && hoveredEmoji.emoji.endsWith(':');
    if (isShortcode) {
      const customEmoji = customEmojiByName.get(hoveredEmoji.emoji.slice(1, -1));
      if (customEmoji) {
        return {
          ...hoveredEmoji,
          isCustom: true,
          imageUrl: customEmoji.imageUrl,
        };
      }
    }

    const toned = hoveredEmoji.skin_tone_support
      ? applySkinTone(hoveredEmoji, skinTone)
      : hoveredEmoji;

    return {
      ...toned,
      isCustom: false,
    };
  }, [hoveredEmoji, skinTone, customEmojiByName]);
}

export function useSkinTone(emoji = '✋'): UseSkinToneReturn {
  const [skinTone, setSkinToneAtom] = useAtom(skinToneAtom);
  const context = useOptionalEmojiPicker();
  const contextSetSkinTone = context?.setSkinTone;

  const setSkinTone = useCallback(
    (next: SkinTone | ((prev: SkinTone) => SkinTone)) => {
      if (contextSetSkinTone) {
        contextSetSkinTone(next);
      } else {
        setSkinToneAtom(next);
      }
    },
    [contextSetSkinTone, setSkinToneAtom]
  );

  const skinToneVariations = useMemo<SkinToneVariation[]>(() => {
    const baseMetadata: EmojiMetadata = {
      emoji,
      name: '',
      slug: '',
      skin_tone_support: true,
    };

    return SKIN_TONE_ORDER.map((tone) => ({
      skinTone: tone,
      emoji: applySkinTone(baseMetadata, tone).emoji,
    }));
  }, [emoji]);

  return [skinTone, setSkinTone, skinToneVariations];
}

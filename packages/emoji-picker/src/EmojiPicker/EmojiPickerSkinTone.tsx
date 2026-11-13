import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { skinToneAtom } from '../atoms/emoji';

import type { SkinTone } from '../types/emoji';

const skinTones: Array<{ emoji: string; tone: SkinTone }> = [
  { emoji: '✋', tone: 'default' },
  { emoji: '✋🏻', tone: 'light' },
  { emoji: '✋🏼', tone: 'medium-light' },
  { emoji: '✋🏽', tone: 'medium' },
  { emoji: '✋🏾', tone: 'medium-dark' },
  { emoji: '✋🏿', tone: 'dark' },
];

export function EmojiPickerSkinTone() {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [skinTone, setSkinTone] = useAtom(skinToneAtom);

  const currentTone = skinTones.find((t) => t.tone === skinTone) || skinTones[0];

  if (isPickerOpen) {
    return (
      <div data-slot="emoji-picker-skin-tone" data-state="open">
        <div className="flex flex-nowrap gap-0.5 p-1 rounded-sm">
          {skinTones.map((tone) => (
            <button
              key={tone.tone}
              type="button"
              className="flex-shrink-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
              onClick={() => {
                setSkinTone(tone.tone);
                setIsPickerOpen(false);
              }}
            >
              <span className="text-lg">{tone.emoji}</span>
            </button>
          ))}
        </div>
        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center text-nowrap">
          Choose your default skin tone
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      data-slot="emoji-picker-skin-tone"
      className="text-md font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-3 py-1.5 transition-colors"
      onClick={() => setIsPickerOpen(true)}
    >
      {currentTone.emoji}
    </button>
  );
}

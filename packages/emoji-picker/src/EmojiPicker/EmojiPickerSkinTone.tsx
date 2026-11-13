import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { skinToneAtom } from '../atoms/emoji';

import type { SkinTone } from '../types/emoji';

const skinTones: Array<{ emoji: string; tone: SkinTone; label: string }> = [
  { emoji: '✋', tone: 'default', label: 'Default skin tone' },
  { emoji: '✋🏻', tone: 'light', label: 'Light skin tone' },
  { emoji: '✋🏼', tone: 'medium-light', label: 'Medium-light skin tone' },
  { emoji: '✋🏽', tone: 'medium', label: 'Medium skin tone' },
  { emoji: '✋🏾', tone: 'medium-dark', label: 'Medium-dark skin tone' },
  { emoji: '✋🏿', tone: 'dark', label: 'Dark skin tone' },
];

export function EmojiPickerSkinTone() {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [skinTone, setSkinTone] = useAtom(skinToneAtom);

  const currentTone = skinTones.find((t) => t.tone === skinTone) || skinTones[0];

  if (isPickerOpen) {
    return (
      <div>
        <div
          role="group"
          aria-label="Choose your default skin tone"
          className="flex flex-nowrap gap-0.5 p-1 rounded-sm"
        >
          {skinTones.map((tone) => (
            <button
              key={tone.tone}
              type="button"
              aria-label={tone.label}
              aria-pressed={tone.tone === skinTone}
              className="flex-shrink-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
              onClick={() => {
                setSkinTone(tone.tone);
                setIsPickerOpen(false);
              }}
            >
              <span className="text-lg" aria-hidden="true">
                {tone.emoji}
              </span>
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
      aria-label={`Change skin tone (${currentTone.label})`}
      aria-expanded={isPickerOpen}
      className="text-md font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-3 py-1.5 transition-colors"
      onClick={() => setIsPickerOpen(true)}
    >
      {currentTone.emoji}
    </button>
  );
}

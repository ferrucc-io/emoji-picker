import React, { useState } from 'react';
import { useSkinTone } from '../hooks/useEmojiPickerHooks';

export function EmojiPickerSkinTone() {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [skinTone, setSkinTone, skinToneVariations] = useSkinTone();

  const currentTone =
    skinToneVariations.find((t) => t.skinTone === skinTone) || skinToneVariations[0];

  if (isPickerOpen) {
    return (
      <div>
        <div className="flex flex-nowrap gap-0.5 p-1 rounded-sm">
          {skinToneVariations.map((tone) => (
            <button
              key={tone.skinTone}
              type="button"
              className="flex-shrink-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
              onClick={() => {
                setSkinTone(tone.skinTone);
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
      className="text-md font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-3 py-1.5 transition-colors"
      onClick={() => setIsPickerOpen(true)}
    >
      {currentTone.emoji}
    </button>
  );
}

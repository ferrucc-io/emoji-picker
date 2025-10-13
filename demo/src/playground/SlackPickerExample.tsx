import { EmojiPicker } from '@ferrucc-io/emoji-picker';
import type { CustomSection, CustomEmoji } from '@ferrucc-io/emoji-picker/dist/types/emoji';
import { SlackStyleHeader } from './SlackStyleHeader';

interface SlackPickerExampleProps {
  onEmojiSelect: (emoji: string) => void;
}

const customSlackEmojis: CustomSection[] = [
  {
    id: 'slack-custom',
    name: 'Custom',
    priority: 1,
    emojis: [
      {
        id: 'shipitparrot',
        name: 'shipitparrot',
        imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/shipitparrot/49b56af45fc26508.gif',
      },
      {
        id: 'pepecry',
        name: 'pepecry',
        imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/pepecry/d8ca543ec102424b.jpg',
      },
      {
        id: 'batman_banana_dance',
        name: 'batman_banana_dance',
        imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/batman_banana_dance/a94ee2a8cb4cfb8a.gif',
      },
      {
        id: 'aaw_yeah',
        name: 'aaw_yeah',
        imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/aaw_yeah/5ee9624f67349629.gif',
      },
      {
        id: 'heartfrog',
        name: 'heartfrog',
        imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/heartfrog/b0a7a829097e6154.png',
      },
      {
        id: 'amplitude-heart2',
        name: 'amplitude-heart2',
        imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/amplitude-heart2/d1707a0e23aa94ed.png',
      },
      {
        id: 'cry_blood',
        name: 'cry_blood',
        imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/cry_blood/039200726d077fc1.png',
      },
    ],
  },
];

const frequentlyUsedEmojis: (string | CustomEmoji)[] = [
  '👍',
  '❤️',
  {
    id: 'shipitparrot-freq',
    name: 'shipitparrot',
    imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/shipitparrot/49b56af45fc26508.gif',
  },
  '😂',
  '🎉',
  '🔥',
  '👏',
  '💯',
  '✨',
  '🚀',
];

export function SlackPickerExample({ onEmojiSelect }: SlackPickerExampleProps) {
  return (
    <div className="rounded-[8px] border border-zinc-300 dark:border-zinc-600 overflow-hidden shadow-sm flex flex-col items-center">
      <EmojiPicker
        className="font-['Lato'] w-[380px] border-none"
        emojisPerRow={9}
        emojiSize={36}
        onEmojiSelect={onEmojiSelect}
        customSections={customSlackEmojis}
        frequentlyUsedEmojis={frequentlyUsedEmojis}
        renderHeader={SlackStyleHeader}
      >
        <EmojiPicker.Header className="w-full px-4 pt-4">
          <EmojiPicker.Input
            placeholder="Search all emoji"
            className="h-[36px] bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 w-full rounded-[8px] text-[15px] focus:shadow-[0_0_0_1px_#1d9bd1,0_0_0_6px_rgba(29,155,209,0.3)] dark:focus:shadow-[0_0_0_1px_#1d9bd1,0_0_0_6px_rgba(29,155,209,0.3)] focus:border-transparent focus:outline-none mb-1"
            hideIcon
          />
        </EmojiPicker.Header>
        <EmojiPicker.Group className="px-1">
          <EmojiPicker.List containerHeight={320} />
        </EmojiPicker.Group>
        <EmojiPicker.Preview className="px-4">
          {({ previewedEmoji }) => (
            <>
              {previewedEmoji ? (
                <EmojiPicker.Content />
              ) : (
                <button className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded px-2.5 py-1 transition-colors">
                  Add Emoji
                </button>
              )}
              <EmojiPicker.SkinTone />
            </>
          )}
        </EmojiPicker.Preview>
      </EmojiPicker>
    </div>
  );
}

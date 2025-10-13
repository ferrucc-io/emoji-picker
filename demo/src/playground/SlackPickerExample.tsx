import { EmojiPicker } from '@ferrucc-io/emoji-picker';
import type { CustomSection, CustomEmoji } from '@ferrucc-io/emoji-picker/dist/types/emoji';

interface SlackPickerExampleProps {
  onEmojiSelect: (emoji: string) => void;
}

const customSlackEmojis: CustomSection[] = [
  {
    id: 'slack-custom',
    name: 'Custom Slack Emojis',
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
        id: 'partyblob',
        name: 'partyblob',
        imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/partyblob/cad0bbfb092a7984.gif',
      },
      {
        id: 'meow_party',
        name: 'meow_party',
        imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/meow_party/6c86d5f053c2e8e8.gif',
      },
      {
        id: 'dancing-penguin',
        name: 'dancing-penguin',
        imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/dancing-penguin/c3f3045a58e0302f.gif',
      },
      {
        id: 'yay',
        name: 'yay',
        imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/yay/8ca690fc93a33e19.png',
      },
      {
        id: 'blob-dance',
        name: 'blob-dance',
        imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/blob-dance/c16e74e37e21f8b0.gif',
      },
      {
        id: 'thumbsup_all',
        name: 'thumbsup_all',
        imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/thumbsup_all/8c86d5f053c2e8e8.gif',
      },
      {
        id: 'chef-kiss',
        name: 'chef-kiss',
        imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/chef-kiss/2c3f845a58e0302f.png',
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
  {
    id: 'meow_party-freq',
    name: 'meow_party',
    imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/meow_party/6c86d5f053c2e8e8.gif',
  },
  '🎉',
  '🔥',
  {
    id: 'yay-freq',
    name: 'yay',
    imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/yay/8ca690fc93a33e19.png',
  },
  '👏',
  '💯',
  '✨',
  {
    id: 'blob-dance-freq',
    name: 'blob-dance',
    imageUrl: 'https://emoji.slack-edge.com/T02AKCA5Q/blob-dance/c16e74e37e21f8b0.gif',
  },
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

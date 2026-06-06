import type { CustomSection, CustomEmoji } from '@ferrucc-io/emoji-picker';

// Served from demo/public/custom-emojis/
export const customSlackEmojis: CustomSection[] = [
  {
    id: 'slack-custom',
    name: 'Custom',
    priority: 1,
    emojis: [
      {
        id: 'mic-drop',
        name: 'mic-drop',
        imageUrl: '/custom-emojis/mic-drop.gif',
      },
      {
        id: 'thisisfine',
        name: 'thisisfine',
        imageUrl: '/custom-emojis/thisisfine.gif',
      },
      {
        id: 'typescript',
        name: 'typescript',
        imageUrl: '/custom-emojis/typescript.png',
      },
      {
        id: 'shipitparrot',
        name: 'shipitparrot',
        imageUrl: '/custom-emojis/shipitparrot.gif',
      },
      {
        id: 'pepecry',
        name: 'pepecry',
        imageUrl: '/custom-emojis/pepecry.gif',
      },
      {
        id: 'banana_dance',
        name: 'banana_dance',
        imageUrl: '/custom-emojis/banana_dance.gif',
      },
      {
        id: 'aaw_yeah',
        name: 'aaw_yeah',
        imageUrl: '/custom-emojis/aaw_yeah.gif',
      },
      {
        id: 'heartfrog',
        name: 'heartfrog',
        imageUrl: '/custom-emojis/heartfrog.png',
      },
      {
        id: 'cry_blood',
        name: 'cry_blood',
        imageUrl: '/custom-emojis/cry_blood.jpg',
      },
    ],
  },
];

export const frequentlyUsedEmojis: (string | CustomEmoji)[] = [
  '👍',
  '❤️',
  {
    id: 'thisisfine-freq',
    name: 'thisisfine',
    imageUrl: '/custom-emojis/thisisfine.gif',
  },
  '😂',
  '🎉',
  '🔥',
  '👏',
  '💯',
  '✨',
  '🚀',
];

const customEmojiUrlByShortcode = new Map<string, string>(
  customSlackEmojis
    .flatMap((section) => section.emojis)
    .filter((emoji): emoji is CustomEmoji => 'imageUrl' in emoji)
    .map((emoji) => [`:${emoji.name}:`, emoji.imageUrl])
);

/** Resolves a custom emoji shortcode like `:shipitparrot:` to its image URL, if known. */
export function getCustomEmojiUrl(shortcode: string): string | undefined {
  return customEmojiUrlByShortcode.get(shortcode);
}

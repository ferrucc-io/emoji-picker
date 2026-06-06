# Emoji Picker - React Emoji picker component

This is a composable React component that allows your users to pick an emoji. Styled with Tailwind and supports custom styling.

This component is heavily inspired by ShadCN and works well alongside it.

![Emojicn](./public/emoji.png)
[Live Demo](https://emoji.ferrucc.io)

## Installation

To use this component your project must be using React and Tailwind.

To install the component:

```bash
bun add @ferrucc-io/emoji-picker
# or
yarn add @ferrucc-io/emoji-picker
# or
npm i @ferrucc-io/emoji-picker
# or
pnpm add @ferrucc-io/emoji-picker
```

Then in your project you can use the component like this:

```tsx
<EmojiPicker onEmojiSelect={handleEmojiSelect}>
  <EmojiPicker.Header>
    <EmojiPicker.Input placeholder="Search emoji" />
  </EmojiPicker.Header>
  <EmojiPicker.Group>
    <EmojiPicker.List />
  </EmojiPicker.Group>
</EmojiPicker>
```

## Features

- 🎨 **Unstyled & Composable**: Built with Tailwind CSS. Every component is minimally styled by default and fully customizable.
- ⚡️ **Fast & Lightweight**: Virtualized list for smooth scrolling. Only renders emojis in view.
- 🎯 **Accessible**: Full keyboard navigation support. ARIA labels and proper semantic markup.
- 🌈 **Dominant Color Hover**: Built-in dominant color hover for supported emojis.
- 🖼️ **Custom Emojis**: Add your own image-based emoji sections (like Slack custom emojis) and a frequently used section.

## Props & Customization

The component accepts several props for customization:

```tsx
interface EmojiPickerProps {
  emojisPerRow?: number; // Number of emojis per row
  emojiSize?: number; // Size of each emoji in pixels
  containerHeight?: number; // Height of the emoji container
  hideIcon?: boolean; // Hide the search icon
  onEmojiSelect?: (emoji: string) => void; // Callback when emoji is selected
  customSections?: CustomSection[]; // Custom image-based emoji sections to show alongside the standard categories
  frequentlyUsedEmojis?: (string | CustomEmoji)[]; // Emojis to show in a "Frequently Used" section at the top
  renderHeader?: (props: HeaderRendererProps) => React.ReactNode; // Custom renderer for section headers
}
```

## Custom Emojis

You can add your own image-based emojis via the `customSections` prop, and pin a "Frequently Used" section at the top of the list with `frequentlyUsedEmojis`:

```tsx
import { EmojiPicker } from '@ferrucc-io/emoji-picker';
import type { CustomEmoji, CustomSection } from '@ferrucc-io/emoji-picker';

const customSections: CustomSection[] = [
  {
    id: 'custom',
    name: 'Custom',
    priority: 1, // Lower values appear first (defaults to 999)
    emojis: [
      { id: 'mic-drop', name: 'mic-drop', imageUrl: '/custom-emojis/mic-drop.gif' },
      { id: 'shipitparrot', name: 'shipitparrot', imageUrl: '/custom-emojis/shipitparrot.gif' },
    ],
  },
];

// Mix standard emoji strings and custom emoji objects
const frequentlyUsedEmojis: (string | CustomEmoji)[] = ['👍', '❤️'];

<EmojiPicker
  customSections={customSections}
  frequentlyUsedEmojis={frequentlyUsedEmojis}
  onEmojiSelect={(emoji) => {
    // Standard emojis: the emoji character, e.g. "👍"
    // Custom emojis: the name wrapped in colons, e.g. ":mic-drop:"
    console.log(emoji);
  }}
>
  {/* ... */}
</EmojiPicker>
```

Custom emojis are searchable by name, support full keyboard navigation, and show up in the preview just like standard emojis. The `CustomEmoji`, `CustomSection`, and `HeaderRendererProps` types are exported from the package, along with an `isCustomEmoji` type guard.

You can also customize how section headers render with the `renderHeader` prop:

```tsx
import type { HeaderRendererProps } from '@ferrucc-io/emoji-picker';

function MyHeader({ content, isSticky }: HeaderRendererProps) {
  return (
    <div className={isSticky ? 'bg-white/95 backdrop-blur-sm' : 'bg-transparent'}>
      {content}
    </div>
  );
}

<EmojiPicker renderHeader={MyHeader}>
  {/* ... */}
</EmojiPicker>
```

## Examples

### Default Style

```tsx
<EmojiPicker onEmojiSelect={handleEmojiSelect}>
  <EmojiPicker.Header>
    <EmojiPicker.Input placeholder="Search emoji" />
  </EmojiPicker.Header>
  <EmojiPicker.Group>
    <EmojiPicker.List />
  </EmojiPicker.Group>
</EmojiPicker>
```

### Linear Style

```tsx
<EmojiPicker>
  <EmojiPicker.Header className="pb-0">
    <EmojiPicker.Input placeholder="Search emoji" />
  </EmojiPicker.Header>
  <EmojiPicker.Group>
    <EmojiPicker.List hideStickyHeader />
  </EmojiPicker.Group>
</EmojiPicker>
```

### Slack Style

```tsx
<EmojiPicker className="font-['Lato'] w-[300px] border-none" emojisPerRow={9} emojiSize={36}>
  <EmojiPicker.Header>
    <EmojiPicker.Input placeholder="Search all emoji" hideIcon />
  </EmojiPicker.Header>
  <EmojiPicker.Group>
    <EmojiPicker.List containerHeight={320} />
  </EmojiPicker.Group>
  <EmojiPicker.Preview>
    {({ previewedEmoji }) => (
      <>
        {previewedEmoji ? <EmojiPicker.Content /> : <button>Add Emoji</button>}
        <EmojiPicker.SkinTone />
      </>
    )}
  </EmojiPicker.Preview>
</EmojiPicker>
```

## Credits

This project was created using `bun init` in bun v1.2.0. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Contributing

This project is structured as a monorepo with two main parts:

- `packages/emoji-picker`: The main package containing the emoji picker component
- `demo`: A demo application showcasing different uses of the component

### Development Setup

To get started with development:

```bash
# Install dependencies for all packages
bun install

# Build the emoji picker package
cd packages/emoji-picker
bun run build

# Run the demo app
cd ../demo
bun run dev
```

### Updating Emoji Colors

To update the emoji hover colors:

```bash
cd packages/emoji-picker
bun run build:emoji-colors
```

This will generate a new `emojiColors.ts` file in the package's `src/utils` directory.

### Testing

```bash
# Run tests for the emoji picker package
cd packages/emoji-picker
bun test
```

Contributions are welcome! Please feel free to submit a PR.

# Emoji Picker - React Emoji picker component

This is a composable React component that allows your users to pick an emoji. Styled with Tailwind and supports custom styling.

This component's goal is to be heavily inspired by how ShadCN does things and to work well alongside it.

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
```

The in your project you can use the component like this:

```tsx
import { EmojiPicker, EmojiPickerInput, EmojiPickerGroup, EmojiPickerList, EmojiPickerPreview, EmojiPickerEmpty, EmojiPickerEmptyIcon, EmojiPickerEmptyText } from '@ferrucc-io/emoji-picker';

const App = () => {

  return <EmojiPicker>
    <EmojiPickerInput placeholder="Search emojis..." />
    <EmojiPickerEmpty>
      <EmojiPickerEmptyIcon />
      <EmojiPickerEmptyText />
    </EmojiPickerEmpty>
    <EmojiPickerGroup>
      <EmojiPickerList />
    </EmojiPickerGroup>
    <EmojiPickerPreview />
  </EmojiPicker>;
};
```

## Credits

This project was created using `bun init` in bun v1.2.0. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


## Contributing

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

To update the emoji hover colors you'll need to run:

```bash
bun run build:emoji-colors
```

This will generate a new `emojiColors.ts` file in the `src/utils` directory.

Contributions are welcome! Please feel free to submit a PR.

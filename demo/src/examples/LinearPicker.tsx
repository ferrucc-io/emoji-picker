import { EmojiPicker } from '@ferrucc-io/emoji-picker';

export function LinearPicker() {
  return (
    <EmojiPicker>
      <EmojiPicker.Header className="pb-0">
        <EmojiPicker.Input 
          placeholder="Search emoji" 
        />
      </EmojiPicker.Header>
      <EmojiPicker.Group>
        <EmojiPicker.List hideStickyHeader />
      </EmojiPicker.Group>
    </EmojiPicker>
  );
} 
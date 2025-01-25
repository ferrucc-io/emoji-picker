import {
  EmojiPicker,
  EmojiPickerGroup,
  EmojiPickerInput,
  EmojiPickerList,
  EmojiPickerPreview,
} from '../../../src';

export function SlackPicker() {
  return (
    <div className="rounded-lg overflow-hidden shadow-sm font-['Lato']">
      <EmojiPicker 
        className="w-[280px]"
        emojisPerRow={9}
        emojiSize={36}
      >
        <EmojiPickerInput 
          placeholder="Search all emoji" 
          wrapperClassName="px-2 pt-1.5 pb-1"
          className="h-[36px] focus:ring-blue-300"
        />
        <EmojiPickerGroup>
          <EmojiPickerList containerHeight={320} />          
        </EmojiPickerGroup>
        <EmojiPickerPreview />
      </EmojiPicker>
    </div>
  );
} 
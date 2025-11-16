import { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Playground } from './playground';
import { Hero } from './Hero';
import { NPM_MONTHLY_DOWNLOADS } from './constants/npmStats';
import { TailwindSetupTabs } from './components/TailwindSetupTabs';
import { SocialProof } from './components/SocialProof';
import { PackageManagerTabs } from './components/PackageManagerTabs';
import { NpmDownloadsPill } from './components/NpmDownloadsPill';
import { Features } from './components/Features';
import { FAQ } from './components/FAQ';

const EXAMPLE_CODE = {
  default: `<EmojiPicker onEmojiSelect={handleEmojiSelect}>
  <EmojiPicker.Header>
    <EmojiPicker.Input placeholder="Search emoji" />
  </EmojiPicker.Header>
  <EmojiPicker.Group>
    <EmojiPicker.List />
  </EmojiPicker.Group>
</EmojiPicker>`,
  linear: `<EmojiPicker
  className="border border-zinc-200 dark:border-zinc-800 rounded-lg"
  emojisPerRow={12}
  emojiSize={28}
  onEmojiSelect={onEmojiSelect}
>
  <EmojiPicker.Header className="p-2 pb-0">
    <EmojiPicker.Input
      placeholder="Search emoji"
      autoFocus={true}
      className="focus:ring-2 focus:ring-inset ring-1 ring-transparent"
    />
  </EmojiPicker.Header>
  <EmojiPicker.Group>
    <EmojiPicker.List hideStickyHeader={true} containerHeight={400} />
  </EmojiPicker.Group>
</EmojiPicker>`,
  slack: `<EmojiPicker 
  className="font-['Lato'] w-[300px] border-none"
  emojisPerRow={9}
  emojiSize={36}
>
  <EmojiPicker.Header>
    <EmojiPicker.Input 
      placeholder="Search all emoji" 
      className="h-[36px] bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 w-full rounded-[8px] text-[15px] focus:shadow-[0_0_0_1px_#1d9bd1,0_0_0_6px_rgba(29,155,209,0.3)] dark:focus:shadow-[0_0_0_1px_#1d9bd1,0_0_0_6px_rgba(29,155,209,0.3)] focus:border-transparent focus:outline-none mb-1"
      hideIcon
    />
  </EmojiPicker.Header>
  <EmojiPicker.Group>
    <EmojiPicker.List containerHeight={320} />          
  </EmojiPicker.Group>
  <EmojiPicker.Preview>
    {({ previewedEmoji }) => (
      <>
        {previewedEmoji ? 
          <EmojiPicker.Content />
          :
          <button>Add Emoji</button>
        }
        <EmojiPicker.SkinTone />
      </>
    )}
  </EmojiPicker.Preview>
</EmojiPicker>`,
};


function App() {
  const { theme } = useTheme();
  const [selectedEmoji, setSelectedEmoji] = useState("⌘");

  return (
    <div
      className={`min-h-screen w-full pt-4 pb-20 md:py-20 flex flex-col items-center bg-white dark:bg-zinc-950 ${theme === "dark" ? "dark" : ""}`}
    >
      <div className="max-w-2xl w-full md:mx-auto flex flex-col items-center gap-8">
        <div className="flex flex-col-reverse gap-6 md:flex-row md:justify-between items-start w-full px-4">
          <Hero selectedEmoji={selectedEmoji} />
          <div className="flex w-full md:w-auto justify-end md:justify-start items-center gap-2 bg-secondary/50 rounded-lg p-1">
            <NpmDownloadsPill
              packageName="@ferrucc-io/emoji-picker"
              defaultDownloads={NPM_MONTHLY_DOWNLOADS}
            />
            <a
              href="https://github.com/ferrucc-io/emoji-picker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          <div className="w-full">
            <Playground code={EXAMPLE_CODE} onEmojiSelect={setSelectedEmoji} />
          </div>
        </div>
        <div className="w-full px-4">
          <SocialProof />
        </div>
        <div className="flex flex-col items-start w-full mt-2 px-4">
          <Features />
        </div>

        <div className="flex flex-col items-start gap-4 w-full px-4">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Installation
          </h2>
          <PackageManagerTabs packageName="@ferrucc-io/emoji-picker" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-2">
            Tailwind Setup
          </h3>
          <TailwindSetupTabs />
        </div>

        <div className="flex flex-col items-start w-full mt-2 px-4">
          <FAQ />
        </div>
      </div>
    </div>
  );
}

export default App;

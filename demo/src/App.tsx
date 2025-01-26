import { useTheme } from './ThemeContext';
import { Playground } from './playground';
import { NPM_MONTHLY_DOWNLOADS } from './constants/npmStats';
import { PackageManagerTabs } from './components/PackageManagerTabs';
import { NpmDownloadsPill } from './components/NpmDownloadsPill';

const EXAMPLE_CODE = {
  default: `<EmojiPicker onEmojiSelect={handleEmojiSelect}>
  <EmojiPicker.Header>
    <EmojiPicker.Input placeholder="Search emoji" />
  </EmojiPicker.Header>
  <EmojiPicker.Group>
    <EmojiPicker.List />
  </EmojiPicker.Group>
</EmojiPicker>`,
  linear: `<EmojiPicker>
  <EmojiPicker.Header className="pb-0">
    <EmojiPicker.Input placeholder="Search emoji" />
  </EmojiPicker.Header>
  <EmojiPicker.Group>
    <EmojiPicker.List hideStickyHeader />
  </EmojiPicker.Group>
</EmojiPicker>`,
  slack: `<EmojiPicker 
  className="w-[300px] border-none"
  emojisPerRow={9}
  emojiSize={36}
>
  <EmojiPicker.Header>
    <EmojiPicker.Input 
      placeholder="Search all emoji" 
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
</EmojiPicker>`
};

const DEFAULT_CONFIGS = {
  default: {},
  linear: {
    hideStickyHeader: true
  },
  slack: {
    emojisPerRow: 9,
    emojiSize: 36,
    containerHeight: 320,
    hideIcon: true
  }
};

function App() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen w-full pt-4 pb-20 md:py-20 px-4 flex flex-col items-center bg-white dark:bg-zinc-950 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="max-w-2xl w-full mx-auto flex flex-col items-center gap-8">
        <div className='flex flex-col-reverse gap-6 md:flex-row md:justify-between items-start w-full'>
          <div className="flex flex-col items-start gap-4 text-center">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">⌘</h1>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Emoji Picker</h1>
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 text-left">
              A fast, composable, unstyled emoji picker made with Tailwind & React
            </p>
          </div>
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
            <Playground
              code={EXAMPLE_CODE}
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 w-full">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Installation</h2>
          <PackageManagerTabs packageName="@ferrucc-io/emojipicker" />
        </div>
        
        <div className="flex flex-col items-start gap-8 w-full mt-8">
          <section className="w-full">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-zinc-50">🎨 Unstyled & Composable</h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Built with Tailwind CSS. Every component is unstyled by default and fully customizable.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-zinc-50">⚡️ Fast & Lightweight</h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Virtualized list for smooth scrolling. Only renders emojis in view.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-zinc-50">🎯 Accessible</h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Full keyboard navigation support. ARIA labels and proper semantic markup.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-zinc-50">🌈 Dominant Color Hover</h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Built-in dominant color hover for supported emojis.
                </p>
              </div>
            </div>
          </section>

          <section className="w-full">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">FAQ</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">What are the peer dependencies?</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                  React ≥0.14.0, React DOM ≥0.14.0, Tailwind CSS ≥3.0.0, and TypeScript ≥5.7.3
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Is it customizable?</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                  Yes! The component is unstyled by default and uses Tailwind CSS for styling. You can customize the appearance using Tailwind classes or your own CSS.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">How does keyboard navigation work?</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                  Use arrow keys to navigate through emojis, Enter to select, and Escape to clear search. Tab and Shift+Tab to move between interactive elements.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Does it support all emojis?</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                  Yes, it includes all emojis up to Unicode 15.0. You can filter out newer emojis using the maxUnicodeVersion prop for better compatibility. It should also with newer emojis versions, but I haven't tested it yet.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">What is the license?</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                  MIT. See the <a href="https://github.com/ferrucc-io/emoji-picker/blob/master/LICENSE" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">LICENSE</a> file for more details.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Where can I find more examples?</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                  Check out the examples above or visit our{' '}
                  <a 
                    href="https://github.com/ferrucc-io/emoji-picker" 
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub repository
                  </a>
                  {' '}for more examples and documentation.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App; 
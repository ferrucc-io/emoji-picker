import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from './ThemeContext';
import { Tabs } from './Tabs';
import { DefaultPicker, LinearPicker, SlackPicker } from './examples';
import { PackageManagerTabs } from './components/PackageManagerTabs';
import { CodeBlock } from './components/CodeBlock';

const TABS = [
  { id: 'default', label: 'Default' },
  { id: 'linear', label: 'Linear' },
  { id: 'slack', label: 'Slack' }
];

function App() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  const renderPicker = () => {
    switch (activeTab) {
      case 'linear':
        return <LinearPicker />;
      case 'slack':
        return <SlackPicker />;
      default:
        return <DefaultPicker />;
    }
  };

  return (
    <div className={`min-h-screen w-full py-20 px-4 flex flex-col items-center bg-white dark:bg-zinc-950 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="max-w-2xl w-full mx-auto flex flex-col items-center gap-8">
        <div className='flex justify-between items-start w-full'>
          <div className="flex flex-col items-start gap-4 text-center">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">⌘</h1>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Emoji Picker</h1>
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-300">
              Fast, composable, unstyled emoji picker for React. Made with Tailwind CSS.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="w-full max-w-md">
            {renderPicker()}
            <div className="mt-4">
              <Tabs
                tabs={TABS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Installation</h2>
          <PackageManagerTabs packageName="@ferrucc-io/emojipicker" />
        </div>
        
        <div className="flex flex-col items-start gap-8 w-full mt-8">
          <section className="w-full">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-medium mb-2">🎨 Unstyled & Composable</h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Built with Tailwind CSS. Every component is unstyled by default and fully customizable.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-medium mb-2">⚡️ Fast & Lightweight</h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Virtualized list for smooth scrolling. Only renders emojis in view.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-medium mb-2">🎯 Accessible</h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Full keyboard navigation support. ARIA labels and proper semantic markup.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-medium mb-2">🌈 Skin Tone Support</h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Built-in skin tone selector for supported emojis. Persists user preference.
                </p>
              </div>
            </div>
          </section>

          <section className="w-full">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">Usage</h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Example</h3>
              <CodeBlock 
                code={`import { EmojiPicker } from '@ferrucc-io/emojipicker'

export function MyComponent() {
  const handleEmojiSelect = (emoji: string) => {
    console.log('Selected emoji:', emoji)
  }

  return (
    <EmojiPicker onEmojiSelect={handleEmojiSelect}>
      <EmojiPicker.Header>
        <EmojiPicker.Input placeholder="Search emoji" />
      </EmojiPicker.Header>
      <EmojiPickerGroup>
        <EmojiPickerList />
      </EmojiPickerGroup>
    </EmojiPicker>
  )
}`} 
                language="tsx"
                showLineNumbers
              />

              <h3 className="text-lg font-medium mt-8">With Preview & Skin Tone</h3>
              <CodeBlock 
                code={`<EmojiPicker onEmojiSelect={handleEmojiSelect}>
  <EmojiPicker.Header>
    <EmojiPicker.Input placeholder="Search emoji" />
  </EmojiPicker.Header>
  <EmojiPickerGroup>
    <EmojiPickerList />
  </EmojiPickerGroup>
  <EmojiPickerPreview>
    {({ previewedEmoji }) => (
      <>
        <EmojiPickerContent />
        <EmojiPickerSkinTone />
      </>
    )}
  </EmojiPickerPreview>
</EmojiPicker>`} 
                language="tsx"
              />

              <h3 className="text-lg font-medium mt-8">Customization</h3>
              <CodeBlock 
                code={`<EmojiPicker 
  onEmojiSelect={handleEmojiSelect}
  emojisPerRow={9}      // Default: 8
  emojiSize={36}        // Default: 32
  maxUnicodeVersion={15.0}  // Filter out newer emojis
  className="w-[280px]"     // Custom width
>
  {/* ... */}
</EmojiPicker>`} 
                language="tsx"
              />
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
                  Yes, it includes all emojis up to Unicode 15.0. You can filter out newer emojis using the maxUnicodeVersion prop for better compatibility.
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
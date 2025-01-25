import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from './ThemeContext';
import { Tabs } from './Tabs';
import { DefaultPicker, LinearPicker, SlackPicker } from './examples';

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
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">EmojiCN</h1>
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

        <div className='flex justify-between items-start w-full'>
          <div className="flex flex-col items-start gap-4 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Installation</h2>
            <div className="bg-secondary rounded-lg p-4 font-mono text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50">
              npm install emojicn
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default App; 
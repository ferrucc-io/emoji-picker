import React, { useState } from 'react';
import { EmojiPickerConfig, PlaygroundProps } from './types';
import { SlackPickerExample } from './SlackPickerExample';
import { LinearPickerExample } from './LinearPickerExample';
import { DefaultPickerExample } from './DefaultPickerExample';
import { useTheme } from '../ThemeContext';
import { CodeBlock } from '../components/CodeBlock';

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
] as const;

const TABS = [
  { id: 'default' as const, label: 'Default' },
  { id: 'slack' as const, label: 'Slack' },
  { id: 'linear' as const, label: 'Linear' },
] as const;

type VariantType = typeof TABS[number]['id'];

const SIZE_CONFIGS = {
  small: { emojisPerRow: 6, emojiSize: 24, containerHeight: 240 },
  medium: { emojisPerRow: 8, emojiSize: 32, containerHeight: 320 },
  large: { emojisPerRow: 10, emojiSize: 40, containerHeight: 400 }
};

export function Playground({ defaultConfig, code }: Omit<PlaygroundProps, 'variant'>) {
  const [config, setConfig] = useState<EmojiPickerConfig>(defaultConfig || {});
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [variant, setVariant] = useState<VariantType>('default');
  const { theme, toggleTheme } = useTheme();

  

  const renderPicker = () => {
    const fullConfig = {
      ...config
    };

    switch (variant) {
      case 'linear':
        return <LinearPickerExample config={fullConfig} />;
      case 'slack':
        return <SlackPickerExample config={fullConfig} />;
      default:
        return <DefaultPickerExample config={fullConfig} />;
    }
  };

  return (
    <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 p-4 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-start justify-center gap-2">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 py-1.5">Style:</span>
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setVariant(tab.id as typeof variant)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  variant === tab.id
                    ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />
        <div className="flex items-start justify-center gap-2">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 py-1.5">Theme:</span>
          <div className="flex gap-1">
            {THEMES.map(({ value, label }) => (
              <button
                key={value}
                onClick={toggleTheme}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  theme === value
                    ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex bg-zinc-100 dark:bg-zinc-900">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'preview'
              ? 'text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'code'
              ? 'text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
          </svg>
          Code
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-950">
        <div className="p-4 flex justify-center gap-4">
          {activeTab === 'preview' ? (
              renderPicker()
          ) : (
            <CodeBlock code={code[variant]} language="tsx" showLineNumbers />
          )}
        </div>
      </div>
    </div>
  );
} 

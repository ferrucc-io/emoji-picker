import { useState } from 'react';
import { ClipboardButton } from './ClipboardButton';

import type { ComponentProps } from "react";
interface PackageManagerTabsProps {
  packageName: string;
}

type PackageManager = "npm" | "bun" | "yarn" | "pnpm";

export function PackageManagerTabs({ packageName }: PackageManagerTabsProps) {
  const [activeTab, setActiveTab] = useState<PackageManager>("npm");
  const [copied, setCopied] = useState(false);

  const commands: Record<PackageManager, string> = {
    npm: `npm install ${packageName}`,
    bun: `bun add ${packageName}`,
    yarn: `yarn add ${packageName}`,
    pnpm: `pnpm add ${packageName}`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(commands[activeTab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-2 py-1.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(Object.keys(commands) as PackageManager[]).map((manager) => (
              <button
                key={manager}
                onClick={() => setActiveTab(manager)}
                className={`px-2 py-1.5 text-xs rounded-md transition-colors ${
                  activeTab === manager
                    ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                }`}
              >
                {manager}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 p-4 relative">
        <pre className="text-sm font-mono text-zinc-900 dark:text-zinc-100 overflow-x-auto pr-24">
          {commands[activeTab]}
        </pre>
        <div className="absolute right-2 top-2">
          <ClipboardButton text={commands[activeTab]} />
        </div>
      </div>
    </div>
  );
}

import React from "react";

interface Tab<T extends string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: readonly Tab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: TabsProps<T>) {
  return (
    <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
            activeTab === id
              ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

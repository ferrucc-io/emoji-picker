import { useState } from "react";
import { Highlight } from "prism-react-renderer";

import type { ComponentProps } from "react";

import type { ReactNode } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = "typescript",
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="relative">
      {/* @ts-ignore - Highlight types are incorrect but component works fine */}
      <Highlight code={code} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} p-4 rounded-lg overflow-x-auto text-sm`}
            style={style}
          >
            <div className="absolute right-2 top-2">
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs px-2 py-1 rounded-md
                  bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700
                  text-zinc-600 dark:text-zinc-300 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {showLineNumbers && (
                  <span className="inline-block w-8 text-zinc-400 select-none">
                    {i + 1}
                  </span>
                )}
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

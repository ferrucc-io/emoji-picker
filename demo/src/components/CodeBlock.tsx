import CopyToClipboard from 'react-copy-to-clipboard';
import React, { useState } from 'react';
import { Highlight, Language } from 'prism-react-renderer';

interface CodeBlockProps {
  code: string;
  language?: Language;
  showLineNumbers?: boolean;
}

interface HighlightProps {
  className: string;
  style: React.CSSProperties;
  tokens: Array<Array<{ types: string[]; content: string }>>;
  getLineProps: (props: { line: any; key?: any }) => any;
  getTokenProps: (props: { token: any; key?: any }) => any;
}

export function CodeBlock({ code, language = "tsx", showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {/* @ts-ignore - CopyToClipboard types are incorrect but component works fine */}
      <CopyToClipboard text={code} onCopy={handleCopy}>
        <button 
          className="absolute right-2 top-2 text-xs px-2 py-1 rounded-md 
            bg-zinc-700/50 text-zinc-300 opacity-0 group-hover:opacity-100 
            hover:bg-zinc-700 transition-all duration-200"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </CopyToClipboard>
      {/* @ts-ignore - Highlight types are incorrect but component works fine */}
      <Highlight
        code={code.trim()}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }: HighlightProps) => (
          <pre className={`${className} p-4 rounded-lg overflow-x-auto`} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {showLineNumbers && (
                  <span className="inline-block w-8 text-zinc-500 select-none">{i + 1}</span>
                )}
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
} 

import { Highlight } from 'prism-react-renderer';
import { ClipboardButton } from './ClipboardButton';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  hideCopyButton?: boolean;
}

export function CodeBlock({
  code,
  language = "typescript",
  showLineNumbers = false,
  hideCopyButton = false,
}: CodeBlockProps) {

  return (
    <div className="relative">
      {/* @ts-ignore - Highlight types are incorrect but component works fine */}
      <Highlight code={code} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} p-4 rounded-lg overflow-x-auto text-sm`}
            style={style}
          >
            {!hideCopyButton && (
              <div className="absolute right-2 top-2">
                <ClipboardButton text={code} />
              </div>
            )}
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

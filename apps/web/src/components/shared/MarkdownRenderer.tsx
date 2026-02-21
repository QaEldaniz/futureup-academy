'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-700/80 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
      title="Copy code"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`markdown-content prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Code blocks with syntax highlighting
          code({ node, className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || '');
            const codeString = String(children).replace(/\n$/, '');
            const isInline = !match && !codeString.includes('\n');

            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 rounded text-[13px] font-mono" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <div className="relative group my-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {match && (
                  <div className="flex items-center justify-between px-4 py-1.5 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
                    <span className="text-xs text-gray-400 font-mono uppercase">{match[1]}</span>
                  </div>
                )}
                <CopyButton code={codeString} />
                <SyntaxHighlighter
                  style={oneDark}
                  language={match?.[1] || 'text'}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    padding: '1rem',
                    fontSize: '13px',
                    lineHeight: '1.6',
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          },

          // Tables with nice styling
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>;
          },
          th({ children }) {
            return (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800">
                {children}
              </td>
            );
          },
          tr({ children }) {
            return <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">{children}</tr>;
          },

          // Images with zoom and caption
          img({ src, alt, ...props }) {
            return (
              <figure className="my-4">
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <img
                    src={src}
                    alt={alt || ''}
                    className="max-w-full h-auto mx-auto"
                    loading="lazy"
                    {...props}
                  />
                </div>
                {alt && (
                  <figcaption className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },

          // Links
          a({ href, children }) {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
              >
                {children}
                {isExternal && <ExternalLink className="w-3 h-3 inline flex-shrink-0" />}
              </a>
            );
          },

          // Blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="my-4 pl-4 border-l-4 border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 py-2 pr-4 rounded-r-lg text-gray-700 dark:text-gray-300 italic">
                {children}
              </blockquote>
            );
          },

          // Headings
          h1({ children }) {
            return <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-3 pb-2 border-b border-gray-200 dark:border-gray-800">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-5 mb-2">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">{children}</h3>;
          },

          // Lists
          ul({ children }) {
            return <ul className="my-2 space-y-1 list-disc list-inside text-gray-700 dark:text-gray-300">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="my-2 space-y-1 list-decimal list-inside text-gray-700 dark:text-gray-300">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-sm leading-relaxed">{children}</li>;
          },

          // Horizontal rule
          hr() {
            return <hr className="my-6 border-gray-200 dark:border-gray-800" />;
          },

          // Paragraphs
          p({ children }) {
            return <p className="my-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>;
          },

          // Checkboxes (GFM task lists)
          input({ type, checked, ...props }) {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

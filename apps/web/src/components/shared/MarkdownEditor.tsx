'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Code, Quote, Image, Link2, Table, Minus, CheckSquare,
  Eye, EyeOff, FileCode, Braces, Terminal,
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  label?: string;
}

interface ToolbarButton {
  icon: React.ElementType;
  label: string;
  action: 'wrap' | 'prefix' | 'insert';
  before?: string;
  after?: string;
  text?: string;
  insertText?: string;
}

const TOOLBAR_GROUPS: ToolbarButton[][] = [
  // Text formatting
  [
    { icon: Bold, label: 'Bold', action: 'wrap', before: '**', after: '**', text: 'bold text' },
    { icon: Italic, label: 'Italic', action: 'wrap', before: '_', after: '_', text: 'italic text' },
    { icon: Code, label: 'Inline Code', action: 'wrap', before: '`', after: '`', text: 'code' },
  ],
  // Headings
  [
    { icon: Heading1, label: 'Heading 1', action: 'prefix', before: '# ', text: 'Heading 1' },
    { icon: Heading2, label: 'Heading 2', action: 'prefix', before: '## ', text: 'Heading 2' },
    { icon: Heading3, label: 'Heading 3', action: 'prefix', before: '### ', text: 'Heading 3' },
  ],
  // Lists
  [
    { icon: List, label: 'Bullet List', action: 'prefix', before: '- ', text: 'List item' },
    { icon: ListOrdered, label: 'Numbered List', action: 'prefix', before: '1. ', text: 'List item' },
    { icon: CheckSquare, label: 'Task List', action: 'prefix', before: '- [ ] ', text: 'Task item' },
  ],
  // Block elements
  [
    { icon: Quote, label: 'Quote', action: 'prefix', before: '> ', text: 'Quote text' },
    { icon: Minus, label: 'Divider', action: 'insert', insertText: '\n---\n' },
  ],
  // Rich content
  [
    { icon: FileCode, label: 'Code Block', action: 'insert', insertText: '\n```javascript\n// your code here\n```\n' },
    { icon: Terminal, label: 'Terminal', action: 'insert', insertText: '\n```bash\n$ command\n```\n' },
    { icon: Braces, label: 'JSON', action: 'insert', insertText: '\n```json\n{\n  "key": "value"\n}\n```\n' },
    { icon: Table, label: 'Table', action: 'insert', insertText: '\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n' },
    { icon: Image, label: 'Image', action: 'insert', insertText: '![alt text](https://example.com/image.png)' },
    { icon: Link2, label: 'Link', action: 'insert', insertText: '[link text](https://example.com)' },
  ],
];

export default function MarkdownEditor({ value, onChange, placeholder, minRows = 12, label }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleToolbarClick = useCallback((btn: ToolbarButton) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newValue = value;
    let newCursorPos = start;

    if (btn.action === 'wrap') {
      const wrappedText = selectedText || btn.text || '';
      newValue = value.substring(0, start) + btn.before + wrappedText + btn.after + value.substring(end);
      newCursorPos = start + (btn.before?.length || 0) + wrappedText.length + (btn.after?.length || 0);
      if (!selectedText) {
        // Select the placeholder text
        newCursorPos = start + (btn.before?.length || 0);
      }
    } else if (btn.action === 'prefix') {
      // Add prefix at line start
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const prefixText = selectedText || btn.text || '';
      newValue = value.substring(0, lineStart) + btn.before + (selectedText ? value.substring(lineStart, end) : prefixText) + value.substring(selectedText ? end : start);
      newCursorPos = lineStart + (btn.before?.length || 0) + prefixText.length;
    } else if (btn.action === 'insert') {
      newValue = value.substring(0, start) + (btn.insertText || '') + value.substring(end);
      newCursorPos = start + (btn.insertText?.length || 0);
    }

    onChange(newValue);

    // Restore cursor position
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  }, [value, onChange]);

  // Handle Tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      });
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
      {/* Header with label and preview toggle */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {label || 'Markdown Editor'} — supports **bold**, `code`, tables, images
        </span>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            showPreview
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {showPreview ? (
        /* Preview mode */
        <div className="p-4 min-h-[200px]">
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
            {TOOLBAR_GROUPS.map((group, gi) => (
              <div key={gi} className="flex items-center">
                {gi > 0 && <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />}
                {group.map((btn, bi) => {
                  const Icon = btn.icon;
                  return (
                    <button
                      key={bi}
                      type="button"
                      onClick={() => handleToolbarClick(btn)}
                      title={btn.label}
                      className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Write your content here...\n\nSupports Markdown: **bold**, _italic_, `code`, tables, images, code blocks...'}
            rows={minRows}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono leading-relaxed focus:outline-none resize-y placeholder:text-gray-400"
            style={{ minHeight: `${minRows * 1.5}rem` }}
          />

          {/* Footer help */}
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-[10px] text-gray-400">
            <span>**bold**</span>
            <span>_italic_</span>
            <span>`code`</span>
            <span>```lang for code blocks</span>
            <span>| tables |</span>
            <span>![](url) for images</span>
            <span>Tab for indent</span>
          </div>
        </>
      )}
    </div>
  );
}

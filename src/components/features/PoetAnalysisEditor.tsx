import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Link from '@tiptap/extension-link';
import { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Heading2, Heading3,
  Quote, Link as LinkIcon, RotateCcw, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PoetAnalysisEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  isEditMode?: boolean;
}

export default function PoetAnalysisEditor({
  value,
  onChange,
  placeholder,
  isEditMode = false,
}: PoetAnalysisEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [focused, setFocused] = useState(false);
  const initRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        strike: false,
      }),
      Underline,
      Strike,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({
        placeholder: placeholder || (isEditMode
          ? 'What changed in your thinking? What drove this revision?'
          : 'What was happening when you wrote this? What do you want feedback on?'),
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const isEmpty = editor.isEmpty;
      onChange(isEmpty ? '' : html);
    },
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  });

  // Sync external value changes (e.g. loaded from db)
  useEffect(() => {
    if (!editor || initRef.current) return;
    if (value && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
    initRef.current = true;
  }, [editor, value]);

  if (!editor) return null;

  const btn = (active: boolean) => cn(
    'p-1.5 rounded-md transition-colors flex items-center justify-center text-sm',
    active
      ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'
      : 'text-foreground-muted hover:bg-background-subtle hover:text-foreground'
  );

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim().startsWith('http') ? linkUrl.trim() : `https://${linkUrl.trim()}` }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const wordCount = editor.getText().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = editor.getText().length;
  const isEmpty = editor.isEmpty;

  return (
    <div className={cn(
      'border rounded-xl overflow-hidden bg-surface transition-colors',
      focused ? 'border-brand-400 ring-1 ring-brand-400/20' : 'border-border'
    )}>

      {/* Toolbar — always visible */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-border bg-background-subtle/80">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title="Bold (Ctrl+B)">
          <Bold size={14} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title="Italic (Ctrl+I)">
          <Italic size={14} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive('underline'))} title="Underline">
          <UnderlineIcon size={14} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive('strike'))} title="Strikethrough">
          <Strikethrough size={14} />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))} title="Section heading">
          <Heading2 size={14} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))} title="Sub-heading">
          <Heading3 size={14} />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title="Bullet list">
          <List size={14} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Numbered list">
          <ListOrdered size={14} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))} title="Blockquote">
          <Quote size={14} />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              setShowLinkInput(!showLinkInput);
            }
          }}
          className={btn(editor.isActive('link'))}
          title={editor.isActive('link') ? 'Remove link' : 'Add link'}
        >
          <LinkIcon size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className={btn(false)}
          title="Clear formatting"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Link input */}
      {showLinkInput && (
        <div className="flex gap-2 items-center px-3 py-2 border-b border-border bg-background-subtle/50">
          <input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddLink();
              if (e.key === 'Escape') { setShowLinkInput(false); setLinkUrl(''); }
            }}
            className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-brand-400"
            autoFocus
          />
          <button onClick={handleAddLink} type="button" className="px-3 py-1 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">
            Add
          </button>
          <button onClick={() => { setShowLinkInput(false); setLinkUrl(''); }} type="button" className="p-1 text-foreground-muted hover:text-foreground transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Editor area */}
      <div
        className="px-4 py-3 min-h-[140px] cursor-text"
        onClick={() => editor.commands.focus()}
      >
        <EditorContent
          editor={editor}
          className={cn(
            'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
            '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[120px]',
            '[&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
            '[&_.ProseMirror_p.is-editor-empty:first-child]:before:text-foreground-muted',
            '[&_.ProseMirror_p.is-editor-empty:first-child]:before:italic',
            '[&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none',
            '[&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left',
            '[&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0',
          )}
        />
      </div>

      {/* Footer */}
      {!isEmpty && (
        <div className="px-4 py-2 border-t border-border bg-background-subtle/50 flex items-center justify-between">
          <p className="text-[10px] text-foreground-muted">
            <span className="font-medium">{wordCount}</span> words · <span className="font-medium">{charCount}</span> chars
          </p>
          <p className="text-[10px] text-foreground-muted italic">
            Visible in Behind the Poem
          </p>
        </div>
      )}
    </div>
  );
}

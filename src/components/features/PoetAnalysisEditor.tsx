import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useState } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Code2,
  Quote,
  Link as LinkIcon,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PoetAnalysisEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  isEditMode?: boolean;
}

const lowlight = createLowlight(common);

export default function PoetAnalysisEditor({
  value,
  onChange,
  placeholder,
  isEditMode = false,
}: PoetAnalysisEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        codeBlock: false,
      }),
      Underline,
      Strike,
      Link.configure({
        openOnClick: true,
        autolink: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder: placeholder || (isEditMode 
          ? "What changed in your thinking? What drove this revision?"
          : "What was happening when you wrote this? What do you want feedback on?"),
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const buttonClass = (isActive: boolean) =>
    cn(
      'p-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed',
      isActive
        ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
        : 'hover:bg-background-subtle text-foreground-muted hover:text-foreground'
    );

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      editor
        .chain()
        .focus()
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const wordCount = editor.getText().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background-subtle focus-within:border-brand-400 transition-colors">
      {/* Main Toolbar */}
      <div className="space-y-2 p-3 border-b border-border bg-surface">
        {/* First Row - Text formatting */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={buttonClass(editor.isActive('bold'))}
            title="Bold (Ctrl+B)"
            type="button"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={buttonClass(editor.isActive('italic'))}
            title="Italic (Ctrl+I)"
            type="button"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            className={buttonClass(editor.isActive('underline'))}
            title="Underline (Ctrl+U)"
            type="button"
          >
            <UnderlineIcon size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={buttonClass(editor.isActive('strike'))}
            title="Strikethrough"
            type="button"
          >
            <Strikethrough size={16} />
          </button>

          <div className="w-px bg-border mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={buttonClass(editor.isActive('heading', { level: 2 }))}
            title="Heading 2"
            type="button"
          >
            <Heading2 size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={buttonClass(editor.isActive('heading', { level: 3 }))}
            title="Heading 3"
            type="button"
          >
            <Heading3 size={16} />
          </button>

          <div className="w-px bg-border mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={buttonClass(editor.isActive('bulletList'))}
            title="Bullet List"
            type="button"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={buttonClass(editor.isActive('orderedList'))}
            title="Numbered List"
            type="button"
          >
            <ListOrdered size={16} />
          </button>

          <div className="w-px bg-border mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={buttonClass(editor.isActive('blockquote'))}
            title="Quote"
            type="button"
          >
            <Quote size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={buttonClass(editor.isActive('codeBlock'))}
            title="Code Block"
            type="button"
          >
            <Code2 size={16} />
          </button>

          <div className="w-px bg-border mx-1" />

          <button
            onClick={() => setShowLinkInput(!showLinkInput)}
            className={buttonClass(editor.isActive('link'))}
            title="Add Link"
            type="button"
          >
            <LinkIcon size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().clearNodes().run()}
            className={buttonClass(false)}
            title="Clear formatting"
            type="button"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Link input */}
        {showLinkInput && (
          <div className="flex gap-2 items-center">
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddLink();
                if (e.key === 'Escape') {
                  setShowLinkInput(false);
                  setLinkUrl('');
                }
              }}
              className="flex-1 px-2 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-brand-400"
              autoFocus
            />
            <button
              onClick={handleAddLink}
              className="px-3 py-1.5 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
              type="button"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
              }}
              className="px-2 py-1.5 text-sm bg-background-subtle hover:bg-background-muted text-foreground rounded-lg transition-colors"
              type="button"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="p-4 prose prose-sm dark:prose-invert max-w-none overflow-hidden">
        <EditorContent
          editor={editor}
          className="min-h-[160px] text-sm text-foreground focus:outline-none"
        />
      </div>

      {/* Footer - Stats and hints */}
      <div className="px-4 py-3 bg-surface border-t border-border space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-xs text-foreground-muted">
            {editor.getText().length > 0 ? (
              <span>
                <strong>{wordCount}</strong> words • <strong>{editor.getText().length}</strong> characters
              </span>
            ) : (
              <span className="italic">Start writing your analysis...</span>
            )}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-foreground-muted">
          <div className="flex items-center gap-1">
            <span className="text-brand-500">✓</span>
            <span>Bold, italic, underline</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-brand-500">✓</span>
            <span>Lists & quotes</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-brand-500">✓</span>
            <span>Code blocks</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-brand-500">✓</span>
            <span>Links</span>
          </div>
        </div>
      </div>
    </div>
  );
}

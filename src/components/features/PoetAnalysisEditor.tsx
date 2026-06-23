import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Heading2, RotateCcw } from 'lucide-react';
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
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
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
      'p-2 rounded-lg transition-colors flex items-center justify-center',
      isActive
        ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
        : 'hover:bg-background-subtle text-foreground-muted hover:text-foreground'
    );

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background-subtle focus-within:border-brand-400 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 border-b border-border bg-surface">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive('bold'))}
          title="Bold"
          type="button"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive('italic'))}
          title="Italic"
          type="button"
        >
          <Italic size={16} />
        </button>

        <div className="w-px bg-border mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={buttonClass(editor.isActive('heading', { level: 2 }))}
          title="Heading"
          type="button"
        >
          <Heading2 size={16} />
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
          onClick={() => editor.chain().focus().clearNodes().run()}
          className={buttonClass(false)}
          title="Clear formatting"
          type="button"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Editor */}
      <div className="p-4 prose prose-sm dark:prose-invert max-w-none">
        <EditorContent
          editor={editor}
          className="min-h-[120px] text-sm text-foreground focus:outline-none"
        />
      </div>

      {/* Character count */}
      <div className="px-4 py-2 bg-surface border-t border-border flex justify-between items-center">
        <p className="text-xs text-foreground-muted">
          {editor.getText().length > 0 && (
            <>Format your analysis with <strong>bold</strong>, <em>italics</em>, and lists</>
          )}
        </p>
        <p className="text-xs text-foreground-muted">
          {editor.getText().length} characters
        </p>
      </div>
    </div>
  );
}

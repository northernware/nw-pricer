import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Icon } from '@iconify/react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-invert max-w-none focus:outline-none min-h-[120px] p-3 text-sm font-body text-nw-black bg-transparent',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-nw-graphite/20 bg-transparent transition-colors focus-within:border-nw-acid">
      <div className="flex items-center gap-1 border-b border-nw-graphite/20 p-2 bg-nw-bone/50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-nw-graphite/20 text-nw-black' : 'text-nw-graphite hover:text-nw-black hover:bg-nw-graphite/10'}`}
          title="Bold"
        >
          <Icon icon="solar:text-bold-linear" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-nw-graphite/20 text-nw-black' : 'text-nw-graphite hover:text-nw-black hover:bg-nw-graphite/10'}`}
          title="Italic"
        >
          <Icon icon="solar:text-italic-linear" />
        </button>
        <div className="w-px h-4 bg-nw-graphite/20 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-nw-graphite/20 text-nw-black' : 'text-nw-graphite hover:text-nw-black hover:bg-nw-graphite/10'}`}
          title="Bullet List"
        >
          <Icon icon="solar:list-linear" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-nw-graphite/20 text-nw-black' : 'text-nw-graphite hover:text-nw-black hover:bg-nw-graphite/10'}`}
          title="Ordered List"
        >
          <Icon icon="solar:sort-from-bottom-to-top-linear" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

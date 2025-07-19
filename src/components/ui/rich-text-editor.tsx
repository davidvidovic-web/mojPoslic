'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minimal?: boolean
}

// Toolbar button component for consistency
const ToolbarButton = ({ 
  active, 
  disabled, 
  onClick, 
  children 
}: { 
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) => (
  <Button
    type="button"
    variant={active ? "default" : "ghost"}
    size="icon"
    className="h-8 w-8 p-0"
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </Button>
)

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Write something...', 
  className,
  disabled = false,
  minimal = false
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  // Initialize the editor
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        validate: href => /^https?:\/\//.test(href),
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: 'left',
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-text'
        ),
        placeholder,
      },
    },
  })

  // Set editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  // Client-side only
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div 
        className={cn(
          'border rounded-md w-full min-h-[150px] bg-background text-foreground p-4',
          className
        )}
      >
        <div className="opacity-70">{value || placeholder}</div>
      </div>
    )
  }

  // Optional: Add a link dialog
  const addLink = () => {
    const url = window.prompt('URL')
    
    if (url && editor) {
      // Check if text is selected
      if (editor.state.selection.empty) {
        // If no text is selected, insert the URL as a link
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: url })
          .run()
      } else {
        // If text is selected, convert it to a link
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: url })
          .run()
      }
    }
  }

  return (
    <div
      className={cn(
        'border rounded-md w-full overflow-hidden bg-background focus-within:ring-1 focus-within:ring-ring',
        className
      )}
    >
      {!minimal && (
        <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-muted/50">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive('bold')}
            disabled={disabled}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive('italic')}
            disabled={disabled}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor?.isActive('heading', { level: 2 })}
            disabled={disabled}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-6 bg-border mx-1" />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive('bulletList')}
            disabled={disabled}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive('orderedList')}
            disabled={disabled}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-6 bg-border mx-1" />
          <ToolbarButton
            onClick={addLink}
            active={editor?.isActive('link')}
            disabled={disabled}
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-6 bg-border mx-1" />
          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            active={editor?.isActive({ textAlign: 'left' })}
            disabled={disabled}
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            active={editor?.isActive({ textAlign: 'center' })}
            disabled={disabled}
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            active={editor?.isActive({ textAlign: 'right' })}
            disabled={disabled}
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}

'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
} from 'lucide-react'

interface SimpleRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
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

export function SimpleRichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Write something...', 
  className,
  disabled = false,
}: SimpleRichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  // Initialize the editor
  const editor = useEditor({
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
      }),
      Link.configure({
        openOnClick: false,
        validate: href => /^https?:\/\//.test(href),
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
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px] p-4',
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
          'border rounded-md w-full min-h-[100px] bg-background text-foreground p-4',
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
      <div className="flex items-center gap-1 p-1 border-b bg-muted/50">
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
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import MaterialIcon from './MaterialIcon'
import { normalizeRichText } from '../../utils/richText'

const TEXT_COLORS = [
  { label: 'Mặc định', value: '' },
  { label: 'Nâu', value: '#4a3020' },
  { label: 'Đỏ', value: '#b42318' },
  { label: 'Xanh lá', value: '#3f6212' },
  { label: 'Xanh dương', value: '#175cd3' },
]

function ToolbarButton({ active, disabled, onClick, title, icon }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active ? 'true' : 'false'}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={[
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition',
        active ? 'bg-primary/12 text-primary' : 'hover:bg-surface-container-low hover:text-primary',
        'disabled:pointer-events-none disabled:opacity-40',
      ].join(' ')}
    >
      <MaterialIcon name={icon} className="text-[18px]" />
    </button>
  )
}

function ToolbarDivider() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-outline-variant/40" aria-hidden="true" />
}

function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Nhập nội dung…',
  disabled = false,
  minHeightClass = 'min-h-[140px]',
  className = '',
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editable: !disabled,
    editorProps: {
      attributes: {
        class: ['rich-text-prose outline-none', minHeightClass].join(' '),
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange?.(normalizeRichText(current.getHTML()))
    },
  })

  useEffect(() => {
    if (!editor) return
    const next = value || ''
    const current = normalizeRichText(editor.getHTML())
    if (next !== current) {
      editor.commands.setContent(next, { emitUpdate: false })
    }
  }, [editor, value])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [editor, disabled])

  if (!editor) return null

  function setLink() {
    const previous = editor.getAttributes('link').href || ''
    const url = window.prompt('Nhập URL liên kết', previous)
    if (url === null) return
    const trimmed = url.trim()
    if (!trimmed) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
  }

  return (
    <div
      className={[
        'rich-text-editor overflow-hidden rounded-lg border border-outline-variant/25 bg-white',
        'focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20',
        disabled ? 'opacity-70' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-outline-variant/20 bg-surface-container-lowest/80 px-1.5 py-1">
        <ToolbarButton
          title="In đậm"
          icon="format_bold"
          active={editor.isActive('bold')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          title="In nghiêng"
          icon="format_italic"
          active={editor.isActive('italic')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          title="Gạch chân"
          icon="format_underlined"
          active={editor.isActive('underline')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          title="Gạch ngang"
          icon="format_strikethrough"
          active={editor.isActive('strike')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          title="Highlight"
          icon="ink_highlighter"
          active={editor.isActive('highlight')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef3c7' }).run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          title="Tiêu đề lớn"
          icon="title"
          active={editor.isActive('heading', { level: 2 })}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          title="Tiêu đề nhỏ"
          icon="format_size"
          active={editor.isActive('heading', { level: 3 })}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          title="Căn trái"
          icon="format_align_left"
          active={editor.isActive({ textAlign: 'left' })}
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        />
        <ToolbarButton
          title="Căn giữa"
          icon="format_align_center"
          active={editor.isActive({ textAlign: 'center' })}
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        />
        <ToolbarButton
          title="Căn phải"
          icon="format_align_right"
          active={editor.isActive({ textAlign: 'right' })}
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        />
        <ToolbarButton
          title="Căn đều"
          icon="format_align_justify"
          active={editor.isActive({ textAlign: 'justify' })}
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          title="Danh sách"
          icon="format_list_bulleted"
          active={editor.isActive('bulletList')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          title="Danh sách số"
          icon="format_list_numbered"
          active={editor.isActive('orderedList')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          title="Trích dẫn"
          icon="format_quote"
          active={editor.isActive('blockquote')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          title="Đường kẻ ngang"
          icon="horizontal_rule"
          disabled={disabled}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          title="Chèn liên kết"
          icon="link"
          active={editor.isActive('link')}
          disabled={disabled}
          onClick={setLink}
        />
        <ToolbarButton
          title="Gỡ liên kết"
          icon="link_off"
          disabled={disabled || !editor.isActive('link')}
          onClick={() => editor.chain().focus().unsetLink().run()}
        />

        <label className="relative inline-flex h-8 w-8 items-center justify-center" title="Màu chữ">
          <MaterialIcon name="format_color_text" className="pointer-events-none text-[18px] text-on-surface-variant" />
          <select
            aria-label="Màu chữ"
            disabled={disabled}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            value={editor.getAttributes('textStyle').color || ''}
            onChange={(event) => {
              const next = event.target.value
              if (!next) {
                editor.chain().focus().unsetColor().run()
                return
              }
              editor.chain().focus().setColor(next).run()
            }}
          >
            {TEXT_COLORS.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <ToolbarDivider />

        <ToolbarButton
          title="Hoàn tác"
          icon="undo"
          disabled={disabled || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          title="Làm lại"
          icon="redo"
          disabled={disabled || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>

      <EditorContent editor={editor} className="px-3 py-2.5 text-[15px] text-on-surface" />
    </div>
  )
}

export default RichTextEditor

import MarkdownContent from './MarkdownContent'
import { looksLikeHtml, sanitizeRichText } from '../../utils/richText'

function RichTextContent({ html = '', className = '' }) {
  const source = String(html || '').trim()
  if (!source) return null

  if (!looksLikeHtml(source)) {
    return <MarkdownContent className={className}>{source}</MarkdownContent>
  }

  const safe = sanitizeRichText(source)
  if (!safe.trim()) return null

  return (
    <div
      className={['markdown-body', className].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}

export default RichTextContent

import Markdown from 'react-markdown'

function MarkdownContent({ children, className = '' }) {
  const source = typeof children === 'string' ? children : ''
  if (!source.trim()) return null

  return (
    <div className={['markdown-body', className].filter(Boolean).join(' ')}>
      <Markdown
        components={{
          a: ({ href, children: linkChildren }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {linkChildren}
            </a>
          ),
        }}
      >
        {source}
      </Markdown>
    </div>
  )
}

export default MarkdownContent

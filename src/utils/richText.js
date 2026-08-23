import DOMPurify from 'isomorphic-dompurify'

const EMPTY_HTML_RE = /^(<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>)+$/i

export function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ''))
}

export function normalizeRichText(html) {
  const raw = String(html || '').trim()
  if (!raw || EMPTY_HTML_RE.test(raw)) return ''
  const text = raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text ? raw : ''
}

export function sanitizeRichText(html) {
  return DOMPurify.sanitize(String(html || ''), {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel', 'style', 'class', 'data-color'],
  })
}

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import MaterialIcon from './MaterialIcon'
import { overlayFade, sheetEnter } from '../../lib/motion'
import { useScrollLock } from '../../hooks/useScrollLock'
import {
  buildFacebookMessengerUrl,
  buildProductOrderMessage,
} from '../../utils/facebook'

async function copyText(text) {
  const value = String(text || '').trim()
  if (!value) return false
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    // fall through
  }
  try {
    const area = document.createElement('textarea')
    area.value = value
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.left = '-9999px'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

/**
 * iOS/Messenger thường bỏ ?text= — hiện tin sẵn + copy + mở chat để khách dán.
 */
function MessengerOrderSheet({ open, product, onClose }) {
  useScrollLock(open)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const message = product ? buildProductOrderMessage(product) : ''
  const messengerUrl = buildFacebookMessengerUrl(message)

  useEffect(() => {
    if (!open || !message) return undefined
    let cancelled = false
    ;(async () => {
      const ok = await copyText(message)
      if (cancelled) return
      setCopied(ok)
      setCopyFailed(!ok)
    })()
    return () => {
      cancelled = true
    }
  }, [open, message])

  async function handleCopyAgain() {
    const ok = await copyText(message)
    setCopied(ok)
    setCopyFailed(!ok)
  }

  function handleOpenMessenger() {
    // Copy lại ngay trước khi mở (iOS clipboard đôi khi hết hạn)
    void copyText(message)
    window.location.href = messengerUrl || 'https://m.me/'
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-4"
          {...overlayFade}
        >
          <button
            type="button"
            className="absolute inset-0 bg-on-surface/45 backdrop-blur-[2px]"
            aria-label="Đóng"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="messenger-order-title"
            {...sheetEnter}
            className="relative z-10 flex max-h-[min(88dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-surface-container-lowest shadow-2xl sm:rounded-2xl"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-surface-container px-4 py-4 sm:px-5">
              <div>
                <p id="messenger-order-title" className="text-base font-semibold text-on-surface">
                  Đặt hoa qua Messenger
                </p>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  iPhone thường không tự điền tin — hãy dán tin nhắn bên dưới vào ô chat.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-on-surface"
                aria-label="Đóng"
              >
                <MaterialIcon name="close" className="text-xl" />
              </button>
            </div>

            <div
              data-scroll-lock-scrollable
              className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5"
            >
              <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-low/80 px-3.5 py-3">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-on-surface">
                  {message}
                </pre>
              </div>

              {copied ? (
                <p className="flex items-center gap-1.5 text-xs font-medium text-primary" role="status">
                  <MaterialIcon name="check_circle" className="text-base" />
                  Đã copy tin nhắn vào bộ nhớ tạm
                </p>
              ) : null}
              {copyFailed ? (
                <p className="text-xs text-error" role="status">
                  Không copy được tự động — bấm “Sao chép lại” rồi dán trong Messenger.
                </p>
              ) : null}

              <ol className="list-decimal space-y-1 pl-4 text-xs leading-relaxed text-on-surface-variant">
                <li>Bấm “Mở Messenger” bên dưới</li>
                <li>Trong ô chat: giữ tay → chọn Dán</li>
                <li>Gửi tin nhắn cho shop</li>
              </ol>
            </div>

            <div className="flex shrink-0 flex-col gap-2 border-t border-surface-container px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
              <button type="button" onClick={handleOpenMessenger} className="btn-primary w-full py-3.5">
                <MaterialIcon name="chat_bubble" className="text-lg" />
                Mở Messenger
              </button>
              <button
                type="button"
                onClick={handleCopyAgain}
                className="btn-glass w-full py-3 text-[11px]"
              >
                Sao chép lại tin nhắn
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

export default MessengerOrderSheet

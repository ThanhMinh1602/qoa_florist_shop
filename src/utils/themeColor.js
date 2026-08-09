const DEFAULT_THEME_COLOR = '#FAF7F2'

/**
 * Đặt màu status bar / browser chrome (Android theme-color).
 * iOS dùng black-translucent nên cần nền header/safe-area cùng màu.
 */
export function setThemeColor(color = DEFAULT_THEME_COLOR) {
  if (typeof document === 'undefined') return

  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', color)
}

export { DEFAULT_THEME_COLOR }

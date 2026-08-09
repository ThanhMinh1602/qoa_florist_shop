import log from 'loglevel'

/**
 * FE logger — loglevel (nhẹ, filter theo level trong DevTools).
 * Local: debug. Production: warn+.
 * Đổi nhanh: localStorage.setItem('qoa_log_level', 'debug') rồi reload.
 */
const stored =
  typeof localStorage !== 'undefined' ? localStorage.getItem('qoa_log_level') : null
const isProd = import.meta.env.PROD

log.setLevel(stored || (isProd ? 'warn' : 'debug'))
log.setDefaultLevel(isProd ? 'warn' : 'debug')

export const logger = {
  debug: (...args) => log.debug('[QOA]', ...args),
  info: (...args) => log.info('[QOA]', ...args),
  warn: (...args) => log.warn('[QOA]', ...args),
  error: (...args) => log.error('[QOA]', ...args),
  setLevel: (level) => log.setLevel(level),
}

export default logger

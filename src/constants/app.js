export function getPublicBaseUrl() {
  if (import.meta.env.VITE_PUBLIC_BASE_URL) {
    return import.meta.env.VITE_PUBLIC_BASE_URL.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return 'http://192.168.1.6:5173'
}

export function buildGreetingUrl(uuid) {
  return `${getPublicBaseUrl()}/q/${uuid}`
}

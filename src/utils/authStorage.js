const AUTH_TOKEN_KEY = 'qoa_admin_token'
const AUTH_USERNAME_KEY = 'qoa_admin_username'

function readStorage(key) {
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value)
    sessionStorage.removeItem(key)
  } catch {
    try {
      sessionStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
  }
}

function removeStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export function getAuthToken() {
  return readStorage(AUTH_TOKEN_KEY)
}

export function getAuthUsername() {
  return readStorage(AUTH_USERNAME_KEY)
}

export function saveAuthSession(token, username) {
  writeStorage(AUTH_TOKEN_KEY, token)
  writeStorage(AUTH_USERNAME_KEY, username || '')
}

export function clearAuthSession() {
  removeStorage(AUTH_TOKEN_KEY)
  removeStorage(AUTH_USERNAME_KEY)
}

export { AUTH_TOKEN_KEY, AUTH_USERNAME_KEY }

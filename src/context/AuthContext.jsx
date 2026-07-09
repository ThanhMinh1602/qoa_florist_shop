import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { changePasswordApi, fetchMeApi, loginApi } from '../api/authApi'

const AUTH_TOKEN_KEY = 'qoa_admin_token'
const AUTH_USERNAME_KEY = 'qoa_admin_username'

const AuthContext = createContext(null)

function readStoredToken() {
  try {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) ?? ''
  } catch {
    return ''
  }
}

function readStoredUsername() {
  try {
    return sessionStorage.getItem(AUTH_USERNAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readStoredToken)
  const [username, setUsername] = useState(readStoredUsername)
  const [isLoading, setIsLoading] = useState(Boolean(readStoredToken()))
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
    sessionStorage.removeItem(AUTH_USERNAME_KEY)
    setToken('')
    setUsername('')
    setIsAuthenticated(false)
  }, [])

  const saveSession = useCallback((nextToken, nextUsername) => {
    sessionStorage.setItem(AUTH_TOKEN_KEY, nextToken)
    sessionStorage.setItem(AUTH_USERNAME_KEY, nextUsername)
    setToken(nextToken)
    setUsername(nextUsername)
    setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      setIsAuthenticated(false)
      return undefined
    }

    let cancelled = false

    async function restoreSession() {
      setIsLoading(true)

      try {
        const result = await fetchMeApi()
        if (!cancelled) {
          setUsername(result.data.username)
          sessionStorage.setItem(AUTH_USERNAME_KEY, result.data.username)
          setIsAuthenticated(true)
        }
      } catch {
        if (!cancelled) {
          clearSession()
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      cancelled = true
    }
  }, [token, clearSession])

  const login = useCallback(
    async (loginUsername, password) => {
      try {
        const result = await loginApi(loginUsername, password)
        saveSession(result.data.token, result.data.username)
        return { success: true }
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Đăng nhập thất bại.',
        }
      }
    },
    [saveSession],
  )

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const changePassword = useCallback(
    async ({ currentPassword, newPassword, confirmPassword }) => {
      try {
        const result = await changePasswordApi({
          currentPassword,
          newPassword,
          confirmPassword,
        })
        return { success: true, message: result.message }
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Không thể đổi mật khẩu.',
        }
      }
    },
    [],
  )

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      username,
      login,
      logout,
      changePassword,
    }),
    [isAuthenticated, isLoading, username, login, logout, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

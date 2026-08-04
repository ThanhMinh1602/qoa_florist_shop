import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { changePasswordApi, fetchMeApi, loginApi } from '../api/authApi'
import {
  clearAuthSession,
  getAuthToken,
  getAuthUsername,
  saveAuthSession,
} from '../utils/authStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAuthToken())
  const [username, setUsername] = useState(() => getAuthUsername())
  const [isLoading, setIsLoading] = useState(() => Boolean(getAuthToken()))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const skipRestoreRef = useRef(false)

  const clearSession = useCallback(() => {
    clearAuthSession()
    setToken('')
    setUsername('')
    setIsAuthenticated(false)
    setIsLoading(false)
  }, [])

  const saveSession = useCallback((nextToken, nextUsername) => {
    saveAuthSession(nextToken, nextUsername)
    skipRestoreRef.current = true
    setToken(nextToken)
    setUsername(nextUsername)
    setIsAuthenticated(true)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      setIsAuthenticated(false)
      return undefined
    }

    if (skipRestoreRef.current) {
      skipRestoreRef.current = false
      setIsAuthenticated(true)
      setIsLoading(false)
      return undefined
    }

    let cancelled = false

    async function restoreSession() {
      setIsLoading(true)

      try {
        const result = await fetchMeApi()
        if (!cancelled) {
          const nextUsername = result.data?.username || getAuthUsername()
          setUsername(nextUsername)
          saveAuthSession(token, nextUsername)
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
        const nextToken = result.data?.token
        const nextUsername = result.data?.username || loginUsername

        if (!nextToken) {
          return {
            success: false,
            message: 'Máy chủ không trả về token đăng nhập.',
          }
        }

        saveSession(nextToken, nextUsername)
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

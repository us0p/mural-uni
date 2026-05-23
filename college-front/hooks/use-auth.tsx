'use client'

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import { login as apiLogin } from '@/lib/api/auth'
import { apiClient } from '@/lib/api/client'
import { getUiPermissionObjects } from '@/lib/api/ui-items'
import type { LoginResponse, UserResponse, UiPermissionObjectResponse } from '@/lib/api/types'

const USER_KEY = 'auth_user'

interface AuthContextType {
  user: UserResponse | null
  isLoading: boolean
  isAdmin: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permissionName: string) => boolean
  canAccessUiItem: (uiItemName: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function readLocal<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function clearStorage() {
  localStorage.removeItem(USER_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]                   = useState<UserResponse | null>(null)
  const [permissions, setPermissions]     = useState<string[]>([])
  const [uiPermissions, setUiPermissions] = useState<UiPermissionObjectResponse[]>([])
  const [isLoading, setIsLoading]         = useState(true)

  // On mount: restore session via httpOnly cookie (/api/auth/me validates it)
  useEffect(() => {
    const storedUser = readLocal<UserResponse>(USER_KEY)
    if (!storedUser) {
      setIsLoading(false)
      return
    }
    apiClient.get<LoginResponse>('/api/auth/me')
      .then(async (me) => {
        const uiPerms = await getUiPermissionObjects()
        setUser(storedUser)
        setPermissions(me.permissions)
        setUiPermissions(uiPerms)
      })
      .catch(() => {
        clearStorage()
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<void> => {
    const result = await apiLogin({ username, password })

    const currentUser: UserResponse = {
      id:          result.userId,
      username:    result.username,
      email:       result.email,
      phoneNumber: result.phoneNumber,
      ra:          result.ra,
      roleId:      result.roleId,
      roleName:    result.roleName,
    }

    const uiPerms = await getUiPermissionObjects()

    setUser(currentUser)
    setPermissions(result.permissions)
    setUiPermissions(uiPerms)

    // Persist only the user object for session restoration — permissions re-fetched from /me
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
  }, [])

  const logout = useCallback(() => {
    void apiClient.post('/api/auth/logout', {})?.catch?.(() => {})
    clearStorage()
    setUser(null)
    setPermissions([])
    setUiPermissions([])
  }, [])

  const hasPermission = useCallback(
    (permissionName: string): boolean => permissions.includes(permissionName),
    [permissions],
  )

  const canAccessUiItem = useCallback(
    (uiItemName: string): boolean => {
      if (!user) return false
      const required = uiPermissions.filter((p) => p.uiItemName === uiItemName)
      if (required.length === 0) return true
      return required.every((r) => permissions.includes(r.permissionName))
    },
    [user, uiPermissions, permissions],
  )

  const isAdmin = permissions.includes('admin')

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAdmin, login, logout, hasPermission, canAccessUiItem }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

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
import type { LoginResponse, UserResponse } from '@/lib/api/types'

const USER_KEY = 'auth_user'

interface AuthContextType {
  user: UserResponse | null
  role: string | null
  isLoading: boolean
  isAdmin: boolean
  isProfessor: boolean
  isAluno: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
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
  const [user, setUser]       = useState<UserResponse | null>(null)
  const [role, setRole]       = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = readLocal<UserResponse>(USER_KEY)
    if (!storedUser) {
      setIsLoading(false)
      return
    }
    apiClient.get<LoginResponse>('/api/auth/me')
      .then((me) => {
        setUser(storedUser)
        setRole(me.roleName)
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

    setUser(currentUser)
    setRole(result.roleName)

    localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
  }, [])

  const logout = useCallback(() => {
    void apiClient.post('/api/auth/logout', {})?.catch?.(() => {})
    clearStorage()
    setUser(null)
    setRole(null)
  }, [])

  const isAdmin     = role === 'admin'
  const isProfessor = role === 'professor'
  const isAluno     = role === 'aluno'

  return (
    <AuthContext.Provider
      value={{ user, role, isLoading, isAdmin, isProfessor, isAluno, login, logout }}
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

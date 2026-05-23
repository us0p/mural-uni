import { apiClient } from './client'
import type { LoginRequest, LoginResponse } from './types'

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/api/auth/login', credentials)
}

export function setPassword(token: string, password: string): Promise<void> {
  return apiClient.post<void>('/api/auth/set-password', { token, password })
}

export function forgotPassword(email: string): Promise<void> {
  return apiClient.post<void>('/api/auth/forgot-password', { email })
}

import { useEffect } from 'react'
import type { ApiResponse } from '../api/client'
import { useAuthStore } from './store'

type AuthUser = { id: string; email: string; role: string }

type RefreshPayload = {
  access_token?: string
  accessToken?: string
  user?: unknown
}

type RefreshResponse = ApiResponse<RefreshPayload>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isAuthUser(value: unknown): value is AuthUser {
  return (
    isRecord(value)
    && typeof value.id === 'string'
    && typeof value.email === 'string'
    && typeof value.role === 'string'
  )
}

function isRefreshPayload(value: unknown): value is RefreshPayload {
  if (!isRecord(value)) {
    return false
  }

  if ('access_token' in value && value.access_token !== undefined && typeof value.access_token !== 'string') {
    return false
  }

  if ('accessToken' in value && value.accessToken !== undefined && typeof value.accessToken !== 'string') {
    return false
  }

  return true
}

function isRefreshResponse(value: unknown): value is RefreshResponse {
  if (!isRecord(value)) {
    return false
  }

  if (typeof value.success !== 'boolean') {
    return false
  }

  if ('data' in value && value.data !== undefined && !isRefreshPayload(value.data)) {
    return false
  }

  return true
}

function extractAccessToken(payload: RefreshPayload | undefined): string | null {
  if (!payload) {
    return null
  }

  if (typeof payload.access_token === 'string') {
    return payload.access_token
  }

  if (typeof payload.accessToken === 'string') {
    return payload.accessToken
  }

  return null
}

function extractUser(payload: RefreshPayload | undefined): AuthUser | null {
  if (!payload) {
    return null
  }

  const candidate = payload.user
  if (isAuthUser(candidate)) {
    return candidate
  }

  return null
}

export function useBootstrapAuth() {
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const res = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Bodyは空 (Cookieからrefresh取得) / 互換で空オブジェクト
          body: JSON.stringify({}),
          credentials: 'include',
        })
        if (!res.ok) throw new Error('refresh failed')
        const json: unknown = await res.json()
        if (!isRefreshResponse(json)) {
          throw new Error('unexpected refresh response')
        }

        if (json.success) {
          const accessToken = extractAccessToken(json.data)
          const user = extractUser(json.data)
          if (accessToken) {
            if (!cancelled) setAuth({ accessToken, user, loading: false })
            return
          }
        }

        if (!cancelled) setAuth({ accessToken: null, user: null, loading: false })
      } catch {
        if (!cancelled) setAuth({ accessToken: null, user: null, loading: false })
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [setAuth])
}

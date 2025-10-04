import { useEffect } from 'react'
import { useAuthStore } from './store'

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
        const json = await res.json()
        if (json?.data?.access_token) {
          if (!cancelled) setAuth({ accessToken: json.data.access_token, user: json.data.user || null, loading: false })
        } else {
          if (!cancelled) setAuth({ accessToken: null, loading: false })
        }
      } catch {
        if (!cancelled) setAuth({ accessToken: null, loading: false })
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [setAuth])
}

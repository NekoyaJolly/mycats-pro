import { create } from 'zustand'

interface AuthState {
  accessToken: string | null
  loading: boolean
  user: { id: string; email: string; role: string } | null
  setAuth: (data: Partial<AuthState>) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  loading: true,
  user: null,
  setAuth: (data) => set((s) => ({ ...s, ...data })),
  reset: () => set({ accessToken: null, user: null, loading: false }),
}))

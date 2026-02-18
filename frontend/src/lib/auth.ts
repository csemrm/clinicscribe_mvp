import { api, clearTokens, setTokens } from './api'

export async function login(email: string, password: string) {
  const res = await api.login(email, password)
  setTokens(res.tokens)
  return res.user
}

export async function register(email: string, password: string, clinic_name?: string) {
  const res = await api.register(email, password, clinic_name)
  setTokens(res.tokens)
  return res.user
}

export function logout() {
  clearTokens()
}

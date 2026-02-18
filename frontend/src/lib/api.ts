const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export type Tokens = { access: string; refresh: string }

export function getAccessToken() {
  return localStorage.getItem('access_token') || ''
}

export function setTokens(tokens: Tokens) {
  localStorage.setItem('access_token', tokens.access)
  localStorage.setItem('refresh_token', tokens.refresh)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getAccessToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { ...headers, ...(options.headers as any) } })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return (await res.json()) as T
  return (await res.text()) as any
}

export const api = {
  register: (email: string, password: string, clinic_name?: string) =>
    request<{ user: any; tokens: Tokens }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, clinic_name }) }),
  login: (email: string, password: string) =>
    request<{ user: any; tokens: Tokens }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request<{ user: any }>('/api/auth/me'),
  patients: {
    list: () => request<any[]>('/api/patients/'),
    create: (data: any) => request<any>('/api/patients/', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: number) => request<any>(`/api/patients/${id}/`),
    update: (id: number, data: any) => request<any>(`/api/patients/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/api/patients/${id}/`, { method: 'DELETE' }),
  },
  encounters: {
    list: () => request<any[]>('/api/encounters/'),
    create: (data: any) => request<any>('/api/encounters/', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: number) => request<any>(`/api/encounters/${id}/`),
    update: (id: number, data: any) => request<any>(`/api/encounters/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    docs: (id: number) => request<any[]>(`/api/encounters/${id}/documents/`),
    generateSOAP: (id: number) => request<any>(`/api/encounters/${id}/generate_soap/`, { method: 'POST' }),
    generateAVS: (id: number) => request<any>(`/api/encounters/${id}/generate_avs/`, { method: 'POST' }),
    generateForm: (id: number, form_type: string, extra_fields: any) =>
      request<any>(`/api/encounters/${id}/generate_form/`, { method: 'POST', body: JSON.stringify({ form_type, extra_fields }) }),
    uploadAttachment: async (id: number, file: File) => {
      const token = getAccessToken()
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${API_BASE_URL}/api/encounters/${id}/upload_attachment/`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  },
  documents: {
    get: (id: number) => request<any>(`/api/documents/${id}/`),
    update: (id: number, data: any) => request<any>(`/api/documents/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    submitReview: (id: number) => request<any>(`/api/documents/${id}/submit_review/`, { method: 'POST' }),
    finalize: (id: number) => request<any>(`/api/documents/${id}/finalize/`, { method: 'POST' }),
    exportJSON: (id: number) => request<any>(`/api/documents/${id}/export_json/`),
    exportPDFUrl: (id: number) => `${API_BASE_URL}/api/documents/${id}/export_pdf/`,
  },
}

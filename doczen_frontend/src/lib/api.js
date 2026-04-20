const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_BASE = RAW_API_BASE.replace(/\/+$/, '').replace(/\/api$/, '')
const TOKEN_KEY = 'doczen_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getApiBase() {
  return API_BASE
}

async function apiRequest(path, init = {}) {
  const token = init.token || getToken()
  const headers = {
    ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(init.headers || {}),
  }

  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  })

  const text = await response.text()
  const data = text ? safeJsonParse(text) : null

  if (!response.ok) {
    const message = (data && (data.detail || data.error || data.message)) || text || `Request failed with ${response.status}`
    throw new Error(message)
  }

  return data
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function buildAuthBody(payload) {
  return {
    username: payload.username || payload.email || '',
    password: payload.password,
    ...(payload.first_name ? { first_name: payload.first_name } : {}),
    ...(payload.last_name ? { last_name: payload.last_name } : {}),
  }
}

export async function login(payload) {
  return apiRequest('/api/login/', {
    method: 'POST',
    body: JSON.stringify(buildAuthBody(payload)),
  })
}

export async function register(payload) {
  return apiRequest('/api/register/', {
    method: 'POST',
    body: JSON.stringify(buildAuthBody(payload)),
  })
}

export async function getMe() {
  return apiRequest('/api/me/')
}

export async function listPatients() {
  return apiRequest('/api/patients/')
}

export async function getPatient(id) {
  return apiRequest(`/api/patients/${id}/`)
}

export async function createPatient(payload) {
  return apiRequest('/api/patients/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listEncounters() {
  return apiRequest('/api/encounters/')
}

export async function getEncounter(id) {
  return apiRequest(`/api/encounters/${id}/`)
}

export async function createEncounter(payload) {
  return apiRequest('/api/encounters/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateEncounter(id, payload) {
  return apiRequest(`/api/encounters/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function generateSoap(id) {
  return apiRequest(`/api/encounters/${id}/generate_soap/`, { method: 'POST' })
}

export async function generateAvs(id) {
  return apiRequest(`/api/encounters/${id}/generate_avs/`, { method: 'POST' })
}

export async function generateForm(id) {
  return apiRequest(`/api/encounters/${id}/generate_form/`, { method: 'POST' })
}

export async function uploadAttachment(id, formData) {
  return apiRequest(`/api/encounters/${id}/upload_attachment/`, {
    method: 'POST',
    body: formData,
    headers: {},
  })
}

export async function listDocuments(encounterId) {
  return apiRequest(`/api/encounters/${encounterId}/documents/`)
}

export async function getDocument(id) {
  return apiRequest(`/api/documents/${id}/`)
}

export async function updateDocument(id, payload) {
  return apiRequest(`/api/documents/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function submitReview(id, payload = {}) {
  return apiRequest(`/api/documents/${id}/submit_review/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function finalizeDocument(id) {
  return apiRequest(`/api/documents/${id}/finalize/`, {
    method: 'POST',
  })
}

export async function exportDocumentJson(id) {
  return apiRequest(`/api/documents/${id}/export_json/`)
}

export async function exportDocumentPdf(id) {
  const token = getToken()
  const response = await fetch(`${API_BASE}/api/documents/${id}/export_pdf/`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    throw new Error(`PDF export failed with ${response.status}`)
  }

  return response.blob()
}


export async function testAI(token, payload) {
  return apiRequest('/api/test-ai/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      kind: payload.kind || 'soap',
      patient_name: payload.patient_name || '',
      chief_complaint: payload.chief_complaint || '',
      raw_notes: payload.raw_notes || '',
      objective: payload.objective || '',
    }),
  });
}
export async function previewChiefComplaint(rawNotes) {
  return apiRequest('/api/preview-chief-complaint/', {
    method: 'POST',
    body: JSON.stringify({ raw_notes: rawNotes || '' }),
  })
}

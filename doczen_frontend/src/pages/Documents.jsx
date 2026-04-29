// src/pages/Documents.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { getToken } from '../lib/api'
import { Download, FileText, Eye, RefreshCw, Search } from 'lucide-react'

const DOCUMENTS_API_URL = (import.meta.env.VITE_API_DOCUMENTS_URL || 'http://localhost:8000/api/documents').replace(/\/$/, '')


function resolveDocumentTitle(doc) {
  return (
    doc.title ||
    doc.name ||
    doc.document_title ||
    doc.kind ||
    `Document ${doc.id}`
  )
}

function resolvePatientName(doc) {
  return (
    doc.patient_name ||
    doc.patient ||
    doc.patient_full_name ||
    doc.encounter_patient_name ||
    '—'
  )
}

function resolveClinicName(doc) {
  return doc.clinic_name || doc.clinic || doc.encounter_clinic_name || '—'
}

function resolveStatus(doc) {
  return (doc.status || doc.state || 'draft').toString().replaceAll('_', ' ')
}

function resolveKind(doc) {
  return (doc.kind || doc.type || 'document').toString().replaceAll('_', ' ')
}

function resolveDate(doc) {
  return doc.updated_at || doc.created_at || doc.visit_date || doc.date || '—'
}

function resolveViewLink(doc) {
  return (
    doc.view_url ||
    doc.document_url ||
    doc.detail_url ||
    `/app/documents/${doc.id}`
  )
}

function resolveDownloadLink(doc) {
  return (
    doc.download_url ||
    doc.pdf_url ||
    doc.file_url ||
    doc.export_url ||
    ''
  )
}

function statusBadge(status) {
  const value = status.toLowerCase()
  if (value.includes('final')) return { bg: 'rgba(34,197,94,0.12)', fg: '#166534', label: status }
  if (value.includes('review')) return { bg: 'rgba(56,189,248,0.12)', fg: '#075985', label: status }
  if (value.includes('draft')) return { bg: 'rgba(245,158,11,0.12)', fg: '#92400e', label: status }
  return { bg: 'rgba(100,116,139,0.12)', fg: '#334155', label: status }
}

export default function Documents() {
  const [documents, setDocuments] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [query, setQuery] = React.useState('')

  const loadDocuments = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = getToken()
      const res = await fetch(`${DOCUMENTS_API_URL}/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!res.ok) {
        throw new Error(`Failed to load documents (${res.status})`)
      }

      const data = await res.json()
      const items = Array.isArray(data) ? data : data.results || data.documents || []
      setDocuments(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const filtered = documents.filter((doc) => {
    const needle = query.trim().toLowerCase()
    if (!needle) return true
    const haystack = [
      resolveDocumentTitle(doc),
      resolvePatientName(doc),
      resolveClinicName(doc),
      resolveStatus(doc),
      resolveKind(doc),
      String(doc.id ?? ''),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(needle)
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">Documents</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">All generated documents</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              View generated clinical documents, open a record for review, or download the exported PDF directly from this page.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadDocuments}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
            >
              <FileText className="h-4 w-4" />
              Back to dashboard
            </Link>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by patient, clinic, document kind, or status"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-600">
            {loading ? 'Loading documents…' : `${filtered.length} document${filtered.length === 1 ? '' : 's'}`}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Document</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Clinic</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Updated</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td className="px-4 py-8 text-sm text-slate-500" colSpan={6}>
                      Loading documents…
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((doc) => {
                    const status = resolveStatus(doc)
                    const badge = statusBadge(status)
                    const viewLink = resolveViewLink(doc)
                    const downloadLink = resolveDownloadLink(doc)
                    const title = resolveDocumentTitle(doc)

                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-950">{title}</div>
                              <div className="mt-1 text-xs text-slate-500">
                                #{doc.id}
                                {doc.kind ? ` • ${resolveKind(doc)}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-slate-700">{resolvePatientName(doc)}</td>
                        <td className="px-4 py-4 align-top text-sm text-slate-700">{resolveClinicName(doc)}</td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className="inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize"
                            style={{ background: badge.bg, color: badge.fg }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-slate-600">{resolveDate(doc)}</td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={viewLink}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Link>
                            {downloadLink ? (
                              <a
                                href={downloadLink}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </a>
                            ) : (
                              <Link
                                to={viewLink}
                                className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
                              >
                                <Download className="h-4 w-4" />
                                Open
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td className="px-4 py-10 text-sm text-slate-500" colSpan={6}>
                      No documents found. Generate a document from an encounter to see it here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../lib/auth'

export default function Layout({ children }: { children: React.ReactNode }) {
  const nav = useNavigate()
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="font-semibold">ClinicScribe</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/patients" className="hover:underline">Patients</Link>
            <Link to="/encounters/new" className="hover:underline">New Encounter</Link>
            <button
              onClick={() => { logout(); nav('/login') }}
              className="rounded-md border px-3 py-1 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="mb-4 rounded-md border bg-yellow-50 p-3 text-sm">
          <div className="font-medium">Documentation assistance only.</div>
          <div className="text-gray-700">Clinician must verify and approve all generated content before final export.</div>
        </div>
        {children}
      </div>
    </div>
  )
}

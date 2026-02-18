import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardPage from './pages/Dashboard'
import PatientsPage from './pages/Patients'
import PatientDetailPage from './pages/PatientDetail'
import EncounterNewPage from './pages/EncounterNew'
import EncounterDetailPage from './pages/EncounterDetail'
import DocumentEditorPage from './pages/DocumentEditor'
import { getAccessToken } from './lib/api'

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = getAccessToken()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/patients" element={<RequireAuth><PatientsPage /></RequireAuth>} />
      <Route path="/patients/:id" element={<RequireAuth><PatientDetailPage /></RequireAuth>} />
      <Route path="/encounters/new" element={<RequireAuth><EncounterNewPage /></RequireAuth>} />
      <Route path="/encounters/:id" element={<RequireAuth><EncounterDetailPage /></RequireAuth>} />
      <Route path="/documents/:id" element={<RequireAuth><DocumentEditorPage /></RequireAuth>} />

      <Route path="*" element={<div className="p-6">Not Found</div>} />
    </Routes>
  )
}

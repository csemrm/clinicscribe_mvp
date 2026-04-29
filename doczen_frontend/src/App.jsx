import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout, { Protected } from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientDetail from './pages/PatientDetail'
import EncounterNew from './pages/EncounterNew'
import EncounterDetail from './pages/EncounterDetail'
import DocumentEditor from './pages/DocumentEditor'
import Documents from './pages/Documents'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={
          <Protected>
            <Layout>
              <Dashboard />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/app/patients"
        element={
          <Protected>
            <Layout>
              <Patients />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/app/patients/:patientId"
        element={
          <Protected>
            <Layout>
              <PatientDetail />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/app/encounters/new"
        element={
          <Protected>
            <Layout>
              <EncounterNew />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/app/encounters/:encounterId"
        element={
          <Protected>
            <Layout>
              <EncounterDetail />
            </Layout>
          </Protected>
        }
      />

      <Route
        path="/app/documents"
        element={
          <Protected>
            <Layout>
              <Documents />
            </Layout>
          </Protected>
        }
      />

      <Route
        path="/app/documents/:documentId"
        element={
          <Protected>
            <Layout>
              <DocumentEditor />
            </Layout>
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import EncounterNew from './pages/EncounterNew';
import EncounterDetail from './pages/EncounterDetail';
import DocumentEditor from './pages/DocumentEditor';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={
          <Layout>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="patients" element={<Patients />} />
              <Route path="patients/:patientId" element={<PatientDetail />} />
              <Route path="encounters/new" element={<EncounterNew />} />
              <Route path="encounters/:encounterId" element={<EncounterDetail />} />
              <Route path="documents/:documentId" element={<DocumentEditor />} />
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

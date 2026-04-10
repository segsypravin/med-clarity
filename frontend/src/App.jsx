import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Results from './pages/Results';
import History from './pages/History';
import Doctors from './pages/Doctors';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import About from './pages/About';
import ScanUpload from './components/ScanUpload';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public pages — no sidebar */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* App shell with sidebar */}
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/landing" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="upload" element={<Upload />} />
            <Route path="results" element={<Results />} />
            <Route path="scan-upload" element={<ScanUpload />} />
            <Route path="history" element={<History />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


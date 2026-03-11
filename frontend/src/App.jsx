import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar       from './components/Sidebar';
import Login         from './pages/Login';
import Dashboard     from './pages/Dashboard';
import Purchases     from './pages/Purchases';
import Transfers     from './pages/Transfers';
import Assignments   from './pages/Assignments';

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#162033',
              color: '#f1f5f9',
              border: '1px solid #1f3050',
              fontSize: '0.875rem',
              borderRadius: '8px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#162033' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#162033' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/purchases" element={
            <ProtectedRoute>
              <Layout><Purchases /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/transfers" element={
            <ProtectedRoute>
              <Layout><Transfers /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/assignments" element={
            <ProtectedRoute roles={['admin', 'base_commander']}>
              <Layout><Assignments /></Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

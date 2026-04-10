import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1a1d2e',
                color: '#e2e8f0',
                border: '1px solid #2d3148',
                borderRadius: '8px',
                fontSize: '13px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#1a1d2e' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#1a1d2e' } },
            }}
          />
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

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
                background: '#fff',
                color: '#1A1A2E',
                border: '1px solid #DDE3EA',
                borderRadius: '8px',
                fontSize: '13px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              },
              success: { iconTheme: { primary: '#16A34A', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#C53030', secondary: '#fff' } },
            }}
          />
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <Routes>
            
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1f2937',
                color: '#f3f4f6',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
                padding: '12px 16px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#1f2937' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#1f2937' },
              },
            }}
          />
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

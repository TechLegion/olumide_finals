import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';

function AppRouter() {
  const { auth, isStudent, isAdmin, isTechnician } = useAuth();

  if (!auth) return <LoginPage />;
  if (isAdmin) return <AdminDashboard />;
  if (isTechnician) return <TechnicianDashboard />;
  if (isStudent) return <StudentDashboard />;

  // Fallback — unknown role
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
      background: 'var(--clr-bg)', color: 'var(--clr-text-primary)',
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--clr-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <h2>Unknown Role: {auth.role}</h2>
      <p style={{ color: 'var(--clr-text-muted)' }}>Please contact your system administrator.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  );
}

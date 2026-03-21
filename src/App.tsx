import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import InternshipsPage from './pages/InternshipsPage';
import ReportsPage from './pages/ReportsPage';
import { Loader2 } from 'lucide-react';

function LoginPage() {
  const navigate = useNavigate();
  return <Login onToggleMode={() => navigate('/signup')} />;
}

function SignupPage() {
  const navigate = useNavigate();
  return <Signup onToggleMode={() => navigate('/login')} />;
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />}
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/internships" element={<InternshipsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

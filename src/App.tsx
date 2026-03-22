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
import ProfilePage from './pages/ProfilePage';
import AdminStudentDetailsPage from './pages/AdminStudentDetailsPage';
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
  const defaultAuthenticatedRoute = user?.role === 'admin' ? '/admin' : '/dashboard';

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
        element={user ? <Navigate to={defaultAuthenticatedRoute} replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to={defaultAuthenticatedRoute} replace /> : <SignupPage />}
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <DashboardPage />}
        />
        <Route
          path="/internships"
          element={user?.role === 'admin' ? <Navigate to="/admin/internships" replace /> : <InternshipsPage />}
        />
        <Route
          path="/reports"
          element={user?.role === 'admin' ? <Navigate to="/admin/reports" replace /> : <ReportsPage />}
        />
        <Route
          path="/profile"
          element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <ProfilePage />}
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/:studentId"
          element={
            <ProtectedRoute requireAdmin>
              <AdminStudentDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/internships"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to={user ? defaultAuthenticatedRoute : '/login'} replace />}
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

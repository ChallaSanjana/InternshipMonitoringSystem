import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
export default function ProtectedRoute({ children, requireAdmin = false }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (<div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin"/>
      </div>);
    }
    if (!user) {
        return <Navigate to="/login" replace/>;
    }
    if (requireAdmin && user.role !== 'admin') {
        return (<div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>);
    }
    return <>{children}</>;
}

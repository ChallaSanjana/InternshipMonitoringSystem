import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar isAdmin={user?.role === 'admin'} />
      <div className="flex-1">
        <Navbar userName={user?.name || 'User'} onLogout={signOut} />
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { BarChart3, Briefcase, FileText, Shield, Users, User, UserCog } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  role?: 'student' | 'admin' | 'mentor';
}

const baseItemClass = 'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-300 ease-in-out transform-gpu';

type MenuItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
};

const studentMenu: MenuItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/internships', label: 'Internships', icon: Briefcase },
  { to: '/reports', label: 'Progress Reports', icon: FileText },
  { to: '/profile', label: 'Profile', icon: User }
];

const adminMenu: MenuItem[] = [
  { to: '/admin', label: 'Admin Dashboard', icon: Shield, end: true },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/mentors', label: 'Mentors', icon: UserCog },
  { to: '/admin/internships', label: 'Internships', icon: Briefcase },
  { to: '/admin/reports', label: 'Reports', icon: FileText }
];

const mentorMenu: MenuItem[] = [
  { to: '/dashboard', label: 'Mentor Dashboard', icon: BarChart3, end: true },
  { to: '/mentor/reports', label: 'Reports', icon: FileText },
  { to: '/profile', label: 'Profile', icon: User }
];

export default function Sidebar({ role = 'student' }: SidebarProps) {
  const menuItems = role === 'admin' ? adminMenu : role === 'mentor' ? mentorMenu : studentMenu;

  return (
    <aside className="w-full border-b border-slate-200 bg-white p-4 md:fixed md:inset-y-0 md:left-0 md:z-30 md:h-screen md:w-72 md:overflow-y-auto md:border-b-0 md:border-r md:p-5">
      <div className="mb-5 hidden md:block">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Internship Hub</h1>
        <p className="text-xs text-slate-500">Monitoring dashboard</p>
      </div>

      <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `${baseItemClass} ${isActive ? 'scale-[1.02] bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:translate-x-1 hover:bg-slate-100 hover:text-blue-700'}`
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

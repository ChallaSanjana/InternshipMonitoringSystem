import { BarChart3, Briefcase, FileText, Shield } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isAdmin: boolean;
}

const baseItemClass = 'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition';

export default function Sidebar({ isAdmin }: SidebarProps) {
  return (
    <aside className="w-full border-b border-slate-200 bg-white p-4 md:h-screen md:w-64 md:border-b-0 md:border-r md:p-5">
      <div className="mb-5 hidden md:block">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Internship Hub</h1>
        <p className="text-xs text-slate-500">Monitoring dashboard</p>
      </div>

      <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${baseItemClass} ${isActive ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`
          }
        >
          <BarChart3 className="h-4 w-4" />
          Dashboard
        </NavLink>

        <NavLink
          to="/internships"
          className={({ isActive }) =>
            `${baseItemClass} ${isActive ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`
          }
        >
          <Briefcase className="h-4 w-4" />
          Internships
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `${baseItemClass} ${isActive ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`
          }
        >
          <FileText className="h-4 w-4" />
          Progress Reports
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `${baseItemClass} ${isActive ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`
            }
          >
            <Shield className="h-4 w-4" />
            Admin
          </NavLink>
        )}
      </nav>
    </aside>
  );
}

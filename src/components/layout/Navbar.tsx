import { LogOut } from 'lucide-react';

interface NavbarProps {
  userName: string;
  onLogout: () => Promise<void> | void;
}

export default function Navbar({ userName, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 md:px-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900 md:text-2xl">Internship Monitoring System</h2>
          <p className="text-xs text-slate-500 md:text-sm">Track internships and progress reports in one place</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 md:inline">
            {userName}
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

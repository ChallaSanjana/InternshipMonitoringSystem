import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
export default function AppLayout() {
    const { user, signOut } = useAuth();
    return (<div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:h-screen md:overflow-hidden">
      <Sidebar role={user?.role}/>
      <div className="flex-1 md:ml-72 md:flex md:h-screen md:min-w-0 md:flex-col">
        <Navbar userName={user?.name || "User"} onLogout={signOut}/>
        <main className="p-4 md:flex-1 md:overflow-y-auto md:p-8">
          <Outlet />
        </main>
      </div>
    </div>);
}

import { useEffect, useMemo, useState } from 'react';
import { studentAPI } from '../lib/api';
import { authAPI } from '../lib/api';
import DashboardCards from '../components/dashboard/DashboardCards';
import { getInternshipTimeStatus } from '../utils/internshipStatus';
import { formatDisplayDate } from '../utils/dateFormat';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
export default function DashboardPage() {
    const { user } = useAuth();
    const [mentor, setMentor] = useState(null);
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [avatarError, setAvatarError] = useState(false);
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [internshipsResponse, currentUserResponse] = await Promise.all([
                    studentAPI.getMyInternships(),
                    authAPI.getCurrentUser()
                ]);
                setInternships(internshipsResponse.data.internships || []);
                const mentorData = currentUserResponse.data?.user?.mentorId;
                if (mentorData && typeof mentorData === 'object') {
                    setMentor({
                        name: mentorData.name,
                        email: mentorData.email,
                        department: mentorData.department
                    });
                }
                else {
                    setMentor(null);
                }
            }
            catch {
                setError('Failed to load dashboard data');
            }
            finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);
    const stats = useMemo(() => {
        const totalInternships = internships.length;
        const pendingInternships = internships.filter((item) => item.status === 'pending').length;
        const approvedInternships = internships.filter((item) => item.status === 'approved').length;
        const rejectedInternships = internships.filter((item) => item.status === 'rejected').length;
        const completedInternships = internships.filter((item) => item.status === 'completed').length;
        const approvedItems = internships.filter((item) => item.status === 'approved');
        const activeInternships = approvedItems.filter((item) => getInternshipTimeStatus(item.startDate, item.endDate) === 'active').length;
        return {
            totalInternships,
            pendingInternships,
            approvedInternships,
            rejectedInternships,
            activeInternships,
            completedInternships
        };
    }, [internships]);
    const today = useMemo(() => formatDisplayDate(new Date()), []);
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12)
            return 'Good morning';
        if (hour < 17)
            return 'Good afternoon';
        return 'Good evening';
    }, []);
    const avatarInitials = useMemo(() => {
        const name = user?.name?.trim();
        if (!name)
            return 'U';
        const parts = name.split(/\s+/).filter(Boolean);
        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }, [user?.name]);
    const avatarUrl = useMemo(() => {
        const name = encodeURIComponent(user?.name || 'Student');
        return `https://ui-avatars.com/api/?name=${name}&background=ffffff&color=3730a3&bold=true&size=128`;
    }, [user?.name]);
    if (loading) {
        return (<div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600"/>
      </div>);
    }
    if (error) {
        return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>;
    }
    return (<div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-6 text-white shadow-lg md:p-8">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/20 blur-2xl"/>
        <div className="absolute -bottom-16 left-12 h-40 w-40 rounded-full bg-cyan-200/30 blur-2xl"/>

        <div className="relative">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
              <Sparkles className="h-4 w-4"/>
              <span>Personal Dashboard</span>
            </div>

            <div className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/15 px-3 py-2">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white/60 bg-white text-sm font-black text-indigo-700 shadow">
                {!avatarError ? (<img src={avatarUrl} alt={`${user?.name || 'User'} avatar`} className="h-full w-full object-cover" onError={() => setAvatarError(true)}/>) : (<span>{avatarInitials}</span>)}
              </div>
              <div className="text-left">
                <p className="text-xs uppercase tracking-wide text-blue-100">Logged in as</p>
                <p className="text-sm font-semibold text-white">{user?.name || 'Student'}</p>
              </div>
            </div>
          </div>

          <p className="text-sm font-semibold text-cyan-100 md:text-base">{greeting}</p>

          <h1 className="text-3xl font-black tracking-tight md:text-5xl">
            Hi, {user?.name || 'Student'} 👋
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-blue-100 md:text-base">
            Welcome back to your Internship Dashboard
          </p>

          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-cyan-100 md:text-sm">
            {today}
          </p>
        </div>
      </section>

      <DashboardCards stats={stats}/>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Assigned Mentor</h3>

        {mentor ? (<div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{mentor.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 break-all">{mentor.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Department</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{mentor.department || '-'}</p>
              </div>
            </div>
          </div>) : (<p className="mt-3 text-sm text-slate-600">No mentor assigned yet</p>)}
      </section>

      <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        Internships must be approved before they become active.
      </p>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Overview</h3>
        <p className="mt-2 text-sm text-slate-600">
          You currently have {stats.totalInternships} internship{stats.totalInternships === 1 ? '' : 's'} tracked.
        </p>
      </section>
    </div>);
}

import { Briefcase, CheckCircle2, Clock3, Trophy } from 'lucide-react';

interface DashboardStats {
  totalInternships: number;
  pendingInternships: number;
  approvedInternships: number;
  completedInternships: number;
}

interface DashboardCardsProps {
  stats: DashboardStats;
}

function Card({
  title,
  value,
  icon,
  colorClass
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${colorClass}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card
        title="Total Internships"
        value={stats.totalInternships}
        icon={<Briefcase className="h-5 w-5 text-blue-700" />}
        colorClass="bg-blue-100"
      />
      <Card
        title="Pending Internships"
        value={stats.pendingInternships}
        icon={<Clock3 className="h-5 w-5 text-amber-700" />}
        colorClass="bg-amber-100"
      />
      <Card
        title="Approved Internships"
        value={stats.approvedInternships}
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-700" />}
        colorClass="bg-emerald-100"
      />
      <Card
        title="Completed Internships"
        value={stats.completedInternships}
        icon={<Trophy className="h-5 w-5 text-violet-700" />}
        colorClass="bg-violet-100"
      />
    </section>
  );
}

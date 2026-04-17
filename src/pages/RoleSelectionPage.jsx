import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield, Users } from "lucide-react";
const roleOptions = [
    {
        key: "student",
        label: "Student",
        description: "Track your internships and submit progress reports.",
        icon: GraduationCap,
        styles: "from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700",
    },
    {
        key: "mentor",
        label: "Mentor",
        description: "Review student updates and monitor internship progress.",
        icon: Users,
        styles: "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700",
    },
    {
        key: "admin",
        label: "Admin",
        description: "Manage users, internships, and platform oversight.",
        icon: Shield,
        styles: "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
    },
];
export default function RoleSelectionPage() {
    const navigate = useNavigate();
    return (<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Choose your role
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Select how you want to sign in to the Internship Monitoring System.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {roleOptions.map((role) => {
            const Icon = role.icon;
            return (<button key={role.key} type="button" onClick={() => navigate(`/login/${role.key}`)} className={`group rounded-xl bg-gradient-to-br ${role.styles} p-6 text-left text-white shadow-lg transition duration-200 hover:-translate-y-1`}>
                <div className="mb-4 inline-flex rounded-lg bg-white/20 p-2">
                  <Icon className="h-6 w-6"/>
                </div>
                <h2 className="text-2xl font-semibold">{role.label}</h2>
                <p className="mt-2 text-sm text-white/90">{role.description}</p>
              </button>);
        })}
        </div>
      </div>
    </div>);
}

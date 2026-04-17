import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserPlus, AlertCircle } from "lucide-react";
export default function Signup({ onToggleMode }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [department, setDepartment] = useState("");
    const [semester, setSemester] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await signUp(name, email, password, role, department || undefined, semester ? Number(semester) : undefined);
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to sign up";
            setError(errorMsg);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="flex min-h-screen flex-col bg-slate-100 dark:bg-slate-950 lg:flex-row">
      <section className="auth-gradient-animate relative hidden flex-1 overflow-hidden bg-gradient-to-br from-cyan-700 via-sky-600 to-blue-700 lg:flex">
        <div className="auth-orb-float-slow absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/15 blur-3xl"/>
        <div className="auth-orb-float absolute -bottom-24 right-4 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl"/>
        <div className="relative z-10 flex h-full w-full flex-col justify-center px-12 py-16 text-white xl:px-20">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <UserPlus className="h-9 w-9"/>
          </div>
          <h2 className="max-w-md text-4xl font-bold leading-tight">
            Build Your Internship Journey
          </h2>
          <p className="mt-4 max-w-md text-base text-cyan-100/90">
            Create your account and keep your internship milestones, feedback, and reports organized from day one.
          </p>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="auth-form-entrance max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-blue-600 p-3">
              <UserPlus className="h-8 w-8 text-white"/>
            </div>
          </div>
          <h2 className="mb-2 text-center text-3xl font-bold text-gray-800 dark:text-slate-100">
            Create Account
          </h2>
          <p className="mb-8 text-center text-gray-600 dark:text-slate-400">
            Join our internship tracker
          </p>

          {error && (<div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0"/>
              <span>{error}</span>
            </div>)}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Full Name
              </label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800" placeholder="John Doe"/>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Email Address
              </label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800" placeholder="you@example.com"/>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Password
              </label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800" placeholder="At least 6 characters"/>
            </div>

            <div>
              <label htmlFor="role" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Role
              </label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800">
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {role === "student" && (<>
                <div>
                  <label htmlFor="department" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Department (Optional)
                  </label>
                  <input id="department" type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800" placeholder="e.g., Computer Science"/>
                </div>

                <div>
                  <label htmlFor="semester" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Semester (Optional)
                  </label>
                  <input id="semester" type="number" value={semester} onChange={(e) => setSemester(e.target.value ? parseInt(e.target.value) : "")} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800" placeholder="e.g., 5" min="1" max="8"/>
                </div>
              </>)}

            <button type="submit" disabled={loading} className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition duration-200 hover:bg-blue-700 disabled:bg-gray-400">
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 dark:text-slate-400">
            Already have an account?{" "}
            <button onClick={onToggleMode} className="font-semibold text-blue-600 hover:text-blue-700">
              Sign in
            </button>
          </p>
        </div>
      </section>
    </div>);
}

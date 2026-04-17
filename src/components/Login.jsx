import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
export default function Login({ onToggleMode, role }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!role) {
            setError("Please choose a role before signing in");
            return;
        }
        setLoading(true);
        try {
            await signIn(email, password, role);
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to sign in";
            setError(errorMsg);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="flex min-h-screen flex-col bg-slate-100 dark:bg-slate-950 lg:flex-row">
      <section className="auth-gradient-animate relative hidden flex-1 overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 lg:flex">
        <div className="auth-orb-float-slow absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"/>
        <div className="auth-orb-float absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl"/>
        <div className="relative z-10 flex h-full w-full flex-col justify-center px-12 py-16 text-white xl:px-20">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <LogIn className="h-9 w-9"/>
          </div>
          <h2 className="max-w-md text-4xl font-bold leading-tight">
            Internship Progress, Simplified
          </h2>
          <p className="mt-4 max-w-md text-base text-blue-100/90">
            Track reports, mentor reviews, and approvals in one place with a focused workflow for every role.
          </p>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="auth-form-entrance w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-blue-600 p-3">
              <LogIn className="h-8 w-8 text-white"/>
            </div>
          </div>
          <h2 className="mb-2 text-center text-3xl font-bold text-gray-800 dark:text-slate-100">
            {roleLabel ? `${roleLabel} Login` : "Welcome Back"}
          </h2>
          <p className="mb-8 text-center text-gray-600 dark:text-slate-400">
            {roleLabel
            ? `Sign in as ${roleLabel.toLowerCase()} to continue`
            : "Sign in to your internship tracker"}
          </p>

          {error && (<div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0"/>
              <span>{error}</span>
            </div>)}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Email Address
              </label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800" placeholder="you@example.com"/>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800" placeholder="Enter your password"/>
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? (<Eye className="h-5 w-5"/>) : (<EyeOff className="h-5 w-5"/>)}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition duration-200 hover:bg-blue-700 disabled:bg-gray-400">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 dark:text-slate-400">
            Don't have an account?{" "}
            <button onClick={onToggleMode} className="font-semibold text-blue-600 hover:text-blue-700">
              Sign up
            </button>
          </p>
        </div>
      </section>
    </div>);
}

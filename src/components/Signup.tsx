import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserPlus, AlertCircle } from "lucide-react";

interface SignupProps {
  onToggleMode: () => void;
}

export default function Signup({ onToggleMode }: SignupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "admin">("student");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState<number | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp(
        name,
        email,
        password,
        role,
        department || undefined,
        semester ? Number(semester) : undefined,
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to sign up";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-slate-100 to-indigo-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mb-2 text-center text-3xl font-bold text-gray-800 dark:text-slate-100">
          Create Account
        </h2>
        <p className="mb-8 text-center text-gray-600 dark:text-slate-400">
          Join our internship tracker
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "student" | "admin")}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {role === "student" && (
            <>
              <div>
                <label
                  htmlFor="department"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Department (Optional)
                </label>
                <input
                  id="department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label
                  htmlFor="semester"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Semester (Optional)
                </label>
                <input
                  id="semester"
                  type="number"
                  value={semester}
                  onChange={(e) =>
                    setSemester(e.target.value ? parseInt(e.target.value) : "")
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                  placeholder="e.g., 5"
                  min="1"
                  max="8"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200 mt-6"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-slate-400">
          Already have an account?{" "}
          <button
            onClick={onToggleMode}
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

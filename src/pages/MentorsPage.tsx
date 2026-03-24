import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import { formatDisplayDate } from '../utils/dateFormat';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  department?: string;
  createdAt?: string;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [showMentors, setShowMentors] = useState(false);
  const [editingMentorId, setEditingMentorId] = useState('');
  const [editingMentorForm, setEditingMentorForm] = useState({
    name: '',
    email: '',
    department: ''
  });
  const [mentorForm, setMentorForm] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [mentorSubmitting, setMentorSubmitting] = useState(false);
  const [mentorUpdating, setMentorUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllMentors();
      setMentors(response.data.mentors || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccess('');
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [success]);

  const handleMentorInputChange = (field: keyof typeof mentorForm, value: string) => {
    setMentorForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddMentor = async () => {
    const payload = {
      name: mentorForm.name.trim(),
      email: mentorForm.email.trim(),
      password: mentorForm.password,
      department: mentorForm.department.trim()
    };

    if (!payload.name || !payload.email || !payload.password) {
      setError('Please enter mentor name, email and password');
      return;
    }

    if (payload.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setMentorSubmitting(true);
      const response = await adminAPI.addMentor(payload);
      setMentors((prev) => [response.data.mentor, ...prev]);
      setMentorForm({ name: '', email: '', password: '', department: '' });
      setSuccess('Mentor added successfully');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add mentor');
    } finally {
      setMentorSubmitting(false);
    }
  };

  const handleStartEditMentor = (mentor: Mentor) => {
    setEditingMentorId(mentor._id);
    setEditingMentorForm({
      name: mentor.name,
      email: mentor.email,
      department: mentor.department || ''
    });
    setError('');
  };

  const handleCancelEditMentor = () => {
    setEditingMentorId('');
    setEditingMentorForm({ name: '', email: '', department: '' });
  };

  const handleEditMentorInputChange = (
    field: keyof typeof editingMentorForm,
    value: string
  ) => {
    setEditingMentorForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveMentor = async (mentorId: string) => {
    const payload = {
      name: editingMentorForm.name.trim(),
      email: editingMentorForm.email.trim(),
      department: editingMentorForm.department.trim()
    };

    if (!payload.name || !payload.email) {
      setError('Please enter mentor name and email');
      return;
    }

    try {
      setMentorUpdating(true);
      const response = await adminAPI.updateMentor(mentorId, payload);
      setMentors((prev) =>
        prev.map((mentor) => (mentor._id === mentorId ? response.data.mentor : mentor))
      );
      setSuccess('Mentor updated successfully');
      setError('');
      handleCancelEditMentor();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update mentor');
    } finally {
      setMentorUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Mentors</h2>
        <p className="text-sm text-slate-600">Create and manage mentor accounts.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          {success}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-8">
          <div>
            <h3 className="text-base font-bold text-slate-900">Add Mentor</h3>
            <p className="mt-1 text-xs text-slate-500">Only admins can create mentor accounts.</p>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={mentorForm.name}
                onChange={(e) => handleMentorInputChange('name', e.target.value)}
                placeholder="Mentor name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <input
                type="email"
                value={mentorForm.email}
                onChange={(e) => handleMentorInputChange('email', e.target.value)}
                placeholder="Mentor email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <input
                type="password"
                value={mentorForm.password}
                onChange={(e) => handleMentorInputChange('password', e.target.value)}
                placeholder="Temporary password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <input
                type="text"
                value={mentorForm.department}
                onChange={(e) => handleMentorInputChange('department', e.target.value)}
                placeholder="Department (optional)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

              <button
                onClick={handleAddMentor}
                disabled={mentorSubmitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {mentorSubmitting ? 'Adding Mentor...' : 'Add Mentor'}
              </button>
            </div>
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Mentor List</h3>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {mentors.length}
                </span>
                <button
                  type="button"
                  onClick={() => setShowMentors((prev) => !prev)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {showMentors ? 'Hide Mentors' : 'Show Mentors'}
                </button>
              </div>
            </div>

            {showMentors && (
              <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border border-slate-200">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Department</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Created</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mentors.map((mentor) => (
                      <tr key={mentor._id}>
                        <td className="px-3 py-2 text-sm text-slate-800">
                          {editingMentorId === mentor._id ? (
                            <input
                              type="text"
                              value={editingMentorForm.name}
                              onChange={(e) => handleEditMentorInputChange('name', e.target.value)}
                              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                          ) : (
                            mentor.name
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600">
                          {editingMentorId === mentor._id ? (
                            <input
                              type="email"
                              value={editingMentorForm.email}
                              onChange={(e) => handleEditMentorInputChange('email', e.target.value)}
                              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                          ) : (
                            mentor.email
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600">
                          {editingMentorId === mentor._id ? (
                            <input
                              type="text"
                              value={editingMentorForm.department}
                              onChange={(e) => handleEditMentorInputChange('department', e.target.value)}
                              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                          ) : (
                            mentor.department || '-'
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600">{mentor.createdAt ? formatDisplayDate(mentor.createdAt) : '-'}</td>
                        <td className="px-3 py-2 text-sm text-slate-600">
                          {editingMentorId === mentor._id ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveMentor(mentor._id)}
                                disabled={mentorUpdating}
                                className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                              >
                                {mentorUpdating ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEditMentor}
                                disabled={mentorUpdating}
                                className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartEditMentor(mentor)}
                              className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!loading && mentors.length === 0 && (
                      <tr>
                        <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={5}>No mentors added yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../lib/api';
import { LogOut, Users, Briefcase, FileText, CheckCircle, Clock } from 'lucide-react';
import { type DateBasedStatus, getDateBasedStatus, getStatusBadgeClass, getStatusLabel } from '../utils/internshipStatus';

interface Student {
  _id: string;
  name: string;
  email: string;
  department?: string;
  semester?: number;
}

interface Internship {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  companyName: string;
  role?: string;
  position?: string;
  status: 'pending' | 'approved' | 'rejected';
  startDate: string;
  endDate: string;
}

interface Report {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  internshipId: {
    _id: string;
    companyName: string;
    role?: string;
    position?: string;
  };
  date: string;
  description: string;
  hoursWorked: number;
  status?: 'submitted' | 'reviewed' | 'feedback_given';
  adminFeedback?: string;
}

interface DashboardStats {
  totalStudents: number;
  totalInternships: number;
  pendingInternships: number;
  approvedInternships: number;
  totalReports: number;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [tabs, setTabs] = useState<'overview' | 'students' | 'internships' | 'reports'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbackModal, setFeedbackModal] = useState<{ internshipId?: string; reportId?: string; open: boolean }>({ open: false });
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (tabs === 'students') fetchStudents();
    else if (tabs === 'internships') fetchInternships();
    else if (tabs === 'reports') fetchReports();
  }, [tabs]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.stats);
      setError('');
    } catch (err) {
      setError('Failed to fetch stats');
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllStudents();
      setStudents(response.data.students);
      setError('');
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllInternships();
      setInternships(response.data.internships);
      setError('');
    } catch (err) {
      setError('Failed to fetch internships');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllReports();
      setReports(response.data.reports);
      setError('');
    } catch (err) {
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveInternship = async (internshipId: string, feedback: string = '') => {
    try {
      await adminAPI.approveInternship(internshipId, feedback);
      fetchInternships();
      setFeedbackModal({ open: false });
      setFeedbackText('');
    } catch (err) {
      setError('Failed to approve internship');
    }
  };

  const handleRejectInternship = async (internshipId: string) => {
    try {
      await adminAPI.rejectInternship(internshipId, feedbackText || 'Application rejected');
      fetchInternships();
      setFeedbackModal({ open: false });
      setFeedbackText('');
    } catch (err) {
      setError('Failed to reject internship');
    }
  };

  const handleGiveFeedback = async (reportId: string) => {
    try {
      await adminAPI.feedbackOnReport(reportId, feedbackText);
      fetchReports();
      setFeedbackModal({ open: false });
      setFeedbackText('');
    } catch (err) {
      setError('Failed to give feedback');
    }
  };

  const getStatusIcon = (status: DateBasedStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-violet-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            {(['overview', 'students', 'internships', 'reports'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTabs(tab)}
                className={`px-6 py-3 font-semibold border-b-2 transition capitalize ${
                  tabs === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {tabs === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Students</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalStudents}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Internships</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalInternships}</p>
                </div>
                <Briefcase className="w-12 h-12 text-indigo-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingInternships}</p>
                </div>
                <Briefcase className="w-12 h-12 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Approved</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.approvedInternships}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Reports</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalReports}</p>
                </div>
                <FileText className="w-12 h-12 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {tabs === 'students' && (
          <div>
            {loading && <p className="text-center text-gray-600">Loading...</p>}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Semester</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map(student => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.department || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.semester || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Internships Tab */}
        {tabs === 'internships' && (
          <div>
            {loading && <p className="text-center text-gray-600">Loading...</p>}
            <div className="space-y-4">
              {internships.map(internship => {
                const derivedStatus = getDateBasedStatus(internship.startDate, internship.endDate);

                return (
                <div key={internship._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{internship.companyName}</h3>
                      <p className="text-gray-600">{internship.role || internship.position}</p>
                      <p className="text-sm text-gray-500 mt-1">By: {internship.studentId.name} ({internship.studentId.email})</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(derivedStatus)}
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeClass(derivedStatus)}`}>
                        {getStatusLabel(derivedStatus)}
                      </span>
                    </div>
                  </div>

                  {derivedStatus === 'pending' && (
                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={() => handleApproveInternship(internship._id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setFeedbackModal({ internshipId: internship._id, open: true })}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {tabs === 'reports' && (
          <div>
            {loading && <p className="text-center text-gray-600">Loading...</p>}
            <div className="space-y-4">
              {reports.map(report => (
                <div key={report._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{new Date(report.date).toLocaleDateString()}</h3>
                      <p className="text-sm text-gray-600 mt-1">By: {report.studentId.name} ({report.studentId.email})</p>
                      <p className="text-sm text-gray-600">Internship: {report.internshipId.companyName} - {report.internshipId.role || report.internshipId.position}</p>
                      <p className="text-sm text-gray-700 mt-2">{report.description}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                      {report.hoursWorked} hours
                    </span>
                  </div>

                  {!report.adminFeedback && (
                    <button
                      onClick={() => setFeedbackModal({ reportId: report._id, open: true })}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Give Feedback
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Feedback Modal */}
      {feedbackModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {feedbackModal.internshipId ? 'Internship Feedback' : 'Report Feedback'}
              </h2>
            </div>

            <div className="p-6">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your feedback..."
              />

              <div className="flex gap-4 justify-end mt-6">
                <button
                  onClick={() => setFeedbackModal({ open: false })}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                {feedbackModal.internshipId ? (
                  <>
                    <button
                      onClick={() => handleApproveInternship(feedbackModal.internshipId!, feedbackText)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectInternship(feedbackModal.internshipId!)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleGiveFeedback(feedbackModal.reportId!)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Send Feedback
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

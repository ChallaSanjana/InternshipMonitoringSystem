import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { studentAPI } from '../lib/api';
import { LogOut, Plus, FileText, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react';
import AddInternship from './AddInternship';
import AddReport from './AddReport';
import {
  getInternshipDisplayStatus,
  getInternshipDisplayStatusBadgeClass,
  getInternshipDisplayStatusLabel,
  type InternshipDisplayStatus
} from '../utils/internshipStatus';
import { formatDisplayDate } from '../utils/dateFormat';

interface Internship {
  _id: string;
  companyName: string;
  role?: string;
  position?: string;
  mode?: 'online' | 'offline' | 'hybrid';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Report {
  _id: string;
  internshipId: string;
  date: string;
  description: string;
  hoursWorked: number;
  adminFeedback?: string;
  createdAt: string;
}

export default function StudentDashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<'internships' | 'reports'>('internships');
  const [internships, setInternships] = useState<Internship[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddInternship, setShowAddInternship] = useState(false);
  const [showAddReport, setShowAddReport] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<string | null>(null);
  const [reportsFilterInternshipId, setReportsFilterInternshipId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const selectedInternshipDetails = internships.find((item) => item._id === selectedInternship);

  useEffect(() => {
    fetchInternships();
  }, []);

  useEffect(() => {
    if (internships.length > 0 && !reportsFilterInternshipId) {
      setReportsFilterInternshipId(internships[0]._id);
    }
  }, [internships, reportsFilterInternshipId]);

  useEffect(() => {
    if (tab === 'reports' && reportsFilterInternshipId) {
      fetchReports(reportsFilterInternshipId);
    }
  }, [tab, reportsFilterInternshipId]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMyInternships();
      setInternships(response.data.internships);
      setError('');
    } catch (err) {
      setError('Failed to fetch internships');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (internshipId: string) => {
    try {
      setLoading(true);
      const response = await studentAPI.getReportsByInternship(internshipId);
      setReports(response.data.reports);
      setError('');
    } catch (err) {
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Delete this report?')) {
      return;
    }

    try {
      await studentAPI.deleteReport(reportId);
      setReports((prev) => prev.filter((report) => report._id !== reportId));
      setError('');
    } catch {
      setError('Failed to delete report');
    }
  };

  const getStatusIcon = (status: InternshipDisplayStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
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
            <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
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
        {success && (
          <div className="fixed right-4 top-20 z-50 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setTab('internships')}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                tab === 'internships'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              My Internships
            </button>
            <button
              onClick={() => setTab('reports')}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                tab === 'reports'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Progress Reports
            </button>
          </div>
        </div>

        {/* Internships Tab */}
        {tab === 'internships' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setShowAddInternship(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                <Plus className="w-5 h-5" />
                Add Internship
              </button>
            </div>

            {showAddInternship && (
              <AddInternship
                onClose={() => setShowAddInternship(false)}
                onSuccess={() => {
                  fetchInternships();
                  setShowAddInternship(false);
                }}
              />
            )}

            {loading && <p className="text-center text-gray-600">Loading...</p>}

            {!loading && internships.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No internships added yet</p>
                <p className="text-gray-500">Click "Add Internship" to get started</p>
              </div>
            )}

            <div className="grid gap-6">
              {internships.map((internship) => {
                const displayStatus = getInternshipDisplayStatus(internship.status, internship.startDate, internship.endDate);

                return (
                <div key={internship._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{internship.companyName}</h3>
                      <p className="text-gray-600">{internship.role || internship.position}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(displayStatus)}
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getInternshipDisplayStatusBadgeClass(displayStatus)}`}>
                        {getInternshipDisplayStatusLabel(displayStatus)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="text-gray-800 font-semibold">{formatDisplayDate(internship.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">End Date</p>
                      <p className="text-gray-800 font-semibold">{formatDisplayDate(internship.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Mode</p>
                      <p className="text-gray-800 font-semibold capitalize">{internship.mode || '-'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedInternship(internship._id);
                      setShowAddReport(true);
                    }}
                    className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    <FileText className="w-4 h-4" />
                    Add Report
                  </button>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {tab === 'reports' && (
          <div>
            {showAddReport && selectedInternship && (
              <AddReport
                internshipId={selectedInternship}
                internshipStartDate={selectedInternshipDetails?.startDate}
                internshipEndDate={selectedInternshipDetails?.endDate}
                onClose={() => {
                  setShowAddReport(false);
                  setSelectedInternship(null);
                }}
                onSuccess={() => {
                  const internshipId = selectedInternship || reportsFilterInternshipId;
                  if (internshipId) {
                    fetchReports(internshipId);
                  }
                  if (selectedInternship) {
                    setReportsFilterInternshipId(selectedInternship);
                  }
                  setSuccess('Progress report submitted successfully');
                  setTimeout(() => setSuccess(''), 2500);
                  setShowAddReport(false);
                  setSelectedInternship(null);
                }}
              />
            )}

            {internships.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Internship</label>
                <select
                  value={reportsFilterInternshipId}
                  onChange={(e) => setReportsFilterInternshipId(e.target.value)}
                  className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {internships.map((internship) => (
                    <option key={internship._id} value={internship._id}>
                      {internship.companyName} - {internship.role || internship.position}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {loading && <p className="text-center text-gray-600">Loading...</p>}

            {!loading && reports.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No reports submitted yet</p>
              </div>
            )}

            <div className="grid gap-6">
              {reports.map((report) => (
                <div key={report._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{formatDisplayDate(report.date)}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                        {report.hoursWorked} hours
                      </span>
                      <button
                        onClick={() => handleDeleteReport(report._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-2">{report.description}</p>
                  <p className="text-gray-500 text-sm mb-4">Submitted on {formatDisplayDate(report.createdAt)}</p>

                  {report.adminFeedback && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-4">
                      <p className="text-sm text-gray-600">Admin Feedback:</p>
                      <p className="text-gray-800 mt-1">{report.adminFeedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Users, Briefcase, FileText, Trash2 } from 'lucide-react';
import { adminAPI, getFilePreviewUrl } from '../lib/api';
import { formatDisplayDate } from '../utils/dateFormat';
import { Link, useLocation } from 'react-router-dom';
import ProgressBar from './common/ProgressBar';

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
    department?: string;
  };
  companyName: string;
  role?: string;
  position?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'expired';
  startDate: string;
  endDate: string;
  progress?: number;
  files?: {
    _id: string;
    fileName: string;
    fileUrl: string;
    fileType: 'offer_letter' | 'report' | 'certificate';
    createdAt: string;
  }[];
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

export default function AdminDashboard() {
  const location = useLocation();
  const [students, setStudents] = useState<Student[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [internshipSearchQuery, setInternshipSearchQuery] = useState('');
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [studentsRes, internshipsRes, reportsRes] = await Promise.all([
        adminAPI.getAllStudents(),
        adminAPI.getAllInternships(),
        adminAPI.getAllReports()
      ]);

      setStudents(studentsRes.data.students || []);
      setInternships(internshipsRes.data.internships || []);
      setReports(reportsRes.data.reports || []);
      setError('');
    } catch {
      setError('Failed to load admin panel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const currentSection: 'overview' | 'students' | 'internships' | 'reports' =
    location.pathname === '/admin/students'
      ? 'students'
      : location.pathname === '/admin/internships'
        ? 'internships'
        : location.pathname === '/admin/reports'
          ? 'reports'
          : 'overview';

  const stats = useMemo(() => {
    const pending = internships.filter((item) => item.status === 'pending').length;
    const approved = internships.filter((item) => item.status === 'approved').length;
    const rejected = internships.filter((item) => item.status === 'rejected').length;
    const completed = internships.filter((item) => item.status === 'completed').length;
    const expired = internships.filter((item) => item.status === 'expired').length;

    return {
      totalStudents: students.length,
      totalInternships: internships.length,
      pendingInternships: pending,
      approvedInternships: approved,
      rejectedInternships: rejected,
      completedInternships: completed,
      expiredInternships: expired,
      totalReports: reports.length
    };
  }, [internships, reports, students]);

  const filteredInternships = useMemo(() => {
    const query = internshipSearchQuery.trim().toLowerCase();

    if (!query) {
      return internships;
    }

    return internships.filter((internship) => {
      const studentName = internship.studentId?.name?.toLowerCase() || '';
      const companyName = internship.companyName?.toLowerCase() || '';
      const department = internship.studentId?.department?.toLowerCase() || '';

      return (
        studentName.includes(query) ||
        companyName.includes(query) ||
        department.includes(query)
      );
    });
  }, [internshipSearchQuery, internships]);

  const handleUpdateInternshipStatus = async (internshipId: string, status: 'approved' | 'rejected') => {
    try {
      await adminAPI.updateInternshipStatus(internshipId, status);
      await fetchAllData();
      setSuccess(`Internship ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setTimeout(() => setSuccess(''), 5000);
      setError('');
    } catch {
      setError('Failed to update internship status');
    }
  };

  const handleFeedbackChange = (reportId: string, value: string) => {
    setFeedbackInputs((prev) => ({ ...prev, [reportId]: value }));
  };

  const handleReportFeedbackSubmit = async (reportId: string) => {
    const feedback = (feedbackInputs[reportId] || '').trim();

    if (!feedback) {
      setError('Please enter feedback before submitting');
      return;
    }

    try {
      const response = await adminAPI.updateReportFeedback(reportId, feedback);
      const updatedReport = response.data.report;
      setReports((prev) => prev.map((item) => (item._id === reportId ? { ...item, adminFeedback: updatedReport.adminFeedback } : item)));
      setFeedbackInputs((prev) => ({ ...prev, [reportId]: '' }));
      setSuccess('Feedback submitted successfully');
      setTimeout(() => setSuccess(''), 5000);
      setError('');
    } catch {
      setError('Failed to submit report feedback');
    }
  };

  const handleDeleteReportFeedback = async (reportId: string) => {
    try {
      await adminAPI.deleteReportFeedback(reportId);
      setReports((prev) => prev.map((item) => (item._id === reportId ? { ...item, adminFeedback: '' } : item)));
      setSuccess('Feedback deleted successfully');
      setTimeout(() => setSuccess(''), 5000);
      setError('');
    } catch {
      setError('Failed to delete report feedback');
    }
  };

  const getInternshipStatusBadgeClass = (status: Internship['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'rejected':
        return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'completed':
        return 'bg-violet-100 text-violet-700 border-violet-300';
      case 'expired':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-300';
    }
  };

  const getInternshipStatusLabel = (status: Internship['status']) => {
    if (status === 'completed') {
      return 'Completed';
    }

    if (status === 'expired') {
      return 'Expired';
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {currentSection === 'overview' && 'Admin Dashboard'}
            {currentSection === 'students' && 'Students'}
            {currentSection === 'internships' && 'Internships'}
            {currentSection === 'reports' && 'Reports'}
          </h2>
          <p className="text-sm text-slate-600">
            {currentSection === 'overview' && 'Overview of your internship monitoring system.'}
            {currentSection === 'students' && 'Manage student records in your system.'}
            {currentSection === 'internships' && 'Review and update internship statuses.'}
            {currentSection === 'reports' && 'Review progress reports and provide feedback.'}
          </p>
        </div>
        <button
          onClick={fetchAllData}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <main className="space-y-6">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        )}
        {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">{success}</div>}

        {currentSection === 'overview' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Students</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalStudents}</p>
                </div>
                <Users className="h-9 w-9 text-blue-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Internships</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalInternships}</p>
                </div>
                <Briefcase className="h-9 w-9 text-indigo-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
                  <p className="mt-2 text-3xl font-bold text-amber-700">{stats.pendingInternships}</p>
                </div>
                <Briefcase className="h-9 w-9 text-amber-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Approved</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-700">{stats.approvedInternships}</p>
                </div>
                <Briefcase className="h-9 w-9 text-emerald-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rejected</p>
                  <p className="mt-2 text-3xl font-bold text-rose-700">{stats.rejectedInternships}</p>
                </div>
                <Briefcase className="h-9 w-9 text-rose-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</p>
                  <p className="mt-2 text-3xl font-bold text-violet-700">{stats.completedInternships}</p>
                </div>
                <Briefcase className="h-9 w-9 text-violet-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Expired</p>
                  <p className="mt-2 text-3xl font-bold text-slate-700">{stats.expiredInternships}</p>
                </div>
                <Briefcase className="h-9 w-9 text-slate-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reports</p>
                  <p className="mt-2 text-3xl font-bold text-violet-700">{stats.totalReports}</p>
                </div>
                <FileText className="h-9 w-9 text-violet-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-3 xl:col-span-8">
              <p className="text-sm text-slate-700">
                You are managing {stats.totalStudents} student{stats.totalStudents === 1 ? '' : 's'} and {stats.totalInternships} internship{stats.totalInternships === 1 ? '' : 's'}.
              </p>
            </div>
          </div>
        )}

        {currentSection === 'students' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Department</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Semester</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td className="px-5 py-4 text-sm font-medium text-slate-800">{student.name}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{student.email}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{student.department || '-'}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{student.semester || '-'}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        <Link
                          to={`/admin/students/${student._id}`}
                          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!loading && students.length === 0 && (
                    <tr>
                      <td className="px-5 py-8 text-center text-sm text-slate-500" colSpan={5}>No students found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentSection === 'internships' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <input
                type="text"
                value={internshipSearchQuery}
                onChange={(e) => setInternshipSearchQuery(e.target.value)}
                placeholder="Search by student name, company, or department"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 md:max-w-md"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Student</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Company</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Role</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Dates</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Progress</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Proof Files</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInternships.map((internship) => (
                    <tr key={internship._id}>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        <p className="font-semibold text-slate-800">{internship.studentId?.name || '-'}</p>
                        <p className="text-xs text-slate-500">{internship.studentId?.email || '-'}</p>
                        <p className="text-xs text-slate-500">{internship.studentId?.department || '-'}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">{internship.companyName}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{internship.role || internship.position || '-'}</td>
                      <td className="px-5 py-4 align-middle text-sm text-slate-700">
                        <span className="inline-flex items-center whitespace-nowrap font-medium tabular-nums">
                          {formatDisplayDate(internship.startDate)} – {formatDisplayDate(internship.endDate)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {internship.status === 'approved' && (
                          <ProgressBar progress={internship.progress || 0} showPercentage={true} size="small" />
                        )}
                        {internship.status === 'completed' && (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-violet-200">
                              <div className="h-full bg-violet-500" style={{ width: '100%' }} />
                            </div>
                            <span className="whitespace-nowrap text-xs font-semibold text-violet-700">Completed</span>
                          </div>
                        )}
                        {internship.status === 'rejected' && (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-rose-200">
                              <div className="h-full bg-rose-500" style={{ width: '0%' }} />
                            </div>
                            <span className="whitespace-nowrap text-xs font-semibold text-rose-700">Rejected</span>
                          </div>
                        )}
                        {internship.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
                              <div className="h-full bg-slate-400" style={{ width: '0%' }} />
                            </div>
                            <span className="whitespace-nowrap text-xs font-semibold text-slate-600">Pending Approval</span>
                          </div>
                        )}
                        {internship.status === 'expired' && (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
                              <div className="h-full bg-slate-500" style={{ width: '0%' }} />
                            </div>
                            <span className="whitespace-nowrap text-xs font-semibold text-slate-700">Expired</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {(internship.files || []).length === 0 ? (
                          <span className="text-xs text-slate-500">No files</span>
                        ) : (
                          <div className="space-y-1">
                            {(internship.files || []).map((file) => (
                              <a
                                key={file._id}
                                href={getFilePreviewUrl(file.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block max-w-56 truncate text-xs font-semibold text-blue-700 underline-offset-2 hover:underline"
                                title={file.fileName}
                              >
                                {file.fileName}
                              </a>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getInternshipStatusBadgeClass(internship.status)}`}>
                          {getInternshipStatusLabel(internship.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateInternshipStatus(internship._id, 'approved')}
                            disabled={internship.status === 'approved' || internship.status === 'completed' || internship.status === 'expired'}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateInternshipStatus(internship._id, 'rejected')}
                            disabled={internship.status === 'rejected' || internship.status === 'completed' || internship.status === 'expired'}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredInternships.length === 0 && (
                    <tr>
                      <td className="px-5 py-8 text-center text-sm text-slate-500" colSpan={8}>
                        {internshipSearchQuery.trim() ? 'No matching internships found.' : 'No internships found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentSection === 'reports' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Student</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Internship</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Hours</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Description</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td className="px-5 py-4 text-sm text-slate-700">{formatDisplayDate(report.date)}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        <p className="font-semibold text-slate-800">{report.studentId?.name || '-'}</p>
                        <p className="text-xs text-slate-500">{report.studentId?.email || '-'}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {report.internshipId?.companyName || '-'}
                        <p className="text-xs text-slate-500">{report.internshipId?.role || report.internshipId?.position || '-'}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">{report.hoursWorked}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{report.description}</td>
                      <td className="px-5 py-4 text-sm">
                        <div className="space-y-2">
                          {report.adminFeedback && (
                            <div className="flex items-start justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                              <p className="text-xs text-blue-700">{report.adminFeedback}</p>
                              <button
                                onClick={() => handleDeleteReportFeedback(report._id)}
                                title="Delete feedback"
                                className="rounded-md p-1 text-rose-600 transition hover:bg-rose-100 hover:text-rose-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={feedbackInputs[report._id] || ''}
                              onChange={(e) => handleFeedbackChange(report._id, e.target.value)}
                              placeholder="Add feedback"
                              className="w-52 rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                            <button
                              onClick={() => handleReportFeedbackSubmit(report._id)}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && reports.length === 0 && (
                    <tr>
                      <td className="px-5 py-8 text-center text-sm text-slate-500" colSpan={6}>No reports found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { mentorAPI } from '../lib/api';
import { formatDisplayDate } from '../utils/dateFormat';
import { Loader2, Users } from 'lucide-react';

interface InternshipSummary {
  _id: string;
  companyName: string;
  role?: string;
  position?: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'expired';
  progress: number;
}

interface AssignedStudent {
  _id: string;
  name: string;
  email: string;
  internships: InternshipSummary[];
}

interface StudentDetails {
  student: {
    _id: string;
    name: string;
    email: string;
    department?: string;
    semester?: number;
    phoneNumber?: string;
    collegeName?: string;
    linkedin?: string;
    github?: string;
    about?: string;
    profileImage?: string;
    createdAt?: string;
  };
  internships: InternshipSummary[];
  reports: {
    _id: string;
    internshipId?: {
      _id: string;
      companyName: string;
      role?: string;
      position?: string;
    };
    date: string;
    description: string;
    hoursWorked: number;
  }[];
}

const getStatusClass = (status: InternshipSummary['status']) => {
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

const getStatusLabel = (status: InternshipSummary['status']) => {
  if (status === 'completed') return 'Completed';
  if (status === 'expired') return 'Expired';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getInternshipSortPriority = (internship: InternshipSummary) => {
  const now = Date.now();
  const start = new Date(internship.startDate).getTime();
  const end = new Date(internship.endDate).getTime();
  const isActiveApproved = internship.status === 'approved' && start <= now && end >= now;

  if (isActiveApproved) return 0;
  if (internship.status === 'approved') return 1;
  if (internship.status === 'pending') return 2;
  if (internship.status === 'completed') return 3;
  if (internship.status === 'expired') return 4;
  if (internship.status === 'rejected') return 5;

  return 6;
};

const shouldShowProgress = (internship: InternshipSummary) => {
  if (internship.status !== 'approved') {
    return false;
  }

  return true;
};

export default function MentorDashboardPage() {
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<StudentDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssignedStudents = async () => {
      try {
        setLoading(true);
        const studentsResponse = await mentorAPI.getAssignedStudents();
        setStudents(studentsResponse.data.students || []);
        setError('');
      } catch {
        setError('Failed to load assigned students');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedStudents();
  }, []);

  const rows = useMemo(() => {
    return students.map((student) => ({
      id: student._id,
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      internships: [...(student.internships || [])].sort(
        (a, b) => {
          const priorityDiff = getInternshipSortPriority(a) - getInternshipSortPriority(b);

          if (priorityDiff !== 0) {
            return priorityDiff;
          }

          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        }
      )
    }));
  }, [students]);

  const handleViewDetails = async (studentId: string) => {
    try {
      setDetailsLoading(true);
      setDetailsError('');
      const response = await mentorAPI.getAssignedStudentDetails(studentId);
      setSelectedStudentDetails({
        student: response.data.student,
        internships: response.data.internships || [],
        reports: response.data.reports || []
      });
    } catch {
      setDetailsError('Failed to load full student details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setSelectedStudentDetails(null);
    setDetailsError('');
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mentor Dashboard</h2>
          <p className="text-sm text-slate-600">Track students assigned to you and monitor internship progress.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
          <Users className="h-4 w-4 text-blue-600" />
          {students.length} Student{students.length === 1 ? '' : 's'}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Student</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Internship Details</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-800">{row.studentName}</p>
                    <p className="text-xs text-slate-500">{row.studentEmail}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {row.internships.length === 0 ? (
                      <span className="text-xs text-slate-500">No internship submitted</span>
                    ) : (
                      <div className="space-y-3">
                        {row.internships.map((internship) => (
                          <div key={internship._id} className="rounded-lg border border-slate-200 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-800">{internship.companyName}</p>
                              <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClass(internship.status)}`}>
                                {getStatusLabel(internship.status)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600">{internship.role || internship.position || '-'}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDisplayDate(internship.startDate)} - {formatDisplayDate(internship.endDate)}
                            </p>
                            {shouldShowProgress(internship) && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-600">Progress</span>
                                <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-200">
                                  <div
                                    className="h-full bg-blue-600"
                                    style={{ width: `${Math.max(0, Math.min(100, internship.progress || 0))}%` }}
                                  />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">{Math.round(internship.progress || 0)}%</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(row.studentId)}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-slate-500" colSpan={3}>
                    No students are assigned to you yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {(detailsLoading || selectedStudentDetails || detailsError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Student Details</h3>
              <button
                type="button"
                onClick={closeDetailsModal}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            {detailsLoading && (
              <div className="flex min-h-40 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              </div>
            )}

            {!detailsLoading && detailsError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                {detailsError}
              </div>
            )}

            {!detailsLoading && !detailsError && selectedStudentDetails && (
              <div className="space-y-5">
                <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-slate-700">Profile</h4>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-700 md:grid-cols-2">
                    <p><span className="font-semibold text-slate-800">Name:</span> {selectedStudentDetails.student.name}</p>
                    <p><span className="font-semibold text-slate-800">Email:</span> {selectedStudentDetails.student.email}</p>
                    <p><span className="font-semibold text-slate-800">Department:</span> {selectedStudentDetails.student.department || '-'}</p>
                    <p><span className="font-semibold text-slate-800">Semester:</span> {selectedStudentDetails.student.semester || '-'}</p>
                    <p><span className="font-semibold text-slate-800">Phone:</span> {selectedStudentDetails.student.phoneNumber || '-'}</p>
                    <p><span className="font-semibold text-slate-800">College:</span> {selectedStudentDetails.student.collegeName || '-'}</p>
                    <p><span className="font-semibold text-slate-800">LinkedIn:</span> {selectedStudentDetails.student.linkedin || '-'}</p>
                    <p><span className="font-semibold text-slate-800">GitHub:</span> {selectedStudentDetails.student.github || '-'}</p>
                  </div>
                  {selectedStudentDetails.student.about && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">About</p>
                      <p className="mt-1 text-sm text-slate-700">{selectedStudentDetails.student.about}</p>
                    </div>
                  )}
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-slate-700">Internships</h4>
                  <div className="mt-3 space-y-3">
                    {selectedStudentDetails.internships.length === 0 && (
                      <p className="text-sm text-slate-500">No internships submitted yet.</p>
                    )}
                    {selectedStudentDetails.internships.map((internship) => (
                      <div key={internship._id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">{internship.companyName}</p>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClass(internship.status)}`}>
                            {getStatusLabel(internship.status)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{internship.role || internship.position || '-'}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDisplayDate(internship.startDate)} - {formatDisplayDate(internship.endDate)}
                        </p>
                        {shouldShowProgress(internship) && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-600">Progress</span>
                            <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full bg-blue-600"
                                style={{ width: `${Math.max(0, Math.min(100, internship.progress || 0))}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{Math.round(internship.progress || 0)}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                    Progress Reports ({selectedStudentDetails.reports.length})
                  </h4>
                  <div className="mt-3 space-y-3">
                    {selectedStudentDetails.reports.length === 0 && (
                      <p className="text-sm text-slate-500">No reports submitted yet.</p>
                    )}
                    {selectedStudentDetails.reports.map((report) => (
                      <div key={report._id} className="rounded-lg border border-slate-200 p-3">
                        <p className="text-xs font-semibold text-slate-700">
                          {report.internshipId?.companyName || 'Internship'} - {formatDisplayDate(report.date)}
                        </p>
                        <p className="mt-1 text-sm text-slate-700">{report.description}</p>
                        <p className="mt-1 text-xs text-slate-500">Hours: {report.hoursWorked}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

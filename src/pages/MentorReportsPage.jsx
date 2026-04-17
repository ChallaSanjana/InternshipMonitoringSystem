import { useEffect, useState } from 'react';
import { getFilePreviewUrl, mentorAPI } from '../lib/api';
import { formatDisplayDate } from '../utils/dateFormat';
import { Loader2 } from 'lucide-react';
export default function MentorReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewingReportId, setReviewingReportId] = useState('');
    const [feedbackSubmittingReportId, setFeedbackSubmittingReportId] = useState('');
    const [feedbackInputs, setFeedbackInputs] = useState({});
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const response = await mentorAPI.getAssignedStudentReports();
                setReports(response.data.reports || []);
                setError('');
            }
            catch {
                setError('Failed to load assigned student reports');
            }
            finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);
    const handleMarkReportReviewed = async (reportId) => {
        try {
            setReviewingReportId(reportId);
            const response = await mentorAPI.markReportReviewed(reportId);
            const updatedReport = response.data.report;
            setReports((prev) => prev.map((report) => report._id === reportId
                ? {
                    ...report,
                    mentorReviewed: updatedReport.mentorReviewed,
                    mentorReviewedAt: updatedReport.mentorReviewedAt
                }
                : report));
            setError('');
        }
        catch {
            setError('Failed to mark report as reviewed');
        }
        finally {
            setReviewingReportId('');
        }
    };
    const handleFeedbackChange = (reportId, value) => {
        setFeedbackInputs((prev) => ({ ...prev, [reportId]: value }));
    };
    const handleSaveFeedback = async (reportId) => {
        const feedback = (feedbackInputs[reportId] || '').trim();
        if (!feedback) {
            setError('Please enter feedback before saving');
            return;
        }
        try {
            setFeedbackSubmittingReportId(reportId);
            const response = await mentorAPI.addReportFeedback(reportId, feedback);
            const updatedReport = response.data.report;
            setReports((prev) => prev.map((report) => report._id === reportId
                ? {
                    ...report,
                    mentorFeedback: updatedReport.mentorFeedback,
                    mentorFeedbackAt: updatedReport.mentorFeedbackAt
                }
                : report));
            setFeedbackInputs((prev) => ({ ...prev, [reportId]: '' }));
            setError('');
        }
        catch {
            setError('Failed to save mentor feedback');
        }
        finally {
            setFeedbackSubmittingReportId('');
        }
    };
    if (loading) {
        return (<div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600"/>
      </div>);
    }
    return (<div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
        <p className="text-sm text-slate-600">Review reports submitted by your assigned students.</p>
      </div>

      {error && (<div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          {error}
        </div>)}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Student</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Internship</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Report Content</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Mentor Feedback</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">File</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Status</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (<tr key={report._id}>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-800">{report.studentId?.name || '-'}</p>
                    <p className="text-xs text-slate-500">{report.studentId?.email || '-'}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    <p className="font-medium text-slate-800">{report.internshipId?.companyName || '-'}</p>
                    <p className="text-xs text-slate-500">{report.internshipId?.role || report.internshipId?.position || '-'}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    <p className="text-xs text-slate-500">{formatDisplayDate(report.date)} | {report.hoursWorked} hours</p>
                    <p className="mt-1 max-w-xl text-sm text-slate-700">{report.description}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {report.mentorFeedback ? (<div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                        {report.mentorFeedback}
                      </div>) : (<p className="mb-2 text-xs text-slate-500">No mentor feedback yet</p>)}
                    <div className="flex items-center gap-2">
                      <input type="text" value={feedbackInputs[report._id] || ''} onChange={(e) => handleFeedbackChange(report._id, e.target.value)} placeholder="Write feedback" className="w-52 rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"/>
                      <button type="button" onClick={() => handleSaveFeedback(report._id)} disabled={feedbackSubmittingReportId === report._id} className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60">
                        {feedbackSubmittingReportId === report._id ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {report.reportFile?.fileUrl ? (<a href={getFilePreviewUrl(report.reportFile.fileUrl)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-700 underline-offset-2 hover:underline">
                        {report.reportFile.fileName}
                      </a>) : (<span className="text-xs text-slate-500">No report file</span>)}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    {report.mentorReviewed ? (<span className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Reviewed
                      </span>) : (<span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        Pending
                      </span>)}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <button type="button" onClick={() => handleMarkReportReviewed(report._id)} disabled={report.mentorReviewed || reviewingReportId === report._id} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300">
                      {reviewingReportId === report._id ? 'Reviewing...' : 'Mark Reviewed'}
                    </button>
                  </td>
                </tr>))}
              {!loading && reports.length === 0 && (<tr>
                  <td className="px-5 py-8 text-center text-sm text-slate-500" colSpan={7}>
                    No reports from assigned students yet.
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </div>);
}

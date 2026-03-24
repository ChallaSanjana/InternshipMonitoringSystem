import { Trash2, Pencil } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dateFormat';

export interface ProgressReportItem {
  _id: string;
  date: string;
  description: string;
  hoursWorked: number;
  createdAt: string;
  adminFeedback?: string;
  mentorFeedback?: string;
}

interface ReportListProps {
  reports: ProgressReportItem[];
  onEdit: (report: ProgressReportItem) => void;
  onDelete: (reportId: string) => void;
}

export default function ReportList({ reports, onEdit, onDelete }: ReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        No reports found for this internship.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-600">Date</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-600">Description</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-600">Hours Worked</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-600">Admin Feedback</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-600">Mentor Feedback</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr key={report._id}>
                <td className="px-5 py-4 text-sm text-slate-700">{formatDisplayDate(report.date)}</td>
                <td className="px-5 py-4 text-sm text-slate-700">{report.description}</td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-800">{report.hoursWorked}</td>
                <td className="px-5 py-4 text-sm">
                  {report.adminFeedback ? (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                      {report.adminFeedback}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">No feedback yet</span>
                  )}
                </td>
                <td className="px-5 py-4 text-sm">
                  {report.mentorFeedback ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                      {report.mentorFeedback}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">No mentor feedback yet</span>
                  )}
                </td>
                <td className="px-5 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(report)}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(report._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

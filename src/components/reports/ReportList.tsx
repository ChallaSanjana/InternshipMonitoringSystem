import { Trash2 } from 'lucide-react';

export interface ProgressReportItem {
  _id: string;
  date: string;
  description: string;
  hoursWorked: number;
  createdAt: string;
}

interface ReportListProps {
  reports: ProgressReportItem[];
  onDelete: (reportId: string) => void;
}

export default function ReportList({ reports, onDelete }: ReportListProps) {
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
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr key={report._id}>
                <td className="px-5 py-4 text-sm text-slate-700">{new Date(report.date).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-sm text-slate-700">{report.description}</td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-800">{report.hoursWorked}</td>
                <td className="px-5 py-4 text-sm">
                  <button
                    onClick={() => onDelete(report._id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

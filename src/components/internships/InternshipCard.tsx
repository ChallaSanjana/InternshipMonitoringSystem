import { CalendarDays, FileText, Trash2 } from 'lucide-react';
import { getDateBasedStatus, getStatusBadgeClass, getStatusLabel } from '../../utils/internshipStatus';

export interface InternshipItem {
  _id: string;
  companyName: string;
  role?: string;
  position?: string;
  mode?: 'online' | 'offline' | 'hybrid';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  startDate: string;
  endDate: string;
}

interface InternshipCardProps {
  internship: InternshipItem;
  onAddReport: (internshipId: string) => void;
  onUploadFile: (internshipId: string) => void;
  onDelete: (internshipId: string) => void;
}

export default function InternshipCard({ internship, onAddReport, onUploadFile, onDelete }: InternshipCardProps) {
  const derivedStatus = getDateBasedStatus(internship.startDate, internship.endDate);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{internship.companyName}</h3>
          <p className="text-sm text-slate-600">{internship.role || internship.position}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
            {internship.mode ? `${internship.mode.charAt(0).toUpperCase()}${internship.mode.slice(1)}` : 'N/A'} mode
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${getStatusBadgeClass(derivedStatus)}`}>
            {getStatusLabel(derivedStatus)}
          </span>
          <button
            onClick={() => onDelete(internship._id)}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <CalendarDays className="h-4 w-4" />
        {new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={() => onAddReport(internship._id)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <FileText className="h-4 w-4" />
          Add Report
        </button>
        <button
          onClick={() => onUploadFile(internship._id)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Upload File
        </button>
      </div>
    </article>
  );
}

import { Award, ClipboardList, Download, FileText, Trash2 } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dateFormat';

export interface InternshipFileItem {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: 'offer_letter' | 'report' | 'certificate';
  createdAt: string;
}

interface FileListProps {
  files: InternshipFileItem[];
  loading?: boolean;
  onDownload: (fileId: string, fileName: string) => void;
  onDelete: (fileId: string) => void;
  onPreview: (fileUrl: string) => void;
}

function typeLabel(fileType: InternshipFileItem['fileType']) {
  switch (fileType) {
    case 'offer_letter':
      return 'Offer Letter';
    case 'report':
      return 'Report';
    case 'certificate':
      return 'Certificate';
    default:
      return fileType;
  }
}

function fileTypeIcon(fileType: InternshipFileItem['fileType']) {
  switch (fileType) {
    case 'offer_letter':
      return <FileText className="h-4 w-4 text-blue-600" />;
    case 'report':
      return <ClipboardList className="h-4 w-4 text-emerald-600" />;
    case 'certificate':
      return <Award className="h-4 w-4 text-amber-600" />;
    default:
      return <FileText className="h-4 w-4 text-slate-600" />;
  }
}

export default function FileList({ files, loading = false, onDownload, onDelete, onPreview }: FileListProps) {
  if (loading) {
    return <p className="text-sm text-slate-500">Loading files...</p>;
  }

  if (files.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        No files uploaded yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file._id}
          className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-slate-100 p-2">{fileTypeIcon(file.fileType)}</div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onPreview(file.fileUrl)}
                className="truncate text-left text-sm font-semibold text-blue-700 underline-offset-2 hover:underline"
                title={`Open ${file.fileName}`}
              >
                {file.fileName}
              </button>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                  {typeLabel(file.fileType)}
                </span>
                <span>Uploaded {formatDisplayDate(file.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="inline-flex flex-shrink-0 items-center gap-2">
            <button
              onClick={() => onDownload(file._id, file.fileName)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            <button
              onClick={() => onDelete(file._id)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import AddInternship from '../components/AddInternship';
import AddReport from '../components/AddReport';
import InternshipCard, { type InternshipItem } from '../components/internships/InternshipCard';
import UploadFileModal from '../components/files/UploadFileModal';
import FileList, { type InternshipFileItem } from '../components/files/FileList';
import { getFilePreviewUrl, studentAPI } from '../lib/api';

export default function InternshipsPage() {
  const [internships, setInternships] = useState<InternshipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddInternship, setShowAddInternship] = useState(false);
  const [showAddReport, setShowAddReport] = useState(false);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>('');
  const [filesByInternship, setFilesByInternship] = useState<Record<string, InternshipFileItem[]>>({});
  const [filesLoading, setFilesLoading] = useState<Record<string, boolean>>({});

  const selectedInternship = internships.find((item) => item._id === selectedInternshipId);

  const fetchInternships = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await studentAPI.getMyInternships();
      setInternships(response.data.internships || []);
      setError('');
    } catch {
      setError('Failed to fetch internships');
      setSuccess('');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchInternships(true);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchInternships(false);
    }, 20000);

    const handleFocus = () => {
      fetchInternships(false);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccess('');
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [success]);

  const fetchFilesForInternship = async (internshipId: string) => {
    try {
      setFilesLoading((prev) => ({ ...prev, [internshipId]: true }));
      const response = await studentAPI.getFilesByInternship(internshipId);
      setFilesByInternship((prev) => ({ ...prev, [internshipId]: response.data.files || [] }));
    } catch {
      setError('Failed to fetch uploaded files');
    } finally {
      setFilesLoading((prev) => ({ ...prev, [internshipId]: false }));
    }
  };

  useEffect(() => {
    internships.forEach((internship) => {
      if (!filesByInternship[internship._id]) {
        fetchFilesForInternship(internship._id);
      }
    });
  }, [internships, filesByInternship]);

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await studentAPI.downloadFile(fileId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download file');
    }
  };

  const handleDeleteFile = async (internshipId: string, fileId: string) => {
    try {
      await studentAPI.deleteFile(fileId);
      setFilesByInternship((prev) => ({
        ...prev,
        [internshipId]: (prev[internshipId] || []).filter((file) => file._id !== fileId)
      }));
      setError('');
      setSuccess('File deleted successfully');
    } catch {
      setError('Failed to delete file');
    }
  };

  const handleDeleteInternship = async (internshipId: string) => {
    if (!window.confirm('Are you sure you want to delete this internship?')) {
      return;
    }

    try {
      await studentAPI.deleteInternship(internshipId);
      setInternships((prev) => prev.filter((internship) => internship._id !== internshipId));
      setFilesByInternship((prev) => {
        const next = { ...prev };
        delete next[internshipId];
        return next;
      });
      setSuccess('Internship deleted successfully');
      setError('');
    } catch {
      setError('Failed to delete internship');
      setSuccess('');
    }
  };

  const handlePreview = (fileUrl: string) => {
    const previewUrl = getFilePreviewUrl(fileUrl);
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900">Internships</h2>
        <button
          onClick={() => setShowAddInternship(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Internship
        </button>
      </div>

      {error && <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>}
      {success && (
        <div className="fixed right-4 top-20 z-50 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {success}
        </div>
      )}

      {loading && internships.length === 0 && <p className="text-slate-600">Loading internships...</p>}

      {!loading && internships.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No internships yet. Click Add Internship to get started.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {internships.map((internship) => (
          <div key={internship._id} className="space-y-3">
            <InternshipCard
              internship={internship}
              onAddReport={(internshipId) => {
                setSelectedInternshipId(internshipId);
                setShowAddReport(true);
              }}
              onUploadFile={(internshipId) => {
                setSelectedInternshipId(internshipId);
                setShowUploadFile(true);
              }}
              onDelete={handleDeleteInternship}
            />

            {(filesByInternship[internship._id] || []).length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="mb-2 text-sm font-semibold text-slate-700">Uploaded Files</p>
                <FileList
                  files={filesByInternship[internship._id] || []}
                  loading={filesLoading[internship._id]}
                  onDownload={handleDownload}
                  onDelete={(fileId) => handleDeleteFile(internship._id, fileId)}
                  onPreview={handlePreview}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddInternship && (
        <AddInternship
          onClose={() => setShowAddInternship(false)}
          onSuccess={() => {
            setShowAddInternship(false);
            fetchInternships(false);
            setSuccess('Internship added successfully');
          }}
        />
      )}

      {showAddReport && selectedInternshipId && (
        <AddReport
          internshipId={selectedInternshipId}
          internshipStartDate={selectedInternship?.startDate}
          internshipEndDate={selectedInternship?.endDate}
          onClose={() => {
            setShowAddReport(false);
            setSelectedInternshipId('');
          }}
          onSuccess={() => {
            setShowAddReport(false);
            setSelectedInternshipId('');
            setSuccess('Progress report submitted successfully');
          }}
        />
      )}

      {showUploadFile && selectedInternshipId && (
        <UploadFileModal
          internshipId={selectedInternshipId}
          onClose={() => {
            setShowUploadFile(false);
            setSelectedInternshipId('');
          }}
          onSuccess={() => {
            fetchFilesForInternship(selectedInternshipId);
            setShowUploadFile(false);
            setSelectedInternshipId('');
            setSuccess('File uploaded successfully');
          }}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AddReport from '../components/AddReport';
import EditReport from '../components/EditReport';
import ReportList, { type ProgressReportItem } from '../components/reports/ReportList';
import type { InternshipItem } from '../components/internships/InternshipCard';
import { studentAPI } from '../lib/api';

export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [internships, setInternships] = useState<InternshipItem[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [reports, setReports] = useState<ProgressReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddReport, setShowAddReport] = useState(false);
  const [showEditReport, setShowEditReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProgressReportItem | null>(null);

  const selectedInternship = internships.find((item) => item._id === selectedInternshipId);
  const canAddReport = selectedInternship?.status === 'approved';
  const addReportDisabledMessage =
    selectedInternship?.status === 'pending'
      ? 'Waiting for admin approval'
      : selectedInternship?.status === 'rejected'
        ? 'Report submission is disabled because this internship was rejected'
        : selectedInternship?.status === 'completed'
          ? 'Report submission is closed because this internship is completed'
          : selectedInternship?.status === 'expired'
            ? 'Report submission is disabled because this internship is expired'
        : '';

  const fetchInternships = async () => {
    const response = await studentAPI.getMyInternships();
    const items = response.data.internships || [];
    setInternships(items);

    const internshipIdFromQuery = searchParams.get('internshipId');
    const hasQueryInternship = internshipIdFromQuery && items.some((item: InternshipItem) => item._id === internshipIdFromQuery);

    if (hasQueryInternship) {
      setSelectedInternshipId(internshipIdFromQuery);
      return;
    }

    if (items.length > 0) {
      setSelectedInternshipId((prev) => prev || items[0]._id);
    }
  };

  const fetchReports = async (internshipId: string) => {
    if (!internshipId) {
      setReports([]);
      return;
    }

    const response = await studentAPI.getReportsByInternship(internshipId);
    setReports(response.data.reports || []);
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

  const handleEditReport = (report: ProgressReportItem) => {
    setSelectedReport(report);
    setShowEditReport(true);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchInternships();
        setError('');
      } catch {
        setError('Failed to fetch reports data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadReports = async () => {
      try {
        if (!selectedInternshipId) {
          return;
        }
        setLoading(true);
        await fetchReports(selectedInternshipId);
      } catch {
        setError('Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [selectedInternshipId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900">Progress Reports</h2>
        {selectedInternshipId && (
          <button
            onClick={() => {
              if (!canAddReport) {
                return;
              }
              setShowAddReport(true);
            }}
            disabled={!canAddReport}
            title={!canAddReport ? addReportDisabledMessage : 'Add report'}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            Add Report
          </button>
        )}
      </div>

      {!canAddReport && selectedInternshipId && addReportDisabledMessage && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">{addReportDisabledMessage}</p>
      )}

      {error && <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>}
      {success && (
        <div className="fixed right-4 top-20 z-50 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {success}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-slate-700">Select Internship</label>
        <select
          value={selectedInternshipId}
          onChange={(e) => {
            setSelectedInternshipId(e.target.value);
            setSearchParams({ internshipId: e.target.value });
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {internships.map((internship) => (
            <option key={internship._id} value={internship._id}>
              {internship.companyName} - {internship.role || internship.position}
            </option>
          ))}
        </select>
      </div>

      {loading ? <p className="text-slate-600">Loading reports...</p> : <ReportList reports={reports} onEdit={handleEditReport} onDelete={handleDeleteReport} />}

      {showAddReport && selectedInternshipId && canAddReport && (
        <AddReport
          internshipId={selectedInternshipId}
          internshipStartDate={selectedInternship?.startDate}
          internshipEndDate={selectedInternship?.endDate}
          onClose={() => setShowAddReport(false)}
          onSuccess={() => {
            setShowAddReport(false);
            fetchReports(selectedInternshipId);
            setSuccess('Progress report submitted successfully');
            setTimeout(() => setSuccess(''), 5000);
          }}
        />
      )}

      {showEditReport && selectedReport && selectedInternship && (
        <EditReport
          report={selectedReport}
          internshipStartDate={selectedInternship.startDate}
          internshipEndDate={selectedInternship.endDate}
          onClose={() => {
            setShowEditReport(false);
            setSelectedReport(null);
          }}
          onSuccess={() => {
            setShowEditReport(false);
            setSelectedReport(null);
            fetchReports(selectedInternshipId);
            setSuccess('Progress report updated successfully');
            setTimeout(() => setSuccess(''), 5000);
          }}
        />
      )}
    </div>
  );
}

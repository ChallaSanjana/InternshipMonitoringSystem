import { useState } from 'react';
import { studentAPI } from '../lib/api';
import { X } from 'lucide-react';
import { formatDisplayDate } from '../utils/dateFormat';
export default function EditReport({ report, internshipStartDate, internshipEndDate, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        date: report.date.split('T')[0],
        description: report.description,
        hoursWorked: report.hoursWorked.toString()
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (internshipStartDate && internshipEndDate && formData.date) {
            const selectedDate = new Date(formData.date);
            const startDate = new Date(internshipStartDate);
            const endDate = new Date(internshipEndDate);
            const selected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
            const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
            const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
            if (selected < start || selected > end) {
                setError('Report date must be between internship start date and end date');
                return;
            }
        }
        setLoading(true);
        try {
            await studentAPI.updateReport(report._id, {
                date: formData.date,
                description: formData.description,
                hoursWorked: Number(formData.hoursWorked)
            });
            onSuccess();
            onClose();
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to update report';
            setError(errorMsg);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">Edit Progress Report</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6"/>
          </button>
        </div>

        {error && (<div className="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>)}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} min={internshipStartDate ? internshipStartDate.slice(0, 10) : undefined} max={internshipEndDate ? internshipEndDate.slice(0, 10) : undefined} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
              {internshipStartDate && internshipEndDate && (<p className="mt-1 text-xs text-gray-500">
                  Allowed range: {formatDisplayDate(internshipStartDate)} - {formatDisplayDate(internshipEndDate)}
                </p>)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hours Worked
              </label>
              <input type="number" name="hoursWorked" value={formData.hoursWorked} onChange={handleChange} min="0" step="0.5" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 40"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Example: Implemented internship dashboard filters, fixed file upload validation, and tested API responses for report submission."/>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Updating...' : 'Update Report'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>);
}

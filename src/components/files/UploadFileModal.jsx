import { useState } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { studentAPI } from '../../lib/api';
export default function UploadFileModal({ internshipId, onClose, onSuccess }) {
    const [fileType, setFileType] = useState('offer_letter');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedFile) {
            setError('Please choose a file');
            return;
        }
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('internshipId', internshipId);
            formData.append('fileType', fileType);
            await studentAPI.uploadFile(formData);
            onSuccess();
            onClose();
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to upload file';
            setError(errorMsg);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h3 className="text-lg font-bold text-slate-900">Upload File</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-5 w-5"/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">File Type</label>
            <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="offer_letter">Offer Letter</option>
              <option value="report">Report</option>
              <option value="certificate">Certificate</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Choose File</label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600 hover:border-blue-400 hover:bg-blue-50">
              <UploadCloud className="h-4 w-4"/>
              {selectedFile ? selectedFile.name : 'Click to select file'}
              <input type="file" className="hidden" onChange={handleFileChange}/>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400">
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>);
}

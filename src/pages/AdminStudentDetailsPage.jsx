import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, GraduationCap, Mail } from 'lucide-react';
import { adminAPI, getFilePreviewUrl } from '../lib/api';
import { formatDisplayDate } from '../utils/dateFormat';
export default function AdminStudentDetailsPage() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [internships, setInternships] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [avatarError, setAvatarError] = useState(false);
    useEffect(() => {
        if (!studentId) {
            setError('Student ID is missing');
            setLoading(false);
            return;
        }
        const fetchStudentDetails = async () => {
            try {
                setLoading(true);
                const response = await adminAPI.getStudentDetails(studentId);
                setStudent(response.data.student || null);
                setInternships(response.data.internships || []);
                setReports(response.data.reports || []);
                setError('');
            }
            catch {
                setError('Failed to load student details');
            }
            finally {
                setLoading(false);
            }
        };
        fetchStudentDetails();
    }, [studentId]);
    const personalInfo = useMemo(() => [
        { label: 'Phone Number', value: student?.phoneNumber || '' },
        { label: 'College Name', value: student?.collegeName || '' },
        { label: 'LinkedIn', value: student?.linkedin || '' },
        { label: 'GitHub', value: student?.github || '' },
        { label: 'About', value: student?.about || '' }
    ].filter((item) => item.value), [student]);
    const internshipMap = useMemo(() => {
        const map = new Map();
        internships.forEach((internship) => map.set(internship._id, internship));
        return map;
    }, [internships]);
    const getInitial = () => {
        if (!student?.name) {
            return 'S';
        }
        return student.name.charAt(0).toUpperCase();
    };
    if (loading) {
        return (<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading student profile...</p>
      </div>);
    }
    if (error) {
        return (<div className="space-y-4">
        <button type="button" onClick={() => navigate('/admin/students')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4"/>
          Back to Students
        </button>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{error}</div>
      </div>);
    }
    if (!student) {
        return (<div className="space-y-4">
        <button type="button" onClick={() => navigate('/admin/students')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4"/>
          Back to Students
        </button>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700">Student not found.</div>
      </div>);
    }
    return (<div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => navigate('/admin/students')} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4"/>
          Back to Students
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          {student.profileImage && !avatarError ? (<img src={getFilePreviewUrl(student.profileImage)} alt={student.name} className="h-20 w-20 rounded-full border border-slate-200 object-cover" onError={() => setAvatarError(true)}/>) : (<div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
              {getInitial()}
            </div>)}

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">{student.name}</h2>
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-4 w-4"/>
              {student.email}
            </p>
            {student.department && (<p className="flex items-center gap-2 text-sm text-slate-600">
                <BookOpen className="h-4 w-4"/>
                {student.department}
              </p>)}
            {student.semester && (<p className="flex items-center gap-2 text-sm text-slate-600">
                <GraduationCap className="h-4 w-4"/>
                Semester {student.semester}
              </p>)}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Personal Info</h3>
        {personalInfo.length === 0 ? (<p className="text-sm text-slate-600">No personal information added yet.</p>) : (<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {personalInfo.map((item) => (<div key={item.label} className={item.label === 'About' ? 'md:col-span-2' : ''}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                {item.label === 'LinkedIn' || item.label === 'GitHub' ? (<a href={item.value} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline break-all hover:text-blue-700">
                    {item.value}
                  </a>) : (<p className="text-sm text-slate-800 whitespace-pre-wrap">{item.value}</p>)}
              </div>))}
          </div>)}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Internships</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {internships.length} total
          </span>
        </div>

        {internships.length === 0 ? (<p className="text-sm text-slate-600">No internships submitted.</p>) : (<div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Company</th>
                  <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Dates</th>
                  <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {internships.map((internship) => (<tr key={internship._id}>
                    <td className="px-4 py-3 text-sm text-slate-800">{internship.companyName}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{internship.role || internship.position || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {formatDisplayDate(internship.startDate)} - {formatDisplayDate(internship.endDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 capitalize">{internship.status}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>)}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Progress Reports</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {reports.length} total
          </span>
        </div>

        {reports.length === 0 ? (<p className="text-sm text-slate-600">No reports submitted.</p>) : (<div className="space-y-4">
            {reports.map((report) => {
                const internship = internshipMap.get(report.internshipId);
                return (<article key={report._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {internship?.companyName || 'Internship'}
                    </p>
                    <p className="inline-flex items-center gap-1 text-xs text-slate-600">
                      <Calendar className="h-3.5 w-3.5"/>
                      {formatDisplayDate(report.date)}
                    </p>
                  </div>

                  <p className="mb-2 text-sm text-slate-700">{report.description}</p>
                  <p className="mb-2 text-xs font-semibold text-slate-700">Hours Worked: {report.hoursWorked}</p>

                  {report.adminFeedback && (<div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide">Admin Feedback</p>
                      <p>{report.adminFeedback}</p>
                    </div>)}
                </article>);
            })}
          </div>)}
      </section>
    </div>);
}

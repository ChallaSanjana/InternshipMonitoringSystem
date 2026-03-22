import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, getFilePreviewUrl } from '../lib/api';
import {
  User as UserIcon,
  Mail,
  BookOpen,
  Layers,
  Check,
  AlertCircle,
  Phone,
  GraduationCap,
  Linkedin,
  Github,
  AlignLeft
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    semester: '',
    phoneNumber: '',
    collegeName: '',
    linkedin: '',
    github: '',
    about: ''
  });
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        semester: user.semester?.toString() || '',
        phoneNumber: user.phoneNumber || '',
        collegeName: user.collegeName || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
        about: user.about || ''
      });
      setAvatarPreview(user.profileImage ? getFilePreviewUrl(user.profileImage) : '');
      setAvatarLoadError(false);
    }
  }, [user]);

  const getInitial = () => {
    if (!user?.name) {
      return 'S';
    }
    return user.name.charAt(0).toUpperCase();
  };

  const hasPersonalInfo = Boolean(
    user?.phoneNumber || user?.collegeName || user?.linkedin || user?.github || user?.about
  );

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be 2MB or less');
      event.target.value = '';
      return;
    }

    setError('');
    setSuccess('');
    setImageLoading(true);

    const previousPreview = avatarPreview;
    const tempPreview = URL.createObjectURL(file);
    setAvatarPreview(tempPreview);
    setAvatarLoadError(false);

    try {
      const payload = new FormData();
      payload.append('image', file);
      const response = await authAPI.uploadProfileImage(payload);

      updateUserProfile(response.data.user);
      setAvatarPreview(
        response.data.user.profileImage ? getFilePreviewUrl(response.data.user.profileImage) : ''
      );
      setSuccess('Profile image updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setAvatarPreview(previousPreview);
      setError(err instanceof Error ? err.message : 'Failed to upload profile image');
    } finally {
      URL.revokeObjectURL(tempPreview);
      setImageLoading(false);
      event.target.value = '';
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updatePayload: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        department: formData.department || undefined,
        semester: formData.semester ? parseInt(formData.semester, 10) : undefined,
        phoneNumber: formData.phoneNumber,
        collegeName: formData.collegeName,
        linkedin: formData.linkedin,
        github: formData.github,
        about: formData.about
      };

      const response = await authAPI.updateProfile(updatePayload);
      
      // Update user in context
      updateUserProfile(response.data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        semester: user.semester?.toString() || '',
        phoneNumber: user.phoneNumber || '',
        collegeName: user.collegeName || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
        about: user.about || ''
      });
    }
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your personal information</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow">
          {/* View Mode */}
          {!isEditing && (
            <div className="p-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  {avatarPreview && !avatarLoadError ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border border-slate-200"
                      onError={() => setAvatarLoadError(true)}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {getInitial()}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600 capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="profile-image" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  <UserIcon className="h-4 w-4" />
                  {imageLoading ? 'Uploading...' : 'Upload Profile Image'}
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={imageLoading}
                />
                <p className="mt-2 text-xs text-slate-500">PNG, JPG, GIF up to 2MB</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Email */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <label className="text-sm font-medium text-gray-700">Email</label>
                  </div>
                  <p className="text-gray-900">{user?.email}</p>
                </div>

                {/* Department */}
                {user?.department && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <label className="text-sm font-medium text-gray-700">Department</label>
                    </div>
                    <p className="text-gray-900">{user.department}</p>
                  </div>
                )}

                {/* Semester */}
                {user?.semester && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-5 h-5 text-gray-400" />
                      <label className="text-sm font-medium text-gray-700">Semester</label>
                    </div>
                    <p className="text-gray-900">Semester {user.semester}</p>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mb-8">
                <h3 className="mb-4 text-base font-semibold text-slate-900">✏️ Personal Info</h3>

                {!hasPersonalInfo && (
                  <p className="text-sm text-slate-600">No personal information added yet</p>
                )}

                {hasPersonalInfo && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {user?.phoneNumber && (
                      <div>
                        <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                          <Phone className="h-3.5 w-3.5" />
                          Phone Number
                        </p>
                        <p className="text-sm text-slate-800">{user.phoneNumber}</p>
                      </div>
                    )}

                    {user?.collegeName && (
                      <div>
                        <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                          <GraduationCap className="h-3.5 w-3.5" />
                          College Name
                        </p>
                        <p className="text-sm text-slate-800">{user.collegeName}</p>
                      </div>
                    )}

                    {user?.linkedin && (
                      <div>
                        <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                          <Linkedin className="h-3.5 w-3.5" />
                          LinkedIn
                        </p>
                        <a
                          href={user.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 underline break-all hover:text-blue-700"
                        >
                          {user.linkedin}
                        </a>
                      </div>
                    )}

                    {user?.github && (
                      <div>
                        <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                          <Github className="h-3.5 w-3.5" />
                          GitHub
                        </p>
                        <a
                          href={user.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 underline break-all hover:text-blue-700"
                        >
                          {user.github}
                        </a>
                      </div>
                    )}

                    {user?.about && (
                      <div className="md:col-span-2">
                        <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                          <AlignLeft className="h-3.5 w-3.5" />
                          About
                        </p>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap">{user.about}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Edit Profile
              </button>
            </div>
          )}

          {/* Edit Mode */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    id="department"
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="e.g., Computer Science"
                  />
                </div>

                {/* Semester */}
                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Select semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem.toString()}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-4 text-base font-semibold text-slate-900">✏️ Personal Info</h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phoneNumber"
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700 mb-2">
                        College Name
                      </label>
                      <input
                        id="collegeName"
                        type="text"
                        name="collegeName"
                        value={formData.collegeName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn URL
                      </label>
                      <input
                        id="linkedin"
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="https://linkedin.com/in/your-profile"
                      />
                    </div>

                    <div>
                      <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub URL
                      </label>
                      <input
                        id="github"
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="https://github.com/your-username"
                      />
                    </div>

                    <div>
                      <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-2">
                        About
                      </label>
                      <textarea
                        id="about"
                        name="about"
                        value={formData.about}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-y"
                        placeholder="Tell us a little about yourself (optional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-900 font-semibold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Account Information</h3>
          <p className="text-blue-800 text-sm">
            Your profile information helps us provide you with a better experience. Personal info fields are optional and you can update them anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

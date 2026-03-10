import { useState } from 'react';
import {
  User,
  Shield,
  Mail,
  Phone,
  Save,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

const profileValidationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phoneNumber: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits'),
});

const passwordValidationSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

export const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const profileFormik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
    },
    enableReinitialize: true,
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      setProfileLoading(true);
      try {
        const updatedUser = await authService.updateProfile(values);
        updateUser(updatedUser);
        setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
      } finally {
        setProfileLoading(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      setPasswordLoading(true);
      try {
        await authService.changePassword(values.currentPassword, values.newPassword);
        setSnackbar({ open: true, message: 'Password changed successfully', severity: 'success' });
        passwordFormik.resetForm();
      } catch {
        setSnackbar({ open: true, message: 'Failed to change password. Check your current password.', severity: 'error' });
      } finally {
        setPasswordLoading(false);
      }
    },
  });

  // Profile Settings Tab
  const ProfileTab = () => (
    <form onSubmit={profileFormik.handleSubmit}>
      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
            {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{user?.username}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 px-3 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full capitalize">
            {user?.role}
          </span>
        </div>

        <hr className="border-gray-200" />

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileFormik.values.firstName}
                onChange={profileFormik.handleChange}
                onBlur={profileFormik.handleBlur}
                className={`block w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  profileFormik.touched.firstName && profileFormik.errors.firstName
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
            </div>
            {profileFormik.touched.firstName && profileFormik.errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{profileFormik.errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profileFormik.values.lastName}
                onChange={profileFormik.handleChange}
                onBlur={profileFormik.handleBlur}
                className={`block w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  profileFormik.touched.lastName && profileFormik.errors.lastName
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
            </div>
            {profileFormik.touched.lastName && profileFormik.errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{profileFormik.errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={profileFormik.values.phoneNumber}
                onChange={profileFormik.handleChange}
                onBlur={profileFormik.handleBlur}
                placeholder="Enter 10-digit phone number"
                className={`block w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  profileFormik.touched.phoneNumber && profileFormik.errors.phoneNumber
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
            </div>
            {profileFormik.touched.phoneNumber && profileFormik.errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{profileFormik.errors.phoneNumber}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={profileLoading}
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50"
          >
            {profileLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
            Save Profile
          </button>
        </div>
      </div>
    </form>
  );

  // Security Settings Tab
  const SecurityTab = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>

      <form onSubmit={passwordFormik.handleSubmit}>
        <div className="space-y-6 max-w-md">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={passwordFormik.values.currentPassword}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                className={`block w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordFormik.errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={passwordFormik.values.newPassword}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                className={`block w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  passwordFormik.touched.newPassword && passwordFormik.errors.newPassword
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordFormik.errors.newPassword}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={passwordFormik.values.confirmPassword}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                className={`block w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordFormik.errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50"
            >
              {passwordLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Shield className="h-5 w-5 mr-2" />}
              Change Password
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white rounded-xl shadow-md">
        {/* Tabs Header */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setTabValue(0)}
              className={`inline-flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                tabValue === 0
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="h-5 w-5 mr-2" />
              Profile
            </button>
            <button
              onClick={() => setTabValue(1)}
              className={`inline-flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                tabValue === 1
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="h-5 w-5 mr-2" />
              Security
            </button>
          </nav>
        </div>

        {/* Tabs Content */}
        <div className="p-6">
          {tabValue === 0 && <ProfileTab />}
          {tabValue === 1 && <SecurityTab />}
        </div>
      </div>

      {/* Toast Notification */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`rounded-lg shadow-lg p-4 flex items-center space-x-3 ${
              snackbar.severity === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className={`flex-shrink-0 ${snackbar.severity === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {snackbar.severity === 'success' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className={`text-sm font-medium ${snackbar.severity === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {snackbar.message}
            </p>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className={`flex-shrink-0 ${snackbar.severity === 'success' ? 'text-green-600' : 'text-red-600'} hover:opacity-75`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

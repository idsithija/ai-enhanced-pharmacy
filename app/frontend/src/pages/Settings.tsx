import { useState } from 'react';
import {
  User,
  Building2,
  Bell,
  Shield,
  Database,
  Mail,
  Phone,
  MapPin,
  Globe,
  Palette,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useFormik } from 'formik';
import * as yup from 'yup';

const profileValidationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').required('Phone is required'),
});

const pharmacyValidationSchema = yup.object({
  pharmacyName: yup.string().required('Pharmacy name is required'),
  licenseNumber: yup.string().required('License number is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipCode: yup.string().required('ZIP code is required'),
  phone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').required('Phone is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
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
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState({
    lowStock: true,
    expiringItems: true,
    newOrders: true,
    customerRegistration: false,
    dailySummary: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  // System preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    currency: 'LKR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-hour',
  });

  const profileFormik = useFormik({
    initialValues: {
      name: 'Admin User',
      email: 'admin@pharmacy.com',
      phone: '9876543210',
      role: 'Administrator',
    },
    validationSchema: profileValidationSchema,
    onSubmit: (values) => {
      console.log('Profile updated:', values);
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
    },
  });

  const pharmacyFormik = useFormik({
    initialValues: {
      pharmacyName: 'Care Pharmacy',
      licenseNumber: 'PH12345678',
      address: '123 Main Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      phone: '9876543210',
      email: 'contact@carepharmacy.com',
      website: 'www.carepharmacy.com',
    },
    validationSchema: pharmacyValidationSchema,
    onSubmit: (values) => {
      console.log('Pharmacy info updated:', values);
      setSnackbar({ open: true, message: 'Pharmacy information updated successfully', severity: 'success' });
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordValidationSchema,
    onSubmit: (values) => {
      console.log('Password changed');
      setSnackbar({ open: true, message: 'Password changed successfully', severity: 'success' });
      passwordFormik.resetForm();
    },
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: string) => {
    setPreferences({ ...preferences, [key]: value });
  };

  // Profile Settings Tab
  const ProfileTab = () => (
    <form onSubmit={profileFormik.handleSubmit}>
      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
            {profileFormik.values.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={profileFormik.values.name}
                onChange={profileFormik.handleChange}
                onBlur={profileFormik.handleBlur}
                className={`block w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  profileFormik.touched.name && profileFormik.errors.name
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
            </div>
            {profileFormik.touched.name && profileFormik.errors.name && (
              <p className="mt-1 text-sm text-red-600">{profileFormik.errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={profileFormik.values.email}
                onChange={profileFormik.handleChange}
                onBlur={profileFormik.handleBlur}
                className={`block w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  profileFormik.touched.email && profileFormik.errors.email
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
            </div>
            {profileFormik.touched.email && profileFormik.errors.email && (
              <p className="mt-1 text-sm text-red-600">{profileFormik.errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="phone"
                name="phone"
                value={profileFormik.values.phone}
                onChange={profileFormik.handleChange}
                onBlur={profileFormik.handleBlur}
                className={`block w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  profileFormik.touched.phone && profileFormik.errors.phone
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
            </div>
            {profileFormik.touched.phone && profileFormik.errors.phone && (
              <p className="mt-1 text-sm text-red-600">{profileFormik.errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              value={profileFormik.values.role}
              disabled
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Profile
          </button>
        </div>
      </div>
    </form>
  );

  // Pharmacy Settings Tab
  const PharmacyTab = () => (
    <form onSubmit={pharmacyFormik.handleSubmit}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pharmacy Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="pharmacyName"
                name="pharmacyName"
                value={pharmacyFormik.values.pharmacyName}
                onChange={pharmacyFormik.handleChange}
                onBlur={pharmacyFormik.handleBlur}
                className={`block w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  pharmacyFormik.touched.pharmacyName && pharmacyFormik.errors.pharmacyName
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
            </div>
            {pharmacyFormik.touched.pharmacyName && pharmacyFormik.errors.pharmacyName && (
              <p className="mt-1 text-sm text-red-600">{pharmacyFormik.errors.pharmacyName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Number
            </label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              value={pharmacyFormik.values.licenseNumber}
              onChange={pharmacyFormik.handleChange}
              onBlur={pharmacyFormik.handleBlur}
              className={`block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                pharmacyFormik.touched.licenseNumber && pharmacyFormik.errors.licenseNumber
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            />
            {pharmacyFormik.touched.licenseNumber && pharmacyFormik.errors.licenseNumber && (
              <p className="mt-1 text-sm text-red-600">{pharmacyFormik.errors.licenseNumber}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="address"
                name="address"
                value={pharmacyFormik.values.address}
                onChange={pharmacyFormik.handleChange}
                onBlur={pharmacyFormik.handleBlur}
                className={`block w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  pharmacyFormik.touched.address && pharmacyFormik.errors.address
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
            </div>
            {pharmacyFormik.touched.address && pharmacyFormik.errors.address && (
              <p className="mt-1 text-sm text-red-600">{pharmacyFormik.errors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={pharmacyFormik.values.city}
              onChange={pharmacyFormik.handleChange}
              onBlur={pharmacyFormik.handleBlur}
              className={`block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                pharmacyFormik.touched.city && pharmacyFormik.errors.city
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            />
            {pharmacyFormik.touched.city && pharmacyFormik.errors.city && (
              <p className="mt-1 text-sm text-red-600">{pharmacyFormik.errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={pharmacyFormik.values.state}
              onChange={pharmacyFormik.handleChange}
              onBlur={pharmacyFormik.handleBlur}
              className={`block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                pharmacyFormik.touched.state && pharmacyFormik.errors.state
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            />
            {pharmacyFormik.touched.state && pharmacyFormik.errors.state && (
              <p className="mt-1 text-sm text-red-600">{pharmacyFormik.errors.state}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={pharmacyFormik.values.zipCode}
              onChange={pharmacyFormik.handleChange}
              onBlur={pharmacyFormik.handleBlur}
              className={`block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                pharmacyFormik.touched.zipCode && pharmacyFormik.errors.zipCode
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            />
            {pharmacyFormik.touched.zipCode && pharmacyFormik.errors.zipCode && (
              <p className="mt-1 text-sm text-red-600">{pharmacyFormik.errors.zipCode}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="phone"
                name="phone"
                value={pharmacyFormik.values.phone}
                onChange={pharmacyFormik.handleChange}
                onBlur={pharmacyFormik.handleBlur}
                className={`block w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  pharmacyFormik.touched.phone && pharmacyFormik.errors.phone
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
            </div>
            {pharmacyFormik.touched.phone && pharmacyFormik.errors.phone && (
              <p className="mt-1 text-sm text-red-600">{pharmacyFormik.errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={pharmacyFormik.values.email}
                onChange={pharmacyFormik.handleChange}
                onBlur={pharmacyFormik.handleBlur}
                className={`block w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  pharmacyFormik.touched.email && pharmacyFormik.errors.email
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
            </div>
            {pharmacyFormik.touched.email && pharmacyFormik.errors.email && (
              <p className="mt-1 text-sm text-red-600">{pharmacyFormik.errors.email}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="text"
              id="website"
              name="website"
              value={pharmacyFormik.values.website}
              onChange={pharmacyFormik.handleChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Pharmacy Info
          </button>
        </div>
      </div>
    </form>
  );

  // Notification Settings Tab
  const NotificationsTab = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h2>
      
      <div className="space-y-4">
        {/* Low Stock Alerts */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Bell className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Low Stock Alerts</p>
              <p className="text-sm text-gray-500">Get notified when items are running low</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleNotificationChange('lowStock')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.lowStock ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.lowStock ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Expiring Items Alerts */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Bell className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Expiring Items Alerts</p>
              <p className="text-sm text-gray-500">Get notified about items nearing expiry</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleNotificationChange('expiringItems')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.expiringItems ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.expiringItems ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* New Orders */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Bell className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">New Orders</p>
              <p className="text-sm text-gray-500">Get notified when new orders are placed</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleNotificationChange('newOrders')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.newOrders ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.newOrders ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Customer Registration */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Customer Registration</p>
              <p className="text-sm text-gray-500">Get notified when new customers register</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleNotificationChange('customerRegistration')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.customerRegistration ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.customerRegistration ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Daily Summary */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Daily Summary</p>
              <p className="text-sm text-gray-500">Receive daily sales and inventory summary</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleNotificationChange('dailySummary')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.dailySummary ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.dailySummary ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Channels</h2>
      
      <div className="space-y-4">
        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Mail className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleNotificationChange('emailNotifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* SMS Notifications */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-500">Receive notifications via SMS</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleNotificationChange('smsNotifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.smsNotifications ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.smsNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setSnackbar({ open: true, message: 'Notification settings saved', severity: 'success' })}
          className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Notification Settings
        </button>
      </div>
    </div>
  );

  // Security Settings Tab
  const SecurityTab = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
      
      <form onSubmit={passwordFormik.handleSubmit}>
        <div className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
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
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordFormik.errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
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
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordFormik.errors.newPassword}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
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
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordFormik.errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              <Shield className="h-5 w-5 mr-2" />
              Change Password
            </button>
          </div>
        </div>
      </form>

      <hr className="my-8 border-gray-200" />

      <h2 className="text-xl font-bold text-gray-900 mb-4">Security Options</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500">Add an extra layer of security</p>
          </div>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium">
            Enable
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-900">Session Timeout</p>
            <p className="text-sm text-gray-500">Auto logout after 30 minutes of inactivity</p>
          </div>
          <button
            type="button"
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600"
          >
            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
          </button>
        </div>
      </div>
    </div>
  );

  // System Settings Tab
  const SystemTab = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">System Preferences</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Theme
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Palette className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={preferences.theme}
              onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={preferences.currency}
            onChange={(e) => handlePreferenceChange('currency', e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="LKR">LKR (Rs)</option>
          </select>
        </div>

        {/* Date Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Format
          </label>
          <select
            value={preferences.dateFormat}
            onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        {/* Time Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Format
          </label>
          <select
            value={preferences.timeFormat}
            onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="12-hour">12-hour</option>
            <option value="24-hour">24-hour</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setSnackbar({ open: true, message: 'System preferences saved', severity: 'success' })}
          className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Preferences
        </button>
      </div>

      <hr className="my-8 border-gray-200" />

      <h2 className="text-xl font-bold text-gray-900 mb-4">Backup & Restore</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Data Card */}
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <Database className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Backup Data</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create a backup of your pharmacy data
          </p>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium">
            Create Backup
          </button>
        </div>

        {/* Restore Data Card */}
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <Database className="h-12 w-12 text-amber-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Restore Data</h3>
          <p className="text-sm text-gray-500 mb-4">
            Restore from a previous backup
          </p>
          <button className="px-4 py-2 border border-amber-300 text-amber-700 bg-white rounded-lg hover:bg-amber-50 transition-colors duration-200 font-medium">
            Restore Backup
          </button>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Bell className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <p className="text-sm text-blue-800">
            Last backup: March 5, 2024 at 2:30 AM
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">⚙️ Settings</h1>

      <div className="bg-white rounded-xl shadow-md">
        {/* Tabs Header */}
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
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
              <Building2 className="h-5 w-5 mr-2" />
              Pharmacy
            </button>
            <button
              onClick={() => setTabValue(2)}
              className={`inline-flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                tabValue === 2
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setTabValue(3)}
              className={`inline-flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                tabValue === 3
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="h-5 w-5 mr-2" />
              Security
            </button>
            <button
              onClick={() => setTabValue(4)}
              className={`inline-flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                tabValue === 4
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="h-5 w-5 mr-2" />
              System
            </button>
          </nav>
        </div>

        {/* Tabs Content */}
        <div className="p-6">
          {tabValue === 0 && <ProfileTab />}
          {tabValue === 1 && <PharmacyTab />}
          {tabValue === 2 && <NotificationsTab />}
          {tabValue === 3 && <SecurityTab />}
          {tabValue === 4 && <SystemTab />}
        </div>
      </div>

      {/* Snackbar/Toast Notification */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`rounded-lg shadow-lg p-4 flex items-center space-x-3 ${
              snackbar.severity === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div
              className={`flex-shrink-0 ${
                snackbar.severity === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {snackbar.severity === 'success' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p
              className={`text-sm font-medium ${
                snackbar.severity === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {snackbar.message}
            </p>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className={`flex-shrink-0 ${
                snackbar.severity === 'success' ? 'text-green-600' : 'text-red-600'
              } hover:opacity-75`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

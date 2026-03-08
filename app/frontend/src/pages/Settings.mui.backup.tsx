import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Person,
  Business,
  Notifications,
  Security,
  Backup,
  Email,
  Phone,
  LocationOn,
  Language,
  Palette,
  Save,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
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
    currency: 'INR',
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: string) => {
    setPreferences({ ...preferences, [key]: value });
  };

  // Profile Settings Tab
  const ProfileTab = () => (
    <form onSubmit={profileFormik.handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Avatar sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: 48 }}>
            {profileFormik.values.name.charAt(0).toUpperCase()}
          </Avatar>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Full Name"
            value={profileFormik.values.name}
            onChange={profileFormik.handleChange}
            onBlur={profileFormik.handleBlur}
            error={profileFormik.touched.name && Boolean(profileFormik.errors.name)}
            helperText={profileFormik.touched.name && profileFormik.errors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={profileFormik.values.email}
            onChange={profileFormik.handleChange}
            onBlur={profileFormik.handleBlur}
            error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
            helperText={profileFormik.touched.email && profileFormik.errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="phone"
            name="phone"
            label="Phone"
            value={profileFormik.values.phone}
            onChange={profileFormik.handleChange}
            onBlur={profileFormik.handleBlur}
            error={profileFormik.touched.phone && Boolean(profileFormik.errors.phone)}
            helperText={profileFormik.touched.phone && profileFormik.errors.phone}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Role" value={profileFormik.values.role} disabled />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" startIcon={<Save />}>
            Save Profile
          </Button>
        </Grid>
      </Grid>
    </form>
  );

  // Pharmacy Settings Tab
  const PharmacyTab = () => (
    <form onSubmit={pharmacyFormik.handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="pharmacyName"
            name="pharmacyName"
            label="Pharmacy Name"
            value={pharmacyFormik.values.pharmacyName}
            onChange={pharmacyFormik.handleChange}
            onBlur={pharmacyFormik.handleBlur}
            error={pharmacyFormik.touched.pharmacyName && Boolean(pharmacyFormik.errors.pharmacyName)}
            helperText={pharmacyFormik.touched.pharmacyName && pharmacyFormik.errors.pharmacyName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Business />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="licenseNumber"
            name="licenseNumber"
            label="License Number"
            value={pharmacyFormik.values.licenseNumber}
            onChange={pharmacyFormik.handleChange}
            onBlur={pharmacyFormik.handleBlur}
            error={pharmacyFormik.touched.licenseNumber && Boolean(pharmacyFormik.errors.licenseNumber)}
            helperText={pharmacyFormik.touched.licenseNumber && pharmacyFormik.errors.licenseNumber}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="address"
            name="address"
            label="Address"
            value={pharmacyFormik.values.address}
            onChange={pharmacyFormik.handleChange}
            onBlur={pharmacyFormik.handleBlur}
            error={pharmacyFormik.touched.address && Boolean(pharmacyFormik.errors.address)}
            helperText={pharmacyFormik.touched.address && pharmacyFormik.errors.address}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="city"
            name="city"
            label="City"
            value={pharmacyFormik.values.city}
            onChange={pharmacyFormik.handleChange}
            onBlur={pharmacyFormik.handleBlur}
            error={pharmacyFormik.touched.city && Boolean(pharmacyFormik.errors.city)}
            helperText={pharmacyFormik.touched.city && pharmacyFormik.errors.city}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="state"
            name="state"
            label="State"
            value={pharmacyFormik.values.state}
            onChange={pharmacyFormik.handleChange}
            onBlur={pharmacyFormik.handleBlur}
            error={pharmacyFormik.touched.state && Boolean(pharmacyFormik.errors.state)}
            helperText={pharmacyFormik.touched.state && pharmacyFormik.errors.state}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="zipCode"
            name="zipCode"
            label="ZIP Code"
            value={pharmacyFormik.values.zipCode}
            onChange={pharmacyFormik.handleChange}
            onBlur={pharmacyFormik.handleBlur}
            error={pharmacyFormik.touched.zipCode && Boolean(pharmacyFormik.errors.zipCode)}
            helperText={pharmacyFormik.touched.zipCode && pharmacyFormik.errors.zipCode}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="phone"
            name="phone"
            label="Phone"
            value={pharmacyFormik.values.phone}
            onChange={pharmacyFormik.handleChange}
            onBlur={pharmacyFormik.handleBlur}
            error={pharmacyFormik.touched.phone && Boolean(pharmacyFormik.errors.phone)}
            helperText={pharmacyFormik.touched.phone && pharmacyFormik.errors.phone}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={pharmacyFormik.values.email}
            onChange={pharmacyFormik.handleChange}
            onBlur={pharmacyFormik.handleBlur}
            error={pharmacyFormik.touched.email && Boolean(pharmacyFormik.errors.email)}
            helperText={pharmacyFormik.touched.email && pharmacyFormik.errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth id="website" name="website" label="Website" value={pharmacyFormik.values.website} onChange={pharmacyFormik.handleChange} />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" startIcon={<Save />}>
            Save Pharmacy Info
          </Button>
        </Grid>
      </Grid>
    </form>
  );

  // Notification Settings Tab
  const NotificationsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Notification Preferences
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <Notifications color="primary" />
          </ListItemIcon>
          <ListItemText primary="Low Stock Alerts" secondary="Get notified when items are running low" />
          <Switch checked={notifications.lowStock} onChange={() => handleNotificationChange('lowStock')} />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemIcon>
            <Notifications color="warning" />
          </ListItemIcon>
          <ListItemText primary="Expiring Items Alerts" secondary="Get notified about items nearing expiry" />
          <Switch checked={notifications.expiringItems} onChange={() => handleNotificationChange('expiringItems')} />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemIcon>
            <Notifications color="success" />
          </ListItemIcon>
          <ListItemText primary="New Orders" secondary="Get notified when new orders are placed" />
          <Switch checked={notifications.newOrders} onChange={() => handleNotificationChange('newOrders')} />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemIcon>
            <Person color="primary" />
          </ListItemIcon>
          <ListItemText primary="Customer Registration" secondary="Get notified when new customers register" />
          <Switch checked={notifications.customerRegistration} onChange={() => handleNotificationChange('customerRegistration')} />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemIcon>
            <Notifications color="info" />
          </ListItemIcon>
          <ListItemText primary="Daily Summary" secondary="Receive daily sales and inventory summary" />
          <Switch checked={notifications.dailySummary} onChange={() => handleNotificationChange('dailySummary')} />
        </ListItem>
      </List>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Notification Channels
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <Email color="primary" />
          </ListItemIcon>
          <ListItemText primary="Email Notifications" secondary="Receive notifications via email" />
          <Switch checked={notifications.emailNotifications} onChange={() => handleNotificationChange('emailNotifications')} />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemIcon>
            <Phone color="success" />
          </ListItemIcon>
          <ListItemText primary="SMS Notifications" secondary="Receive notifications via SMS" />
          <Switch checked={notifications.smsNotifications} onChange={() => handleNotificationChange('smsNotifications')} />
        </ListItem>
      </List>
      <Box sx={{ mt: 3 }}>
        <Button variant="contained" startIcon={<Save />} onClick={() => setSnackbar({ open: true, message: 'Notification settings saved', severity: 'success' })}>
          Save Notification Settings
        </Button>
      </Box>
    </Box>
  );

  // Security Settings Tab
  const SecurityTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Change Password
      </Typography>
      <form onSubmit={passwordFormik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="currentPassword"
              name="currentPassword"
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordFormik.values.currentPassword}
              onChange={passwordFormik.handleChange}
              onBlur={passwordFormik.handleBlur}
              error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
              helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="newPassword"
              name="newPassword"
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={passwordFormik.values.newPassword}
              onChange={passwordFormik.handleChange}
              onBlur={passwordFormik.handleBlur}
              error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
              helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordFormik.values.confirmPassword}
              onChange={passwordFormik.handleChange}
              onBlur={passwordFormik.handleBlur}
              error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
              helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" startIcon={<Security />}>
              Change Password
            </Button>
          </Grid>
        </Grid>
      </form>
      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Security Options
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Two-Factor Authentication" secondary="Add an extra layer of security" />
          <Button variant="outlined">Enable</Button>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary="Session Timeout" secondary="Auto logout after 30 minutes of inactivity" />
          <Switch defaultChecked />
        </ListItem>
      </List>
    </Box>
  );

  // System Settings Tab
  const SystemTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        System Preferences
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Language"
            value={preferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
            SelectProps={{ native: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Language />
                </InputAdornment>
              ),
            }}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Theme"
            value={preferences.theme}
            onChange={(e) => handlePreferenceChange('theme', e.target.value)}
            SelectProps={{ native: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Palette />
                </InputAdornment>
              ),
            }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Currency"
            value={preferences.currency}
            onChange={(e) => handlePreferenceChange('currency', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Date Format"
            value={preferences.dateFormat}
            onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Time Format"
            value={preferences.timeFormat}
            onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="12-hour">12-hour</option>
            <option value="24-hour">24-hour</option>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" startIcon={<Save />} onClick={() => setSnackbar({ open: true, message: 'System preferences saved', severity: 'success' })}>
            Save Preferences
          </Button>
        </Grid>
      </Grid>
      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Backup & Restore
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Backup sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Backup Data
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Create a backup of your pharmacy data
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>
              Create Backup
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Backup sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Restore Data
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Restore from a previous backup
            </Typography>
            <Button variant="outlined" color="warning" sx={{ mt: 2 }}>
              Restore Backup
            </Button>
          </Paper>
        </Grid>
      </Grid>
      <Alert severity="info" sx={{ mt: 3 }}>
        Last backup: March 5, 2024 at 2:30 AM
      </Alert>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        ⚙️ Settings
      </Typography>

      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Profile" icon={<Person />} iconPosition="start" />
          <Tab label="Pharmacy" icon={<Business />} iconPosition="start" />
          <Tab label="Notifications" icon={<Notifications />} iconPosition="start" />
          <Tab label="Security" icon={<Security />} iconPosition="start" />
          <Tab label="System" icon={<Backup />} iconPosition="start" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <ProfileTab />}
          {tabValue === 1 && <PharmacyTab />}
          {tabValue === 2 && <NotificationsTab />}
          {tabValue === 3 && <SecurityTab />}
          {tabValue === 4 && <SystemTab />}
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

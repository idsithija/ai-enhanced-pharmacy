# Frontend Screens & UI Documentation
## AI-Enhanced Pharmacy Management System

**Version**: 1.0.0  
**Date**: 2025-10-20  
**Developer**: @idsithija  
**Framework**: React.js with Material-UI

---

## Table of Contents
1. [Screen Hierarchy & Navigation](#screen-hierarchy--navigation)
2. [Authentication Screens](#authentication-screens)
3. [Admin Dashboard & Screens](#admin-dashboard--screens)
4. [Pharmacist Dashboard & Screens](#pharmacist-dashboard--screens)
5. [Customer Dashboard & Screens](#customer-dashboard--screens)
6. [AI Feature Screens](#ai-feature-screens)
7. [Component Library](#component-library)
8. [Responsive Design Guidelines](#responsive-design-guidelines)

---

## Screen Hierarchy & Navigation

### Complete Application Structure

```
AI Pharmacy System
│
├── 🔓 PUBLIC ROUTES (No Authentication)
│   ├── / (Landing Page)
│   ├── /login
│   ├── /register
│   ├── /forgot-password
│   └── /about
│
├── 🔐 ADMIN ROUTES (/admin/*)
│   ├── /admin/dashboard
│   ├── /admin/users
│   │   ├── /admin/users/list
│   │   ├── /admin/users/create
│   │   └── /admin/users/:id/edit
│   ├── /admin/medicines
│   │   ├── /admin/medicines/list
│   │   ├── /admin/medicines/create
│   │   └── /admin/medicines/:id/edit
│   ├── /admin/categories
│   ├── /admin/suppliers
│   ├── /admin/reports
│   │   ├── /admin/reports/sales
│   │   ├── /admin/reports/inventory
│   │   ├── /admin/reports/expiry
│   │   └── /admin/reports/financial
│   ├── /admin/settings
│   └── /admin/audit-logs
│
├── 🔐 PHARMACIST ROUTES (/pharmacist/*)
│   ├── /pharmacist/dashboard
│   ├── /pharmacist/pos (Point of Sale)
│   ├── /pharmacist/prescriptions
│   │   ├── /pharmacist/prescriptions/list
│   │   ├── /pharmacist/prescriptions/scan (AI Scanner)
│   │   └── /pharmacist/prescriptions/:id/view
│   ├── /pharmacist/inventory
│   │   ├── /pharmacist/inventory/view
│   │   ├── /pharmacist/inventory/alerts
│   │   └── /pharmacist/inventory/predictions (AI)
│   ├── /pharmacist/medicines
│   │   ├── /pharmacist/medicines/search
│   │   └── /pharmacist/medicines/:id/details
│   ├── /pharmacist/customers
│   │   ├── /pharmacist/customers/search
│   │   └── /pharmacist/customers/:id/profile
│   ├── /pharmacist/sales
│   │   ├── /pharmacist/sales/history
│   │   └── /pharmacist/sales/:id/invoice
│   └── /pharmacist/ai-tools
│       ├── /pharmacist/ai-tools/drug-checker
│       └── /pharmacist/ai-tools/chatbot
│
├── 🔐 CUSTOMER ROUTES (/customer/*)
│   ├── /customer/dashboard
│   ├── /customer/profile
│   ├── /customer/prescriptions
│   │   ├── /customer/prescriptions/upload
│   │   └── /customer/prescriptions/history
│   ├── /customer/orders
│   │   └── /customer/orders/:id/details
│   ├── /customer/medicines
│   │   └── /customer/medicines/search
│   └── /customer/chatbot
│
└── 🔐 COMMON ROUTES (All Authenticated Users)
    ├── /profile
    ├── /change-password
    ├── /notifications
    └── /help
```

---

## Authentication Screens

### 1. Landing Page (/)

**Purpose**: Welcome page with system overview  
**Access**: Public  
**Route**: `/`

#### Wireframe
```
┌─────────────────────────────────────────────────────────┐
│  [LOGO] AI Pharmacy System          [Login] [Register] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              🏥 AI-Enhanced Pharmacy                     │
│               Management System                          │
│                                                          │
│        Revolutionize your pharmacy with AI              │
│                                                          │
│         [Get Started] [Learn More]                      │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  ✨ Key Features                                        │
│                                                          │
│  📸 AI Prescription     💊 Drug Interaction             │
│     Scanner                Checker                      │
│                                                          │
│  📊 Inventory           🤖 AI Chatbot                   │
│     Prediction             Assistant                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  📞 Contact | 📄 About | 🔒 Privacy                    │
└─────────────────────────────────────────────────────────┘
```

#### Components Needed
```jsx
// pages/LandingPage.jsx
- <Navbar />
- <HeroSection />
- <FeaturesSection />
- <CTASection />
- <Footer />
```

---

### 2. Login Page (/login)

**Purpose**: User authentication  
**Access**: Public  
**Route**: `/login`

#### Wireframe
```
┌──────────────────────────────────────────────┐
│                                               │
│           🏥 AI Pharmacy System              │
│                                               │
│  ┌────────────────────────────────────┐     │
│  │         Login to Continue          │     │
│  ├────────────────────────────────────┤     │
│  │                                     │     │
│  │  Email or Username                 │     │
│  │  [____________________________]    │     │
│  │                                     │     │
│  │  Password                          │     │
│  │  [____________________________] 👁  │     │
│  │                                     │     │
│  │  [ ] Remember me                   │     │
│  │           [Forgot Password?]       │     │
│  │                                     │     │
│  │        [  Login  ]                 │     │
│  │                                     │     │
│  │  ────────── or ──────────         │     │
│  │                                     │     │
│  │  Don't have an account?            │     │
│  │  [Register Now]                    │     │
│  │                                     │     │
│  └────────────────────────────────────┘     │
│                                               │
└──────────────────────────────────────────────┘
```

#### Component Code Structure

```jsx
// pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { login } from '../services/authService';

const validationSchema = Yup.object({
  email: Yup.string()
    .required('Email or username is required'),
  password: Yup.string()
    .required('Password is required')
});

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        
        const response = await login(values.email, values.password);
        
        // Store token
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Redirect based on role
        const role = response.user.role;
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'pharmacist') {
          navigate('/pharmacist/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
              🏥 AI Pharmacy System
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" mb={3}>
              Login to Continue
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                label="Email or Username"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="rememberMe"
                      checked={formik.values.rememberMe}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Remember me"
                />
                <Link href="/forgot-password" underline="hover">
                  Forgot Password?
                </Link>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <Typography align="center" sx={{ mt: 2 }}>
                Don't have an account?{' '}
                <Link href="/register" underline="hover">
                  Register Now
                </Link>
              </Typography>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;
```

---

### 3. Register Page (/register)

**Purpose**: New user registration  
**Access**: Public  
**Route**: `/register`

#### Wireframe
```
┌──────────────────────────────────────────────┐
│           🏥 Create New Account              │
│                                               │
│  ┌────────────────────────────────────┐     │
│  │  First Name        Last Name       │     │
│  │  [______________]  [______________]│     │
│  │                                     │     │
│  │  Username                          │     │
│  │  [____________________________]    │     │
│  │                                     │     │
│  │  Email                             │     │
│  │  [____________________________]    │     │
│  │                                     │     │
│  │  Phone Number                      │     │
│  │  [____________________________]    │     │
│  │                                     │     │
│  │  Password                          │     │
│  │  [____________________________] 👁  │     │
│  │  ▓▓▓▓░░░░ Weak                     │     │
│  │                                     │     │
│  │  Confirm Password                  │     │
│  │  [____________________________] 👁  │     │
│  │                                     │     │
│  │  [ ] I agree to Terms & Conditions │     │
│  │                                     │     │
│  │        [  Register  ]              │     │
│  │                                     │     │
│  │  Already have an account? [Login]  │     │
│  └────────────────────────────────────┘     │
└──────────────────────────────────────────────┘
```

#### Validation Rules
- First Name: Required, 2-50 characters
- Last Name: Required, 2-50 characters
- Username: Required, 3-50 characters, alphanumeric, unique
- Email: Required, valid email format, unique
- Phone: Optional, valid phone format
- Password: Required, min 8 characters, 1 uppercase, 1 lowercase, 1 number
- Confirm Password: Must match password
- Terms: Must be checked

---

## Admin Dashboard & Screens

### 1. Admin Dashboard (/admin/dashboard)

**Purpose**: Overview of entire system  
**Access**: Admin only  
**Route**: `/admin/dashboard`

#### Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ [LOGO] AI Pharmacy    [🔔 Notifications]  [👤 Admin ▼]            │
├─────────────────────────────────────────────────────────────────────┤
│ 📊 Dashboard                                       Oct 20, 2025    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ 💰 Revenue  │ │ 📦 Orders   │ │ 💊 Medicines│ │ 👥 Customers│ │
│  │             │ │             │ │             │ │             │ │
│  │  $45,230    │ │    1,234    │ │    856      │ │    342      │ │
│  │  +12.5% ↗   │ │   +8.2% ↗   │ │   +3.4% ↗   │ │   +15% ↗    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                                      │
│  ┌────────────────────────────┐  ┌────────────────────────────┐   │
│  │ 📈 Sales Chart (Last 7 Days│  │ ⚠️  Alerts & Warnings      │   │
│  ├────────────────────────────┤  ├────────────────────────────┤   │
│  │         ┌─┐                │  │                             │   │
│  │      ┌─┐│ │  ┌─┐           │  │ 🔴 15 medicines expiring    │   │
│  │   ┌─┐│ ││ │┌─┤ │           │  │    in 30 days               │   │
│  │ ┌─┤ ││ ││ ││ │ │  ┌─┐      │  │                             │   │
│  │ │ │ ││ ││ ││ │ │┌─┤ │      │  │ 🟡 8 medicines low stock    │   │
│  │─┴─┴─┴┴─┴┴─┴┴─┴─┴┴─┴─┴──   │  │                             │   │
│  │ Mon Tue Wed Thu Fri Sat Sun│  │ 🟢 Inventory prediction     │   │
│  │                             │  │    complete                 │   │
│  └────────────────────────────┘  └────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 📋 Recent Activities                                         │  │
│  ├─────────────────────────────────────────────────────────────┤  │
│  │ • John Doe processed sale #INV-1234           2 mins ago     │  │
│  │ • New prescription uploaded by Jane Smith     5 mins ago     │  │
│  │ • Inventory updated: Amoxicillin 500mg       10 mins ago     │  │
│  │ • New user registered: Mark Wilson           15 mins ago     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Component Structure

```jsx
// pages/admin/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as OrdersIcon,
  LocalPharmacy as MedicineIcon,
  People as CustomersIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import SalesChart from '../../components/dashboard/SalesChart';
import AlertsWidget from '../../components/dashboard/AlertsWidget';
import RecentActivities from '../../components/dashboard/RecentActivities';
import { getDashboardStats } from '../../services/dashboardService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    revenue: { value: 0, change: 0 },
    orders: { value: 0, change: 0 },
    medicines: { value: 0, change: 0 },
    customers: { value: 0, change: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          📊 Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Revenue"
              value={`$${stats.revenue.value.toLocaleString()}`}
              change={stats.revenue.change}
              icon={<TrendingUpIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Orders"
              value={stats.orders.value.toLocaleString()}
              change={stats.orders.change}
              icon={<OrdersIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Medicines"
              value={stats.medicines.value.toLocaleString()}
              change={stats.medicines.change}
              icon={<MedicineIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Customers"
              value={stats.customers.value.toLocaleString()}
              change={stats.customers.change}
              icon={<CustomersIcon />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Charts and Alerts */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <SalesChart />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <AlertsWidget />
          </Grid>
        </Grid>

        {/* Recent Activities */}
        <Box sx={{ mt: 3 }}>
          <RecentActivities />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default AdminDashboard;
```

---

### 2. Medicine Management (/admin/medicines/list)

**Purpose**: Manage all medicines in system  
**Access**: Admin only  
**Route**: `/admin/medicines/list`

#### Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ 💊 Medicine Management                                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [🔍 Search medicines...]         [Filter ▼] [+ Add New Medicine]  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ID │ Name        │ Generic    │ Category │ Price │ Stock │⚙️│  │
│  ├────┼─────────────┼────────────┼──────────┼───────┼───────┼──┤  │
│  │ 1  │ Amoxicillin │ Amoxicillin│ Antibiotic│$2.50 │ 234  │✎│  │
│  │    │ 500mg       │            │          │       │       │🗑│  │
│  ├────┼─────────────┼────────────┼──────────┼───────┼───────┼──┤  │
│  │ 2  │ Paracetamol │ Paracetamol│ Pain     │$0.50 │ 567  │✎│  │
│  │    │ 500mg       │            │ Relief   │       │       │🗑│  │
│  ├────┼─────────────┼────────────┼──────────┼───────┼───────┼──┤  │
│  │ 3  │ Aspirin     │ ASA        │ Pain     │$1.20 │ 123  │✎│  │
│  │    │ 100mg       │            │ Relief   │       │ ⚠️Low│🗑│  │
│  ├────┼─────────────┼────────────┼──────────┼───────┼───────┼──┤  │
│  │ 4  │ Metformin   │ Metformin  │ Diabetes │$1.50 │ 345  │✎│  │
│  │    │ 500mg       │            │          │       │       │🗑│  │
│  └────┴─────────────┴────────────┴──────────┴───────┴───────┴──┘  │
│                                                                      │
│  Showing 1-4 of 856 medicines        [< Previous] [1][2][3] [Next >]│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Features
- **Search**: Real-time search by name, generic name, or barcode
- **Filter**: By category, stock level, expiry status
- **Sort**: By name, price, stock, date added
- **Bulk Actions**: Delete multiple, export to Excel/PDF
- **Quick Actions**: Edit, Delete, View Details

#### Component Code

```jsx
// pages/admin/MedicineList.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getMedicines, deleteMedicine } from '../../services/medicineService';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const MedicineList = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  useEffect(() => {
    loadMedicines();
  }, [page, rowsPerPage, searchQuery]);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const response = await getMedicines({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery
      });
      setMedicines(response.data);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Failed to load medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMedicine(id);
      loadMedicines();
      setDeleteDialog({ open: false, id: null });
    } catch (error) {
      console.error('Failed to delete medicine:', error);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'error' };
    if (quantity < 50) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">💊 Medicine Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/medicines/create')}
          >
            Add New Medicine
          </Button>
        </Box>

        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search medicines by name, generic name, or barcode..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
          >
            Filter
          </Button>
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Generic Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center">Stock</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medicines.map((medicine) => {
                const stockStatus = getStockStatus(medicine.totalStock);
                return (
                  <TableRow key={medicine.id}>
                    <TableCell>{medicine.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {medicine.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {medicine.strength}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{medicine.genericName}</TableCell>
                    <TableCell>{medicine.category?.name}</TableCell>
                    <TableCell align="right">${medicine.unitPrice}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${medicine.totalStock} ${stockStatus.label}`}
                        color={stockStatus.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/medicines/${medicine.id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, id: medicine.id })}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialog.open}
          title="Delete Medicine"
          message="Are you sure you want to delete this medicine? This action cannot be undone."
          onConfirm={() => handleDelete(deleteDialog.id)}
          onCancel={() => setDeleteDialog({ open: false, id: null })}
        />
      </Box>
    </DashboardLayout>
  );
};

export default MedicineList;
```

---

## Pharmacist Dashboard & Screens

### 1. Point of Sale (POS) System (/pharmacist/pos)

**Purpose**: Process sales transactions  
**Access**: Pharmacist only  
**Route**: `/pharmacist/pos`

#### Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🛒 Point of Sale                              Invoice #: INV-001234 │
├────────────────────────────────────┬────────────────────────────────┤
│                                    │                                │
│ 🔍 Search Medicine                │  📋 Current Cart               │
│ [Search by name/barcode...]       │                                │
│                                    │  Paracetamol 500mg             │
│ 📦 Search Results:                │  Qty: 2  $0.50  = $1.00  [x]  │
│                                    │                                │
│ ┌──────────────────────────────┐  │  Amoxicillin 500mg             │
│ │ Paracetamol 500mg            │  │  Qty: 1  $2.50  = $2.50  [x]  │
│ │ Generic: Paracetamol         │  │                                │
│ │ Stock: 567 | Price: $0.50    │  │  Vitamin D3 1000IU             │
│ │ Category: Pain Relief        │  │  Qty: 1  $5.00  = $5.00  [x]  │
│ │           [+ Add to Cart]    │  │                                │
│ └──────────────────────────────┘  │  ────────────────────────────  │
│                                    │  Subtotal:          $8.50      │
│ ┌──────────────────────────────┐  │  Discount (10%):   -$0.85      │
│ │ Amoxicillin 500mg            │  │  Tax (5%):         +$0.38      │
│ │ Generic: Amoxicillin         │  │  ────────────────────────────  │
│ │ Stock: 234 | Price: $2.50    │  │  Total:             $8.03      │
│ │ Category: Antibiotic         │  │                                │
│ │ ⚠️ Requires Prescription     │  │  ────────────────────────────  │
│ │           [+ Add to Cart]    │  │                                │
│ └──────────────────────────────┘  │  Customer: [Select Customer ▼] │
│                                    │  Phone: [+1234567890]          │
│ [Scan Barcode 📷]                 │                                │
│                                    │  Payment Mode:                 │
│                                    │  (•) Cash  ( ) Card  ( ) UPI  │
│                                    │                                │
│                                    │  [Clear Cart] [Process Sale]  │
│                                    │                                │
└────────────────────────────────────┴────────────────────────────────┘
```

#### Key Features
- **Medicine Search**: Type-ahead search with auto-complete
- **Barcode Scanner**: Use camera or USB scanner
- **Cart Management**: Add, remove, update quantities
- **Customer Selection**: Link sale to customer profile
- **Prescription Check**: Warn if medicine requires Rx
- **Discount Application**: Manual or coupon-based
- **Multiple Payment Modes**: Cash, Card, UPI, Insurance
- **Real-time Stock Check**: Show available quantity
- **Print Invoice**: Auto-print or email

---

### 2. AI Prescription Scanner (/pharmacist/prescriptions/scan)

**Purpose**: Scan and process prescriptions using AI  
**Access**: Pharmacist only  
**Route**: `/pharmacist/prescriptions/scan`

#### Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ 📸 AI Prescription Scanner                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Step 1: Upload or Capture Prescription                            │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                                                             │    │
│  │              📷 CAMERA VIEW / IMAGE PREVIEW                │    │
│  │                                                             │    │
│  │                    [Prescription Image]                    │    │
│  │                                                             │    │
│  │                                                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  [📷 Take Photo]  [📁 Upload File]  [🔄 Retake]                    │
│                                                                      │
│  ─────────────────────────────────────────────────────────────     │
│                                                                      │
│  Step 2: AI Processing (When image uploaded)                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ 🔄 Processing...                                            │    │
│  │                                                             │    │
│  │ ✓ Image uploaded                                           │    │
│  │ ⏳ Extracting text (OCR)...        [████████░░] 80%        │    │
│  │ ⏳ Analyzing prescription (NLP)... [████░░░░░░] 40%        │    │
│  │ ⏳ Checking drug interactions...   [██░░░░░░░░] 20%        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ─────────────────────────────────────────────────────────────     │
│                                                                      │
│  Step 3: Review & Verify Extracted Data                            │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Prescription Details:                                       │    │
│  │                                                             │    │
│  │ Doctor: Dr. Sarah Johnson        Patient: John Doe         │    │
│  │ Date: 2025-10-20                 Confidence: 92%           │    │
│  │                                                             │    │
│  │ Extracted Medicines:                                        │    │
│  │ ┌─────────────────────────────────────────────────────┐   │    │
│  │ │ Medicine      │ Dosage│ Frequency │ Duration│ ✓/✎  │   │    │
│  │ ├───────────────┼───────┼───────────┼─────────┼──────┤   │    │
│  │ │ Amoxicillin   │ 500mg │ 2x/day    │ 7 days  │ ✓    │   │    │
│  │ ├───────────────┼───────┼───────────┼─────────┼──────┤   │    │
│  │ │ Paracetamol   │ 500mg │ 3x/day    │ 5 days  │ ✓    │   │    │
│  │ ├───────────────┼───────┼───────────┼─────────┼──────┤   │    │
│  │ │ Vitamin D3    │1000IU │ 1x/day    │ 30 days │ ✓    │   │    │
│  │ └─────────────────────────────────────────────────────┘   │    │
│  │                                                             │    │
│  │ ⚠️ Warnings:                                               │    │
│  │ 🟡 Moderate interaction detected between Amoxicillin       │    │
│  │    and patient's current medication (Warfarin)             │    │
│  │    Recommendation: Monitor closely for bleeding            │    │
│  │                                                             │    │
│  │ [✎ Edit Details]  [✓ Verify & Process]  [✗ Cancel]       │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### User Flow
1. **Upload/Capture**: Pharmacist uploads prescription image or takes photo
2. **AI Processing**: 
   - OCR extracts text (Tesseract.js)
   - NLP parses medicines, dosage, frequency (Natural.js)
   - Drug interaction check (OpenFDA API)
3. **Review**: Pharmacist reviews extracted data
4. **Edit**: Make corrections if needed
5. **Verify**: Mark as verified and save to database
6. **Process**: Optionally create sale immediately

---

### 3. Inventory View (/pharmacist/inventory/view)

**Purpose**: View and manage inventory  
**Access**: Pharmacist only  
**Route**: `/pharmacist/inventory/view`

#### Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ 📦 Inventory Management                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [🔍 Search...]  [Filter ▼]  [Export]  [+ Add Stock]               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Medicine    │Batch#│ Qty │ Exp.Date  │Supplier│Location│⚙️   │  │
│  ├─────────────┼──────┼─────┼───────────┼────────┼────────┼─────┤  │
│  │ Amoxicillin │B123  │ 150 │ 2026-05-12│PharmaCo│ A-12   │ ✎  │  │
│  │ 500mg       │      │     │           │        │        │     │  │
│  ├─────────────┼──────┼─────┼───────────┼────────┼────────┼─────┤  │
│  │ Paracetamol │B456  │ 45  │ 2025-12-01│MediCorp│ B-05   │ ✎  │  │
│  │ 500mg       │      │⚠️Low│           │        │        │     │  │
│  ├─────────────┼──────┼─────┼───────────┼────────┼────────┼─────┤  │
│  │ Aspirin     │B789  │ 12  │ 2025-11-15│PharmaCo│ A-08   │ ✎  │  │
│  │ 100mg       │      │🔴Critical│ 🕐 26 days│      │        │     │  │
│  └─────────────┴──────┴─────┴───────────┴────────┴────────┴─────┘  │
│                                                                      │
│  📊 Inventory Summary:                                              │
│  Total SKUs: 856 | Total Stock Value: $125,430 | Low Stock: 23    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Customer Dashboard & Screens

### 1. Customer Dashboard (/customer/dashboard)

**Purpose**: Customer overview and quick actions  
**Access**: Customer only  
**Route**: `/customer/dashboard`

#### Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ Welcome back, Jane! 👋                        [🔔] [👤 Jane ▼]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────┐  ┌────────────────────────────┐  │
│  │ 📋 My Prescriptions          │  │ 🛒 Recent Orders           │  │
│  ├──────────────────────────────┤  ├────────────────────────────┤  │
│  │                               │  │                             │  │
│  │ Active: 2                    │  │ Last order: Oct 18, 2025   │  │
│  │ Expired: 5                   │  │ Amount: $28.50             │  │
│  │                               │  │ Status: Delivered ✓        │  │
│  │ [Upload New]  [View All]     │  │                             │  │
│  └──────────────────────────────┘  │ [View Details]             │  │
│                                     └────────────────────────────┘  │
│  ┌──────────────────────────────┐  ┌────────────────────────────┐  │
│  │ 💊 Medicine Reminders        │  │ 🤖 AI Assistant            │  │
│  ├──────────────────────────────┤  ├────────────────────────────┤  │
│  │                               │  │                             │  │
│  │ 🔔 Amoxicillin - Take now    │  │ Hi! How can I help you?   │  │
│  │ 🔔 Vitamin D - In 2 hours    │  │                             │  │
│  │                               │  │ [💬 Start Chat]            │  │
│  │ [Manage Reminders]           │  │                             │  │
│  └──────────────────────────────┘  └────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## AI Feature Screens

### 1. Drug Interaction Checker (/pharmacist/ai-tools/drug-checker)

**Purpose**: Check drug interactions manually  
**Access**: Pharmacist only  
**Route**: `/pharmacist/ai-tools/drug-checker`

#### Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ ⚕️ Drug Interaction Checker (AI Powered)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Select medicines to check for interactions:                        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ [Search and add medicines...]                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Selected Medicines:                                                │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ 💊 Amoxicillin 500mg                                  [x]  │    │
│  │ 💊 Warfarin 5mg                                       [x]  │    │
│  │ 💊 Aspirin 100mg                                      [x]  │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│                    [🔍 Check Interactions]                          │
│                                                                      │
│  ═══════════════════════════════════════════════════════════════   │
│                                                                      │
│  Results:                                                           │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ 🔴 CRITICAL INTERACTION FOUND                              │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │                                                             │    │
│  │ Warfarin ⚠️ Aspirin                                        │    │
│  │                                                             │    │
│  │ Severity: Critical                                         │    │
│  │ Risk: Increased bleeding risk                              │    │
│  │                                                             │    │
│  │ Description:                                                │    │
│  │ Concurrent use of warfarin and aspirin significantly       │    │
│  │ increases the risk of bleeding complications.              │    │
│  │                                                             │    │
│  │ Recommendation:                                             │    │
│  │ • Avoid concurrent use if possible                         │    │
│  │ • If necessary, monitor INR closely                        │    │
│  │ • Watch for signs of bleeding                              │    │
│  │ • Consider alternative antiplatelet agents                 │    │
│  │                                                             │    │
│  │ Source: OpenFDA Database                                   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ 🟡 MODERATE INTERACTION FOUND                              │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │                                                             │    │
│  │ Amoxicillin ⚠️ Warfarin                                    │    │
│  │                                                             │    │
│  │ Severity: Moderate                                         │    │
│  │ Risk: May affect blood clotting                            │    │
│  │                                                             │    │
│  │ [View Details]                                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  [📄 Print Report]  [📧 Email Report]  [💾 Save to File]          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 2. AI Chatbot (/customer/chatbot)

**Purpose**: AI assistant for medicine queries  
**Access**: All authenticated users  
**Route**: `/customer/chatbot` or `/pharmacist/ai-tools/chatbot`

#### Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🤖 AI Pharmacy Assistant                                      [✕]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                                                             │    │
│  │  🤖 Hi! I'm your AI pharmacy assistant.                    │    │
│  │     How can I help you today?                              │    │
│  │                                                             │    │
│  │  ────────────────────────────────────────                  │    │
│  │                                                             │    │
│  │                     👤 Do you have Paracetamol in stock?   │    │
│  │                                                             │    │
│  │  🤖 Yes! We have Paracetamol 500mg in stock.              │    │
│  │     Available quantity: 567 units                          │    │
│  │     Price: $0.50 per tablet                                │    │
│  │                                                             │    │
│  │     Would you like to know more details or check          │    │
│  │     drug interactions?                                     │    │
│  │                                                             │    │
│  │  ────────────────────────────────────────                  │    │
│  │                                                             │    │
│  │                     👤 Can I take it with Aspirin?         │    │
│  │                                                             │    │
│  │  🤖 Let me check drug interactions for you...             │    │
│  │                                                             │    │
│  │     ✓ Good news! Paracetamol and Aspirin generally        │    │
│  │       don't have significant interactions.                 │    │
│  │                                                             │    │
│  │     However, I recommend:                                  │    │
│  │     • Taking them at different times                       │    │
│  │     • Consulting your doctor if unsure                     │    │
│  │                                                             │    │
│  │     Is there anything else I can help with?               │    │
│  │                                                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ [Type your message here...]                        [Send 📤]│    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Quick Questions:                                                   │
│  [Check Stock] [Drug Info] [Interactions] [Store Hours]            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Library

### Reusable Components

#### 1. StatCard Component
```jsx
// components/dashboard/StatCard.jsx

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatCard = ({ title, value, change, icon, color = 'primary' }) => {
  const isPositive = change >= 0;
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {isPositive ? (
                <TrendingUp color="success" fontSize="small" />
              ) : (
                <TrendingDown color="error" fontSize="small" />
              )}
              <Typography
                variant="body2"
                color={isPositive ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5 }}
              >
                {Math.abs(change)}%
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: `${color}.lighter`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: `${color}.main`
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
```

#### 2. SearchBar Component
```jsx
// components/common/SearchBar.jsx

import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const SearchBar = ({ placeholder, value, onChange, fullWidth = true }) => {
  return (
    <TextField
      fullWidth={fullWidth}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        )
      }}
    />
  );
};

export default SearchBar;
```

#### 3. DashboardLayout Component
```jsx
// components/layouts/DashboardLayout.jsx

import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Typography, Avatar, Menu, MenuItem } from '@mui/material';
import { Menu as MenuIcon, Dashboard, LocalPharmacy, Inventory, ShoppingCart, People, Settings, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 240;

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Medicines', icon: <LocalPharmacy />, path: '/admin/medicines/list' },
    { text: 'Inventory', icon: <Inventory />, path: '/admin/inventory' },
    { text: 'Sales', icon: <ShoppingCart />, path: '/admin/sales' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Settings', icon: <Settings />, path: '/admin/settings' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap>
          🏥 Pharmacy
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            AI Pharmacy System
          </Typography>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar>{user.firstName?.[0]}</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' }
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
```

---

## Responsive Design Guidelines

### Breakpoints (Material-UI)
```javascript
const breakpoints = {
  xs: 0,      // Mobile phones (portrait)
  sm: 600,    // Mobile phones (landscape) / Tablets (portrait)
  md: 900,    // Tablets (landscape) / Small laptops
  lg: 1200,   // Desktops
  xl: 1536    // Large desktops
};
```

### Mobile-First Approach
```jsx
// Stack cards vertically on mobile, horizontally on desktop
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    <StatCard />
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <StatCard />
  </Grid>
</Grid>
```

### Touch-Friendly
- Minimum touch target: 44x44 pixels
- Adequate spacing between interactive elements
- Large, easy-to-tap buttons

---

## Color Scheme

```javascript
const theme = {
  primary: '#1976d2',    // Blue
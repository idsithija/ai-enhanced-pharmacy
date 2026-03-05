import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  InputAdornment,
  Avatar,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Snackbar,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Person,
  Phone,
  Email,
  LocationOn,
  Stars,
  ShoppingBag,
  TrendingUp,
  CardGiftcard,
  Cake,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import type { Customer } from '../types';
import { customerService } from '../services/customerService';

interface PurchaseHistory {
  id: string;
  invoiceNumber: string;
  date: string;
  totalAmount: number;
  paymentMethod: string;
  itemCount: number;
  pointsEarned: number;
}

// Mock data
const mockCustomers: (Customer & { totalSpent: number; totalPurchases: number })[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '9876543210',
    email: 'john.doe@email.com',
    address: '123 Main St, Springfield',
    dateOfBirth: '1985-06-15',
    loyaltyPoints: 450,
    totalSpent: 15680.50,
    totalPurchases: 42,
    createdAt: '2023-01-15T10:00:00',
    updatedAt: '2024-03-05T10:00:00',
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '9876543211',
    email: 'jane.smith@email.com',
    address: '456 Oak Ave, Springfield',
    dateOfBirth: '1990-03-22',
    loyaltyPoints: 1250,
    totalSpent: 28500.75,
    totalPurchases: 78,
    createdAt: '2022-08-20T09:00:00',
    updatedAt: '2024-03-05T11:00:00',
  },
  {
    id: '3',
    name: 'Robert Brown',
    phone: '9876543212',
    email: 'robert.brown@email.com',
    address: '789 Pine Rd, Springfield',
    loyaltyPoints: 180,
    totalSpent: 5420.25,
    totalPurchases: 18,
    createdAt: '2023-11-10T14:00:00',
    updatedAt: '2024-03-04T15:00:00',
  },
  {
    id: '4',
    name: 'Emily Davis',
    phone: '9876543213',
    email: 'emily.davis@email.com',
    address: '321 Elm St, Springfield',
    dateOfBirth: '1988-12-08',
    loyaltyPoints: 820,
    totalSpent: 19250.00,
    totalPurchases: 56,
    createdAt: '2023-03-05T11:00:00',
    updatedAt: '2024-03-05T09:00:00',
  },
  {
    id: '5',
    name: 'Michael Wilson',
    phone: '9876543214',
    loyaltyPoints: 65,
    totalSpent: 1850.00,
    totalPurchases: 7,
    createdAt: '2024-02-01T13:00:00',
    updatedAt: '2024-03-02T10:00:00',
  },
];

const mockPurchaseHistory: { [customerId: string]: PurchaseHistory[] } = {
  '1': [
    { id: '1', invoiceNumber: 'INV001', date: '2024-03-05T10:00:00', totalAmount: 450.50, paymentMethod: 'card', itemCount: 5, pointsEarned: 45 },
    { id: '2', invoiceNumber: 'INV002', date: '2024-03-01T14:30:00', totalAmount: 280.00, paymentMethod: 'cash', itemCount: 3, pointsEarned: 28 },
    { id: '3', invoiceNumber: 'INV003', date: '2024-02-28T09:15:00', totalAmount: 620.75, paymentMethod: 'mobile', itemCount: 7, pointsEarned: 62 },
    { id: '4', invoiceNumber: 'INV004', date: '2024-02-25T16:45:00', totalAmount: 150.25, paymentMethod: 'cash', itemCount: 2, pointsEarned: 15 },
  ],
  '2': [
    { id: '5', invoiceNumber: 'INV005', date: '2024-03-05T11:00:00', totalAmount: 890.00, paymentMethod: 'card', itemCount: 8, pointsEarned: 89 },
    { id: '6', invoiceNumber: 'INV006', date: '2024-03-03T12:30:00', totalAmount: 1250.50, paymentMethod: 'card', itemCount: 12, pointsEarned: 125 },
  ],
};

const customerValidationSchema = yup.object({
  name: yup.string().required('Name is required'),
  phone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').required('Phone is required'),
  email: yup.string().email('Invalid email format'),
  dateOfBirth: yup.string(),
  address: yup.string(),
  notes: yup.string(),
});

export const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to load customers', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      dateOfBirth: '',
      notes: '',
    },
    validationSchema: customerValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (selectedCustomer) {
          await customerService.update(selectedCustomer.id, values);
          setSnackbar({ open: true, message: 'Customer updated successfully', severity: 'success' });
        } else {
          await customerService.create(values);
          setSnackbar({ open: true, message: 'Customer created successfully', severity: 'success' });
        }
        handleCloseDialog();
        fetchCustomers(); // Refresh the list
      } catch (error: any) {
        console.error('Error saving customer:', error);
        setSnackbar({ open: true, message: error.response?.data?.message || 'Operation failed', severity: 'error' });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    filterCustomers(newValue, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterCustomers(tabValue, query);
  };

  const filterCustomers = (tier: number, query: string) => {
    let filtered = customers;

    // Filter by tier
    if (tier === 1) filtered = customers.filter((c) => c.loyaltyPoints >= 1000); // VIP (1000+ points)
    if (tier === 2) filtered = customers.filter((c) => c.loyaltyPoints >= 100 && c.loyaltyPoints < 1000); // Regular (100-999 points)
    if (tier === 3) filtered = customers.filter((c) => c.loyaltyPoints < 100); // New (< 100 points)

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query) ||
          c.email?.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      formik.setValues({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        dateOfBirth: customer.dateOfBirth || '',
        notes: customer.notes || '',
      });
      setSelectedCustomer(customer);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomer(null);
    formik.resetForm();
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPurchaseHistory(mockPurchaseHistory[customer.id] || []);
    setOpenViewDialog(true);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
    setFilteredCustomers(filteredCustomers.filter((c) => c.id !== id));
    setSnackbar({ open: true, message: 'Customer deleted successfully', severity: 'success' });
  };

  const getTierBadge = (points: number) => {
    if (points >= 1000) return { label: 'VIP', color: 'error' as const, icon: <Stars fontSize="small" /> };
    if (points >= 100) return { label: 'Regular', color: 'primary' as const, icon: <Person fontSize="small" /> };
    return { label: 'New', color: 'default' as const, icon: null };
  };

  const getLoyaltyProgress = (points: number) => {
    const nextTier = points < 100 ? 100 : points < 1000 ? 1000 : 2000;
    return (points / nextTier) * 100;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          👥 Customers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          Add Customer
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Customers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {customers.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <Person />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    VIP Customers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {customers.filter((c) => c.loyaltyPoints >= 1000).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                  <Stars />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ₹{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Purchases
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {customers.reduce((sum, c) => sum + c.totalPurchases, 0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <ShoppingBag />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`All (${customers.length})`} />
          <Tab label={`VIP (${customers.filter((c) => c.loyaltyPoints >= 1000).length})`} />
          <Tab label={`Regular (${customers.filter((c) => c.loyaltyPoints >= 100 && c.loyaltyPoints < 1000).length})`} />
          <Tab label={`New (${customers.filter((c) => c.loyaltyPoints < 100).length})`} />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Loyalty Points</TableCell>
                <TableCell>Total Spent</TableCell>
                <TableCell>Purchases</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No customers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => {
                  const tier = getTierBadge(customer.loyaltyPoints);
                  return (
                    <TableRow key={customer.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {customer.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {customer.name}
                            </Typography>
                            <Chip
                              label={tier.label}
                              size="small"
                              color={tier.color}
                              icon={tier.icon || undefined}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Phone fontSize="small" color="action" />
                            <Typography variant="body2">{customer.phone}</Typography>
                          </Box>
                          {customer.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Email fontSize="small" color="action" />
                              <Typography variant="body2">{customer.email}</Typography>
                            </Box>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }} color="primary">
                            {customer.loyaltyPoints}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={getLoyaltyProgress(customer.loyaltyPoints)}
                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          ₹{customer.totalSpent.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={customer.totalPurchases} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleViewCustomer(customer)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleOpenDialog(customer)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteCustomer(customer.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Full Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
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
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
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
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
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
                <TextField
                  fullWidth
                  id="address"
                  name="address"
                  label="Address"
                  multiline
                  rows={2}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="dateOfBirth"
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  value={formik.values.dateOfBirth}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Cake />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Notes"
                  multiline
                  rows={2}
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Medical conditions, allergies, preferences..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedCustomer ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        {selectedCustomer && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 24 }}>
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedCustomer.name}</Typography>
                    <Chip
                      label={getTierBadge(selectedCustomer.loyaltyPoints).label}
                      size="small"
                      color={getTierBadge(selectedCustomer.loyaltyPoints).color}
                      icon={getTierBadge(selectedCustomer.loyaltyPoints).icon || undefined}
                    />
                  </Box>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Customer Info */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Contact Information
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone fontSize="small" color="primary" />
                        <Typography variant="body2">{selectedCustomer.phone}</Typography>
                      </Box>
                      {selectedCustomer.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Email fontSize="small" color="primary" />
                          <Typography variant="body2">{selectedCustomer.email}</Typography>
                        </Box>
                      )}
                      {selectedCustomer.address && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn fontSize="small" color="primary" />
                          <Typography variant="body2">{selectedCustomer.address}</Typography>
                        </Box>
                      )}
                      {selectedCustomer.dateOfBirth && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Cake fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {new Date(selectedCustomer.dateOfBirth).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                </Grid>

                {/* Loyalty Program */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Loyalty Program
                    </Typography>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', margin: '0 auto', mb: 1 }}>
                        <CardGiftcard sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Typography variant="h3" sx={{ fontWeight: 'bold' }} color="primary">
                        {selectedCustomer.loyaltyPoints}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Loyalty Points
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={getLoyaltyProgress(selectedCustomer.loyaltyPoints)}
                        sx={{ mt: 2, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {selectedCustomer.loyaltyPoints < 100
                          ? `${100 - selectedCustomer.loyaltyPoints} points to Regular`
                          : selectedCustomer.loyaltyPoints < 1000
                          ? `${1000 - selectedCustomer.loyaltyPoints} points to VIP`
                          : 'VIP Member'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Statistics */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Purchase Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }} color="success.main">
                            ₹{selectedCustomer.totalSpent.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total Spent
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }} color="primary.main">
                            {selectedCustomer.totalPurchases}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total Purchases
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }} color="warning.main">
                            ₹{(selectedCustomer.totalSpent / selectedCustomer.totalPurchases || 0).toFixed(2)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Avg. Purchase
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Purchase History */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Purchase History
                  </Typography>
                  {purchaseHistory.length === 0 ? (
                    <Alert severity="info">No purchase history available</Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Invoice</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Items</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Payment</TableCell>
                            <TableCell>Points</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {purchaseHistory.map((purchase) => (
                            <TableRow key={purchase.id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {purchase.invoiceNumber}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(purchase.date).toLocaleDateString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(purchase.date).toLocaleTimeString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip label={purchase.itemCount} size="small" />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  ₹{purchase.totalAmount.toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip label={purchase.paymentMethod.toUpperCase()} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell>
                                <Chip label={`+${purchase.pointsEarned}`} size="small" color="success" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Grid>

                {selectedCustomer.notes && (
                  <Grid item xs={12}>
                    <Alert severity="warning">
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Notes:
                      </Typography>
                      <Typography variant="body2">{selectedCustomer.notes}</Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
              <Button variant="outlined" startIcon={<Edit />} onClick={() => {
                setOpenViewDialog(false);
                handleOpenDialog(selectedCustomer);
              }}>
                Edit Customer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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

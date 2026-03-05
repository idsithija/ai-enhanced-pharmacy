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
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import type { InventoryItem, Medicine, Supplier } from '../types';

// Mock data for demonstration
const mockMedicines: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', manufacturer: 'PharmaCorp', unitPrice: 5.99, requiresPrescription: false, createdAt: '', updatedAt: '' },
  { id: '2', name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotic', manufacturer: 'MediPharm', unitPrice: 12.50, requiresPrescription: true, createdAt: '', updatedAt: '' },
  { id: '3', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'NSAID', manufacturer: 'HealthPlus', unitPrice: 8.75, requiresPrescription: false, createdAt: '', updatedAt: '' },
];

const mockSuppliers: Supplier[] = [
  { id: '1', name: 'MedSupply Co.', contactPerson: 'John Doe', phone: '1234567890', email: 'john@medsupply.com', createdAt: '', updatedAt: '' },
  { id: '2', name: 'PharmaDist', contactPerson: 'Jane Smith', phone: '0987654321', email: 'jane@pharmadist.com', createdAt: '', updatedAt: '' },
];

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    medicineId: '1',
    medicine: mockMedicines[0],
    batchNumber: 'BATCH001',
    quantity: 450,
    expiryDate: '2026-12-31',
    purchasePrice: 4.50,
    sellingPrice: 5.99,
    supplierId: '1',
    supplier: mockSuppliers[0],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
  },
  {
    id: '2',
    medicineId: '2',
    medicine: mockMedicines[1],
    batchNumber: 'BATCH002',
    quantity: 45,
    expiryDate: '2026-03-15',
    purchasePrice: 10.00,
    sellingPrice: 12.50,
    supplierId: '1',
    supplier: mockSuppliers[0],
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
  },
  {
    id: '3',
    medicineId: '3',
    medicine: mockMedicines[2],
    batchNumber: 'BATCH003',
    quantity: 180,
    expiryDate: '2026-08-20',
    purchasePrice: 7.00,
    sellingPrice: 8.75,
    supplierId: '2',
    supplier: mockSuppliers[1],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '4',
    medicineId: '1',
    medicine: mockMedicines[0],
    batchNumber: 'BATCH004',
    quantity: 12,
    expiryDate: '2026-04-10',
    purchasePrice: 4.50,
    sellingPrice: 5.99,
    supplierId: '2',
    supplier: mockSuppliers[1],
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
  },
];

const validationSchema = yup.object({
  medicineId: yup.string().required('Medicine is required'),
  batchNumber: yup.string().required('Batch number is required'),
  quantity: yup.number().positive('Quantity must be positive').required('Quantity is required'),
  expiryDate: yup.date().min(new Date(), 'Expiry date must be in the future').required('Expiry date is required'),
  purchasePrice: yup.number().positive('Purchase price must be positive').required('Purchase price is required'),
  sellingPrice: yup.number().positive('Selling price must be positive').required('Selling price is required'),
  supplierId: yup.string().required('Supplier is required'),
});

const getExpiryStatus = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: 'expired', label: 'Expired', color: 'error' as const };
  if (diffDays <= 30) return { status: 'critical', label: `${diffDays} days`, color: 'error' as const };
  if (diffDays <= 90) return { status: 'warning', label: `${diffDays} days`, color: 'warning' as const };
  return { status: 'good', label: `${diffDays} days`, color: 'success' as const };
};

const getStockStatus = (quantity: number) => {
  if (quantity === 0) return { label: 'Out of Stock', color: 'error' as const };
  if (quantity < 50) return { label: 'Low Stock', color: 'warning' as const };
  return { label: 'In Stock', color: 'success' as const };
};

export const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(mockInventory);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const formik = useFormik({
    initialValues: {
      medicineId: '',
      batchNumber: '',
      quantity: 0,
      expiryDate: '',
      purchasePrice: 0,
      sellingPrice: 0,
      supplierId: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (editingItem) {
          const updatedItem: InventoryItem = {
            ...editingItem,
            ...values,
            medicine: mockMedicines.find(m => m.id === values.medicineId),
            supplier: mockSuppliers.find(s => s.id === values.supplierId),
            updatedAt: new Date().toISOString(),
          };
          setInventory(inventory.map(i => i.id === editingItem.id ? updatedItem : i));
          setSnackbar({ open: true, message: 'Stock updated successfully', severity: 'success' });
        } else {
          const newItem: InventoryItem = {
            ...values,
            id: (inventory.length + 1).toString(),
            medicine: mockMedicines.find(m => m.id === values.medicineId),
            supplier: mockSuppliers.find(s => s.id === values.supplierId),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setInventory([...inventory, newItem]);
          setSnackbar({ open: true, message: 'Stock added successfully', severity: 'success' });
        }
        handleCloseDialog();
      } catch (error) {
        setSnackbar({ open: true, message: 'Operation failed', severity: 'error' });
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    let filtered = inventory;

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(
        (item) =>
          item.medicine?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    if (tabValue === 1) {
      // Low Stock
      filtered = filtered.filter(item => item.quantity < 50);
    } else if (tabValue === 2) {
      // Expiring Soon
      const today = new Date();
      filtered = filtered.filter(item => {
        const expiry = new Date(item.expiryDate);
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 90 && diffDays >= 0;
      });
    }

    setFilteredInventory(filtered);
    setPage(0);
  }, [searchQuery, inventory, tabValue]);

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      formik.setValues({
        medicineId: item.medicineId,
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        purchasePrice: item.purchasePrice,
        sellingPrice: item.sellingPrice,
        supplierId: item.supplierId,
      });
    } else {
      setEditingItem(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    formik.resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this stock entry?')) {
      setInventory(inventory.filter((i) => i.id !== id));
      setSnackbar({ open: true, message: 'Stock deleted successfully', severity: 'success' });
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            📦 Inventory Management
          </Typography>
          <Typography color="text.secondary">
            Track stock levels, batches, and expiry dates
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          Add Stock
        </Button>
      </Box>

      {/* Search & Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by medicine name or batch number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="All Stock" />
            <Tab label="Low Stock" icon={<Warning fontSize="small" />} iconPosition="end" />
            <Tab label="Expiring Soon" icon={<ErrorIcon fontSize="small" />} iconPosition="end" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Medicine</TableCell>
                <TableCell>Batch Number</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell align="right">Purchase Price</TableCell>
                <TableCell align="right">Selling Price</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell align="center">Stock Status</TableCell>
                <TableCell align="center">Expiry Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventory
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => {
                  const expiryStatus = getExpiryStatus(item.expiryDate);
                  const stockStatus = getStockStatus(item.quantity);
                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.medicine?.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={item.batchNumber} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {item.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell align="right">₹{item.purchasePrice.toFixed(2)}</TableCell>
                      <TableCell align="right">₹{item.sellingPrice.toFixed(2)}</TableCell>
                      <TableCell>{item.supplier?.name}</TableCell>
                      <TableCell align="center">
                        <Chip label={stockStatus.label} size="small" color={stockStatus.color} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={expiryStatus.label} size="small" color={expiryStatus.color} />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredInventory.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Stock' : 'Add New Stock'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="medicineId"
                  name="medicineId"
                  label="Medicine"
                  value={formik.values.medicineId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.medicineId && Boolean(formik.errors.medicineId)}
                  helperText={formik.touched.medicineId && formik.errors.medicineId}
                >
                  {mockMedicines.map((medicine) => (
                    <MenuItem key={medicine.id} value={medicine.id}>
                      {medicine.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="batchNumber"
                  name="batchNumber"
                  label="Batch Number"
                  value={formik.values.batchNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.batchNumber && Boolean(formik.errors.batchNumber)}
                  helperText={formik.touched.batchNumber && formik.errors.batchNumber}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="quantity"
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                  helperText={formik.touched.quantity && formik.errors.quantity}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="expiryDate"
                  name="expiryDate"
                  label="Expiry Date"
                  type="date"
                  value={formik.values.expiryDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                  helperText={formik.touched.expiryDate && formik.errors.expiryDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="purchasePrice"
                  name="purchasePrice"
                  label="Purchase Price (₹)"
                  type="number"
                  value={formik.values.purchasePrice}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.purchasePrice && Boolean(formik.errors.purchasePrice)}
                  helperText={formik.touched.purchasePrice && formik.errors.purchasePrice}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="sellingPrice"
                  name="sellingPrice"
                  label="Selling Price (₹)"
                  type="number"
                  value={formik.values.sellingPrice}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.sellingPrice && Boolean(formik.errors.sellingPrice)}
                  helperText={formik.touched.sellingPrice && formik.errors.sellingPrice}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  id="supplierId"
                  name="supplierId"
                  label="Supplier"
                  value={formik.values.supplierId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.supplierId && Boolean(formik.errors.supplierId)}
                  helperText={formik.touched.supplierId && formik.errors.supplierId}
                >
                  {mockSuppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {loading ? <CircularProgress size={24} /> : editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

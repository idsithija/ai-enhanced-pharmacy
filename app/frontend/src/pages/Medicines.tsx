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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Medication,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import type { Medicine } from '../types';

// Mock data for demonstration
const mockMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    category: 'Analgesic',
    manufacturer: 'PharmaCorp',
    description: 'Pain reliever and fever reducer',
    unitPrice: 5.99,
    requiresPrescription: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    category: 'Antibiotic',
    manufacturer: 'MediPharm',
    description: 'Bacterial infection treatment',
    unitPrice: 12.50,
    requiresPrescription: true,
    createdAt: '2024-01-16',
    updatedAt: '2024-01-16',
  },
  {
    id: '3',
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    category: 'NSAID',
    manufacturer: 'HealthPlus',
    description: 'Anti-inflammatory medication',
    unitPrice: 8.75,
    requiresPrescription: false,
    createdAt: '2024-01-17',
    updatedAt: '2024-01-17',
  },
  {
    id: '4',
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    category: 'Proton Pump Inhibitor',
    manufacturer: 'PharmaCorp',
    description: 'Reduces stomach acid',
    unitPrice: 15.25,
    requiresPrescription: true,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18',
  },
  {
    id: '5',
    name: 'Cetirizine',
    genericName: 'Cetirizine HCl',
    category: 'Antihistamine',
    manufacturer: 'AllergyRelief Ltd',
    description: 'Allergy relief medication',
    unitPrice: 7.50,
    requiresPrescription: false,
    createdAt: '2024-01-19',
    updatedAt: '2024-01-19',
  },
];

const validationSchema = yup.object({
  name: yup.string().required('Medicine name is required'),
  genericName: yup.string().required('Generic name is required'),
  category: yup.string().required('Category is required'),
  manufacturer: yup.string().required('Manufacturer is required'),
  unitPrice: yup.number().positive('Price must be positive').required('Price is required'),
  requiresPrescription: yup.boolean(),
  description: yup.string(),
});

export const Medicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>(mockMedicines);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const formik = useFormik({
    initialValues: {
      name: '',
      genericName: '',
      category: '',
      manufacturer: '',
      description: '',
      unitPrice: 0,
      requiresPrescription: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (editingMedicine) {
          // Update existing medicine
          const updatedMedicine = {
            ...editingMedicine,
            ...values,
            updatedAt: new Date().toISOString(),
          };
          setMedicines(medicines.map(m => m.id === editingMedicine.id ? updatedMedicine : m));
          setSnackbar({ open: true, message: 'Medicine updated successfully', severity: 'success' });
        } else {
          // Create new medicine
          const newMedicine: Medicine = {
            ...values,
            id: (medicines.length + 1).toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setMedicines([...medicines, newMedicine]);
          setSnackbar({ open: true, message: 'Medicine added successfully', severity: 'success' });
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
    // Filter medicines based on search query
    if (searchQuery.trim() === '') {
      setFilteredMedicines(medicines);
    } else {
      const filtered = medicines.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMedicines(filtered);
    }
    setPage(0);
  }, [searchQuery, medicines]);

  const handleOpenDialog = (medicine?: Medicine) => {
    if (medicine) {
      setEditingMedicine(medicine);
      formik.setValues({
        name: medicine.name,
        genericName: medicine.genericName,
        category: medicine.category,
        manufacturer: medicine.manufacturer,
        description: medicine.description || '',
        unitPrice: medicine.unitPrice,
        requiresPrescription: medicine.requiresPrescription,
      });
    } else {
      setEditingMedicine(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMedicine(null);
    formik.resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      setMedicines(medicines.filter((m) => m.id !== id));
      setSnackbar({ open: true, message: 'Medicine deleted successfully', severity: 'success' });
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
            💊 Medicines
          </Typography>
          <Typography color="text.secondary">
            Manage your medicine database
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
          Add Medicine
        </Button>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search medicines by name, generic name, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Medicine Name</TableCell>
                <TableCell>Generic Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Manufacturer</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center">Prescription</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMedicines
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((medicine) => (
                  <TableRow key={medicine.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Medication color="primary" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {medicine.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{medicine.genericName}</TableCell>
                    <TableCell>
                      <Chip label={medicine.category} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{medicine.manufacturer}</TableCell>
                    <TableCell align="right">₹{medicine.unitPrice.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={medicine.requiresPrescription ? 'Required' : 'Not Required'}
                        size="small"
                        color={medicine.requiresPrescription ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(medicine)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(medicine.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredMedicines.length}
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
          {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Medicine Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="genericName"
                  name="genericName"
                  label="Generic Name"
                  value={formik.values.genericName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.genericName && Boolean(formik.errors.genericName)}
                  helperText={formik.touched.genericName && formik.errors.genericName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="category"
                  name="category"
                  label="Category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="manufacturer"
                  name="manufacturer"
                  label="Manufacturer"
                  value={formik.values.manufacturer}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.manufacturer && Boolean(formik.errors.manufacturer)}
                  helperText={formik.touched.manufacturer && formik.errors.manufacturer}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="unitPrice"
                  name="unitPrice"
                  label="Unit Price (₹)"
                  type="number"
                  value={formik.values.unitPrice}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.unitPrice && Boolean(formik.errors.unitPrice)}
                  helperText={formik.touched.unitPrice && formik.errors.unitPrice}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="requiresPrescription"
                  name="requiresPrescription"
                  label="Requires Prescription"
                  value={formik.values.requiresPrescription}
                  onChange={formik.handleChange}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
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
              {loading ? <CircularProgress size={24} /> : editingMedicine ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
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

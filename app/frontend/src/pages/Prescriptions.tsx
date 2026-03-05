import { useState } from 'react';
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
  Tabs,
  Tab,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  CheckCircle,
  LocalPharmacy,
  Upload,
  Person,
  LocalHospital,
  Close,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import type { Prescription, Medicine } from '../types';

// Mock data
const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'John Doe',
    customerPhone: '9876543210',
    doctorName: 'Dr. Sarah Smith',
    doctorLicense: 'MED12345',
    medicines: [
      { medicineId: '2', medicineName: 'Amoxicillin 250mg', dosage: '250mg', frequency: '3 times daily', duration: '7 days', quantity: 21 },
      { medicineId: '3', medicineName: 'Ibuprofen 400mg', dosage: '400mg', frequency: 'As needed', duration: '5 days', quantity: 10 },
    ],
    status: 'pending',
    notes: 'Patient has mild allergic reaction to penicillin - monitor closely',
    imageUrl: 'https://via.placeholder.com/400x300/667eea/ffffff?text=Prescription+Image',
    createdAt: '2024-03-05T10:30:00',
    updatedAt: '2024-03-05T10:30:00',
  },
  {
    id: '2',
    customerId: '2',
    customerName: 'Jane Smith',
    customerPhone: '9876543211',
    doctorName: 'Dr. Michael Johnson',
    doctorLicense: 'MED12346',
    medicines: [
      { medicineId: '5', medicineName: 'Omeprazole 20mg', dosage: '20mg', frequency: 'Once daily before breakfast', duration: '30 days', quantity: 30 },
    ],
    status: 'verified',
    verifiedBy: 'pharmacist1',
    verifiedAt: '2024-03-05T11:00:00',
    verificationNotes: 'Prescription verified and approved',
    imageUrl: 'https://via.placeholder.com/400x300/764ba2/ffffff?text=Prescription+Image',
    createdAt: '2024-03-05T09:15:00',
    updatedAt: '2024-03-05T11:00:00',
  },
  {
    id: '3',
    customerId: '3',
    customerName: 'Robert Brown',
    customerPhone: '9876543212',
    doctorName: 'Dr. Emily Davis',
    doctorLicense: 'MED12347',
    medicines: [
      { medicineId: '4', medicineName: 'Cetirizine 10mg', dosage: '10mg', frequency: 'Once daily at bedtime', duration: '14 days', quantity: 14 },
    ],
    status: 'dispensed',
    verifiedBy: 'pharmacist1',
    verifiedAt: '2024-03-04T14:30:00',
    dispensedBy: 'pharmacist2',
    dispensedAt: '2024-03-04T15:00:00',
    dispensedNotes: 'Dispensed and patient counseled',
    imageUrl: 'https://via.placeholder.com/400x300/667eea/ffffff?text=Prescription+Image',
    createdAt: '2024-03-04T14:00:00',
    updatedAt: '2024-03-04T15:00:00',
  },
];

const mockMedicines: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', manufacturer: 'PharmaCorp', unitPrice: 5.99, requiresPrescription: false, createdAt: '', updatedAt: '' },
  { id: '2', name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotic', manufacturer: 'MediPharm', unitPrice: 12.50, requiresPrescription: true, createdAt: '', updatedAt: '' },
  { id: '3', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'NSAID', manufacturer: 'HealthPlus', unitPrice: 8.75, requiresPrescription: false, createdAt: '', updatedAt: '' },
  { id: '4', name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', category: 'Antihistamine', manufacturer: 'AllergyRelief', unitPrice: 7.50, requiresPrescription: false, createdAt: '', updatedAt: '' },
  { id: '5', name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'PPI', manufacturer: 'PharmaCorp', unitPrice: 15.25, requiresPrescription: true, createdAt: '', updatedAt: '' },
];

const prescriptionValidationSchema = yup.object({
  customerName: yup.string().required('Customer name is required'),
  customerPhone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').required('Phone is required'),
  doctorName: yup.string().required('Doctor name is required'),
  doctorLicense: yup.string().required('License number is required'),
  notes: yup.string(),
});

interface MedicineItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

export const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<MedicineItem[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const formik = useFormik({
    initialValues: {
      customerName: '',
      customerPhone: '',
      doctorName: '',
      doctorLicense: '',
      notes: '',
    },
    validationSchema: prescriptionValidationSchema,
    onSubmit: (values) => {
      if (prescriptionMedicines.length === 0) {
        setSnackbar({ open: true, message: 'Please add at least one medicine', severity: 'error' });
        return;
      }

      const newPrescription: Prescription = {
        id: Date.now().toString(),
        customerId: Date.now().toString(),
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        doctorName: values.doctorName,
        doctorLicense: values.doctorLicense,
        medicines: prescriptionMedicines,
        status: 'pending',
        notes: values.notes,
        imageUrl: imagePreview || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setPrescriptions([newPrescription, ...prescriptions]);
      setFilteredPrescriptions([newPrescription, ...prescriptions]);
      handleCloseDialog();
      setSnackbar({ open: true, message: 'Prescription created successfully', severity: 'success' });
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    filterPrescriptions(newValue, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterPrescriptions(tabValue, query);
  };

  const filterPrescriptions = (status: number, query: string) => {
    let filtered = prescriptions;

    // Filter by status
    if (status === 1) filtered = prescriptions.filter((p) => p.status === 'pending');
    if (status === 2) filtered = prescriptions.filter((p) => p.status === 'verified');
    if (status === 3) filtered = prescriptions.filter((p) => p.status === 'dispensed');

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.customerName.toLowerCase().includes(query.toLowerCase()) ||
          p.customerPhone.includes(query) ||
          p.doctorName.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredPrescriptions(filtered);
  };

  const handleOpenDialog = (prescription?: Prescription) => {
    if (prescription) {
      formik.setValues({
        customerName: prescription.customerName,
        customerPhone: prescription.customerPhone,
        doctorName: prescription.doctorName,
        doctorLicense: prescription.doctorLicense,
        notes: prescription.notes || '',
      });
      setPrescriptionMedicines(prescription.medicines);
      setImagePreview(prescription.imageUrl || '');
      setSelectedPrescription(prescription);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPrescription(null);
    formik.resetForm();
    setPrescriptionMedicines([]);
    setImagePreview('');
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setOpenViewDialog(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSnackbar({ open: true, message: 'Image uploaded successfully', severity: 'success' });
    }
  };

  const handleAddMedicine = () => {
    setPrescriptionMedicines([
      ...prescriptionMedicines,
      { medicineId: '', medicineName: '', dosage: '', frequency: '', duration: '', quantity: 0 },
    ]);
  };

  const handleUpdateMedicine = (index: number, field: keyof MedicineItem, value: any) => {
    const updated = [...prescriptionMedicines];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-fill medicine name when medicine is selected
    if (field === 'medicineId') {
      const medicine = mockMedicines.find((m) => m.id === value);
      if (medicine) {
        updated[index].medicineName = medicine.name;
      }
    }
    
    setPrescriptionMedicines(updated);
  };

  const handleRemoveMedicine = (index: number) => {
    setPrescriptionMedicines(prescriptionMedicines.filter((_, i) => i !== index));
  };

  const handleVerifyPrescription = (id: string) => {
    setPrescriptions(
      prescriptions.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'verified',
              verifiedBy: 'current_user',
              verifiedAt: new Date().toISOString(),
              verificationNotes: 'Verified and approved',
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    setFilteredPrescriptions(
      filteredPrescriptions.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'verified',
              verifiedBy: 'current_user',
              verifiedAt: new Date().toISOString(),
              verificationNotes: 'Verified and approved',
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    setSnackbar({ open: true, message: 'Prescription verified successfully', severity: 'success' });
  };

  const handleDispensePrescription = (id: string) => {
    setPrescriptions(
      prescriptions.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'dispensed',
              dispensedBy: 'current_user',
              dispensedAt: new Date().toISOString(),
              dispensedNotes: 'Dispensed and patient counseled',
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    setFilteredPrescriptions(
      filteredPrescriptions.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'dispensed',
              dispensedBy: 'current_user',
              dispensedAt: new Date().toISOString(),
              dispensedNotes: 'Dispensed and patient counseled',
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    setSnackbar({ open: true, message: 'Prescription dispensed successfully', severity: 'success' });
    setOpenViewDialog(false);
  };

  const handleDeletePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
    setFilteredPrescriptions(filteredPrescriptions.filter((p) => p.id !== id));
    setSnackbar({ open: true, message: 'Prescription deleted successfully', severity: 'success' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'verified':
        return 'info';
      case 'dispensed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle fontSize="small" />;
      case 'dispensed':
        return <LocalPharmacy fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          📋 Prescriptions
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          New Prescription
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by customer name, phone, or doctor..."
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
          <Tab label={`All (${prescriptions.length})`} />
          <Tab label={`Pending (${prescriptions.filter((p) => p.status === 'pending').length})`} />
          <Tab label={`Verified (${prescriptions.filter((p) => p.status === 'verified').length})`} />
          <Tab label={`Dispensed (${prescriptions.filter((p) => p.status === 'dispensed').length})`} />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Prescription ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Medicines</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPrescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No prescriptions found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {prescription.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          <Person fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{prescription.customerName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {prescription.customerPhone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalHospital fontSize="small" color="primary" />
                        <Box>
                          <Typography variant="body2">{prescription.doctorName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {prescription.doctorLicense}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${prescription.medicines.length} medicine(s)`} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={prescription.status.toUpperCase()}
                        size="small"
                        color={getStatusColor(prescription.status)}
                        icon={getStatusIcon(prescription.status) || undefined}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(prescription.createdAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleViewPrescription(prescription)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                      {prescription.status === 'pending' && (
                        <>
                          <IconButton size="small" onClick={() => handleOpenDialog(prescription)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeletePrescription(prescription.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Prescription Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPrescription ? 'Edit Prescription' : 'New Prescription'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="customerName"
                  name="customerName"
                  label="Customer Name"
                  value={formik.values.customerName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.customerName && Boolean(formik.errors.customerName)}
                  helperText={formik.touched.customerName && formik.errors.customerName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="customerPhone"
                  name="customerPhone"
                  label="Customer Phone"
                  value={formik.values.customerPhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.customerPhone && Boolean(formik.errors.customerPhone)}
                  helperText={formik.touched.customerPhone && formik.errors.customerPhone}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="doctorName"
                  name="doctorName"
                  label="Doctor Name"
                  value={formik.values.doctorName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.doctorName && Boolean(formik.errors.doctorName)}
                  helperText={formik.touched.doctorName && formik.errors.doctorName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="doctorLicense"
                  name="doctorLicense"
                  label="License Number"
                  value={formik.values.doctorLicense}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.doctorLicense && Boolean(formik.errors.doctorLicense)}
                  helperText={formik.touched.doctorLicense && formik.errors.doctorLicense}
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
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Medicines
                  </Typography>
                  <Button startIcon={<Add />} onClick={handleAddMedicine} size="small">
                    Add Medicine
                  </Button>
                </Box>
                {prescriptionMedicines.map((medicine, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          select
                          size="small"
                          label="Medicine"
                          value={medicine.medicineId}
                          onChange={(e) => handleUpdateMedicine(index, 'medicineId', e.target.value)}
                          SelectProps={{ native: true }}
                        >
                          <option value="">Select Medicine</option>
                          {mockMedicines.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Dosage"
                          value={medicine.dosage}
                          onChange={(e) => handleUpdateMedicine(index, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Frequency"
                          value={medicine.frequency}
                          onChange={(e) => handleUpdateMedicine(index, 'frequency', e.target.value)}
                          placeholder="e.g., 2 times daily"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Duration"
                          value={medicine.duration}
                          onChange={(e) => handleUpdateMedicine(index, 'duration', e.target.value)}
                          placeholder="e.g., 7 days"
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Quantity"
                          value={medicine.quantity}
                          onChange={(e) => handleUpdateMedicine(index, 'quantity', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <IconButton color="error" onClick={() => handleRemoveMedicine(index)}>
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Prescription Image
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<Upload />}
                    fullWidth
                  >
                    Upload Prescription Scan
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </Button>
                  {imagePreview && (
                    <Box sx={{ mt: 2, position: 'relative' }}>
                      <img
                        src={imagePreview}
                        alt="Prescription preview"
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                      />
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
                        onClick={() => setImagePreview('')}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedPrescription ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Prescription Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        {selectedPrescription && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Prescription Details</Typography>
                <Chip
                  label={selectedPrescription.status.toUpperCase()}
                  color={getStatusColor(selectedPrescription.status)}
                  icon={getStatusIcon(selectedPrescription.status) || undefined}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Patient Information
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedPrescription.customerName}
                    </Typography>
                    <Typography variant="body2">{selectedPrescription.customerPhone}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Prescriber Information
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedPrescription.doctorName}
                    </Typography>
                    <Typography variant="body2">License: {selectedPrescription.doctorLicense}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Prescribed Medicines
                  </Typography>
                  <List>
                    {selectedPrescription.medicines.map((medicine, index) => (
                      <ListItem key={index} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                        <ListItemText
                          primary={medicine.medicineName}
                          secondary={
                            <Stack spacing={0.5} sx={{ mt: 1 }}>
                              <Typography variant="caption">
                                <strong>Dosage:</strong> {medicine.dosage}
                              </Typography>
                              <Typography variant="caption">
                                <strong>Frequency:</strong> {medicine.frequency}
                              </Typography>
                              <Typography variant="caption">
                                <strong>Duration:</strong> {medicine.duration}
                              </Typography>
                              <Typography variant="caption">
                                <strong>Quantity:</strong> {medicine.quantity}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                {selectedPrescription.notes && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Notes:
                      </Typography>
                      <Typography variant="body2">{selectedPrescription.notes}</Typography>
                    </Alert>
                  </Grid>
                )}
                {selectedPrescription.imageUrl && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Prescription Image
                    </Typography>
                    <Box
                      component="img"
                      src={selectedPrescription.imageUrl}
                      alt="Prescription"
                      sx={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                    />
                  </Grid>
                )}
                {selectedPrescription.verifiedAt && (
                  <Grid item xs={12}>
                    <Alert severity="success">
                      <Typography variant="body2">
                        <strong>Verified by:</strong> {selectedPrescription.verifiedBy} on{' '}
                        {new Date(selectedPrescription.verifiedAt).toLocaleString()}
                      </Typography>
                      {selectedPrescription.verificationNotes && (
                        <Typography variant="body2">{selectedPrescription.verificationNotes}</Typography>
                      )}
                    </Alert>
                  </Grid>
                )}
                {selectedPrescription.dispensedAt && (
                  <Grid item xs={12}>
                    <Alert severity="success">
                      <Typography variant="body2">
                        <strong>Dispensed by:</strong> {selectedPrescription.dispensedBy} on{' '}
                        {new Date(selectedPrescription.dispensedAt).toLocaleString()}
                      </Typography>
                      {selectedPrescription.dispensedNotes && (
                        <Typography variant="body2">{selectedPrescription.dispensedNotes}</Typography>
                      )}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
              {selectedPrescription.status === 'pending' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircle />}
                  onClick={() => handleVerifyPrescription(selectedPrescription.id)}
                >
                  Verify
                </Button>
              )}
              {selectedPrescription.status === 'verified' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<LocalPharmacy />}
                  onClick={() => handleDispensePrescription(selectedPrescription.id)}
                >
                  Dispense
                </Button>
              )}
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

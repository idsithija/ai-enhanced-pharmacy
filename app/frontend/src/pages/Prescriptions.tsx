import { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import type { Medicine } from '../types';
import { PrescriptionUploadDialog } from '../components/PrescriptionUploadDialog';
import type { OCRResult } from '../services/ocrService';

// Extended Prescription interface for this page with additional fields
interface ExtendedPrescription {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  doctorName: string;
  doctorLicense: string;
  medicines: {
    medicineId: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }[];
  status: 'pending' | 'verified' | 'dispensed';
  notes?: string;
  imageUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  dispensedBy?: string;
  dispensedAt?: string;
  dispensedNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const mockPrescriptions: ExtendedPrescription[] = [
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
  const [prescriptions, setPrescriptions] = useState<ExtendedPrescription[]>(mockPrescriptions);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<ExtendedPrescription[]>(mockPrescriptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<ExtendedPrescription | null>(null);
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<MedicineItem[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [openOCRDialog, setOpenOCRDialog] = useState(false);

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

      const newPrescription: ExtendedPrescription = {
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

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
    filterPrescriptions(newValue, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterPrescriptions(tabValue, query);
  };

  const filterPrescriptions = (status: number, query: string) => {
    let filtered = prescriptions;

    if (status === 1) filtered = prescriptions.filter((p) => p.status === 'pending');
    if (status === 2) filtered = prescriptions.filter((p) => p.status === 'verified');
    if (status === 3) filtered = prescriptions.filter((p) => p.status === 'dispensed');

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

  const handleOpenDialog = (prescription?: ExtendedPrescription) => {
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

  const handleViewPrescription = (prescription: ExtendedPrescription) => {
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
    const updatePrescription = (p: Prescription) =>
      p.id === id
        ? {
            ...p,
            status: 'verified' as const,
            verifiedBy: 'current_user',
            verifiedAt: new Date().toISOString(),
            verificationNotes: 'Verified and approved',
            updatedAt: new Date().toISOString(),
          }
        : p;

    setPrescriptions(prescriptions.map(updatePrescription));
    setFilteredPrescriptions(filteredPrescriptions.map(updatePrescription));
    setSnackbar({ open: true, message: 'Prescription verified successfully', severity: 'success' });
  };

  const handleDispensePrescription = (id: string) => {
    const updatePrescription = (p: Prescription) =>
      p.id === id
        ? {
            ...p,
            status: 'dispensed' as const,
            dispensedBy: 'current_user',
            dispensedAt: new Date().toISOString(),
            dispensedNotes: 'Dispensed and patient counseled',
            updatedAt: new Date().toISOString(),
          }
        : p;

    setPrescriptions(prescriptions.map(updatePrescription));
    setFilteredPrescriptions(filteredPrescriptions.map(updatePrescription));
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'dispensed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return '✓';
      case 'dispensed': return '💊';
      default: return '⏱️';
    }
  };

  const handleOCRUploadComplete = (result: OCRResult) => {
    formik.setValues({
      customerName: result.extractedData.patientName || '',
      customerPhone: '',
      doctorName: result.extractedData.doctorName || '',
      doctorLicense: '',
      notes: `OCR Extracted - Confidence: ${result.confidence.toFixed(1)}%\n${result.extractedData.hospitalName ? `Hospital: ${result.extractedData.hospitalName}\n` : ''}${result.extractedData.date ? `Date: ${result.extractedData.date}` : ''}`,
    });

    const medicines: MedicineItem[] = result.extractedData.medications.map((med, index) => ({
      medicineId: `temp_${index}`,
      medicineName: med.name,
      dosage: med.dosage || '',
      frequency: med.frequency || '',
      duration: med.duration || '',
      quantity: 0,
    }));

    setPrescriptionMedicines(medicines);
    setOpenOCRDialog(false);
    setOpenDialog(true);
    setSnackbar({ 
      open: true, 
      message: `OCR completed! ${medicines.length} medication(s) extracted. Please review and adjust.`, 
      severity: 'success' 
    });
  };

  const tabs = [
    { label: 'All', count: prescriptions.length },
    { label: 'Pending', count: prescriptions.filter((p) => p.status === 'pending').length },
    { label: 'Verified', count: prescriptions.filter((p) => p.status === 'verified').length },
    { label: 'Dispensed', count: prescriptions.filter((p) => p.status === 'dispensed').length },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📋 Prescriptions</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setOpenOCRDialog(true)}
            className="px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <span>📤</span> Upload with AI OCR
          </button>
          <button
            onClick={() => handleOpenDialog()}
            className="px-6 py-2 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2"
          >
            <span>+</span> New Prescription
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by customer name, phone, or doctor..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <span className="absolute left-3 top-3 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Tabs and Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => handleTabChange(index)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  tabValue === index
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Prescription ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Medicines</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No prescriptions found
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <tr key={prescription.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900">{prescription.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-dark font-bold text-sm">
                          {prescription.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{prescription.customerName}</p>
                          <p className="text-xs text-gray-600">{prescription.customerPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-primary">🏥</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{prescription.doctorName}</p>
                          <p className="text-xs text-gray-600">{prescription.doctorLicense}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {prescription.medicines.length} medicine(s)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                        <span>{getStatusIcon(prescription.status)}</span>
                        {prescription.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{new Date(prescription.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-600">{new Date(prescription.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewPrescription(prescription)}
                        className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors mr-1"
                        title="View"
                      >
                        👁️
                      </button>
                      {prescription.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleOpenDialog(prescription)}
                            className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors mr-1"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeletePrescription(prescription.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      {openDialog && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleCloseDialog} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedPrescription ? 'Edit Prescription' : 'New Prescription'}
                </h2>
              </div>

              <form onSubmit={formik.handleSubmit}>
                <div className="px-6 py-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                      <input
                        type="text"
                        name="customerName"
                        value={formik.values.customerName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          formik.touched.customerName && formik.errors.customerName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formik.touched.customerName && formik.errors.customerName && (
                        <p className="mt-1 text-xs text-red-600">{formik.errors.customerName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone *</label>
                      <input
                        type="text"
                        name="customerPhone"
                        value={formik.values.customerPhone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          formik.touched.customerPhone && formik.errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formik.touched.customerPhone && formik.errors.customerPhone && (
                        <p className="mt-1 text-xs text-red-600">{formik.errors.customerPhone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name *</label>
                      <input
                        type="text"
                        name="doctorName"
                        value={formik.values.doctorName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          formik.touched.doctorName && formik.errors.doctorName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formik.touched.doctorName && formik.errors.doctorName && (
                        <p className="mt-1 text-xs text-red-600">{formik.errors.doctorName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                      <input
                        type="text"
                        name="doctorLicense"
                        value={formik.values.doctorLicense}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          formik.touched.doctorLicense && formik.errors.doctorLicense ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formik.touched.doctorLicense && formik.errors.doctorLicense && (
                        <p className="mt-1 text-xs text-red-600">{formik.errors.doctorLicense}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      rows={2}
                      value={formik.values.notes}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-bold text-gray-900">Medicines</h3>
                      <button
                        type="button"
                        onClick={handleAddMedicine}
                        className="px-3 py-1 text-sm bg-primary text-dark rounded-lg hover:bg-primary-dark flex items-center gap-1"
                      >
                        <span>+</span> Add Medicine
                      </button>
                    </div>

                    <div className="space-y-3">
                      {prescriptionMedicines.map((medicine, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Medicine</label>
                              <select
                                value={medicine.medicineId}
                                onChange={(e) => handleUpdateMedicine(index, 'medicineId', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                <option value="">Select Medicine</option>
                                {mockMedicines.map((m) => (
                                  <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Dosage</label>
                              <input
                                type="text"
                                value={medicine.dosage}
                                onChange={(e) => handleUpdateMedicine(index, 'dosage', e.target.value)}
                                placeholder="e.g., 500mg"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                              <input
                                type="text"
                                value={medicine.frequency}
                                onChange={(e) => handleUpdateMedicine(index, 'frequency', e.target.value)}
                                placeholder="e.g., 2 times daily"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                              <input
                                type="text"
                                value={medicine.duration}
                                onChange={(e) => handleUpdateMedicine(index, 'duration', e.target.value)}
                                placeholder="e.g., 7 days"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                              <input
                                type="number"
                                value={medicine.quantity}
                                onChange={(e) => handleUpdateMedicine(index, 'quantity', Number(e.target.value))}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>

                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveMedicine(index)}
                                className="w-full px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                              >
                                🗑️ Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Prescription Image</h3>
                    <label className="block w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition">
                      <span className="text-sm text-gray-600">📤 Upload Prescription Scan</span>
                      <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                    </label>
                    {imagePreview && (
                      <div className="mt-3 relative">
                        <img
                          src={imagePreview}
                          alt="Prescription preview"
                          className="w-full max-h-48 object-contain rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setImagePreview('')}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseDialog}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-dark"
                  >
                    {selectedPrescription ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* View Prescription Dialog */}
      {openViewDialog && selectedPrescription && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setOpenViewDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Prescription Details</h2>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedPrescription.status)}`}>
                  {getStatusIcon(selectedPrescription.status)} {selectedPrescription.status.toUpperCase()}
                </span>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-xs font-semibold text-gray-600 mb-2">Patient Information</h3>
                    <p className="text-lg font-bold text-gray-900">{selectedPrescription.customerName}</p>
                    <p className="text-sm text-gray-700">{selectedPrescription.customerPhone}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-xs font-semibold text-gray-600 mb-2">Prescriber Information</h3>
                    <p className="text-lg font-bold text-gray-900">{selectedPrescription.doctorName}</p>
                    <p className="text-sm text-gray-700">License: {selectedPrescription.doctorLicense}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Prescribed Medicines</h3>
                  <div className="space-y-2">
                    {selectedPrescription.medicines.map((medicine: { medicineId: string; medicineName: string; dosage: string; frequency: string; duration: string; quantity: number }, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <p className="font-semibold text-gray-900">{medicine.medicineName}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700">
                          <p><strong>Dosage:</strong> {medicine.dosage}</p>
                          <p><strong>Frequency:</strong> {medicine.frequency}</p>
                          <p><strong>Duration:</strong> {medicine.duration}</p>
                          <p><strong>Quantity:</strong> {medicine.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedPrescription.notes && (
                  <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-bold text-blue-900">Notes:</p>
                    <p className="text-sm text-blue-800 mt-1">{selectedPrescription.notes}</p>
                  </div>
                )}

                {selectedPrescription.imageUrl && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Prescription Image</h3>
                    <img
                      src={selectedPrescription.imageUrl}
                      alt="Prescription"
                      className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {selectedPrescription.verifiedAt && (
                  <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Verified by:</strong> {selectedPrescription.verifiedBy} on{' '}
                      {new Date(selectedPrescription.verifiedAt).toLocaleString()}
                    </p>
                    {selectedPrescription.verificationNotes && (
                      <p className="text-sm text-green-800 mt-1">{selectedPrescription.verificationNotes}</p>
                    )}
                  </div>
                )}

                {selectedPrescription.dispensedAt && (
                  <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Dispensed by:</strong> {selectedPrescription.dispensedBy} on{' '}
                      {new Date(selectedPrescription.dispensedAt).toLocaleString()}
                    </p>
                    {selectedPrescription.dispensedNotes && (
                      <p className="text-sm text-green-800 mt-1">{selectedPrescription.dispensedNotes}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setOpenViewDialog(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedPrescription.status === 'pending' && (
                  <button
                    onClick={() => handleVerifyPrescription(selectedPrescription.id)}
                    className="px-6 py-2 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-dark flex items-center gap-2"
                  >
                    <span>✓</span> Verify
                  </button>
                )}
                {selectedPrescription.status === 'verified' && (
                  <button
                    onClick={() => handleDispensePrescription(selectedPrescription.id)}
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <span>💊</span> Dispense
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* AI OCR Upload Dialog */}
      <PrescriptionUploadDialog
        open={openOCRDialog}
        onClose={() => setOpenOCRDialog(false)}
        onUploadComplete={handleOCRUploadComplete}
      />

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
            snackbar.severity === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            <span>{snackbar.message}</span>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

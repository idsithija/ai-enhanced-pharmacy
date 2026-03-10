import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ocrService } from '../services/ocrService';
import type { OCRResult } from '../services/ocrService';
import { prescriptionService } from '../services/prescriptionService';
import { customerService } from '../services/customerService';
import { inventoryService } from '../services/inventoryService';
import { useAuthStore } from '../store/authStore';
import type { Customer } from '../types';

const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
import {
  Upload,
  Cpu,
  X,
  Stethoscope,
  Pill,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  UserPlus,
  AlertTriangle,
  Camera,
  FileText,
  ShoppingCart,
  Package,
} from 'lucide-react';

// Prescription interface matching backend model
interface PrescriptionData {
  id: number;
  prescriptionNumber: string;
  patientName: string;
  patientAge?: number;
  patientPhone: string;
  doctorName: string;
  doctorLicense?: string;
  hospitalName?: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }[];
  prescriptionDate: string;
  validUntil?: string;
  imageUrl?: string;
  ocrText?: string;
  ocrConfidence?: number;
  status: 'pending' | 'verified' | 'dispensed' | 'rejected' | 'expired' | 'cancelled';
  notes?: string;
  aiWarnings?: string[];
  verifiedBy?: number;
  verifiedAt?: string;
  verifiedByUser?: { id: number; username: string; firstName: string; lastName: string };
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

const prescriptionValidationSchema = yup.object({
  patientName: yup.string().required('Patient name is required'),
  patientPhone: yup.string().required('Phone number is required').matches(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  doctorName: yup.string(),
  hospitalName: yup.string(),
  notes: yup.string(),
});

export const Prescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionData | null>(null);
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<MedicationItem[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [formTab, setFormTab] = useState<'manual' | 'ai'>('manual');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiPreview, setAiPreview] = useState('');
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [ocrError, setOcrError] = useState('');
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const [manualImageFile, setManualImageFile] = useState<File | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', phoneNumber: '' });
  const [inventoryStock, setInventoryStock] = useState<{ name: string; genericName: string; stock: number }[]>([]);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  const statusMap = ['', 'pending', 'verified', 'dispensed', 'rejected'];

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const status = statusMap[tabValue] || undefined;
      const result = await prescriptionService.getPrescriptions(pagination.page, 20, status);
      setPrescriptions(result.prescriptions || []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (error: any) {
      console.error('Error fetching prescriptions:', error);
      setSnackbar({ open: true, message: 'Failed to load prescriptions', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [tabValue, pagination.page]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  // Fetch inventory stock for availability checking
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await inventoryService.getInventory(1, 1000);
        const items = response.data?.inventory || [];
        setInventoryStock(items.map((item: any) => ({
          name: (item.medicine?.name || item.medicineName || '').toLowerCase(),
          genericName: (item.medicine?.genericName || '').toLowerCase(),
          stock: item.quantity || 0,
        })));
      } catch { /* silent */ }
    };
    fetchStock();
  }, []);

  const getStockInfo = (medicineName: string): { status: 'available' | 'low' | 'out-of-stock' | 'not-found'; stock: number } => {
    const nameLower = medicineName.toLowerCase().trim();
    if (!nameLower) return { status: 'not-found', stock: 0 };
    const match = inventoryStock.find(
      (item) => item.name === nameLower || item.genericName === nameLower ||
        item.name.includes(nameLower) || nameLower.includes(item.name) ||
        (item.genericName && (item.genericName.includes(nameLower) || nameLower.includes(item.genericName)))
    );
    if (!match) return { status: 'not-found', stock: 0 };
    if (match.stock <= 0) return { status: 'out-of-stock', stock: 0 };
    if (match.stock < 10) return { status: 'low', stock: match.stock };
    return { status: 'available', stock: match.stock };
  };

  const StockBadge = ({ medicineName }: { medicineName: string }) => {
    const info = getStockInfo(medicineName);
    const styles = {
      'available': 'bg-green-100 text-green-800',
      'low': 'bg-yellow-100 text-yellow-800',
      'out-of-stock': 'bg-red-100 text-red-800',
      'not-found': 'bg-gray-100 text-gray-600',
    };
    const labels = {
      'available': `In Stock (${info.stock})`,
      'low': `Low Stock (${info.stock})`,
      'out-of-stock': 'Out of Stock',
      'not-found': 'Not in Inventory',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${styles[info.status]}`}>
        <Package size={10} />
        {labels[info.status]}
      </span>
    );
  };

  const formik = useFormik({
    initialValues: {
      patientName: '',
      patientPhone: '',
      doctorName: '',
      hospitalName: '',
      notes: '',
    },
    validationSchema: prescriptionValidationSchema,
    onSubmit: async (values) => {
      if (prescriptionMedicines.length === 0) {
        setSnackbar({ open: true, message: 'Please add at least one medicine', severity: 'error' });
        return;
      }

      try {
        if (selectedPrescription) {
          await prescriptionService.updatePrescription(String(selectedPrescription.id), {
            patientName: values.patientName,
            patientPhone: values.patientPhone,
            doctorName: values.doctorName,
            hospitalName: values.hospitalName,
            medications: prescriptionMedicines,
            notes: values.notes,
          });
          setSnackbar({ open: true, message: 'Prescription updated successfully', severity: 'success' });
        } else {
          // Upload image if we have one from AI scan or manual upload
          let imageUrl: string | undefined;
          const fileToUpload = aiFile || manualImageFile;
          if (fileToUpload) {
            try {
              imageUrl = await prescriptionService.uploadImage(fileToUpload);
            } catch {
              // Image upload is optional, continue without it
            }
          }

          await prescriptionService.createPrescription({
            patientName: values.patientName,
            patientPhone: values.patientPhone,
            doctorName: values.doctorName,
            hospitalName: values.hospitalName,
            medications: prescriptionMedicines,
            prescriptionDate: new Date().toISOString(),
            notes: values.notes,
            ...(imageUrl && { imageUrl }),
          });
          setSnackbar({ open: true, message: 'Prescription created successfully', severity: 'success' });
        }
        handleCloseDialog();
        fetchPrescriptions();
      } catch (error: any) {
        setSnackbar({ open: true, message: error.response?.data?.error?.message || 'Failed to save prescription', severity: 'error' });
      }
    },
  });

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
    setPagination(p => ({ ...p, page: 1 }));
  };

  const filteredPrescriptions = searchQuery
    ? prescriptions.filter(
        (p) =>
          p.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.patientPhone?.includes(searchQuery) ||
          p.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.prescriptionNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : prescriptions;

  const handleOpenDialog = (prescription?: PrescriptionData) => {
    if (prescription) {
      formik.setValues({
        patientName: prescription.patientName || '',
        patientPhone: prescription.patientPhone || '',
        doctorName: prescription.doctorName || '',

        hospitalName: prescription.hospitalName || '',
        notes: prescription.notes || '',
      });
      setPrescriptionMedicines(prescription.medications || []);
      setImagePreview(prescription.imageUrl ? `${apiBase}${prescription.imageUrl}` : '');
      setSelectedPrescription(prescription);
    }
    setFormTab('manual');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPrescription(null);
    formik.resetForm();
    setPrescriptionMedicines([]);
    setImagePreview('');
    setManualImageFile(null);
    setFormTab('manual');
    setAiFile(null);
    setAiPreview('');
    setOcrResult(null);
    setOcrError('');
    setOcrProcessing(false);
    setCustomerSearch('');
    setCustomerResults([]);
    setShowCustomerDropdown(false);
    setShowNewCustomerForm(false);
    setNewCustomer({ firstName: '', lastName: '', phoneNumber: '' });
  };

  const handleViewPrescription = (prescription: PrescriptionData) => {
    setSelectedPrescription(prescription);
    setOpenViewDialog(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setManualImageFile(file);
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
      { name: '', dosage: '', frequency: '', duration: '', quantity: 0 },
    ]);
  };

  const handleUpdateMedicine = (index: number, field: keyof MedicationItem, value: string | number) => {
    const updated = [...prescriptionMedicines];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptionMedicines(updated);
  };

  const handleRemoveMedicine = (index: number) => {
    setPrescriptionMedicines(prescriptionMedicines.filter((_, i) => i !== index));
  };

  const handleVerifyPrescription = async (id: number) => {
    try {
      await prescriptionService.verifyPrescription(String(id));
      setSnackbar({ open: true, message: 'Prescription verified successfully', severity: 'success' });
      setOpenViewDialog(false);
      setSelectedPrescription(null);
      await fetchPrescriptions();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error?.message || 'Failed to verify', severity: 'error' });
    }
  };

  const handleRejectPrescription = async (id: number) => {
    try {
      await prescriptionService.rejectPrescription(String(id));
      setSnackbar({ open: true, message: 'Prescription rejected', severity: 'success' });
      setOpenViewDialog(false);
      setSelectedPrescription(null);
      await fetchPrescriptions();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error?.message || 'Failed to reject', severity: 'error' });
    }
  };

  const handleDispensePrescription = async (id: number) => {
    try {
      await prescriptionService.dispensePrescription(String(id));
      setSnackbar({ open: true, message: 'Prescription dispensed successfully', severity: 'success' });
      setOpenViewDialog(false);
      setSelectedPrescription(null);
      await fetchPrescriptions();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error?.message || 'Failed to dispense', severity: 'error' });
    }
  };

  const handleProcessToSale = (prescription: PrescriptionData) => {
    navigate('/pos', {
      state: {
        prescription: {
          id: prescription.id,
          prescriptionNumber: prescription.prescriptionNumber,
          patientName: prescription.patientName,
          patientPhone: prescription.patientPhone,
          medications: prescription.medications,
        },
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'dispensed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return '✓';
      case 'dispensed': return '💊';
      case 'rejected': return '✕';
      case 'expired': return '⏰';
      case 'cancelled': return '🚫';
      default: return '⏱️';
    }
  };

  const handleAiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setOcrError('Please select a valid image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setOcrError('File size must be less than 10MB');
      return;
    }
    setAiFile(file);
    setOcrError('');
    setOcrResult(null);
    const reader = new FileReader();
    reader.onloadend = () => setAiPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProcessOCR = async () => {
    if (!aiFile) return;
    try {
      setOcrProcessing(true);
      setOcrError('');
      const result = await ocrService.processPrescriptionImage(aiFile);
      setOcrResult(result);
    } catch (err: any) {
      setOcrError(err.response?.data?.error?.message || 'Failed to process image. Make sure the OCR service is running.');
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleOcrMedicationEdit = (index: number, field: string, value: string) => {
    if (!ocrResult) return;
    const updated = [...ocrResult.extractedData.medications];
    updated[index] = { ...updated[index], [field]: value };
    setOcrResult({ ...ocrResult, extractedData: { ...ocrResult.extractedData, medications: updated } });
  };

  const handleOcrMedicationDelete = (index: number) => {
    if (!ocrResult) return;
    setOcrResult({
      ...ocrResult,
      extractedData: {
        ...ocrResult.extractedData,
        medications: ocrResult.extractedData.medications.filter((_, i) => i !== index),
      },
    });
  };

  const handleOcrAddMedication = () => {
    if (!ocrResult) return;
    setOcrResult({
      ...ocrResult,
      extractedData: {
        ...ocrResult.extractedData,
        medications: [...ocrResult.extractedData.medications, { name: '', dosage: '', frequency: '', duration: '' }],
      },
    });
  };

  const handleApplyOcrToForm = () => {
    if (!ocrResult) return;
    formik.setValues({
      patientName: ocrResult.extractedData.patientName || '',
      patientPhone: '',
      doctorName: ocrResult.extractedData.doctorName || '',
      hospitalName: ocrResult.extractedData.hospitalName || '',
      notes: `OCR Extracted - Confidence: ${(ocrResult.confidence <= 1 ? ocrResult.confidence * 100 : ocrResult.confidence).toFixed(1)}%${ocrResult.extractedData.date ? `\nDate: ${ocrResult.extractedData.date}` : ''}`,
    });
    const medicines: MedicationItem[] = ocrResult.extractedData.medications.map((med) => ({
      name: med.name,
      dosage: med.dosage || '',
      frequency: med.frequency || '',
      duration: med.duration || '',
      quantity: 0,
    }));
    setPrescriptionMedicines(medicines);
    // Carry the AI scanned image to the manual entry tab
    if (aiPreview) {
      setImagePreview(aiPreview);
    }
    setFormTab('manual');
    setSnackbar({ open: true, message: `${medicines.length} medication(s) applied. Review and submit.`, severity: 'success' });
  };

  const resetAiTab = () => {
    setAiFile(null);
    setAiPreview('');
    setOcrResult(null);
    setOcrError('');
    if (aiFileInputRef.current) aiFileInputRef.current.value = '';
  };

  // Customer search for admin
  const handleCustomerSearch = async (query: string) => {
    setCustomerSearch(query);
    if (query.length < 2) {
      setCustomerResults([]);
      setShowCustomerDropdown(false);
      return;
    }
    try {
      const customers = await customerService.getAll();
      const filtered = customers.filter((c: Customer) => {
        const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
        const phone = c.phoneNumber || c.phone || '';
        return name.includes(query.toLowerCase()) || phone.includes(query);
      });
      setCustomerResults(filtered.slice(0, 5));
      setShowCustomerDropdown(true);
    } catch {
      setCustomerResults([]);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    const name = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    const phone = customer.phoneNumber || customer.phone || '';
    formik.setFieldValue('patientName', name);
    formik.setFieldValue('patientPhone', phone);
    setCustomerSearch(name);
    setShowCustomerDropdown(false);
  };

  const handleCreateNewCustomer = async () => {
    if (!newCustomer.firstName || !newCustomer.phoneNumber) {
      setSnackbar({ open: true, message: 'First name and phone are required', severity: 'error' });
      return;
    }
    try {
      const created = await customerService.createCustomer(newCustomer);
      const name = `${created.firstName || ''} ${created.lastName || ''}`.trim();
      const phone = created.phoneNumber || '';
      formik.setFieldValue('patientName', name);
      formik.setFieldValue('patientPhone', phone);
      setCustomerSearch(name);
      setShowNewCustomerForm(false);
      setNewCustomer({ firstName: '', lastName: '', phoneNumber: '' });
      setSnackbar({ open: true, message: 'Customer created and selected', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.error?.message || 'Failed to create customer', severity: 'error' });
    }
  };

  const tabs = [
    { label: 'All', count: pagination.total },
    { label: 'Pending' },
    { label: 'Verified' },
    { label: 'Dispensed' },
    { label: 'Rejected' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📋 Prescriptions</h1>
        <button
          onClick={() => handleOpenDialog()}
          className="px-6 py-2 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2"
        >
          <span>+</span> Add Prescription
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by patient name, phone, doctor, or Rx number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Rx Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Medicines</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    Loading prescriptions...
                  </td>
                </tr>
              ) : filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No prescriptions found
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <tr key={prescription.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900">{prescription.prescriptionNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-dark font-bold text-sm">
                          {(prescription.patientName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{prescription.patientName}</p>
                          <p className="text-xs text-gray-600">{prescription.patientPhone || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-primary">🏥</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{prescription.doctorName || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {prescription.medications?.length || 0} medicine(s)
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
                        <button
                          onClick={() => handleOpenDialog(prescription)}
                          className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors mr-1"
                          title="Edit"
                        >
                          ✏️
                        </button>
                      )}
                      {prescription.status === 'verified' && (
                        <button
                          onClick={() => handleProcessToSale(prescription)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors mr-1"
                          title="Process to Sale"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
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
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Dialog Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedPrescription ? 'Edit Prescription' : 'Add Prescription'}
                </h2>
                <button onClick={handleCloseDialog} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Tab Switcher — only when adding new */}
              {!selectedPrescription && (
                <div className="px-6 pt-4">
                  <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setFormTab('manual')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                        formTab === 'manual'
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Upload size={16} />
                      Manual Entry
                    </button>
                    <button
                      onClick={() => setFormTab('ai')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                        formTab === 'ai'
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Cpu size={16} />
                      AI Scan
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════ Manual Entry Tab ═══════════ */}
              {(formTab === 'manual' || selectedPrescription) && (
                <form onSubmit={formik.handleSubmit}>
                  <div className="px-6 py-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Customer Search for Admin/Staff */}
                      {isAdmin && !selectedPrescription && (
                        <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Search size={14} />
                            Search Existing Customer
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={customerSearch}
                              onChange={(e) => handleCustomerSearch(e.target.value)}
                              onFocus={() => customerResults.length > 0 && setShowCustomerDropdown(true)}
                              placeholder="Type customer name or phone..."
                              className="w-full px-3 py-2 pr-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                            <Search size={16} className="absolute right-3 top-2.5 text-blue-400" />
                            {showCustomerDropdown && customerResults.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {customerResults.map((c) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => handleSelectCustomer(c)}
                                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center justify-between border-b border-gray-100 last:border-0"
                                  >
                                    <span className="text-sm font-medium text-gray-900">
                                      {c.firstName} {c.lastName}
                                    </span>
                                    <span className="text-xs text-gray-500">{c.phoneNumber || c.phone}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-blue-700">Customer not found?</span>
                            <button
                              type="button"
                              onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                            >
                              <UserPlus size={12} />
                              {showNewCustomerForm ? 'Cancel' : 'Create New Customer'}
                            </button>
                          </div>
                          {showNewCustomerForm && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                                  <input
                                    type="text"
                                    value={newCustomer.firstName}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                                  <input
                                    type="text"
                                    value={newCustomer.lastName}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input
                                  type="text"
                                  value={newCustomer.phoneNumber}
                                  onChange={(e) => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
                                  placeholder="10-digit phone number"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={handleCreateNewCustomer}
                                className="w-full py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
                              >
                                Create & Select Customer
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                        <input
                          type="text"
                          name="patientName"
                          value={formik.values.patientName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                            formik.touched.patientName && formik.errors.patientName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formik.touched.patientName && formik.errors.patientName && (
                          <p className="mt-1 text-xs text-red-600">{formik.errors.patientName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Patient Phone *</label>
                        <input
                          type="text"
                          name="patientPhone"
                          value={formik.values.patientPhone}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="10-digit phone number"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                            formik.touched.patientPhone && formik.errors.patientPhone ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formik.touched.patientPhone && formik.errors.patientPhone && (
                          <p className="mt-1 text-xs text-red-600">{formik.errors.patientPhone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                        <input
                          type="text"
                          name="doctorName"
                          value={formik.values.doctorName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                        <input
                          type="text"
                          name="hospitalName"
                          value={formik.values.hospitalName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
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
                          <div key={index} className={`border rounded-lg p-3 ${getStockInfo(medicine.name).status === 'out-of-stock' ? 'border-red-300 bg-red-50' : getStockInfo(medicine.name).status === 'not-found' && medicine.name ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
                            {medicine.name && (
                              <div className="mb-2">
                                <StockBadge medicineName={medicine.name} />
                              </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Medicine Name</label>
                                <input
                                  type="text"
                                  value={medicine.name}
                                  onChange={(e) => handleUpdateMedicine(index, 'name', e.target.value)}
                                  placeholder="e.g., Amoxicillin 500mg"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
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
              )}

              {/* ═══════════ AI Scan Tab ═══════════ */}
              {formTab === 'ai' && !selectedPrescription && (
                <div className="px-6 py-4 space-y-6">
                  {/* Step 1: Upload & Scan */}
                  {!ocrResult && !ocrProcessing && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Prescription Image *</label>
                        {!aiPreview ? (
                          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 transition bg-gray-50">
                            <Cpu size={36} className="text-gray-400 mb-3" />
                            <span className="text-sm font-medium text-gray-600">Click to upload prescription image</span>
                            <span className="text-xs text-gray-400 mt-1">JPG, PNG — Max 10MB</span>
                            <input
                              ref={aiFileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleAiFileChange}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="relative">
                            <img
                              src={aiPreview}
                              alt="Preview"
                              className="w-full max-h-60 object-contain border border-gray-200 rounded-xl"
                            />
                            <button
                              onClick={resetAiTab}
                              className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow text-gray-500 hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      {ocrError && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                          <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-red-700">{ocrError}</p>
                        </div>
                      )}

                      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                        <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-700">
                          Upload a clear image of the prescription. Our AI will automatically extract the doctor name, medicines, dosages, and other details.
                        </p>
                      </div>

                      <button
                        onClick={handleProcessOCR}
                        disabled={!aiFile}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Stethoscope size={18} />
                        Scan with AI OCR
                      </button>
                    </>
                  )}

                  {/* Processing indicator */}
                  {ocrProcessing && (
                    <div className="py-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Processing Prescription...</h3>
                      <p className="text-sm text-gray-500">AI is extracting details from the prescription</p>
                      <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto mt-4">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                  )}

                  {/* Low Confidence Warning */}
                  {ocrResult && ocrResult.belowThreshold && (
                    <div className="space-y-4">
                      <div className="p-5 rounded-lg border-2 border-amber-300 bg-amber-50">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-7 h-7 flex-shrink-0 text-amber-500 mt-0.5" />
                          <div>
                            <h3 className="text-base font-bold text-amber-800 mb-1">Low Scan Confidence</h3>
                            <p className="text-sm text-amber-700 mb-3">
                              The AI scan confidence is only <strong>{(ocrResult.confidence <= 1 ? ocrResult.confidence * 100 : ocrResult.confidence).toFixed(1)}%</strong>, 
                              which is below the required <strong>75%</strong> threshold. For patient safety, 
                              the scanned results cannot be used automatically.
                            </p>
                            <p className="text-sm text-amber-700 mb-4">
                              Please switch to <strong>Manual Entry</strong> to enter the prescription details by hand, 
                              or retry with a clearer image.
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={() => {
                                  if (aiPreview) setImagePreview(aiPreview);
                                  setFormTab('manual');
                                  setOcrResult(null);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg transition-colors text-sm"
                                style={{ backgroundColor: '#f59e0b' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                              >
                                <FileText size={16} />
                                Switch to Manual Entry
                              </button>
                              <button
                                onClick={() => { setOcrResult(null); setAiFile(null); setAiPreview(''); }}
                                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-indigo-500 text-indigo-500 font-semibold rounded-lg transition-colors text-sm hover:bg-indigo-50"
                              >
                                <Camera size={16} />
                                Retry with Better Image
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {aiPreview && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Uploaded prescription:</p>
                          <img src={aiPreview} alt="Prescription" className="w-full max-h-40 object-contain border border-gray-200 rounded-lg opacity-75" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Review extracted data */}
                  {ocrResult && !ocrResult.belowThreshold && (
                    <>
                      {/* Scanned Prescription Image */}
                      {aiPreview && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Scanned Prescription</p>
                          <img src={aiPreview} alt="Prescription" className="w-full max-h-48 object-contain border border-gray-200 rounded-lg" />
                        </div>
                      )}

                      {/* Confidence badge */}
                      {(() => {
                        const conf = ocrService.getConfidenceDisplay(ocrResult.confidence);
                        return (
                          <div className={`flex items-center gap-2 p-3 rounded-lg ${
                            conf.severity === 'success' ? 'bg-emerald-50' : conf.severity === 'warning' ? 'bg-amber-50' : 'bg-red-50'
                          }`}>
                            <CheckCircle size={18} style={{ color: conf.color }} />
                            <span className="text-sm font-medium" style={{ color: conf.color }}>
                              OCR Complete — Confidence: {(ocrResult.confidence <= 1 ? ocrResult.confidence * 100 : ocrResult.confidence).toFixed(1)}% ({conf.level})
                            </span>
                          </div>
                        );
                      })()}

                      {/* Patient & Doctor Info */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Stethoscope size={16} className="text-indigo-500" />
                          Patient & Doctor Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Patient Name</label>
                            <input
                              type="text"
                              value={ocrResult.extractedData.patientName || ''}
                              onChange={(e) => setOcrResult({ ...ocrResult, extractedData: { ...ocrResult.extractedData, patientName: e.target.value } })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Patient name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Doctor Name</label>
                            <input
                              type="text"
                              value={ocrResult.extractedData.doctorName || ''}
                              onChange={(e) => setOcrResult({ ...ocrResult, extractedData: { ...ocrResult.extractedData, doctorName: e.target.value } })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Doctor name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Hospital / Clinic</label>
                            <input
                              type="text"
                              value={ocrResult.extractedData.hospitalName || ''}
                              onChange={(e) => setOcrResult({ ...ocrResult, extractedData: { ...ocrResult.extractedData, hospitalName: e.target.value } })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Hospital or clinic"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                            <input
                              type="text"
                              value={ocrResult.extractedData.date || ''}
                              onChange={(e) => setOcrResult({ ...ocrResult, extractedData: { ...ocrResult.extractedData, date: e.target.value } })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Prescription date"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Medications */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Pill size={16} className="text-indigo-500" />
                            Medications ({ocrResult.extractedData.medications.length})
                          </h3>
                          <button
                            onClick={handleOcrAddMedication}
                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            <Plus size={14} /> Add Medicine
                          </button>
                        </div>

                        {ocrResult.extractedData.medications.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <Pill size={24} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">No medications detected</p>
                            <button onClick={handleOcrAddMedication} className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                              + Add manually
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {ocrResult.extractedData.medications.map((med, index) => (
                              <div key={index} className={`p-3 border rounded-lg ${getStockInfo(med.name).status === 'out-of-stock' ? 'border-red-300 bg-red-50' : getStockInfo(med.name).status === 'not-found' && med.name ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                      Medicine {index + 1}
                                    </span>
                                    {med.name && <StockBadge medicineName={med.name} />}
                                  </div>
                                  <button onClick={() => handleOcrMedicationDelete(index)} className="p-1 text-red-400 hover:text-red-600">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="col-span-2">
                                    <label className="block text-xs text-gray-500 mb-0.5">Name</label>
                                    <input type="text" value={med.name} onChange={(e) => handleOcrMedicationEdit(index, 'name', e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Medicine name" />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-0.5">Dosage</label>
                                    <input type="text" value={med.dosage || ''} onChange={(e) => handleOcrMedicationEdit(index, 'dosage', e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. 500mg" />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-0.5">Frequency</label>
                                    <input type="text" value={med.frequency || ''} onChange={(e) => handleOcrMedicationEdit(index, 'frequency', e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. 3 times daily" />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-xs text-gray-500 mb-0.5">Duration</label>
                                    <input type="text" value={med.duration || ''} onChange={(e) => handleOcrMedicationEdit(index, 'duration', e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. 7 days" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={resetAiTab}
                          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                          Scan Again
                        </button>
                        <button
                          onClick={handleApplyOcrToForm}
                          className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Apply & Review
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
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
                    <p className="text-lg font-bold text-gray-900">{selectedPrescription.patientName}</p>
                    <p className="text-sm text-gray-700">{selectedPrescription.patientPhone || '—'}</p>
                    {selectedPrescription.patientAge && (
                      <p className="text-sm text-gray-700">Age: {selectedPrescription.patientAge}</p>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-xs font-semibold text-gray-600 mb-2">Prescriber Information</h3>
                    <p className="text-lg font-bold text-gray-900">{selectedPrescription.doctorName || '—'}</p>
                    {selectedPrescription.hospitalName && (
                      <p className="text-sm text-gray-700">{selectedPrescription.hospitalName}</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Rx Number:</span>
                      <span className="ml-2 font-semibold text-gray-900">{selectedPrescription.prescriptionNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-semibold text-gray-900">{new Date(selectedPrescription.prescriptionDate).toLocaleDateString()}</span>
                    </div>
                    {selectedPrescription.ocrConfidence != null && (
                      <div>
                        <span className="text-gray-600">OCR Confidence:</span>
                        <span className="ml-2 font-semibold text-gray-900">{selectedPrescription.ocrConfidence.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Prescribed Medicines</h3>
                  <div className="space-y-2">
                    {(selectedPrescription.medications || []).map((medicine, index) => (
                      <div key={index} className={`border rounded-lg p-3 ${getStockInfo(medicine.name).status === 'out-of-stock' ? 'border-red-300 bg-red-50' : getStockInfo(medicine.name).status === 'not-found' ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900">{medicine.name}</p>
                          <StockBadge medicineName={medicine.name} />
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700">
                          <p><strong>Dosage:</strong> {medicine.dosage || '—'}</p>
                          <p><strong>Frequency:</strong> {medicine.frequency || '—'}</p>
                          <p><strong>Duration:</strong> {medicine.duration || '—'}</p>
                          <p><strong>Quantity:</strong> {medicine.quantity || '—'}</p>
                        </div>
                      </div>
                    ))}
                    {(!selectedPrescription.medications || selectedPrescription.medications.length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">No medications listed</p>
                    )}
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
                      src={`${apiBase}${selectedPrescription.imageUrl}`}
                      alt="Prescription"
                      className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {selectedPrescription.verifiedAt && (
                  <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Verified by:</strong>{' '}
                      {selectedPrescription.verifiedByUser
                        ? `${selectedPrescription.verifiedByUser.firstName} ${selectedPrescription.verifiedByUser.lastName}`
                        : 'Staff'}{' '}
                      on {new Date(selectedPrescription.verifiedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedPrescription.status === 'rejected' && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Status:</strong> This prescription has been rejected.
                    </p>
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
                  <>
                    <button
                      onClick={() => handleRejectPrescription(selectedPrescription.id)}
                      className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <span>✕</span> Reject
                    </button>
                    <button
                      onClick={() => handleVerifyPrescription(selectedPrescription.id)}
                      className="px-6 py-2 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-dark flex items-center gap-2"
                    >
                      <span>✓</span> Verify
                    </button>
                  </>
                )}
                {selectedPrescription.status === 'verified' && (
                  <>
                    <button
                      onClick={() => handleProcessToSale(selectedPrescription)}
                      className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" /> Process to Sale
                    </button>
                    <button
                      onClick={() => handleDispensePrescription(selectedPrescription.id)}
                      className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <span>💊</span> Dispense
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
            snackbar.severity === 'success' ? 'bg-green-600 text-white' : snackbar.severity === 'warning' ? 'bg-yellow-500 text-white' : 'bg-red-600 text-white'
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

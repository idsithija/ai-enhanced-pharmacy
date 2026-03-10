import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Trash2,
  Plus,
  Pill,
  Stethoscope,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { prescriptionService } from '../services/prescriptionService';
import { ocrService } from '../services/ocrService';
import type { OCRResult, Medication } from '../services/ocrService';
import type { Prescription } from '../types';
import { useAuthStore } from '../store/authStore';

export const MyPrescriptions = () => {
  const { user } = useAuthStore();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  // Upload form state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  // OCR state
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [ocrError, setOcrError] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await prescriptionService.getPrescriptions(1, 100);
      const data = response.data?.prescriptions || response.data || [];
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setOcrError('Please select a valid image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setOcrError('File size must be less than 10MB');
        return;
      }
      setImageFile(file);
      setOcrError('');
      setOcrResult(null);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProcessOCR = async () => {
    if (!imageFile) return;
    try {
      setProcessing(true);
      setOcrError('');
      const result = await ocrService.processPrescriptionImage(imageFile);
      setOcrResult(result);
    } catch (err: any) {
      setOcrError(err.response?.data?.error?.message || 'Failed to process prescription image. Make sure the OCR service is running.');
    } finally {
      setProcessing(false);
    }
  };

  const handleMedicationEdit = (index: number, field: keyof Medication, value: string) => {
    if (!ocrResult) return;
    const updated = [...ocrResult.extractedData.medications];
    updated[index] = { ...updated[index], [field]: value };
    setOcrResult({
      ...ocrResult,
      extractedData: { ...ocrResult.extractedData, medications: updated },
    });
  };

  const handleMedicationDelete = (index: number) => {
    if (!ocrResult) return;
    setOcrResult({
      ...ocrResult,
      extractedData: {
        ...ocrResult.extractedData,
        medications: ocrResult.extractedData.medications.filter((_, i) => i !== index),
      },
    });
  };

  const handleAddMedication = () => {
    if (!ocrResult) return;
    setOcrResult({
      ...ocrResult,
      extractedData: {
        ...ocrResult.extractedData,
        medications: [
          ...ocrResult.extractedData.medications,
          { name: '', dosage: '', frequency: '', duration: '' },
        ],
      },
    });
  };

  const handleSubmitPrescription = async () => {
    if (!ocrResult) {
      setToast({ show: true, message: 'Please scan the prescription first', type: 'error' });
      return;
    }
    const { extractedData } = ocrResult;
    if (!extractedData.doctorName?.trim()) {
      setToast({ show: true, message: 'Doctor name is required', type: 'error' });
      return;
    }

    try {
      setUploading(true);
      let imageUrl = '';
      if (imageFile) {
        try {
          imageUrl = await prescriptionService.uploadImage(imageFile);
        } catch {
          // Image upload may fail if endpoint not available — continue anyway
        }
      }

      const fullName = user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username || '';
      await prescriptionService.createPrescription({
        patientName: extractedData.patientName || fullName,
        patientPhone: user?.phoneNumber || '',
        doctorName: extractedData.doctorName || '',
        doctorLicense: '',
        hospitalName: extractedData.hospitalName || '',
        ocrConfidence: ocrResult.confidence <= 1 ? ocrResult.confidence * 100 : ocrResult.confidence,
        medications: extractedData.medications.map((m) => ({
          name: m.name,
          dosage: m.dosage || '',
          frequency: m.frequency || '',
          duration: m.duration || '',
          quantity: 0,
        })),
        prescriptionDate: new Date().toISOString(),
        notes: `Submitted by user | Hospital: ${extractedData.hospitalName || 'N/A'} | Date: ${extractedData.date || 'N/A'}`,
        imageUrl: imageUrl || undefined,
      });

      setToast({ show: true, message: 'Prescription submitted successfully!', type: 'success' });
      handleCloseUpload();
      fetchPrescriptions();
    } catch (err: any) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to submit prescription',
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCloseUpload = () => {
    setShowUpload(false);
    setImageFile(null);
    setImagePreview('');
    setOcrResult(null);
    setOcrError('');
    setProcessing(false);
  };

  const handleSendToManualOrder = async () => {
    try {
      setUploading(true);
      let imageUrl = '';
      if (imageFile) {
        try {
          imageUrl = await prescriptionService.uploadImage(imageFile);
        } catch {
          // continue anyway
        }
      }

      const confidencePct = ocrResult
        ? (ocrResult.confidence <= 1 ? ocrResult.confidence * 100 : ocrResult.confidence).toFixed(1)
        : '0';

      const fullName = user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username || '';
      await prescriptionService.createPrescription({
        patientName: fullName,
        patientPhone: user?.phoneNumber || '',
        doctorName: 'Pending Manual Review',
        prescriptionDate: new Date().toISOString(),
        notes: `[MANUAL ORDER] Low OCR confidence (${confidencePct}%). Prescription image uploaded for manual data entry by pharmacist.`,
        imageUrl: imageUrl || undefined,
        medications: [],
      });

      setToast({ show: true, message: 'Prescription sent for manual order processing!', type: 'success' });
      handleCloseUpload();
      fetchPrescriptions();
    } catch (err: any) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to submit manual order',
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRetryOCR = () => {
    setOcrResult(null);
    setImageFile(null);
    setImagePreview('');
    setOcrError('');
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      uploaded: { color: 'bg-blue-50 text-blue-700', icon: <Upload size={14} />, label: 'Uploaded' },
      processing: { color: 'bg-amber-50 text-amber-700', icon: <Clock size={14} />, label: 'Processing' },
      pending: { color: 'bg-amber-50 text-amber-700', icon: <Clock size={14} />, label: 'Pending Review' },
      verified: { color: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle size={14} />, label: 'Verified' },
      dispensed: { color: 'bg-indigo-50 text-indigo-700', icon: <CheckCircle size={14} />, label: 'Dispensed' },
      rejected: { color: 'bg-red-50 text-red-700', icon: <XCircle size={14} />, label: 'Rejected' },
    };
    const c = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.color}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.doctorName?.toLowerCase().includes(q) ||
      p.id?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Prescriptions</h1>
          <p className="text-gray-600">Upload and track your prescriptions</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          <Upload size={18} />
          Upload Prescription
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prescriptions..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="uploaded">Uploaded</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="dispensed">Dispensed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Prescriptions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Upload your first prescription to get started'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              {/* Image preview or placeholder */}
              {prescription.imageUrl ? (
                <div className="h-40 bg-gray-100 overflow-hidden">
                  <img
                    src={prescription.imageUrl}
                    alt="Prescription"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                  <FileText size={40} className="text-indigo-300" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">
                    #{prescription.id?.toString().slice(0, 8)}
                  </p>
                  {getStatusBadge(prescription.status)}
                </div>

                <div className="space-y-1.5 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-700">Doctor:</span>{' '}
                    {prescription.doctorName || 'Not specified'}
                  </p>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock size={14} />
                    <span>{new Date(prescription.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {prescription.extractedText && (
                  <div className="mt-3 p-2.5 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium mb-1">Extracted Text</p>
                    <p className="text-xs text-gray-700 line-clamp-2">{prescription.extractedText}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Stethoscope size={22} className="text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  {ocrResult ? 'Review Extracted Details' : 'Upload Prescription'}
                </h2>
              </div>
              <button onClick={handleCloseUpload} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 1: Upload Image */}
              {!ocrResult && !processing && (
                <div className="space-y-4">
                  {/* Image Upload Area */}
                  {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 transition bg-gray-50">
                      <Upload size={32} className="text-gray-400 mb-3" />
                      <span className="text-sm font-medium text-gray-600">Click to upload prescription image</span>
                      <span className="text-xs text-gray-400 mt-1">JPG, PNG — Max 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-60 object-contain border border-gray-200 rounded-xl"
                      />
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                          setOcrError('');
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow text-gray-500 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {ocrError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                      <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700">{ocrError}</p>
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      Upload a clear image of your prescription. Our AI will automatically extract the doctor name, medicines, dosages, and other details.
                    </p>
                  </div>
                </div>
              )}

              {/* Processing indicator */}
              {processing && (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Processing Prescription...</h3>
                  <p className="text-sm text-gray-500">AI is extracting details from your prescription</p>
                  <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto mt-4">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
              )}

              {/* Step 2: Low Confidence Warning */}
              {ocrResult && ocrResult.belowThreshold && (
                <div className="space-y-4">
                  <div className="p-5 rounded-lg border-2 border-amber-300 bg-amber-50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-7 h-7 flex-shrink-0 text-amber-500 mt-0.5" />
                      <div>
                        <h3 className="text-base font-bold text-amber-800 mb-1">Low Scan Confidence</h3>
                        <p className="text-sm text-amber-700 mb-3">
                          The AI scan confidence is only <strong>{(ocrResult.confidence <= 1 ? ocrResult.confidence * 100 : ocrResult.confidence).toFixed(1)}%</strong>, 
                          which is below the required <strong>75%</strong> threshold. For your safety, 
                          the scanned data cannot be used automatically.
                        </p>
                        <p className="text-sm text-amber-700 mb-4">
                          You can enter the prescription details manually, or retry with a clearer image.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => {
                              setOcrResult({
                                text: '',
                                confidence: ocrResult!.confidence,
                                extractedData: { medications: [] },
                                belowThreshold: false,
                              });
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg transition-colors text-sm"
                            style={{ backgroundColor: '#f59e0b' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                          >
                            <FileText size={16} />
                            Enter Details Manually
                          </button>
                          <button
                            onClick={handleRetryOCR}
                            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-indigo-500 text-indigo-500 font-semibold rounded-lg transition-colors text-sm hover:bg-indigo-50"
                          >
                            <Camera size={16} />
                            Retry with Better Image
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {imagePreview && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Uploaded prescription:</p>
                      <img src={imagePreview} alt="Prescription" className="w-full max-h-40 object-contain border border-gray-200 rounded-lg opacity-75" />
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Review extracted details */}
              {ocrResult && !ocrResult.belowThreshold && (
                <div className="space-y-5">
                  {/* Confidence Badge */}
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
                      Patient &amp; Doctor Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Patient Name</label>
                        <input
                          type="text"
                          value={ocrResult.extractedData.patientName || ''}
                          onChange={(e) =>
                            setOcrResult({
                              ...ocrResult,
                              extractedData: { ...ocrResult.extractedData, patientName: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Patient name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Doctor Name *</label>
                        <input
                          type="text"
                          value={ocrResult.extractedData.doctorName || ''}
                          onChange={(e) =>
                            setOcrResult({
                              ...ocrResult,
                              extractedData: { ...ocrResult.extractedData, doctorName: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Doctor name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Hospital / Clinic</label>
                        <input
                          type="text"
                          value={ocrResult.extractedData.hospitalName || ''}
                          onChange={(e) =>
                            setOcrResult({
                              ...ocrResult,
                              extractedData: { ...ocrResult.extractedData, hospitalName: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Hospital or clinic"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                        <input
                          type="text"
                          value={ocrResult.extractedData.date || ''}
                          onChange={(e) =>
                            setOcrResult({
                              ...ocrResult,
                              extractedData: { ...ocrResult.extractedData, date: e.target.value },
                            })
                          }
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
                        onClick={handleAddMedication}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        <Plus size={14} /> Add Medicine
                      </button>
                    </div>

                    {ocrResult.extractedData.medications.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <Pill size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">No medications detected</p>
                        <button
                          onClick={handleAddMedication}
                          className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          + Add manually
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {ocrResult.extractedData.medications.map((med, index) => (
                          <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                Medicine {index + 1}
                              </span>
                              <button
                                onClick={() => handleMedicationDelete(index)}
                                className="p-1 text-red-400 hover:text-red-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="col-span-2">
                                <label className="block text-xs text-gray-500 mb-0.5">Name</label>
                                <input
                                  type="text"
                                  value={med.name}
                                  onChange={(e) => handleMedicationEdit(index, 'name', e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  placeholder="Medicine name"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-0.5">Dosage</label>
                                <input
                                  type="text"
                                  value={med.dosage || ''}
                                  onChange={(e) => handleMedicationEdit(index, 'dosage', e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  placeholder="e.g. 500mg"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-0.5">Frequency</label>
                                <input
                                  type="text"
                                  value={med.frequency || ''}
                                  onChange={(e) => handleMedicationEdit(index, 'frequency', e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  placeholder="e.g. 3 times daily"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs text-gray-500 mb-0.5">Duration</label>
                                <input
                                  type="text"
                                  value={med.duration || ''}
                                  onChange={(e) => handleMedicationEdit(index, 'duration', e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  placeholder="e.g. 7 days"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Raw extracted text */}
                  {ocrResult.text && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Raw Extracted Text</p>
                      <div className="p-3 bg-gray-50 rounded-lg max-h-28 overflow-auto">
                        <pre className="text-xs font-mono text-gray-600 whitespace-pre-wrap">{ocrResult.text}</pre>
                      </div>
                    </div>
                  )}

                  {/* Uploaded image thumbnail */}
                  {imagePreview && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Prescription Image</p>
                      <img
                        src={imagePreview}
                        alt="Prescription"
                        className="w-full max-h-32 object-contain border border-gray-200 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              {!ocrResult && !processing && (
                <>
                  <button
                    onClick={handleCloseUpload}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessOCR}
                    disabled={!imageFile}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Stethoscope size={16} />
                    Scan with AI OCR
                  </button>
                </>
              )}

              {ocrResult && !ocrResult.belowThreshold && (
                <>
                  <button
                    onClick={() => {
                      setOcrResult(null);
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Scan Again
                  </button>
                  <button
                    onClick={handleSubmitPrescription}
                    disabled={uploading}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Submit Prescription
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

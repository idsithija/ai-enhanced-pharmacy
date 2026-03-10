import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileImage,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  X,
  Send,
  Cpu,
  Trash2,
  Plus,
  Pill,
  Stethoscope,
  XCircle,
  Camera,
  FileText,
} from 'lucide-react';
import { prescriptionService } from '../services/prescriptionService';
import { ocrService } from '../services/ocrService';
import type { OCRResult, Medication } from '../services/ocrService';
import { useAuthStore } from '../store/authStore';

type OrderStep = 'upload' | 'submitted';
type TabType = 'manual' | 'ai';

export const PlaceOrder = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);

  // Common state
  const [activeTab, setActiveTab] = useState<TabType>('manual');
  const [step, setStep] = useState<OrderStep>('upload');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const [lastOrder, setLastOrder] = useState<{ prescriptionNumber: string } | null>(null);

  // Manual tab state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // AI tab state
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiPreview, setAiPreview] = useState('');
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [ocrError, setOcrError] = useState('');
  const [aiSubmitting, setAiSubmitting] = useState(false);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // ─── Shared helpers ───

  // ─── Manual tab handlers ───
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setToast({ show: true, message: 'File too large. Max 10MB.', type: 'error' });
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && /image|pdf/.test(file.type)) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualSubmit = async () => {
    if (!selectedFile) {
      setToast({ show: true, message: 'Please upload a prescription image', type: 'error' });
      return;
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (notes) formData.append('notes', notes);

      const response = await prescriptionService.createPrescriptionWithImage(formData);
      const order = (response as any)?.data?.prescription || (response as any)?.prescription || response;
      setLastOrder({ prescriptionNumber: order?.prescriptionNumber || '' });
      setStep('submitted');
      clearFile();
      setNotes('');
    } catch (err: any) {
      setToast({
        show: true,
        message: err.response?.data?.error?.message || 'Upload failed. Please try again.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── AI tab handlers ───
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
      setProcessing(true);
      setOcrError('');
      const result = await ocrService.processPrescriptionImage(aiFile);
      setOcrResult(result);
    } catch (err: any) {
      setOcrError(err.response?.data?.error?.message || 'Failed to process image. Make sure the OCR service is running.');
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

  const handleAiSubmit = async () => {
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
      setAiSubmitting(true);
      let imageUrl = '';
      if (aiFile) {
        try {
          imageUrl = await prescriptionService.uploadImage(aiFile);
        } catch {
          // Continue even if image upload fails
        }
      }
      const fullName = user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username || '';
      await prescriptionService.createPrescription({
        customerId: '',
        customerName: fullName,
        customerPhone: '',
        doctorName: extractedData.doctorName || '',
        doctorLicense: '',
        medicines: extractedData.medications.map((m) => ({
          medicineId: '',
          medicineName: m.name,
          dosage: m.dosage || '',
          frequency: m.frequency || '',
          duration: m.duration || '',
          quantity: 0,
        })),
        notes: `AI Scanned | Hospital: ${extractedData.hospitalName || 'N/A'} | Date: ${extractedData.date || 'N/A'}`,
        imageUrl: imageUrl || undefined,
      });
      setToast({ show: true, message: 'Prescription submitted successfully!', type: 'success' });
      resetAiTab();
      setStep('submitted');
      setLastOrder({ prescriptionNumber: 'AI-Scanned' });
    } catch (err: any) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to submit prescription',
        type: 'error',
      });
    } finally {
      setAiSubmitting(false);
    }
  };

  const resetAiTab = () => {
    setAiFile(null);
    setAiPreview('');
    setOcrResult(null);
    setOcrError('');
    if (aiFileInputRef.current) aiFileInputRef.current.value = '';
  };

  // ─── Success screen ───
  if (step === 'submitted' && lastOrder) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
          <div className="mx-auto bg-emerald-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Prescription Submitted!</h2>
          <p className="text-gray-500 mb-2">
            Your prescription has been uploaded. The pharmacy will review it and arrange your medications.
          </p>
          {lastOrder.prescriptionNumber && lastOrder.prescriptionNumber !== 'AI-Scanned' && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-500">Reference Number</p>
              <p className="text-lg font-bold text-indigo-600">{lastOrder.prescriptionNumber}</p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setStep('upload'); setLastOrder(null); }}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Submit Another
            </button>
            <button
              onClick={() => navigate('/my-orders')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Track Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main upload view with tabs ───
  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Prescription</h1>
          <p className="text-gray-500 text-sm">Upload your prescription image and we'll arrange your medications</p>
        </div>
        <button
          onClick={() => navigate('/my-orders')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
        >
          Track Orders
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === 'manual'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload size={16} />
          Manual Upload
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === 'ai'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Cpu size={16} />
          AI Scan
        </button>
      </div>

      {/* ═══════════ Manual Tab ═══════════ */}
      {activeTab === 'manual' && (
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
          {/* Image Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Prescription Image *</label>
            {!selectedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition"
              >
                <Upload size={40} className="mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 font-medium">Click or drag & drop your prescription</p>
                <p className="text-sm text-gray-400 mt-1">JPG, PNG, WebP, or PDF — Max 10MB</p>
              </div>
            ) : (
              <div className="relative border border-gray-200 rounded-xl overflow-hidden">
                {preview && !selectedFile.type.includes('pdf') ? (
                  <img src={preview} alt="Preview" className="w-full max-h-80 object-contain bg-gray-50" />
                ) : (
                  <div className="flex items-center gap-3 p-6 bg-gray-50">
                    <FileImage size={32} className="text-indigo-500" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={clearFile}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition"
                >
                  <X size={16} className="text-red-500" />
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need delivery by tomorrow, allergic to penicillin..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleManualSubmit}
            disabled={submitting || !selectedFile}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Send size={18} />
                Submit Prescription
              </>
            )}
          </button>

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-1">How it works</h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Upload a clear photo of your prescription</li>
              <li>Our pharmacy team reviews and verifies it</li>
              <li>We arrange your medications</li>
              <li>Collect your order from the pharmacy</li>
            </ol>
          </div>
        </div>
      )}

      {/* ═══════════ AI Scan Tab ═══════════ */}
      {activeTab === 'ai' && (
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
          {/* Step 1: Upload & Scan */}
          {!ocrResult && !processing && (
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
                  Upload a clear image of your prescription. Our AI will automatically extract the doctor name, medicines, dosages, and other details.
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
                      Please switch to <strong>Manual Upload</strong> to enter the prescription details by hand,
                      or retry with a clearer image.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          if (aiPreview) setPreview(aiPreview);
                          if (aiFile) setSelectedFile(aiFile);
                          setActiveTab('manual');
                          setOcrResult(null);
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

          {/* Step 2: Review extracted details */}
          {ocrResult && !ocrResult.belowThreshold && (
            <>
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

              {/* Uploaded Prescription Image */}
              {aiPreview && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Uploaded Prescription</p>
                  <img
                    src={aiPreview}
                    alt="Uploaded prescription"
                    className="w-full max-h-48 object-contain border border-gray-200 rounded-lg bg-gray-50"
                  />
                </div>
              )}

              {/* Doctor Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Stethoscope size={16} className="text-indigo-500" />
                  Doctor Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Doctor Name *</label>
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
                    <button onClick={handleAddMedication} className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
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
                          <button onClick={() => handleMedicationDelete(index)} className="p-1 text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-0.5">Name</label>
                            <input type="text" value={med.name} onChange={(e) => handleMedicationEdit(index, 'name', e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Medicine name" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-0.5">Dosage</label>
                            <input type="text" value={med.dosage || ''} onChange={(e) => handleMedicationEdit(index, 'dosage', e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. 500mg" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-0.5">Frequency</label>
                            <input type="text" value={med.frequency || ''} onChange={(e) => handleMedicationEdit(index, 'frequency', e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. 3 times daily" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-0.5">Duration</label>
                            <input type="text" value={med.duration || ''} onChange={(e) => handleMedicationEdit(index, 'duration', e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. 7 days" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI tab action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={resetAiTab}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Scan Again
                </button>
                <button
                  onClick={handleAiSubmit}
                  disabled={aiSubmitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {aiSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Submit Prescription
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

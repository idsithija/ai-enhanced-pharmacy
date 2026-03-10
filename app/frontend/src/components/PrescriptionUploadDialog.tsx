import { useState, useRef, useEffect } from 'react';
import { 
  CloudUpload, 
  Image as ImageIcon, 
  CheckCircle, 
  Camera, 
  Trash2, 
  Plus, 
  StopCircle, 
  X,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { ocrService } from '../services/ocrService';
import type { OCRResult, Medication } from '../services/ocrService';
import { pharmacareColors } from '../theme/pharmacare-theme';

interface PrescriptionUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete: (result: OCRResult) => void;
  onManualOrder?: (confidence: number, imageFile: File | null) => void;
}

export const PrescriptionUploadDialog = ({ open, onClose, onUploadComplete, onManualOrder }: PrescriptionUploadDialogProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        setError(null);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageDataUrl);
        setPreviewUrl(imageDataUrl);
        stopCamera();

        // Convert to file for OCR processing
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'prescription-capture.jpg', { type: 'image/jpeg' });
            setSelectedFile(file);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  // Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setOcrResult(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process image with OCR
  const handleProcessImage = async () => {
    if (!selectedFile) return;

    try {
      setProcessing(true);
      setError(null);

      const result = await ocrService.processPrescriptionImage(selectedFile);
      setOcrResult(result);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to process prescription image');
    } finally {
      setProcessing(false);
    }
  };

  const handleManualOrder = () => {
    if (ocrResult) {
      // Switch to editable form with empty fields but keep the image
      setOcrResult({
        text: '',
        confidence: ocrResult.confidence,
        extractedData: { medications: [] },
        belowThreshold: false,
      });
    }
  };

  const handleRetry = () => {
    setOcrResult(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCapturedImage(null);
    setError(null);
  };

  const handleMedicationEdit = (index: number, field: keyof Medication, value: string) => {
    if (!ocrResult) return;

    const updatedMedications = [...ocrResult.extractedData.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    };

    setOcrResult({
      ...ocrResult,
      extractedData: {
        ...ocrResult.extractedData,
        medications: updatedMedications,
      },
    });
  };

  const handleMedicationDelete = (index: number) => {
    if (!ocrResult) return;

    const updatedMedications = ocrResult.extractedData.medications.filter((_, i) => i !== index);
    setOcrResult({
      ...ocrResult,
      extractedData: {
        ...ocrResult.extractedData,
        medications: updatedMedications,
      },
    });
  };

  const handleAddMedication = () => {
    if (!ocrResult) return;

    const updatedMedications = [
      ...ocrResult.extractedData.medications,
      { name: '', dosage: '', frequency: '', duration: '' },
    ];

    setOcrResult({
      ...ocrResult,
      extractedData: {
        ...ocrResult.extractedData,
        medications: updatedMedications,
      },
    });
  };

  const handleConfirm = () => {
    if (ocrResult) {
      onUploadComplete(ocrResult);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setSelectedFile(null);
    setPreviewUrl(null);
    setOcrResult(null);
    setError(null);
    setProcessing(false);
    setCapturedImage(null);
    setTabValue(0);
    onClose();
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const confidenceDisplay = ocrResult ? ocrService.getConfidenceDisplay(ocrResult.confidence) : null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Dialog Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-6 h-6" style={{ color: pharmacareColors.primary }} />
              <h2 className="text-xl font-semibold text-gray-900">Scan Prescription (AI OCR)</h2>
            </div>
            <div className="flex items-center gap-3">
              <span 
                className="text-xs font-semibold px-2 py-1 rounded" 
                style={{ 
                  backgroundColor: pharmacareColors.primary, 
                  color: pharmacareColors.textPrimary 
                }}
              >
                Powered by AI
              </span>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dialog Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Tab Selection */}
          {!ocrResult && (
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => {
                  setTabValue(0);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setCapturedImage(null);
                  setError(null);
                  stopCamera();
                }}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  tabValue === 0
                    ? 'border-b-2 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={tabValue === 0 ? { borderColor: pharmacareColors.primary, color: pharmacareColors.primary } : {}}
              >
                <CloudUpload className="w-5 h-5" />
                Upload File
              </button>
              <button
                onClick={() => {
                  setTabValue(1);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setCapturedImage(null);
                  setError(null);
                }}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  tabValue === 1
                    ? 'border-b-2 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={tabValue === 1 ? { borderColor: pharmacareColors.primary, color: pharmacareColors.primary } : {}}
              >
                <Camera className="w-5 h-5" />
                Use Camera
              </button>
            </div>
          )}

          {/* Upload File Tab */}
          {tabValue === 0 && !selectedFile && !ocrResult && (
            <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-all hover:border-gray-400 hover:bg-gray-50">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              <ImageIcon className="mx-auto mb-4" size={64} style={{ color: pharmacareColors.primary }} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Click to Upload Prescription Image</h3>
              <p className="text-sm text-gray-500">Supports JPG, PNG, PDF (Max 10MB)</p>
            </label>
          )}

          {/* Camera Tab */}
          {tabValue === 1 && !capturedImage && !ocrResult && (
            <div>
              {!cameraActive ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="mx-auto mb-4" size={64} style={{ color: pharmacareColors.primary }} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Capture Prescription with Camera</h3>
                  <p className="text-sm text-gray-500 mb-6">Position the prescription clearly in front of the camera</p>
                  <button
                    onClick={startCamera}
                    className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: pharmacareColors.primary,
                      color: pharmacareColors.textPrimary 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = pharmacareColors.primaryDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = pharmacareColors.primary}
                  >
                    <Camera className="w-5 h-5" />
                    Start Camera
                  </button>
                </div>
              ) : (
                <div>
                  <div className="rounded-lg overflow-hidden mb-4 shadow-lg">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-h-96 bg-black"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={capturePhoto}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-colors"
                      style={{ 
                        backgroundColor: pharmacareColors.primary,
                        color: pharmacareColors.textPrimary 
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = pharmacareColors.primaryDark}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = pharmacareColors.primary}
                    >
                      <Camera className="w-5 h-5" />
                      Capture Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 font-semibold rounded-lg transition-colors"
                      style={{ 
                        borderColor: pharmacareColors.error,
                        color: pharmacareColors.error 
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${pharmacareColors.error}08`}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <StopCircle className="w-5 h-5" />
                      Stop
                    </button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
            </div>
          )}

          {/* Preview and Process */}
          {selectedFile && !ocrResult && (
            <div>
              <div className="border border-gray-300 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-4 mb-4">
                  <ImageIcon className="w-6 h-6" style={{ color: pharmacareColors.primary }} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setCapturedImage(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Change
                  </button>
                </div>

                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Prescription preview"
                    className="w-full max-h-72 object-contain border border-gray-300 rounded-lg"
                  />
                )}
              </div>

              {error && (
                <div className="mb-4 p-4 rounded-lg flex items-start gap-2" style={{ backgroundColor: pharmacareColors.errorLight }}>
                  <X className="w-5 h-5 flex-shrink-0" style={{ color: pharmacareColors.error }} />
                  <p className="text-sm" style={{ color: pharmacareColors.error }}>{error}</p>
                </div>
              )}

              <button
                onClick={handleProcessImage}
                disabled={processing}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: pharmacareColors.primary,
                  color: pharmacareColors.textPrimary 
                }}
                onMouseEnter={(e) => !processing && (e.currentTarget.style.backgroundColor = pharmacareColors.primaryDark)}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = pharmacareColors.primary}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Processing with AI OCR...
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-5 h-5" />
                    Process with AI OCR
                  </>
                )}
              </button>
            </div>
          )}

          {processing && (
            <div className="mt-4">
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse" style={{ width: '70%' }}></div>
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">✨ Extracting prescription data using AI OCR...</p>
            </div>
          )}

          {/* OCR Results */}
          {ocrResult && ocrResult.belowThreshold && (
            <div>
              {/* Low Confidence Warning */}
              <div className="mb-6 p-5 rounded-lg border-2 border-amber-300 bg-amber-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-8 h-8 flex-shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold text-amber-800 mb-1">Low Scan Confidence</h3>
                    <p className="text-sm text-amber-700 mb-3">
                      The AI scan confidence is only <strong>{(ocrResult.confidence <= 1 ? ocrResult.confidence * 100 : ocrResult.confidence).toFixed(1)}%</strong>, 
                      which is below the required <strong>75%</strong> threshold. For patient safety, 
                      the scanned results cannot be used automatically.
                    </p>
                    <p className="text-sm text-amber-700 mb-4">
                      You can enter the prescription details manually, or retry with a clearer image.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleManualOrder}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-lg transition-colors"
                          style={{ backgroundColor: pharmacareColors.warning }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = pharmacareColors.warning}
                        >
                          <FileText className="w-4 h-4" />
                          Enter Details Manually
                        </button>
                      <button
                        onClick={handleRetry}
                        className="inline-flex items-center gap-2 px-5 py-2.5 border-2 font-semibold rounded-lg transition-colors"
                        style={{ borderColor: pharmacareColors.primary, color: pharmacareColors.primary }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${pharmacareColors.primary}08`}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Camera className="w-4 h-4" />
                        Retry with Better Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Show image preview for reference */}
              {previewUrl && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Uploaded prescription image:</p>
                  <img
                    src={previewUrl}
                    alt="Prescription"
                    className="w-full max-h-48 object-contain border border-gray-300 rounded-lg opacity-75"
                  />
                </div>
              )}
            </div>
          )}

          {ocrResult && !ocrResult.belowThreshold && (
            <div>
              <div 
                className="mb-6 p-4 rounded-lg flex items-start gap-2"
                style={{ 
                  backgroundColor: confidenceDisplay?.severity === 'success' ? pharmacareColors.successLight : 
                                 confidenceDisplay?.severity === 'warning' ? pharmacareColors.warningLight :
                                 pharmacareColors.infoLight
                }}
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: pharmacareColors.success }} />
                <div className="text-sm">
                  <strong>OCR Completed!</strong> Confidence: {(ocrResult.confidence <= 1 ? ocrResult.confidence * 100 : ocrResult.confidence).toFixed(1)}% (
                  {confidenceDisplay?.level}) - Please verify the extracted data below.
                </div>
              </div>

              <h3 className="text-base font-semibold text-gray-900 mb-4">Patient & Doctor Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={ocrResult.extractedData.patientName || ''}
                    onChange={(e) =>
                      setOcrResult({
                        ...ocrResult,
                        extractedData: { ...ocrResult.extractedData, patientName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    value={ocrResult.extractedData.doctorName || ''}
                    onChange={(e) =>
                      setOcrResult({
                        ...ocrResult,
                        extractedData: { ...ocrResult.extractedData, doctorName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Clinic</label>
                  <input
                    type="text"
                    value={ocrResult.extractedData.hospitalName || ''}
                    onChange={(e) =>
                      setOcrResult({
                        ...ocrResult,
                        extractedData: { ...ocrResult.extractedData, hospitalName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="text"
                    value={ocrResult.extractedData.date || ''}
                    onChange={(e) =>
                      setOcrResult({
                        ...ocrResult,
                        extractedData: { ...ocrResult.extractedData, date: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Medications ({ocrResult.extractedData.medications.length})
                </h3>
                <button
                  onClick={handleAddMedication}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: pharmacareColors.primary }}
                >
                  <Plus className="w-4 h-4" />
                  Add Medicine
                </button>
              </div>

              {ocrResult.extractedData.medications.map((med, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border border-gray-300 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span 
                      className="text-xs font-medium px-2 py-1 rounded"
                      style={{ backgroundColor: pharmacareColors.infoLight, color: pharmacareColors.info }}
                    >
                      Medicine {index + 1}
                    </span>
                    <button
                      onClick={() => handleMedicationDelete(index)}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                      style={{ color: pharmacareColors.error }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedicationEdit(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedicationEdit(index, 'dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleMedicationEdit(index, 'frequency', e.target.value)}
                        placeholder="e.g., 3 times daily"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedicationEdit(index, 'duration', e.target.value)}
                        placeholder="e.g., 7 days"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Raw Text (for reference) */}
              <div className="mt-6">
                <p className="text-xs text-gray-500 mb-2">Raw Extracted Text (for reference):</p>
                <div className="p-4 bg-gray-50 rounded-lg max-h-36 overflow-auto">
                  <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">{ocrResult.text}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          {ocrResult && !ocrResult.belowThreshold && (
            <button
              onClick={handleConfirm}
              className="px-6 py-2 text-white font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: pharmacareColors.success }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = pharmacareColors.success}
            >
              Confirm & Add Prescription
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

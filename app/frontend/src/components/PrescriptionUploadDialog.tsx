import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  TextField,
  Grid,
  LinearProgress,
  IconButton,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import StopIcon from '@mui/icons-material/Stop';
import { ocrService } from '../services/ocrService';
import type { OCRResult, Medication } from '../services/ocrService';
import { pharmacareColors } from '../theme/pharmacare-theme';

interface PrescriptionUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete: (result: OCRResult) => void;
}

export const PrescriptionUploadDialog = ({ open, onClose, onUploadComplete }: PrescriptionUploadDialogProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingMedication, setEditingMedication] = useState<number | null>(null);
  
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
    setEditingMedication(updatedMedications.length - 1);
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
    setEditingMedication(null);
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <PhotoCameraIcon sx={{ color: pharmacareColors.primary }} />
            <Typography variant="h6" fontWeight={600}>
              Scan Prescription (AI OCR)
            </Typography>
          </Box>
          <Chip 
            label="Powered by AI" 
            size="small" 
            sx={{ bgcolor: pharmacareColors.primary, color: pharmacareColors.textPrimary, fontWeight: 600 }}
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Tab Selection */}
        {!ocrResult && (
          <Tabs 
            value={tabValue} 
            onChange={(_, newValue) => {
              setTabValue(newValue);
              setSelectedFile(null);
              setPreviewUrl(null);
              setCapturedImage(null);
              setError(null);
              if (newValue === 0) stopCamera();
            }}
            sx={{ 
              mb: 3,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Tab 
              icon={<CloudUploadIcon />} 
              label="Upload File" 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab 
              icon={<CameraAltIcon />} 
              label="Use Camera" 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
          </Tabs>
        )}

        {/* Upload File Tab */}
        {tabValue === 0 && !selectedFile && !ocrResult && (
          <Box
            sx={{
              border: `2px dashed ${pharmacareColors.border}`,
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': { 
                borderColor: pharmacareColors.primary, 
                bgcolor: `${pharmacareColors.primary}08` 
              },
            }}
            component="label"
          >
            <input type="file" accept="image/*" hidden onChange={handleFileSelect} />
            <ImageIcon sx={{ fontSize: 64, color: pharmacareColors.primary, mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Click to Upload Prescription Image
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports JPG, PNG, PDF (Max 10MB)
            </Typography>
          </Box>
        )}

        {/* Camera Tab */}
        {tabValue === 1 && !capturedImage && !ocrResult && (
          <Box>
            {!cameraActive ? (
              <Box
                sx={{
                  border: `2px dashed ${pharmacareColors.border}`,
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <CameraAltIcon sx={{ fontSize: 64, color: pharmacareColors.primary, mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Capture Prescription with Camera
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Position the prescription clearly in front of the camera
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CameraAltIcon />}
                  onClick={startCamera}
                  sx={{
                    bgcolor: pharmacareColors.primary,
                    color: pharmacareColors.textPrimary,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: pharmacareColors.primaryDark,
                    },
                  }}
                >
                  Start Camera
                </Button>
              </Box>
            ) : (
              <Box>
                <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      maxHeight: '400px',
                      display: 'block',
                      backgroundColor: '#000',
                    }}
                  />
                </Paper>
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<PhotoCameraIcon />}
                    onClick={capturePhoto}
                    sx={{
                      bgcolor: pharmacareColors.primary,
                      color: pharmacareColors.textPrimary,
                      fontWeight: 600,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: pharmacareColors.primaryDark,
                      },
                    }}
                  >
                    Capture Photo
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<StopIcon />}
                    onClick={stopCamera}
                    sx={{
                      borderColor: pharmacareColors.error,
                      color: pharmacareColors.error,
                      '&:hover': {
                        borderColor: pharmacareColors.error,
                        bgcolor: `${pharmacareColors.error}08`,
                      },
                    }}
                  >
                    Stop
                  </Button>
                </Box>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </Box>
            )}
          </Box>
        )}

        {/* Preview and Process */}
        {selectedFile && !ocrResult && (
          <Box>
            <Card elevation={0} sx={{ border: `1px solid ${pharmacareColors.border}`, mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <ImageIcon sx={{ color: pharmacareColors.primary }} />
                  <Box flex={1}>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setCapturedImage(null);
                    }}
                  >
                    Change
                  </Button>
                </Box>

                {previewUrl && (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Prescription preview"
                    sx={{
                      width: '100%',
                      maxHeight: 300,
                      objectFit: 'contain',
                      borderRadius: 1,
                      border: `1px solid ${pharmacareColors.border}`,
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleProcessImage}
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              sx={{
                bgcolor: pharmacareColors.primary,
                color: pharmacareColors.textPrimary,
                fontWeight: 600,
                py: 1.5,
                '&:hover': {
                  bgcolor: pharmacareColors.primaryDark,
                },
              }}
            >
              {processing ? 'Processing with AI OCR...' : 'Process with AI OCR'}
            </Button>
          </Box>
        )}

        {processing && (
          <Box mt={2}>
            <LinearProgress sx={{ 
              '& .MuiLinearProgress-bar': { 
                bgcolor: pharmacareColors.primary 
              } 
            }} />
            <Typography variant="body2" color="text.secondary" align="center" mt={1}>
              ✨ Extracting prescription data using AI OCR...
            </Typography>
          </Box>
        )}

        {/* OCR Results */}
        {ocrResult && (
          <Box>
            <Alert
              severity={confidenceDisplay?.severity}
              icon={<CheckCircleIcon />}
              sx={{ mb: 3 }}
            >
              <strong>OCR Completed!</strong> Confidence: {ocrResult.confidence.toFixed(1)}% (
              {confidenceDisplay?.level}) - Please verify the extracted data below.
            </Alert>

            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Patient & Doctor Information
            </Typography>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Patient Name"
                  value={ocrResult.extractedData.patientName || ''}
                  onChange={(e) =>
                    setOcrResult({
                      ...ocrResult,
                      extractedData: { ...ocrResult.extractedData, patientName: e.target.value },
                    })
                  }
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Doctor Name"
                  value={ocrResult.extractedData.doctorName || ''}
                  onChange={(e) =>
                    setOcrResult({
                      ...ocrResult,
                      extractedData: { ...ocrResult.extractedData, doctorName: e.target.value },
                    })
                  }
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hospital/Clinic"
                  value={ocrResult.extractedData.hospitalName || ''}
                  onChange={(e) =>
                    setOcrResult({
                      ...ocrResult,
                      extractedData: { ...ocrResult.extractedData, hospitalName: e.target.value },
                    })
                  }
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  value={ocrResult.extractedData.date || ''}
                  onChange={(e) =>
                    setOcrResult({
                      ...ocrResult,
                      extractedData: { ...ocrResult.extractedData, date: e.target.value },
                    })
                  }
                  size="small"
                />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Medications ({ocrResult.extractedData.medications.length})
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddMedication}
                sx={{ color: pharmacareColors.primary }}
              >
                Add Medicine
              </Button>
            </Box>

            {ocrResult.extractedData.medications.map((med, index) => (
              <Card 
                key={index} 
                elevation={0}
                sx={{ 
                  mb: 2, 
                  border: `1px solid ${pharmacareColors.border}`,
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip 
                      label={`Medicine ${index + 1}`} 
                      size="small"
                      sx={{ bgcolor: pharmacareColors.infoLight, color: pharmacareColors.info }}
                    />
                    <IconButton 
                      size="small" 
                      onClick={() => handleMedicationDelete(index)}
                      sx={{ color: pharmacareColors.error }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Medicine Name"
                        value={med.name}
                        onChange={(e) => handleMedicationEdit(index, 'name', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Dosage"
                        value={med.dosage}
                        onChange={(e) => handleMedicationEdit(index, 'dosage', e.target.value)}
                        size="small"
                        placeholder="e.g., 500mg"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Frequency"
                        value={med.frequency}
                        onChange={(e) => handleMedicationEdit(index, 'frequency', e.target.value)}
                        size="small"
                        placeholder="e.g., 3 times daily"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Duration"
                        value={med.duration}
                        onChange={(e) => handleMedicationEdit(index, 'duration', e.target.value)}
                        size="small"
                        placeholder="e.g., 7 days"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            {/* Raw Text (for reference) */}
            <Box mt={3}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Raw Extracted Text (for reference):
              </Typography>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  bgcolor: pharmacareColors.bgGray,
                  borderRadius: 1,
                  maxHeight: 150,
                  overflow: 'auto',
                }}
              >
                <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  {ocrResult.rawText}
                </Typography>
              </Paper>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        {ocrResult && (
          <Button 
            onClick={handleConfirm} 
            variant="contained"
            sx={{
              bgcolor: pharmacareColors.success,
              color: '#fff',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#059669',
              },
            }}
          >
            Confirm & Add Prescription
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

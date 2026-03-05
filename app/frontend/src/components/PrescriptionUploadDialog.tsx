import { useState } from 'react';
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
  List,
  Divider,
  LinearProgress,
  IconButton,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ocrService } from '../services/ocrService';
import type { OCRResult, Medication } from '../services/ocrService';

interface PrescriptionUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete: (result: OCRResult) => void;
}

export const PrescriptionUploadDialog = ({ open, onClose, onUploadComplete }: PrescriptionUploadDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingMedication, setEditingMedication] = useState<number | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setOcrResult(null);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
    setSelectedFile(null);
    setPreviewUrl(null);
    setOcrResult(null);
    setError(null);
    setProcessing(false);
    setEditingMedication(null);
    onClose();
  };

  const confidenceDisplay = ocrResult ? ocrService.getConfidenceDisplay(ocrResult.confidence) : null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CloudUploadIcon />
          Upload Prescription Image (AI OCR)
        </Box>
      </DialogTitle>
      <DialogContent>
        {!selectedFile && (
          <Box
            sx={{
              border: '2px dashed #ddd',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: '#667eea', bgcolor: '#f8f9ff' },
            }}
            component="label"
          >
            <input type="file" accept="image/*" hidden onChange={handleFileSelect} />
            <ImageIcon sx={{ fontSize: 64, color: '#667eea', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Click to Upload Prescription Image
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports JPG, PNG (Max 10MB)
            </Typography>
          </Box>
        )}

        {selectedFile && !ocrResult && (
          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <ImageIcon color="primary" />
                  <Box flex={1}>
                    <Typography variant="body1" fontWeight="500">
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small" onClick={() => setSelectedFile(null)}>
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
                      border: '1px solid #eee',
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box mt={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleProcessImage}
                disabled={processing}
                startIcon={processing ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              >
                {processing ? 'Processing with AI OCR...' : 'Process with AI OCR'}
              </Button>
            </Box>
          </Box>
        )}

        {processing && (
          <Box mt={2}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" align="center" mt={1}>
              Extracting text from image using Tesseract OCR...
            </Typography>
          </Box>
        )}

        {ocrResult && (
          <Box>
            <Alert
              severity={confidenceDisplay?.severity}
              icon={<CheckCircleIcon />}
              sx={{ mb: 2 }}
            >
              <strong>OCR Completed!</strong> Confidence: {ocrResult.confidence.toFixed(1)}% (
              {confidenceDisplay?.level})
            </Alert>

            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Hospital Name"
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
              <Grid item xs={12} md={6}>
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

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Extracted Medications</Typography>
              <Button size="small" startIcon={<EditIcon />} onClick={handleAddMedication}>
                Add Medication
              </Button>
            </Box>

            {ocrResult.extractedData.medications.length === 0 ? (
              <Alert severity="warning" icon={<WarningIcon />}>
                No medications detected. Please add them manually.
              </Alert>
            ) : (
              <List>
                {ocrResult.extractedData.medications.map((med, index) => (
                  <Paper key={index} sx={{ mb: 2, p: 2 }}>
                    {editingMedication === index ? (
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Medicine Name"
                            value={med.name}
                            onChange={(e) => handleMedicationEdit(index, 'name', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Dosage"
                            value={med.dosage || ''}
                            onChange={(e) => handleMedicationEdit(index, 'dosage', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Frequency"
                            value={med.frequency || ''}
                            onChange={(e) => handleMedicationEdit(index, 'frequency', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Duration"
                            value={med.duration || ''}
                            onChange={(e) => handleMedicationEdit(index, 'duration', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button size="small" onClick={() => setEditingMedication(null)}>
                            Done
                          </Button>
                        </Grid>
                      </Grid>
                    ) : (
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="start">
                          <Box flex={1}>
                            <Typography variant="body1" fontWeight="500">
                              {med.name || 'Unnamed medication'}
                            </Typography>
                            <Box display="flex" gap={1} mt={1}>
                              {med.dosage && <Chip label={med.dosage} size="small" />}
                              {med.frequency && <Chip label={med.frequency} size="small" color="primary" />}
                              {med.duration && <Chip label={med.duration} size="small" color="secondary" />}
                            </Box>
                          </Box>
                          <Box>
                            <IconButton size="small" onClick={() => setEditingMedication(index)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleMedicationDelete(index)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Paper>
                ))}
              </List>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Raw OCR Text:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', maxHeight: 150, overflow: 'auto' }}>
              <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {ocrResult.text}
              </Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!ocrResult}
          startIcon={<CheckCircleIcon />}
        >
          Confirm & Create Prescription
        </Button>
      </DialogActions>
    </Dialog>
  );
};

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  Chip,
  Stack,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Delete,
  Search,
  Warning,
  CheckCircle,
  MedicalServices,
} from '@mui/icons-material';
import { drugInteractionService, type DrugInteraction } from '../services/drugInteractionService';

export const DrugInteractionChecker = () => {
  const [medications, setMedications] = useState<string[]>([]);
  const [currentMedication, setCurrentMedication] = useState('');
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMedication = () => {
    const medication = currentMedication.trim();
    if (!medication) {
      setError('Please enter a medication name');
      return;
    }
    
    if (medications.includes(medication)) {
      setError('This medication is already in the list');
      return;
    }

    setMedications([...medications, medication]);
    setCurrentMedication('');
    setError('');
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
    if (medications.length - 1 < 2) {
      setInteractions([]);
    }
  };

  const handleCheckInteractions = async () => {
    if (medications.length < 2) {
      setError('Please add at least 2 medications to check for interactions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await drugInteractionService.checkInteractions(medications);
      setInteractions(result.interactions);
    } catch (err: any) {
      setError(err.message || 'Failed to check drug interactions');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMedications([]);
    setInteractions([]);
    setCurrentMedication('');
    setError('');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'major':
        return 'error';
      case 'moderate':
        return 'warning';
      case 'minor':
        return 'info';
      default:
        return 'default';
    }
  };

  const majorCount = interactions.filter(i => i.severity === 'major').length;
  const moderateCount = interactions.filter(i => i.severity === 'moderate').length;
  const minorCount = interactions.filter(i => i.severity === 'minor').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <MedicalServices sx={{ fontSize: 40 }} />
          AI Drug Interaction Checker
        </Typography>
        <Typography color="text.secondary">
          Check for potential drug interactions between multiple medications using AI-powered analysis.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Side - Add Medications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Add Medications
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Medication Name"
                  value={currentMedication}
                  onChange={(e) => setCurrentMedication(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMedication()}
                  placeholder="e.g., Aspirin, Warfarin, Ibuprofen"
                  error={!!error}
                  helperText={error}
                />
                <Button
                  variant="contained"
                  onClick={handleAddMedication}
                  startIcon={<Add />}
                  sx={{ minWidth: '120px' }}
                >
                  Add
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Medications List ({medications.length})
              </Typography>

              {medications.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No medications added yet. Add at least 2 medications to check for interactions.
                </Alert>
              ) : (
                <List>
                  {medications.map((medication, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={medication}
                        secondary={`Medication ${index + 1}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleRemoveMedication(index)}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCheckInteractions}
                  disabled={medications.length < 2 || loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {loading ? 'Checking...' : 'Check Interactions'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  disabled={medications.length === 0}
                >
                  Clear All
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side - Results */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Interaction Results
              </Typography>

              {medications.length < 2 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Add at least 2 medications and click "Check Interactions" to see results.
                </Alert>
              ) : loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : interactions.length === 0 && medications.length >= 2 ? (
                <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    No Known Interactions Detected
                  </Typography>
                  <Typography variant="body2">
                    The medications in your list do not have any known interactions in our database.
                    However, always consult with a healthcare professional before combining medications.
                  </Typography>
                </Alert>
              ) : (
                <>
                  {/* Summary */}
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      {majorCount > 0 && (
                        <Grid item xs={4}>
                          <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {majorCount}
                              </Typography>
                              <Typography variant="caption">Major</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                      {moderateCount > 0 && (
                        <Grid item xs={4}>
                          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {moderateCount}
                              </Typography>
                              <Typography variant="caption">Moderate</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                      {minorCount > 0 && (
                        <Grid item xs={4}>
                          <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {minorCount}
                              </Typography>
                              <Typography variant="caption">Minor</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  {/* Detailed Interactions */}
                  <Stack spacing={2}>
                    {interactions.map((interaction, index) => (
                      <Alert
                        key={index}
                        severity={getSeverityColor(interaction.severity) as any}
                        icon={<Warning />}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {interaction.drugs.join(' + ')}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {interaction.description}
                        </Typography>
                        <Chip
                          label={`${interaction.severity.toUpperCase()} SEVERITY`}
                          color={getSeverityColor(interaction.severity) as any}
                          size="small"
                        />
                      </Alert>
                    ))}
                  </Stack>

                  <Alert severity="warning" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      <strong>Important:</strong> This tool provides information based on known drug interactions.
                      Always consult with a qualified healthcare professional before making any medication decisions.
                    </Typography>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* How It Works */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            How It Works
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, mb: 2, display: 'inline-block' }}>
                  <Add sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  1. Add Medications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter the names of medications you want to check
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, mb: 2, display: 'inline-block' }}>
                  <Search sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  2. AI Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our AI checks for known interactions using comprehensive databases
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, mb: 2, display: 'inline-block' }}>
                  <Warning sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  3. Get Results
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Receive detailed information about potential interactions
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

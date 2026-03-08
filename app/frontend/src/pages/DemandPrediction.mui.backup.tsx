import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import InventoryIcon from '@mui/icons-material/Inventory';
import RefreshIcon from '@mui/icons-material/Refresh';
import { demandPredictionService } from '../services/demandPredictionService';
import type { DemandSummary, PredictionResult } from '../services/demandPredictionService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const DemandPrediction = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DemandSummary | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await demandPredictionService.getAllPredictions();
      setSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch demand predictions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getTrendIcon = (trend: 'increasing' | 'stable' | 'decreasing') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUpIcon sx={{ color: '#4caf50' }} />;
      case 'decreasing':
        return <TrendingDownIcon sx={{ color: '#f44336' }} />;
      default:
        return <TrendingFlatIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const getPriorityChip = (daysUntilStockout: number) => {
    if (daysUntilStockout < 7) {
      return <Chip label="Critical" color="error" size="small" />;
    } else if (daysUntilStockout < 14) {
      return <Chip label="High" color="warning" size="small" />;
    } else if (daysUntilStockout < 30) {
      return <Chip label="Medium" color="info" size="small" />;
    } else {
      return <Chip label="Low" color="success" size="small" />;
    }
  };

  const renderPredictionTable = (predictions: PredictionResult[]) => {
    if (predictions.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No items in this category
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><strong>Medicine Name</strong></TableCell>
              <TableCell align="center"><strong>Current Stock</strong></TableCell>
              <TableCell align="center"><strong>Avg Daily Sales</strong></TableCell>
              <TableCell align="center"><strong>7-Day Demand</strong></TableCell>
              <TableCell align="center"><strong>30-Day Demand</strong></TableCell>
              <TableCell align="center"><strong>Days Until Stockout</strong></TableCell>
              <TableCell align="center"><strong>Trend</strong></TableCell>
              <TableCell align="center"><strong>Priority</strong></TableCell>
              <TableCell align="center"><strong>Reorder Qty</strong></TableCell>
              <TableCell align="center"><strong>Confidence</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {predictions.map((prediction) => (
              <TableRow key={prediction.medicineId} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">
                    {prediction.medicineName}
                  </Typography>
                </TableCell>
                <TableCell align="center">{prediction.currentStock}</TableCell>
                <TableCell align="center">{prediction.averageDailySales}</TableCell>
                <TableCell align="center">
                  <Chip label={prediction.predictedDemand} color="primary" size="small" variant="outlined" />
                </TableCell>
                <TableCell align="center">
                  <Chip label={prediction.predictedDemand30Days} color="secondary" size="small" variant="outlined" />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={prediction.daysUntilStockout > 999 ? '∞' : `${prediction.daysUntilStockout} days`}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={prediction.trend}>
                    {getTrendIcon(prediction.trend)}
                  </Tooltip>
                </TableCell>
                <TableCell align="center">{getPriorityChip(prediction.daysUntilStockout)}</TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="500" color="primary">
                    {prediction.recommendedReorderQuantity}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={prediction.confidence}
                      sx={{ width: 60, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption">{prediction.confidence}%</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="600" gutterBottom>
            📊 Demand Prediction Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered inventory forecasting based on 6 months of sales data
          </Typography>
        </Box>
        <Tooltip title="Refresh Predictions">
          <IconButton onClick={fetchPredictions} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <WarningIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {summary.criticalStockItems.length}
                  </Typography>
                  <Typography variant="body2">Critical Stock Items</Typography>
                  <Typography variant="caption">{'<7 days until stockout'}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUpIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {summary.highDemandItems.length}
                  </Typography>
                  <Typography variant="body2">High Demand Items</Typography>
                  <Typography variant="caption">Increasing trend</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingDownIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {summary.slowMovingItems.length}
                  </Typography>
                  <Typography variant="body2">Slow Moving Items</Typography>
                  <Typography variant="caption">Low sales velocity</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #03a9f4 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <InventoryIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {summary.predictions.length}
                  </Typography>
                  <Typography variant="body2">Total Medicines</Typography>
                  <Typography variant="caption">AI predictions available</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for Different Views */}
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<WarningIcon />} label="Critical Stock" iconPosition="start" />
          <Tab icon={<TrendingUpIcon />} label="High Demand" iconPosition="start" />
          <Tab icon={<TrendingDownIcon />} label="Slow Moving" iconPosition="start" />
          <Tab icon={<InventoryIcon />} label="All Predictions" iconPosition="start" />
        </Tabs>

        <Box p={3}>
          <TabPanel value={tabValue} index={0}>
            {summary.criticalStockItems.length > 0 ? (
              <>
                <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 2 }}>
                  <strong>Urgent Action Required!</strong> These items will run out of stock within 7 days.
                  Place orders immediately to avoid stockouts.
                </Alert>
                {renderPredictionTable(summary.criticalStockItems)}
              </>
            ) : (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                Great! No critical stock items at this time. All medicines have adequate inventory levels.
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
              These medicines show increasing demand trends. Consider increasing stock levels to meet growing demand.
            </Alert>
            {renderPredictionTable(summary.highDemandItems)}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Alert severity="warning" icon={<InfoIcon />} sx={{ mb: 2 }}>
              These items have low sales velocity and high inventory. Consider promotions or reducing future orders.
            </Alert>
            {renderPredictionTable(summary.slowMovingItems)}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {renderPredictionTable(summary.predictions)}
          </TabPanel>
        </Box>
      </Paper>

      {/* Model Info Footer */}
      <Box mt={4}>
        <Alert severity="info" icon={<InfoIcon />}>
          <Typography variant="body2">
            <strong>Prediction Model:</strong> Statistical forecasting using moving averages (7-day, 30-day, 90-day weighted),
            trend detection, and seasonality analysis. Based on 6 months of synthetic sales data.{' '}
            <em>Can be upgraded to TensorFlow.js model for improved accuracy.</em>
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

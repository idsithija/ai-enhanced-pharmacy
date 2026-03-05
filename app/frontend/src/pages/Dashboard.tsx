import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  Warning,
  Inventory,
  Add,
  PointOfSale,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Mock data for demonstration
const mockSalesData = [
  { date: 'Mon', sales: 4200 },
  { date: 'Tue', sales: 5100 },
  { date: 'Wed', sales: 3800 },
  { date: 'Thu', sales: 6200 },
  { date: 'Fri', sales: 7500 },
  { date: 'Sat', sales: 8300 },
  { date: 'Sun', sales: 6700 },
];

const mockRecentSales = [
  { id: '1', customerName: 'John Doe', amount: 450, items: 3, time: '10 mins ago' },
  { id: '2', customerName: 'Jane Smith', amount: 780, items: 5, time: '25 mins ago' },
  { id: '3', customerName: 'Bob Johnson', amount: 320, items: 2, time: '1 hour ago' },
  { id: '4', customerName: 'Alice Brown', amount: 890, items: 6, time: '2 hours ago' },
  { id: '5', customerName: 'Charlie Wilson', amount: 540, items: 4, time: '3 hours ago' },
];

const mockLowStock = [
  { id: '1', name: 'Paracetamol 500mg', quantity: 45, threshold: 100, status: 'warning' },
  { id: '2', name: 'Amoxicillin 250mg', quantity: 12, threshold: 50, status: 'critical' },
  { id: '3', name: 'Ibuprofen 400mg', quantity: 78, threshold: 100, status: 'warning' },
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, color, subtitle }: StatCardProps) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${color}15`,
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Welcome back, {user?.fullName}! Here's what's happening today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Sales"
            value="₹8,300"
            subtitle="+12.5% from yesterday"
            icon={<TrendingUp />}
            color="#667eea"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Transactions"
            value="156"
            subtitle="24 pending prescriptions"
            icon={<ShoppingCart />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value="12"
            subtitle="Requires attention"
            icon={<Warning />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Expiring Soon"
            value="8"
            subtitle="Within 30 days"
            icon={<Inventory />}
            color="#ef4444"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<PointOfSale />}
              onClick={() => navigate('/pos')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              New Sale
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => navigate('/medicines')}
            >
              Add Medicine
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => navigate('/inventory')}
            >
              Add Stock
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Sales Overview (Last 7 Days)
              </Typography>
              <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                <ResponsiveContainer>
                  <LineChart data={mockSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#667eea"
                      strokeWidth={2}
                      dot={{ fill: '#667eea' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Sales */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recent Sales
              </Typography>
              <Box sx={{ mt: 2 }}>
                {mockRecentSales.map((sale) => (
                  <Box
                    key={sale.id}
                    sx={{
                      py: 1.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {sale.customerName}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        ₹{sale.amount}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        {sale.items} items
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sale.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Low Stock Alerts
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Medicine Name</TableCell>
                      <TableCell align="right">Current Stock</TableCell>
                      <TableCell align="right">Threshold</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockLowStock.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{item.threshold}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.status === 'critical' ? 'Critical' : 'Warning'}
                            color={item.status === 'critical' ? 'error' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate('/inventory')}
                          >
                            Reorder
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

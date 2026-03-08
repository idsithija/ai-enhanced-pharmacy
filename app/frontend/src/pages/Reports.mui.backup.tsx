import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Inventory,
  People,
  AttachMoney,
  Download,
  Assessment,
  LocalPharmacy,
  ShoppingCart,
  MonetizationOn,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mock data for sales trend (last 7 days)
const salesTrendData = [
  { date: 'Mar 29', sales: 8500, transactions: 45 },
  { date: 'Mar 30', sales: 9200, transactions: 52 },
  { date: 'Mar 31', sales: 7800, transactions: 38 },
  { date: 'Apr 01', sales: 10500, transactions: 58 },
  { date: 'Apr 02', sales: 11200, transactions: 64 },
  { date: 'Apr 03', sales: 9800, transactions: 51 },
  { date: 'Apr 04', sales: 12300, transactions: 72 },
];

// Mock data for category sales
const categorySalesData = [
  { category: 'Analgesics', sales: 45000, percentage: 28 },
  { category: 'Antibiotics', sales: 38500, percentage: 24 },
  { category: 'Vitamins', sales: 28000, percentage: 17 },
  { category: 'Antihistamines', sales: 22500, percentage: 14 },
  { category: 'Others', sales: 27000, percentage: 17 },
];

// Mock data for top selling medicines
const topMedicines = [
  { name: 'Paracetamol 500mg', sold: 1250, revenue: 7487.50, growth: 12 },
  { name: 'Amoxicillin 250mg', sold: 890, revenue: 11125.00, growth: 8 },
  { name: 'Ibuprofen 400mg', sold: 780, revenue: 6825.00, growth: -3 },
  { name: 'Cetirizine 10mg', sold: 650, revenue: 4875.00, growth: 15 },
  { name: 'Omeprazole 20mg', sold: 520, revenue: 7930.00, growth: 5 },
];

// Mock data for payment methods
const paymentMethodData = [
  { method: 'Cash', amount: 82500, percentage: 51 },
  { method: 'Card', amount: 58300, percentage: 36 },
  { method: 'Mobile', amount: 20700, percentage: 13 },
];

// Mock data for inventory status
const inventoryStatusData = [
  { status: 'In Stock', count: 156, color: '#4caf50' },
  { status: 'Low Stock', count: 23, color: '#ff9800' },
  { status: 'Out of Stock', count: 8, color: '#f44336' },
  { status: 'Expiring Soon', count: 12, color: '#2196f3' },
];

// Colors for pie chart
const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

const PAYMENT_COLORS = ['#4caf50', '#2196f3', '#ff9800'];

export const Reports = () => {
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState('2024-03-01');
  const [endDate, setEndDate] = useState('2024-03-05');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExport = (reportType: string) => {
    // Mock export functionality
    console.log(`Exporting ${reportType} report from ${startDate} to ${endDate}`);
    alert(`Exporting ${reportType} report...`);
  };

  // Sales Report Tab
  const SalesReportTab = () => (
    <Box>
      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Sales
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    ₹69,500
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingUp fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      +18.2%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <MonetizationOn />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Transactions
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    380
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingUp fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      +12.5%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <ShoppingCart />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Avg. Order Value
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    ₹183
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingUp fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      +5.1%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Profit Margin
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    28.5%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingDown fontSize="small" color="error" />
                    <Typography variant="caption" color="error.main">
                      -2.3%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <Assessment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Sales Trend (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#667eea" strokeWidth={3} name="Sales (₹)" />
                  <Line yAxisId="right" type="monotone" dataKey="transactions" stroke="#764ba2" strokeWidth={3} name="Transactions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Sales Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Sales by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorySalesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sales"
                  >
                    {categorySalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {categorySalesData.map((cat, index) => (
                  <Box key={cat.category} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: COLORS[index], borderRadius: 1 }} />
                      <Typography variant="body2">{cat.category}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ₹{cat.sales.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Selling Medicines */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Top Selling Medicines
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Medicine</TableCell>
                      <TableCell>Units Sold</TableCell>
                      <TableCell>Revenue</TableCell>
                      <TableCell>Growth</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topMedicines.map((medicine, index) => (
                      <TableRow key={medicine.name} hover>
                        <TableCell>
                          <Chip label={`#${index + 1}`} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {medicine.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{medicine.sold.toLocaleString()}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            ₹{medicine.revenue.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {medicine.growth >= 0 ? (
                              <>
                                <TrendingUp fontSize="small" color="success" />
                                <Typography variant="body2" color="success.main">
                                  +{medicine.growth}%
                                </Typography>
                              </>
                            ) : (
                              <>
                                <TrendingDown fontSize="small" color="error" />
                                <Typography variant="body2" color="error.main">
                                  {medicine.growth}%
                                </Typography>
                              </>
                            )}
                          </Box>
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

  // Inventory Report Tab
  const InventoryReportTab = () => (
    <Box>
      <Grid container spacing={3}>
        {/* Inventory Status Cards */}
        {inventoryStatusData.map((status) => (
          <Grid item xs={12} sm={6} md={3} key={status.status}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      {status.status}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {status.count}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: status.color, width: 56, height: 56 }}>
                    <LocalPharmacy />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Inventory Value */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Inventory Value by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categorySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#667eea" name="Value (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Stock Status Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Stock Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inventoryStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.status}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {inventoryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alert */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Low Stock Items Requiring Action
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Medicine</TableCell>
                      <TableCell>Current Stock</TableCell>
                      <TableCell>Min. Required</TableCell>
                      <TableCell>Reorder Qty</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      <TableCell>Amoxicillin 250mg</TableCell>
                      <TableCell>45</TableCell>
                      <TableCell>100</TableCell>
                      <TableCell>200</TableCell>
                      <TableCell>
                        <Chip label="Low Stock" color="warning" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell>Aspirin 75mg</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>50</TableCell>
                      <TableCell>150</TableCell>
                      <TableCell>
                        <Chip label="Out of Stock" color="error" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell>Metformin 500mg</TableCell>
                      <TableCell>35</TableCell>
                      <TableCell>80</TableCell>
                      <TableCell>180</TableCell>
                      <TableCell>
                        <Chip label="Low Stock" color="warning" size="small" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Customer Report Tab
  const CustomerReportTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Customers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    1,248
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    New Customers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    86
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingUp fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      +24.5%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Avg. Lifetime Value
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ₹8,450
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <MonetizationOn />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Loyalty Points Issued
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    12,450
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                  <Assessment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Top Customers by Revenue
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Total Purchases</TableCell>
                      <TableCell>Total Spent</TableCell>
                      <TableCell>Loyalty Points</TableCell>
                      <TableCell>Tier</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      <TableCell><Chip label="#1" size="small" color="primary" /></TableCell>
                      <TableCell>Jane Smith</TableCell>
                      <TableCell>78</TableCell>
                      <TableCell><strong>₹28,500.75</strong></TableCell>
                      <TableCell>1,250</TableCell>
                      <TableCell><Chip label="VIP" size="small" color="error" /></TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell><Chip label="#2" size="small" color="primary" /></TableCell>
                      <TableCell>Emily Davis</TableCell>
                      <TableCell>56</TableCell>
                      <TableCell><strong>₹19,250.00</strong></TableCell>
                      <TableCell>820</TableCell>
                      <TableCell><Chip label="Regular" size="small" color="primary" /></TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell><Chip label="#3" size="small" color="primary" /></TableCell>
                      <TableCell>John Doe</TableCell>
                      <TableCell>42</TableCell>
                      <TableCell><strong>₹15,680.50</strong></TableCell>
                      <TableCell>450</TableCell>
                      <TableCell><Chip label="Regular" size="small" color="primary" /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Financial Report Tab
  const FinancialReportTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="success.main">
                ₹161,500
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="error.main">
                ₹98,200
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Net Profit
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="primary.main">
                ₹63,300
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Profit Margin
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="warning.main">
                39.2%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Method Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Payment Method Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.method} ${entry.percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {paymentMethodData.map((method, index) => (
                  <Box key={method.method} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: PAYMENT_COLORS[index], borderRadius: 1 }} />
                      <Typography variant="body2">{method.method}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ₹{method.amount.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue vs Expenses */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Revenue vs Expenses
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Week 1', revenue: 38500, expenses: 23000 },
                    { name: 'Week 2', revenue: 42000, expenses: 25500 },
                    { name: 'Week 3', revenue: 39500, expenses: 24200 },
                    { name: 'Week 4', revenue: 41500, expenses: 25500 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#4caf50" name="Revenue" />
                  <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          📊 Reports & Analytics
        </Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={() => handleExport(['Sales', 'Inventory', 'Customer', 'Financial'][tabValue])}
          sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          Export Report
        </Button>
      </Box>

      {/* Date Range Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="outlined" fullWidth sx={{ height: 56 }}>
                Apply Filter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Sales Report" icon={<ShoppingCart />} iconPosition="start" />
          <Tab label="Inventory Report" icon={<Inventory />} iconPosition="start" />
          <Tab label="Customer Report" icon={<People />} iconPosition="start" />
          <Tab label="Financial Report" icon={<AttachMoney />} iconPosition="start" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <SalesReportTab />}
          {tabValue === 1 && <InventoryReportTab />}
          {tabValue === 2 && <CustomerReportTab />}
          {tabValue === 3 && <FinancialReportTab />}
        </Box>
      </Paper>
    </Box>
  );
};

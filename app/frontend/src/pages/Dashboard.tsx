import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
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
} from "@mui/material";
import {
  TrendingUp,
  ShoppingCart,
  Warning,
  Inventory,
  Add,
  PointOfSale,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { dashboardService } from "../services/dashboardService";
import type { DashboardStats, Sale } from "../types";

// Temporary mock data for sales chart (until sales-chart endpoint is implemented)
const mockSalesData = [
  { date: "Mon", sales: 4200 },
  { date: "Tue", sales: 5100 },
  { date: "Wed", sales: 3800 },
  { date: "Thu", sales: 6200 },
  { date: "Fri", sales: 7500 },
  { date: "Sat", sales: 8300 },
  { date: "Sun", sales: 6700 },
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, color, subtitle }: StatCardProps) => (
  <Card sx={{ height: "100%", position: "relative", overflow: "visible" }}>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography
            variant="h4"
            component="div"
            sx={{ fontWeight: "bold", mb: 0.5 }}
          >
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
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_expiringItems, setExpiringItems] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch stats and recent sales
      const [statsData, salesData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentSales(5),
      ]);

      setStats(statsData);
      setRecentSales(Array.isArray(salesData) ? salesData : []);

      // Try to fetch low stock and expiring items, but don't fail if they error
      try {
        const lowStockData = await dashboardService.getLowStock();
        setLowStock(Array.isArray(lowStockData) ? lowStockData : []);
      } catch (err) {
        console.log("Low stock data not available");
        setLowStock([]);
      }

      try {
        const expiringData = await dashboardService.getExpiringItems();
        setExpiringItems(Array.isArray(expiringData) ? expiringData : []);
      } catch (err) {
        console.log("Expiring items data not available");
        setExpiringItems([]);
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
      // Ensure state is set to safe defaults on error
      setRecentSales([]);
      setLowStock([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Welcome back, {user?.fullName}! Here's what's happening today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Today's Revenue"
            value={`₹${stats?.todayRevenue?.toLocaleString() || 0}`}
            subtitle={`${stats?.todaySales || 0} transactions`}
            icon={<TrendingUp />}
            color="#667eea"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Prescriptions"
            value={stats?.pendingPrescriptions || 0}
            subtitle={`${stats?.todaySales || 0} sales today`}
            icon={<ShoppingCart />}
            color="#10b981"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Low Stock Items"
            value={stats?.lowStockCount || 0}
            subtitle="Requires attention"
            icon={<Warning />}
            color="#f59e0b"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Expiring Soon"
            value={stats?.expiringSoonCount || 0}
            subtitle="Within 30 days"
            icon={<Inventory />}
            color="#ef4444"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid>
            <Button
              variant="contained"
              startIcon={<PointOfSale />}
              onClick={() => navigate("/pos")}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              New Sale
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => navigate("/medicines")}
            >
              Add Medicine
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => navigate("/inventory")}
            >
              Add Stock
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Sales Overview (Last 7 Days)
              </Typography>
              <Box sx={{ width: "100%", height: 300, mt: 2 }}>
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
                      dot={{ fill: "#667eea" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Sales */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Recent Sales
              </Typography>
              <Box sx={{ mt: 2 }}>
                {recentSales.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ py: 3 }}
                  >
                    No recent sales
                  </Typography>
                ) : (
                  recentSales.map((sale) => (
                    <Box
                      key={sale.id}
                      sx={{
                        py: 1.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        "&:last-child": { borderBottom: "none" },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {sale.customer?.name ||
                            `Sale #${sale.id.slice(0, 8)}`}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          ₹{sale.total.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {sale.items?.length || 0} items
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(sale.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Low Stock Alerts
              </Typography>
              {lowStock.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No low stock items at the moment
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Medicine Name</TableCell>
                        <TableCell align="right">Current Stock</TableCell>
                        <TableCell align="right">Batch Number</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lowStock.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.medicineName || item.name}
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {item.batchNumber}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                item.quantity < 20 ? "Critical" : "Warning"
                              }
                              color={item.quantity < 20 ? "error" : "warning"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => navigate("/inventory")}
                            >
                              Reorder
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

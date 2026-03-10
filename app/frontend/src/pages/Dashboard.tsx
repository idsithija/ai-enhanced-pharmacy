import { useEffect, useState } from "react";
import { TrendingUp, ShoppingCart, AlertTriangle, Package, Plus, CreditCard, FileText, Clock, CheckCircle } from "lucide-react";
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
import { prescriptionService } from "../services/prescriptionService";
import { reportService } from "../services/reportService";
import type { DashboardStats, Sale } from "../types";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, color, subtitle }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow-md p-6 h-full relative overflow-visible hover:shadow-lg transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-600 text-sm mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      <div
        className="p-3 rounded-xl"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
    </div>
  </div>
);

export const Dashboard = () => {
  const { user } = useAuthStore();

  // Show user dashboard for 'user' role
  if (user?.role === 'user') {
    return <UserDashboard />;
  }

  // Show admin/staff dashboard
  return <StaffDashboard />;
};

// ============================================
// USER DASHBOARD - Order history & quick actions
// ============================================
const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: 'text-amber-700', bg: 'bg-amber-50', label: 'Pending Review' },
  verified: { color: 'text-blue-700', bg: 'bg-blue-50', label: 'Verified' },
  dispensed: { color: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Dispensed' },
  rejected: { color: 'text-red-700', bg: 'bg-red-50', label: 'Rejected' },
  expired: { color: 'text-gray-500', bg: 'bg-gray-50', label: 'Expired' },
  cancelled: { color: 'text-orange-700', bg: 'bg-orange-50', label: 'Cancelled' },
};

interface PrescriptionOrder {
  id: number;
  prescriptionNumber: string;
  patientName: string;
  doctorName?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<PrescriptionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await prescriptionService.getMyPrescriptions(1, 5);
      const data = response?.data?.prescriptions || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Could not fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (s: string) => statusConfig[s] || statusConfig.pending;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
        <p className="text-gray-600">
          Hello, {user?.firstName}! What would you like to do today?
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button
          onClick={() => navigate('/place-order')}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-shadow group"
        >
          <div className="p-3 bg-white/20 rounded-xl w-fit mb-3">
            <ShoppingCart size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Place Order</h3>
          <p className="text-indigo-100 text-sm">Browse medicines & order</p>
        </button>

        <button
          onClick={() => navigate('/my-orders')}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-shadow group"
        >
          <div className="p-3 bg-white/20 rounded-xl w-fit mb-3">
            <Package size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">My Orders</h3>
          <p className="text-emerald-100 text-sm">View order history</p>
        </button>

        <button
          onClick={() => navigate('/place-order')}
          className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-shadow group"
        >
          <div className="p-3 bg-white/20 rounded-xl w-fit mb-3">
            <FileText size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Prescriptions</h3>
          <p className="text-orange-100 text-sm">Upload & manage</p>
        </button>

        <button
          onClick={() => navigate('/drug-checker')}
          className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-shadow group"
        >
          <div className="p-3 bg-white/20 rounded-xl w-fit mb-3">
            <CheckCircle size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Drug Checker</h3>
          <p className="text-cyan-100 text-sm">Check interactions</p>
        </button>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
          <button
            onClick={() => navigate('/my-orders')}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
            <button
              onClick={() => navigate('/place-order')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Place Your First Order
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const st = getStatus(order.status);
              return (
                <div
                  key={order.id}
                  onClick={() => navigate('/my-orders')}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Package size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.prescriptionNumber || `#${order.id?.toString().slice(0, 8)}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.doctorName ? `Dr. ${order.doctorName} • ` : ''}{new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${st.bg} ${st.color}`}>
                      <Clock size={10} />
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// STAFF/ADMIN DASHBOARD - Original dashboard
// ============================================
const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [salesChartData, setSalesChartData] = useState<any[]>([]);
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

      try {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        const salesReport = await reportService.getSalesReport(
          start.toISOString().split('T')[0],
          end.toISOString().split('T')[0],
          'day'
        );
        const chart = (salesReport?.chartData || []).map((d: any) => ({
          date: new Date(d.period).toLocaleDateString('en-US', { weekday: 'short' }),
          sales: Number(d.revenue || 0),
        }));
        setSalesChartData(chart);
      } catch (err) {
        console.log("Sales chart data not available");
        setSalesChartData([]);
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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex justify-between items-center">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded hover:bg-red-100 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.firstName}! Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Revenue"
          value={`Rs ${stats?.todayRevenue?.toLocaleString() || 0}`}
          subtitle={`${stats?.todaySales || 0} transactions`}
          icon={<TrendingUp size={24} />}
          color="#667eea"
        />
        <StatCard
          title="Pending Prescriptions"
          value={stats?.pendingPrescriptions || 0}
          subtitle={`${stats?.todaySales || 0} sales today`}
          icon={<ShoppingCart size={24} />}
          color="#10b981"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockCount || 0}
          subtitle="Requires attention"
          icon={<AlertTriangle size={24} />}
          color="#f59e0b"
        />
        <StatCard
          title="Expiring Soon"
          value={stats?.expiringSoonCount || 0}
          subtitle="Within 30 days"
          icon={<Package size={24} />}
          color="#ef4444"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/pos")}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <CreditCard size={20} />
            New Sale
          </button>
          <button
            onClick={() => navigate("/medicines")}
            className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Medicine
          </button>
          <button
            onClick={() => navigate("/inventory")}
            className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Sales Overview (Last 7 Days)
            </h3>
            <div className="w-full h-80 mt-4">
              <ResponsiveContainer>
                <LineChart data={salesChartData}>
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
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 h-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Sales</h3>
            <div className="mt-4 space-y-4">
              {recentSales.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent sales</p>
              ) : (
                recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="pb-4 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {sale.customer?.name || `Sale #${String(sale.id).slice(0, 8)}`}
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        Rs {Number(sale.total || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {sale.items?.length || 0} items
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Low Stock Alerts</h3>
            {lowStock.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mt-4">
                No low stock items at the moment
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medicine Name
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch Number
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lowStock.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.medicineName || item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.batchNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.quantity < 20
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.quantity < 20 ? "Critical" : "Warning"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => navigate("/inventory")}
                            className="text-indigo-600 hover:text-indigo-900 font-medium border border-indigo-600 px-3 py-1 rounded hover:bg-indigo-50 transition"
                          >
                            Reorder
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

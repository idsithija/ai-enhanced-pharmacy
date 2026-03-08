import { useEffect, useState } from "react";
import { TrendingUp, ShoppingCart, AlertTriangle, Package, Plus, CreditCard } from "lucide-react";
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
          Welcome back, {user?.fullName}! Here's what's happening today.
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
                        {sale.customer?.name || `Sale #${sale.id.slice(0, 8)}`}
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

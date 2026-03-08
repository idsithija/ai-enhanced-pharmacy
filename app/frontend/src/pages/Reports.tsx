import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  DollarSign,
  Download,
  BarChart3,
  Pill,
  ShoppingCart,
  CreditCard,
  Calendar,
} from 'lucide-react';
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
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹69,500</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-sm text-green-600 font-medium">+18.2%</span>
              </div>
            </div>
            <div className="h-14 w-14 rounded-full bg-green-600 flex items-center justify-center">
              <DollarSign size={28} className="text-white" />
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">380</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
              </div>
            </div>
            <div className="h-14 w-14 rounded-full bg-indigo-600 flex items-center justify-center">
              <ShoppingCart size={28} className="text-white" />
            </div>
          </div>
        </div>

        {/* Avg. Order Value */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Avg. Order Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹183</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-sm text-green-600 font-medium">+5.1%</span>
              </div>
            </div>
            <div className="h-14 w-14 rounded-full bg-amber-600 flex items-center justify-center">
              <CreditCard size={28} className="text-white" />
            </div>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">28.5%</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown size={16} className="text-red-600" />
                <span className="text-sm text-red-600 font-medium">-2.3%</span>
              </div>
            </div>
            <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center">
              <BarChart3 size={28} className="text-white" />
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h6 className="text-lg font-bold text-gray-900 mb-4">
            Sales Trend (Last 7 Days)
          </h6>
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
        </div>

        {/* Category Sales Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h6 className="text-lg font-bold text-gray-900 mb-4">
            Sales by Category
          </h6>
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
          <div className="space-y-2 mt-4">
            {categorySalesData.map((cat, index) => (
              <div key={cat.category} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index] }} />
                  <p className="text-sm text-gray-700">{cat.category}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  ₹{cat.sales.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Selling Medicines */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h6 className="text-lg font-bold text-gray-900 mb-4">
          Top Selling Medicines
        </h6>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topMedicines.map((medicine, index) => (
                <tr key={medicine.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      #{index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-bold text-gray-900">
                      {medicine.name}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{medicine.sold.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-bold text-gray-900">
                      ₹{medicine.revenue.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {medicine.growth >= 0 ? (
                        <>
                          <TrendingUp size={16} className="text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            +{medicine.growth}%
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown size={16} className="text-red-600" />
                          <span className="text-sm text-red-600 font-medium">
                            {medicine.growth}%
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Inventory Report Tab
  const InventoryReportTab = () => (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {/* Inventory Status Cards */}
        {inventoryStatusData.map((status) => (
          <div key={status.status} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  {status.status}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {status.count}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full flex items-center justify-center" style={{ backgroundColor: status.color }}>
                <Pill size={28} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Inventory Value */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h6 className="text-lg font-bold text-gray-900 mb-4">
            Inventory Value by Category
          </h6>
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
        </div>

        {/* Stock Status Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h6 className="text-lg font-bold text-gray-900 mb-4">
            Stock Status Distribution
          </h6>
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
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h6 className="text-lg font-bold text-gray-900 mb-4">
          Low Stock Items Requiring Action
        </h6>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min. Required</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Amoxicillin 250mg</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">45</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">100</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">200</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Low Stock
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Aspirin 75mg</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">0</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">50</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">150</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Metformin 500mg</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">35</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">80</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">180</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Low Stock
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Customer Report Tab
  const CustomerReportTab = () => (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Total Customers
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                1,248
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-indigo-600 flex items-center justify-center">
              <Users size={28} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                New Customers
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                86
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  +24.5%
                </span>
              </div>
            </div>
            <div className="h-14 w-14 rounded-full bg-green-600 flex items-center justify-center">
              <Users size={28} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Avg. Lifetime Value
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                ₹8,450
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-amber-600 flex items-center justify-center">
              <DollarSign size={28} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Loyalty Points Issued
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                12,450
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-red-600 flex items-center justify-center">
              <BarChart3 size={28} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h6 className="text-lg font-bold text-gray-900 mb-4">
          Top Customers by Revenue
        </h6>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Purchases</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loyalty Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    #1
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jane Smith</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">78</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹28,500.75</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">1,250</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    VIP
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    #2
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Emily Davis</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">56</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹19,250.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">820</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Regular
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    #3
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John Doe</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">42</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹15,680.50</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">450</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Regular
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Financial Report Tab
  const FinancialReportTab = () => (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">
            Total Revenue
          </p>
          <p className="text-3xl font-bold text-green-600">
            ₹161,500
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">
            Total Expenses
          </p>
          <p className="text-3xl font-bold text-red-600">
            ₹98,200
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">
            Net Profit
          </p>
          <p className="text-3xl font-bold text-indigo-600">
            ₹63,300
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">
            Profit Margin
          </p>
          <p className="text-3xl font-bold text-amber-600">
            39.2%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Payment Method Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h6 className="text-lg font-bold text-gray-900 mb-4">
            Payment Method Distribution
          </h6>
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
          <div className="space-y-2 mt-4">
            {paymentMethodData.map((method, index) => (
              <div key={method.method} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: PAYMENT_COLORS[index] }} />
                  <p className="text-sm text-gray-700">{method.method}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  ₹{method.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue vs Expenses */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h6 className="text-lg font-bold text-gray-900 mb-4">
            Revenue vs Expenses
          </h6>
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
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">📊 Reports & Analytics</h1>
        <button
          onClick={() => handleExport(['Sales', 'Inventory', 'Customer', 'Financial'][tabValue])}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={18} className="text-gray-400" />
              </div>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 block w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
              />
            </div>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={18} className="text-gray-400" />
              </div>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 block w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium">
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap">
            <button
              onClick={() => setTabValue(0)}
              className={`flex items-center gap-2 px-6 py-4 font-medium ${
                tabValue === 0
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingCart size={18} />
              Sales Report
            </button>
            <button
              onClick={() => setTabValue(1)}
              className={`flex items-center gap-2 px-6 py-4 font-medium ${
                tabValue === 1
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package size={18} />
              Inventory Report
            </button>
            <button
              onClick={() => setTabValue(2)}
              className={`flex items-center gap-2 px-6 py-4 font-medium ${
                tabValue === 2
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={18} />
              Customer Report
            </button>
            <button
              onClick={() => setTabValue(3)}
              className={`flex items-center gap-2 px-6 py-4 font-medium ${
                tabValue === 3
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign size={18} />
              Financial Report
            </button>
          </div>
        </div>
        <div className="p-6">
          {tabValue === 0 && <SalesReportTab />}
          {tabValue === 1 && <InventoryReportTab />}
          {tabValue === 2 && <CustomerReportTab />}
          {tabValue === 3 && <FinancialReportTab />}
        </div>
      </div>
    </div>
  );
};

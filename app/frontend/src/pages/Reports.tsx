import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Users,
  DollarSign,
  Download,
  BarChart3,
  Pill,
  ShoppingCart,
  CreditCard,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
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
import { reportService } from '../services/reportService';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
const INVENTORY_COLORS: Record<string, string> = {
  in_stock: '#4caf50',
  low_stock: '#ff9800',
  out_of_stock: '#f44336',
  expiring: '#2196f3',
};

const formatCurrency = (val: number) => `Rs ${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const Reports = () => {
  const [tabValue, setTabValue] = useState(0);
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  // Data states
  const [salesData, setSalesData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [topMedicines, setTopMedicines] = useState<any[]>([]);
  const [profitData, setProfitData] = useState<any>(null);
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sales, inventory, medicines, profit, prescriptions] = await Promise.allSettled([
        reportService.getSalesReport(startDate, endDate),
        reportService.getInventoryReport(),
        reportService.getTopMedicines('month', 10),
        reportService.getProfitLossReport(startDate, endDate),
        reportService.getPrescriptionReport(startDate, endDate),
      ]);
      if (sales.status === 'fulfilled') setSalesData(sales.value);
      if (inventory.status === 'fulfilled') setInventoryData(inventory.value);
      if (medicines.status === 'fulfilled') setTopMedicines(medicines.value?.topMedicines || []);
      if (profit.status === 'fulfilled') setProfitData(profit.value);
      if (prescriptions.status === 'fulfilled') setPrescriptionData(prescriptions.value);
    } catch (err: any) {
      setError('Failed to load report data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = (reportType: string) => {
    const data = reportType === 'Sales' ? salesData : reportType === 'Inventory' ? inventoryData : profitData;
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType.toLowerCase()}-report-${startDate}-to-${endDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Loading spinner
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-20">
      <Loader2 size={40} className="animate-spin text-indigo-600" />
    </div>
  );

  // Sales Report Tab
  const SalesReportTab = () => {
    const summary = salesData?.summary;
    const chartData = salesData?.chartData || [];

    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary?.totalRevenue || 0)}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-green-600 flex items-center justify-center">
                <DollarSign size={28} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.totalSales || 0}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-indigo-600 flex items-center justify-center">
                <ShoppingCart size={28} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary?.averageOrderValue || 0)}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-amber-600 flex items-center justify-center">
                <CreditCard size={28} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Est. Profit</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary?.totalProfit || 0)}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center">
                <BarChart3 size={28} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Trend Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <h6 className="text-lg font-bold text-gray-900 mb-4">Sales Trend</h6>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={3} name="Revenue (Rs)" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#764ba2" strokeWidth={3} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Selling Medicines */}
        {topMedicines.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <h6 className="text-lg font-bold text-gray-900 mb-4">Top Selling Medicines</h6>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topMedicines.map((med: any, index: number) => (
                    <tr key={med.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{med.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{med.category || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{Number(med.order_count || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(Number(med.total_revenue || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!chartData.length && !topMedicines.length && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center mt-6">
            <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No sales data available for the selected date range.</p>
          </div>
        )}
      </div>
    );
  };

  // Inventory Report Tab
  const InventoryReportTab = () => {
    const summary = inventoryData?.summary;
    const items = inventoryData?.inventory || [];

    const statusCounts = [
      { status: 'In Stock', count: (summary?.totalItems || 0) - (summary?.lowStockCount || 0) - (summary?.outOfStockCount || 0), color: INVENTORY_COLORS.in_stock },
      { status: 'Low Stock', count: summary?.lowStockCount || 0, color: INVENTORY_COLORS.low_stock },
      { status: 'Out of Stock', count: summary?.outOfStockCount || 0, color: INVENTORY_COLORS.out_of_stock },
      { status: 'Expiring Soon', count: summary?.expiringCount || 0, color: INVENTORY_COLORS.expiring },
    ];

    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {statusCounts.map((s) => (
            <div key={s.status} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{s.status}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{s.count}</p>
                </div>
                <div className="h-14 w-14 rounded-full flex items-center justify-center" style={{ backgroundColor: s.color }}>
                  <Pill size={28} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Inventory Value */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h6 className="text-lg font-bold text-gray-900 mb-2">Total Inventory Value</h6>
            <p className="text-3xl font-bold text-indigo-600">{formatCurrency(summary?.totalValue || 0)}</p>
            <p className="text-sm text-gray-500 mt-1">{summary?.totalItems || 0} items total</p>
          </div>

          {/* Stock Status Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h6 className="text-lg font-bold text-gray-900 mb-4">Stock Status Distribution</h6>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusCounts.filter(s => s.count > 0)} cx="50%" cy="50%" labelLine={false} label={(e) => e.status} outerRadius={80} dataKey="count">
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock / Expiring Items Table */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <h6 className="text-lg font-bold text-gray-900 mb-4">Inventory Items</h6>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.slice(0, 20).map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.medicine?.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.batchNumber || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(Number(item.unitPrice || 0))}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                          item.status === 'low_stock' ? 'bg-amber-100 text-amber-800' :
                          item.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {(item.status || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Prescription Report Tab
  const PrescriptionReportTab = () => {
    const summary = prescriptionData?.summary;
    const prescriptions = prescriptionData?.prescriptions || [];

    const statusCounts = [
      { label: 'Total', count: summary?.totalPrescriptions || 0, color: 'bg-indigo-600' },
      { label: 'Verified', count: summary?.verifiedCount || 0, color: 'bg-green-600' },
      { label: 'Pending', count: summary?.pendingCount || 0, color: 'bg-amber-600' },
      { label: 'Rejected', count: summary?.rejectedCount || 0, color: 'bg-red-600' },
    ];

    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {statusCounts.map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{s.label} Prescriptions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{s.count}</p>
                </div>
                <div className={`h-14 w-14 rounded-full ${s.color} flex items-center justify-center`}>
                  <Users size={28} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {prescriptions.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <h6 className="text-lg font-bold text-gray-900 mb-4">Recent Prescriptions</h6>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rx #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prescriptions.slice(0, 20).map((rx: any) => (
                    <tr key={rx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rx.prescriptionNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{rx.patientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{rx.doctorName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {rx.prescriptionDate ? new Date(rx.prescriptionDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rx.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                          rx.status === 'dispensed' ? 'bg-green-100 text-green-800' :
                          rx.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          rx.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!prescriptions.length && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center mt-6">
            <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No prescription data available for the selected date range.</p>
          </div>
        )}
      </div>
    );
  };

  // Financial Report Tab
  const FinancialReportTab = () => {
    const revenue = profitData?.revenue;
    const costs = profitData?.costs;
    const profit = profitData?.profit;

    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(revenue?.totalRevenue || 0)}</p>
            <p className="text-xs text-gray-500 mt-1">{revenue?.totalOrders || 0} orders</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Costs</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(costs?.totalCosts || 0)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Net Profit</p>
            <p className="text-3xl font-bold text-indigo-600">{formatCurrency(profit?.netProfit || 0)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
            <p className="text-3xl font-bold text-amber-600">{profit?.netProfitMargin || '0%'}</p>
          </div>
        </div>

        {/* Cost Breakdown */}
        {costs?.operatingExpenses && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h6 className="text-lg font-bold text-gray-900 mb-4">Cost Breakdown</h6>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Cost of Goods Sold</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(costs.costOfGoodsSold || 0)}</span>
                </div>
                {Object.entries(costs.operatingExpenses).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 capitalize">{key}</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(Number(value))}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 mt-2 font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatCurrency(costs.totalCosts || 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h6 className="text-lg font-bold text-gray-900 mb-4">Profit Summary</h6>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Gross Profit</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(profit?.grossProfit || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Gross Margin</span>
                  <span className="text-sm font-bold text-gray-900">{profit?.grossProfitMargin || '0%'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Net Profit</span>
                  <span className="text-sm font-bold text-indigo-600">{formatCurrency(profit?.netProfit || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Net Margin</span>
                  <span className="text-sm font-bold text-gray-900">{profit?.netProfitMargin || '0%'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!profitData && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center mt-6">
            <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Financial data unavailable. Admin access may be required.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <button
          onClick={() => handleExport(['Sales', 'Inventory', 'Prescriptions', 'Financial'][tabValue])}
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
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={18} className="text-gray-400" />
              </div>
              <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="pl-10 block w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2" />
            </div>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={18} className="text-gray-400" />
              </div>
              <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="pl-10 block w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2" />
            </div>
          </div>
          <div className="flex items-end">
            <button onClick={fetchData} className="w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium">
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Report Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap">
            {[
              { label: 'Sales Report', icon: ShoppingCart },
              { label: 'Inventory Report', icon: Package },
              { label: 'Prescriptions', icon: Users },
              { label: 'Financial Report', icon: DollarSign },
            ].map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => setTabValue(i)}
                className={`flex items-center gap-2 px-6 py-4 font-medium ${
                  tabValue === i ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {loading ? <LoadingSpinner /> : (
            <>
              {tabValue === 0 && <SalesReportTab />}
              {tabValue === 1 && <InventoryReportTab />}
              {tabValue === 2 && <PrescriptionReportTab />}
              {tabValue === 3 && <FinancialReportTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

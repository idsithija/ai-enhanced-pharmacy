import { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  Search,
  CheckCircle,
  AlertCircle,
  Eye,
  FileText,
} from 'lucide-react';
import { prescriptionService } from '../services/prescriptionService';

interface PrescriptionOrder {
  id: number;
  prescriptionNumber: string;
  patientName: string;
  patientPhone?: string;
  doctorName?: string;
  imageUrl?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Clock; label: string }> = {
  pending: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock, label: 'Pending Review' },
  verified: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: CheckCircle, label: 'Verified — Ready for Pickup' },
  dispensed: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: Package, label: 'Dispensed' },
  rejected: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: AlertCircle, label: 'Rejected' },
  expired: { color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', icon: Clock, label: 'Expired' },
};

export const MyOrders = () => {
  const [orders, setOrders] = useState<PrescriptionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await prescriptionService.getMyPrescriptions(page, 10, statusFilter || undefined);
      const data = response?.data?.prescriptions || [];
      setOrders(Array.isArray(data) ? data : []);
      setTotalPages(response?.data?.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.prescriptionNumber?.toLowerCase().includes(q) ||
      order.patientName?.toLowerCase().includes(q) ||
      order.notes?.toLowerCase().includes(q)
    );
  });

  const getStatus = (s: string) => statusConfig[s] || statusConfig.pending;

  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Orders</h1>
        <p className="text-gray-500 text-sm">Track your uploaded prescriptions and their status</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference number or name..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="verified">Verified</option>
          <option value="dispensed">Dispensed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter
              ? 'Try different filters'
              : "You haven't uploaded any prescriptions yet"}
          </p>
          {!searchQuery && !statusFilter && (
            <a
              href="/place-order"
              className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Upload Prescription
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const st = getStatus(order.status);
            const StIcon = st.icon;
            return (
              <div key={order.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden`}>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-indigo-50 rounded-lg mt-0.5">
                        <FileText size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{order.prescriptionNumber}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {order.patientName}
                          {order.patientPhone && ` • ${order.patientPhone}`}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock size={13} className="text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                            {' at '}
                            {new Date(order.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {order.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic leading-snug">"{order.notes}"</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border ${st.bg} ${st.color}`}>
                        <StIcon size={14} />
                        {st.label}
                      </span>
                      {order.imageUrl && (
                        <a
                          href={`${apiBase}${order.imageUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
                        >
                          <Eye size={14} />
                          View Image
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="inline-flex items-center px-4 py-2 text-sm text-gray-600">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{page}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-4 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

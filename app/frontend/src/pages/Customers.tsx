import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  ShoppingBag,
  TrendingUp,
  Gift,
  Calendar,
} from 'lucide-react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import type { Customer } from '../types';
import { customerService } from '../services/customerService';

interface PurchaseHistory {
  id: string;
  invoiceNumber: string;
  date: string;
  totalAmount: number;
  paymentMethod: string;
  itemCount: number;
  pointsEarned: number;
}

// Mock data
const mockCustomers: (Customer & { totalSpent: number; totalPurchases: number })[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '9876543210',
    email: 'john.doe@email.com',
    address: '123 Main St, Springfield',
    dateOfBirth: '1985-06-15',
    loyaltyPoints: 450,
    totalSpent: 15680.50,
    totalPurchases: 42,
    createdAt: '2023-01-15T10:00:00',
    updatedAt: '2024-03-05T10:00:00',
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '9876543211',
    email: 'jane.smith@email.com',
    address: '456 Oak Ave, Springfield',
    dateOfBirth: '1990-03-22',
    loyaltyPoints: 1250,
    totalSpent: 28500.75,
    totalPurchases: 78,
    createdAt: '2022-08-20T09:00:00',
    updatedAt: '2024-03-05T11:00:00',
  },
  {
    id: '3',
    name: 'Robert Brown',
    phone: '9876543212',
    email: 'robert.brown@email.com',
    address: '789 Pine Rd, Springfield',
    loyaltyPoints: 180,
    totalSpent: 5420.25,
    totalPurchases: 18,
    createdAt: '2023-11-10T14:00:00',
    updatedAt: '2024-03-04T15:00:00',
  },
  {
    id: '4',
    name: 'Emily Davis',
    phone: '9876543213',
    email: 'emily.davis@email.com',
    address: '321 Elm St, Springfield',
    dateOfBirth: '1988-12-08',
    loyaltyPoints: 820,
    totalSpent: 19250.00,
    totalPurchases: 56,
    createdAt: '2023-03-05T11:00:00',
    updatedAt: '2024-03-05T09:00:00',
  },
  {
    id: '5',
    name: 'Michael Wilson',
    phone: '9876543214',
    loyaltyPoints: 65,
    totalSpent: 1850.00,
    totalPurchases: 7,
    createdAt: '2024-02-01T13:00:00',
    updatedAt: '2024-03-02T10:00:00',
  },
];

const mockPurchaseHistory: { [customerId: string]: PurchaseHistory[] } = {
  '1': [
    { id: '1', invoiceNumber: 'INV001', date: '2024-03-05T10:00:00', totalAmount: 450.50, paymentMethod: 'card', itemCount: 5, pointsEarned: 45 },
    { id: '2', invoiceNumber: 'INV002', date: '2024-03-01T14:30:00', totalAmount: 280.00, paymentMethod: 'cash', itemCount: 3, pointsEarned: 28 },
    { id: '3', invoiceNumber: 'INV003', date: '2024-02-28T09:15:00', totalAmount: 620.75, paymentMethod: 'mobile', itemCount: 7, pointsEarned: 62 },
    { id: '4', invoiceNumber: 'INV004', date: '2024-02-25T16:45:00', totalAmount: 150.25, paymentMethod: 'cash', itemCount: 2, pointsEarned: 15 },
  ],
  '2': [
    { id: '5', invoiceNumber: 'INV005', date: '2024-03-05T11:00:00', totalAmount: 890.00, paymentMethod: 'card', itemCount: 8, pointsEarned: 89 },
    { id: '6', invoiceNumber: 'INV006', date: '2024-03-03T12:30:00', totalAmount: 1250.50, paymentMethod: 'card', itemCount: 12, pointsEarned: 125 },
  ],
};

const customerValidationSchema = yup.object({
  name: yup.string().required('Name is required'),
  phone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').required('Phone is required'),
  email: yup.string().email('Invalid email format'),
  dateOfBirth: yup.string(),
  address: yup.string(),
  notes: yup.string(),
});

export const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to load customers', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      dateOfBirth: '',
      notes: '',
    },
    validationSchema: customerValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (selectedCustomer) {
          await customerService.update(selectedCustomer.id, values);
          setSnackbar({ open: true, message: 'Customer updated successfully', severity: 'success' });
        } else {
          await customerService.create(values);
          setSnackbar({ open: true, message: 'Customer created successfully', severity: 'success' });
        }
        handleCloseDialog();
        fetchCustomers(); // Refresh the list
      } catch (error: any) {
        console.error('Error saving customer:', error);
        setSnackbar({ open: true, message: error.response?.data?.message || 'Operation failed', severity: 'error' });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    filterCustomers(newValue, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterCustomers(tabValue, query);
  };

  const filterCustomers = (tier: number, query: string) => {
    let filtered = customers;

    // Filter by tier
    if (tier === 1) filtered = customers.filter((c) => c.loyaltyPoints >= 1000); // VIP (1000+ points)
    if (tier === 2) filtered = customers.filter((c) => c.loyaltyPoints >= 100 && c.loyaltyPoints < 1000); // Regular (100-999 points)
    if (tier === 3) filtered = customers.filter((c) => c.loyaltyPoints < 100); // New (< 100 points)

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query) ||
          c.email?.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      formik.setValues({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        dateOfBirth: customer.dateOfBirth || '',
        notes: customer.notes || '',
      });
      setSelectedCustomer(customer);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomer(null);
    formik.resetForm();
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPurchaseHistory(mockPurchaseHistory[customer.id] || []);
    setOpenViewDialog(true);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
    setFilteredCustomers(filteredCustomers.filter((c) => c.id !== id));
    setSnackbar({ open: true, message: 'Customer deleted successfully', severity: 'success' });
  };

  const getTierBadge = (points: number) => {
    if (points >= 1000) return { label: 'VIP', icon: <Star size={16} className="text-red-600" />, colorClass: 'bg-red-100 text-red-800' };
    if (points >= 100) return { label: 'Regular', icon: <User size={16} className="text-indigo-600" />, colorClass: 'bg-indigo-100 text-indigo-800' };
    return { label: 'New', icon: null, colorClass: 'bg-gray-100 text-gray-800' };
  };

  const getLoyaltyProgress = (points: number) => {
    const nextTier = points < 100 ? 100 : points < 1000 ? 1000 : 2000;
    return (points / nextTier) * 100;
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">👥 Customers</h1>
        <button
          onClick={() => handleOpenDialog()}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm mb-2">Total Customers</p>
              <h3 className="text-3xl font-bold text-gray-900">{customers.length}</h3>
            </div>
            <div className="p-3 bg-indigo-100 rounded-xl">
              <User className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm mb-2">VIP Customers</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {customers.filter((c) => c.loyaltyPoints >= 1000).length}
              </h3>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <Star className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900">
                Rs {customers.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm mb-2">Total Purchases</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {customers.reduce((sum, c) => sum + Number(c.totalPurchases || 0), 0)}
              </h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <ShoppingBag className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => handleTabChange({} as any, 0)}
              className={`px-6 py-3 font-medium transition-colors ${
                tabValue === 0
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({customers.length})
            </button>
            <button
              onClick={() => handleTabChange({} as any, 1)}
              className={`px-6 py-3 font-medium transition-colors ${
                tabValue === 1
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              VIP ({customers.filter((c) => c.loyaltyPoints >= 1000).length})
            </button>
            <button
              onClick={() => handleTabChange({} as any, 2)}
              className={`px-6 py-3 font-medium transition-colors ${
                tabValue === 2
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Regular ({customers.filter((c) => c.loyaltyPoints >= 100 && c.loyaltyPoints < 1000).length})
            </button>
            <button
              onClick={() => handleTabChange({} as any, 3)}
              className={`px-6 py-3 font-medium transition-colors ${
                tabValue === 3
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              New ({customers.filter((c) => c.loyaltyPoints < 100).length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loyalty Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchases</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const tier = getTierBadge(customer.loyaltyPoints);
                  const customerName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                  const customerPhone = customer.phone || customer.phoneNumber || '';
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{customerName}</p>
                            <span className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${tier.colorClass}`}>
                              {tier.icon}
                              {tier.label}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Phone size={14} className="text-gray-400" />
                            {customerPhone}
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <Mail size={14} className="text-gray-400" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-xl font-bold text-indigo-600">{customer.loyaltyPoints}</p>
                          <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(getLoyaltyProgress(customer.loyaltyPoints), 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-gray-900">Rs {Number(customer.totalSpent || 0).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {Number(customer.totalPurchases || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenDialog(customer)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Customer Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
            </div>
            <form onSubmit={formik.handleSubmit}>
              <div className="p-6 space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`pl-10 block w-full rounded-lg border ${
                        formik.touched.name && formik.errors.name
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      } px-4 py-2`}
                    />
                  </div>
                  {formik.touched.name && formik.errors.name && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
                  )}
                </div>

                {/* Phone and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={18} className="text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="text"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`pl-10 block w-full rounded-lg border ${
                          formik.touched.phone && formik.errors.phone
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                        } px-4 py-2`}
                      />
                    </div>
                    {formik.touched.phone && formik.errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`pl-10 block w-full rounded-lg border ${
                          formik.touched.email && formik.errors.email
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                        } px-4 py-2`}
                      />
                    </div>
                    {formik.touched.email && formik.errors.email && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                      <MapPin size={18} className="text-gray-400" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      rows={2}
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="pl-10 block w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formik.values.dateOfBirth}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="pl-10 block w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Medical conditions, allergies, preferences..."
                    className="block w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700"
                >
                  {selectedCustomer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Dialog */}
      {openViewDialog && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                  {(selectedCustomer.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                  <span className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getTierBadge(selectedCustomer.loyaltyPoints).colorClass}`}>
                    {getTierBadge(selectedCustomer.loyaltyPoints).icon}
                    {getTierBadge(selectedCustomer.loyaltyPoints).label}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Phone size={16} className="text-indigo-600" />
                      {selectedCustomer.phone || selectedCustomer.phoneNumber || 'N/A'}
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Mail size={16} className="text-indigo-600" />
                        {selectedCustomer.email}
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <MapPin size={16} className="text-indigo-600" />
                        {selectedCustomer.address}
                      </div>
                    )}
                    {selectedCustomer.dateOfBirth && (
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar size={16} className="text-indigo-600" />
                        {new Date(selectedCustomer.dateOfBirth).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Loyalty Program */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Loyalty Program</h3>
                  <div className="text-center">
                    <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-white mx-auto mb-2">
                      <ShoppingBag size={40} />
                    </div>
                    <p className="text-4xl font-bold text-indigo-600">{selectedCustomer.loyaltyPoints}</p>
                    <p className="text-sm text-gray-600 mb-3">Loyalty Points</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(getLoyaltyProgress(selectedCustomer.loyaltyPoints), 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedCustomer.loyaltyPoints < 100
                        ? `${100 - selectedCustomer.loyaltyPoints} points to Regular`
                        : selectedCustomer.loyaltyPoints < 1000
                        ? `${1000 - selectedCustomer.loyaltyPoints} points to VIP`
                        : 'VIP Member'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase Statistics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Purchase Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">Rs {Number(selectedCustomer.totalSpent || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Total Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{Number(selectedCustomer.totalPurchases || 0)}</p>
                    <p className="text-xs text-gray-600">Total Purchases</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">Rs {(Number(selectedCustomer.totalSpent || 0) / Number(selectedCustomer.totalPurchases || 1)).toFixed(2)}</p>
                    <p className="text-xs text-gray-600">Avg. Purchase</p>
                  </div>
                </div>
              </div>

              {/* Purchase History */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Purchase History</h3>
                {purchaseHistory.length === 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    No purchase history available
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {purchaseHistory.map((purchase) => (
                          <tr key={purchase.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="text-sm font-bold text-gray-900">{purchase.invoiceNumber}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="text-sm text-gray-900">{new Date(purchase.date).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">{new Date(purchase.date).toLocaleTimeString()}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                {purchase.itemCount}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="text-sm font-bold text-gray-900">Rs {Number(purchase.totalAmount || 0).toFixed(2)}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-white text-gray-800 border-gray-300">
                                {purchase.paymentMethod.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                +{purchase.pointsEarned}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedCustomer.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-amber-900 mb-1">Notes:</p>
                  <p className="text-sm text-amber-800">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setOpenViewDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setOpenViewDialog(false);
                  handleOpenDialog(selectedCustomer);
                }}
                className="px-4 py-2 text-sm font-medium text-indigo-700 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-50 flex items-center gap-2"
              >
                <Edit size={16} />
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`rounded-lg shadow-lg p-4 max-w-md ${
            snackbar.severity === 'success' ? 'bg-green-50 border border-green-200' :
            snackbar.severity === 'error' ? 'bg-red-50 border border-red-200' :
            snackbar.severity === 'warning' ? 'bg-amber-50 border border-amber-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <p className={`text-sm font-medium ${
                snackbar.severity === 'success' ? 'text-green-800' :
                snackbar.severity === 'error' ? 'text-red-800' :
                snackbar.severity === 'warning' ? 'text-amber-800' :
                'text-blue-800'
              }`}>
                {snackbar.message}
              </p>
              <button
                onClick={() => setSnackbar({ ...snackbar, open: false })}
                className={`${
                  snackbar.severity === 'success' ? 'text-green-600 hover:text-green-800' :
                  snackbar.severity === 'error' ? 'text-red-600 hover:text-red-800' :
                  snackbar.severity === 'warning' ? 'text-amber-600 hover:text-amber-800' :
                  'text-blue-600 hover:text-blue-800'
                }`}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


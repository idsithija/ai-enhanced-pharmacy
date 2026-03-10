import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle, CheckCircle, XCircle, Package } from 'lucide-react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import type { InventoryItem, Medicine, Supplier } from '../types';
import { inventoryService } from '../services/inventoryService';
import { medicineService } from '../services/medicineService';
import { supplierService } from '../services/supplierService';
import { Pagination } from '../components/Pagination';

const validationSchema = yup.object({
  medicineId: yup.string().required('Medicine is required'),
  batchNumber: yup.string().required('Batch number is required'),
  quantity: yup.number().positive('Quantity must be positive').required('Quantity is required'),
  expiryDate: yup.date().min(new Date(), 'Expiry date must be in the future').required('Expiry date is required'),
  purchasePrice: yup.number().positive('Purchase price must be positive').required('Purchase price is required'),
  sellingPrice: yup.number().positive('Selling price must be positive').required('Selling price is required'),
  supplierId: yup.string().required('Supplier is required'),
});

const getExpiryStatus = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: 'expired', label: 'Expired', colorClass: 'bg-red-100 text-red-800' };
  if (diffDays <= 30) return { status: 'critical', label: `${diffDays} days`, colorClass: 'bg-red-100 text-red-800' };
  if (diffDays <= 90) return { status: 'warning', label: `${diffDays} days`, colorClass: 'bg-yellow-100 text-yellow-800' };
  return { status: 'good', label: `${diffDays} days`, colorClass: 'bg-green-100 text-green-800' };
};

const getStockStatus = (quantity: number) => {
  if (quantity === 0) return { label: 'Out of Stock', colorClass: 'bg-red-100 text-red-800' };
  if (quantity < 50) return { label: 'Low Stock', colorClass: 'bg-yellow-100 text-yellow-800' };
  return { label: 'In Stock', colorClass: 'bg-green-100 text-green-800' };
};

export const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryData, medicinesData, suppliersData] = await Promise.all([
        inventoryService.getAll(),
        medicineService.getAll(),
        supplierService.getAll().catch(() => []),
      ]);
      setInventory(inventoryData);
      setFilteredInventory(inventoryData);
      setMedicines(medicinesData);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to load data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      medicineId: '',
      batchNumber: '',
      quantity: 0,
      expiryDate: '',
      purchasePrice: 0,
      sellingPrice: 0,
      supplierId: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (editingItem) {
          await inventoryService.updateStock(editingItem.id, values);
          setSnackbar({ open: true, message: 'Stock updated successfully', severity: 'success' });
        } else {
          await inventoryService.addStock(values);
          setSnackbar({ open: true, message: 'Stock added successfully', severity: 'success' });
        }
        handleCloseDialog();
        fetchData(); // Refresh the list
      } catch (error: any) {
        console.error('Error saving stock:', error);
        setSnackbar({ open: true, message: error.response?.data?.message || 'Operation failed', severity: 'error' });
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    let filtered = inventory;

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(
        (item) =>
          item.medicine?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    if (tabValue === 1) {
      // Low Stock
      filtered = filtered.filter(item => item.quantity < 50);
    } else if (tabValue === 2) {
      // Expiring Soon
      const today = new Date();
      filtered = filtered.filter(item => {
        const expiry = new Date(item.expiryDate);
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 90 && diffDays >= 0;
      });
    }

    setFilteredInventory(filtered);
    setPage(0);
  }, [searchQuery, inventory, tabValue]);

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      formik.setValues({
        medicineId: item.medicineId,
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        purchasePrice: item.unitPrice,
        sellingPrice: item.sellingPrice,
        supplierId: item.supplierId,
      });
    } else {
      setEditingItem(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    formik.resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this stock entry?')) {
      try {
        await inventoryService.deleteStock(id);
        setSnackbar({ open: true, message: 'Stock deleted successfully', severity: 'success' });
        fetchData(); // Refresh the list
      } catch (error: any) {
        console.error('Error deleting stock:', error);
        setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to delete stock', severity: 'error' });
      }
    }
  };



  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-indigo-600" size={32} />
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1">Track stock levels, batches, and expiry dates</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add Stock
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by medicine name or batch number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setTabValue(0)}
            className={`px-4 py-2 font-medium transition-colors ${
              tabValue === 0
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setTabValue(1)}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              tabValue === 1
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Low Stock
            <AlertTriangle size={16} />
          </button>
          <button
            onClick={() => setTabValue(2)}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              tabValue === 2
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Expiring Soon
            <XCircle size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => {
                  const expiryStatus = getExpiryStatus(item.expiryDate);
                  const stockStatus = getStockStatus(item.quantity);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{item.medicine?.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full border border-gray-300">
                          {item.batchNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-gray-900">{item.quantity}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        Rs {Number(item.unitPrice || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        Rs {Number(item.sellingPrice || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.supplier?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.colorClass}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${expiryStatus.colorClass}`}>
                          {expiryStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleOpenDialog(item)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 mr-2"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        
        <Pagination
          page={page}
          totalItems={filteredInventory.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(val) => { setRowsPerPage(val); setPage(0); }}
        />
      </div>

      {/* Add/Edit Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Edit Stock' : 'Add New Stock'}
              </h2>
            </div>
            
            <form onSubmit={formik.handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="medicineId" className="block text-sm font-medium text-gray-700 mb-1">
                      Medicine
                    </label>
                    <select
                      id="medicineId"
                      name="medicineId"
                      value={formik.values.medicineId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formik.touched.medicineId && formik.errors.medicineId
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map((medicine) => (
                        <option key={medicine.id} value={medicine.id}>
                          {medicine.name}
                        </option>
                      ))}
                    </select>
                    {formik.touched.medicineId && formik.errors.medicineId && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.medicineId}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="batchNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      id="batchNumber"
                      name="batchNumber"
                      value={formik.values.batchNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formik.touched.batchNumber && formik.errors.batchNumber
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {formik.touched.batchNumber && formik.errors.batchNumber && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.batchNumber}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formik.values.quantity}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formik.touched.quantity && formik.errors.quantity
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {formik.touched.quantity && formik.errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.quantity}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={formik.values.expiryDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formik.touched.expiryDate && formik.errors.expiryDate
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {formik.touched.expiryDate && formik.errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.expiryDate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Price (Rs)
                    </label>
                    <input
                      type="number"
                      id="purchasePrice"
                      name="purchasePrice"
                      value={formik.values.purchasePrice}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formik.touched.purchasePrice && formik.errors.purchasePrice
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {formik.touched.purchasePrice && formik.errors.purchasePrice && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.purchasePrice}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price (Rs)
                    </label>
                    <input
                      type="number"
                      id="sellingPrice"
                      name="sellingPrice"
                      value={formik.values.sellingPrice}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formik.touched.sellingPrice && formik.errors.sellingPrice
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {formik.touched.sellingPrice && formik.errors.sellingPrice && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.sellingPrice}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <select
                      id="supplierId"
                      name="supplierId"
                      value={formik.values.supplierId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formik.touched.supplierId && formik.errors.supplierId
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                    {formik.touched.supplierId && formik.errors.supplierId && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.supplierId}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
          <div
            className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
              snackbar.severity === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {snackbar.severity === 'success' ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <XCircle size={20} className="text-red-600" />
            )}
            <span className="font-medium">{snackbar.message}</span>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Pill } from 'lucide-react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import type { Medicine } from '../types';
import { medicineService } from '../services/medicineService';
import { Pagination } from '../components/Pagination';

const validationSchema = yup.object({
  name: yup.string().required('Medicine name is required'),
  genericName: yup.string().required('Generic name is required'),
  category: yup.string().required('Category is required'),
  manufacturer: yup.string().required('Manufacturer is required'),
  requiresPrescription: yup.boolean(),
  description: yup.string(),
});

export const Medicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const data = await medicineService.getAll();
      setMedicines(data);
      setFilteredMedicines(data);
    } catch (error: any) {
      console.error('Error fetching medicines:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to load medicines', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      genericName: '',
      category: '',
      manufacturer: '',
      description: '',
      requiresPrescription: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (editingMedicine) {
          // Update existing medicine
          await medicineService.update(editingMedicine.id, values);
          setSnackbar({ open: true, message: 'Medicine updated successfully', severity: 'success' });
        } else {
          // Create new medicine
          await medicineService.create(values);
          setSnackbar({ open: true, message: 'Medicine added successfully', severity: 'success' });
        }
        handleCloseDialog();
        fetchMedicines(); // Refresh the list
      } catch (error: any) {
        console.error('Error saving medicine:', error);
        setSnackbar({ open: true, message: error.response?.data?.message || 'Operation failed', severity: 'error' });
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    // Filter medicines based on search query
    if (searchQuery.trim() === '') {
      setFilteredMedicines(medicines);
    } else {
      const filtered = medicines.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMedicines(filtered);
    }
    setPage(0);
  }, [searchQuery, medicines]);

  const handleOpenDialog = (medicine?: Medicine) => {
    if (medicine) {
      setEditingMedicine(medicine);
      formik.setValues({
        name: medicine.name,
        genericName: medicine.genericName,
        category: medicine.category,
        manufacturer: medicine.manufacturer,
        description: medicine.description || '',
        requiresPrescription: medicine.requiresPrescription,
      });
    } else {
      setEditingMedicine(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMedicine(null);
    formik.resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await medicineService.deleteMedicine(id);
        setMedicines((prev) => prev.filter((m) => m.id !== id));
        setSnackbar({ open: true, message: 'Medicine deleted successfully', severity: 'success' });
      } catch (error: any) {
        console.error('Error deleting medicine:', error);
        setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to delete medicine', severity: 'error' });
      }
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💊 Medicines</h1>
          <p className="text-gray-600">Manage your medicine database</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Add Medicine
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search medicines by name, generic name, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generic Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manufacturer
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prescription
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Pill className="text-indigo-600" size={20} />
                        <span className="text-sm font-medium text-gray-900">{medicine.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {medicine.genericName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {medicine.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {medicine.manufacturer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          medicine.requiresPrescription
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {medicine.requiresPrescription ? 'Required' : 'Not Required'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleOpenDialog(medicine)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(medicine.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalItems={filteredMedicines.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(val) => { setRowsPerPage(val); setPage(0); }}
        />
      </div>

      {/* Add/Edit Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
            </div>
            <form onSubmit={formik.handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Medicine Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="genericName" className="block text-sm font-medium text-gray-700 mb-1">
                      Generic Name *
                    </label>
                    <input
                      type="text"
                      id="genericName"
                      name="genericName"
                      value={formik.values.genericName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formik.touched.genericName && formik.errors.genericName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formik.touched.genericName && formik.errors.genericName && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.genericName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formik.values.category}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formik.touched.category && formik.errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formik.touched.category && formik.errors.category && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.category}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer *
                    </label>
                    <input
                      type="text"
                      id="manufacturer"
                      name="manufacturer"
                      value={formik.values.manufacturer}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formik.touched.manufacturer && formik.errors.manufacturer ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formik.touched.manufacturer && formik.errors.manufacturer && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.manufacturer}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="requiresPrescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Requires Prescription
                    </label>
                    <select
                      id="requiresPrescription"
                      name="requiresPrescription"
                      value={String(formik.values.requiresPrescription)}
                      onChange={formik.handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    editingMedicine ? 'Update' : 'Add'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
              snackbar.severity === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            <span>{snackbar.message}</span>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

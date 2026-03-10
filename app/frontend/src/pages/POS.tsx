import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Plus,
  Minus,
  Trash2,
  Search,
  ShoppingCart,
  CreditCard,
  User,
  Receipt,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Loader,
  FileText,
} from "lucide-react";
import { useFormik } from "formik";
import * as yup from "yup";
import type { Customer } from "../types";
import { saleService } from "../services/saleService";
import type { SaleRequest } from "../services/saleService";
import { inventoryService } from "../services/inventoryService";
import {
  drugInteractionService,
  type DrugInteraction,
} from "../services/drugInteractionService";

interface MedicineWithStock {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  unitPrice: number;
  requiresPrescription: boolean;
  stock: number;
  batchNumber: string;
  inventoryId: string;
}

interface CartItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  inventoryId: string;
  batchNumber: string;
  stock: number;
}

const customerValidationSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  phoneNumber: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Phone is required"),
});

export const POS = () => {
  const location = useLocation();
  const [medicines, setMedicines] = useState<MedicineWithStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "mobile"
  >("cash");
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  // Linked prescription (from Prescriptions page)
  const [linkedPrescription, setLinkedPrescription] = useState<{
    id: number;
    prescriptionNumber: string;
    patientName: string;
    patientPhone: string;
    medications: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
    }[];
  } | null>(null);

  // Drug interaction checking
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [checkingInteractions, setCheckingInteractions] = useState(false);
  const [showInteractions, setShowInteractions] = useState(true);

  // Fetch inventory items (medicines with stock) on mount
  useEffect(() => {
    fetchMedicines();
  }, []);

  // Process prescription data from navigation state
  useEffect(() => {
    const state = location.state as {
      prescription?: typeof linkedPrescription;
    } | null;
    if (state?.prescription && medicines.length > 0) {
      const rx = state.prescription;
      setLinkedPrescription(rx);

      // Auto-search customer by phone
      if (rx.patientPhone) {
        setCustomerPhone(rx.patientPhone);
        saleService
          .searchCustomerByPhone(rx.patientPhone)
          .then((found) => {
            if (found) setCustomer(found);
          })
          .catch(() => {});
      }

      // Auto-populate cart by matching medication names to inventory
      const newCart: CartItem[] = [];
      for (const med of rx.medications) {
        const medNameLower = med.name.toLowerCase();
        const match = medicines.find(
          (m) =>
            m.name.toLowerCase() === medNameLower ||
            m.genericName.toLowerCase() === medNameLower ||
            m.name.toLowerCase().includes(medNameLower) ||
            medNameLower.includes(m.name.toLowerCase()),
        );
        if (match && match.stock > 0) {
          const qty = Math.min(med.quantity || 1, match.stock);
          newCart.push({
            medicineId: match.id,
            medicineName: match.name,
            quantity: qty,
            unitPrice: match.unitPrice,
            inventoryId: match.inventoryId,
            batchNumber: match.batchNumber,
            stock: match.stock,
          });
        }
      }

      if (newCart.length > 0) {
        setCart(newCart);
        setSnackbar({
          open: true,
          message: `${newCart.length} of ${rx.medications.length} medications matched to inventory`,
          severity:
            newCart.length < rx.medications.length ? "warning" : "success",
        });
      } else if (rx.medications.length > 0) {
        setSnackbar({
          open: true,
          message:
            "No prescription medications matched inventory. Please add items manually.",
          severity: "warning",
        });
      }

      // Clear location state to prevent re-processing on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state, medicines]);

  // Check drug interactions when cart changes
  useEffect(() => {
    if (cart.length >= 2) {
      checkDrugInteractions();
    } else {
      setInteractions([]);
    }
  }, [cart]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventory(1, 1000); // Get all inventory

      // Response structure: { success: true, data: { inventory: [...], pagination: {...} } }
      const inventoryData = response.data?.inventory || [];

      // Transform inventory items to medicine format for POS
      const medicinesWithStock: MedicineWithStock[] = inventoryData.map(
        (item: any) => ({
          id: item.id, // Use inventory item ID as unique identifier (not medicine ID)
          name: item.medicine?.name || item.medicineName || "Unknown Medicine",
          genericName: item.medicine?.genericName || "",
          category: item.medicine?.category || "",
          manufacturer: item.medicine?.manufacturer || "",
          unitPrice: item.sellingPrice || 0,
          requiresPrescription: item.medicine?.requiresPrescription || false,
          stock: item.quantity || 0,
          batchNumber: item.batchNumber || "",
          inventoryId: item.id,
        }),
      );

      setMedicines(medicinesWithStock);
    } catch (error: any) {
      console.error("Error fetching medicines:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to load medicines",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkDrugInteractions = async () => {
    try {
      setCheckingInteractions(true);
      const medicineNames = cart.map((item) => item.medicineName);
      const result =
        await drugInteractionService.checkInteractions(medicineNames);
      setInteractions(result.interactions);

      // Show warning if major interactions found
      const majorInteractions = result.interactions.filter(
        (i) => i.severity === "major",
      );
      if (majorInteractions.length > 0) {
        setSnackbar({
          open: true,
          message: `⚠️ ${majorInteractions.length} major drug interaction(s) detected!`,
          severity: "warning",
        });
      }
    } catch (error) {
      console.error("Error checking drug interactions:", error);
    } finally {
      setCheckingInteractions(false);
    }
  };

  const customerFormik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
    validationSchema: customerValidationSchema,
    onSubmit: async (values) => {
      try {
        const newCustomer = await saleService.createQuickCustomer({
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
        });
        setCustomer(newCustomer);
        setCustomerPhone(values.phoneNumber);
        setOpenCustomerDialog(false);
        setSnackbar({
          open: true,
          message: "Customer added successfully",
          severity: "success",
        });
        customerFormik.resetForm();
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Failed to add customer",
          severity: "error",
        });
      }
    },
  });

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const addToCart = (medicine: MedicineWithStock) => {
    const existingItem = cart.find((item) => item.medicineId === medicine.id);

    if (existingItem) {
      if (existingItem.quantity >= medicine.stock) {
        setSnackbar({
          open: true,
          message: "Insufficient stock",
          severity: "warning",
        });
        return;
      }
      setCart(
        cart.map((item) =>
          item.medicineId === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          medicineId: medicine.id,
          medicineName: medicine.name,
          quantity: 1,
          unitPrice: medicine.unitPrice,
          inventoryId: medicine.inventoryId,
          batchNumber: medicine.batchNumber,
          stock: medicine.stock,
        },
      ]);
    }
    setSnackbar({
      open: true,
      message: `${medicine.name} added to cart`,
      severity: "success",
    });
  };

  const updateQuantity = (medicineId: string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.medicineId === medicineId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return item;
          if (newQuantity > item.stock) {
            setSnackbar({
              open: true,
              message: "Insufficient stock",
              severity: "warning",
            });
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCart(cart.filter((item) => item.medicineId !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
    setCustomerPhone("");
    setDiscount(0);
    setPaymentMethod("cash");
    setLinkedPrescription(null);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const discountAmount = (subtotal * discount) / 100;
  const tax = ((subtotal - discountAmount) * 5) / 100; // 5% tax
  const total = subtotal - discountAmount + tax;

  const handleCustomerSearch = async () => {
    if (!customerPhone || customerPhone.length !== 10) {
      setSnackbar({
        open: true,
        message: "Please enter a valid 10-digit phone number",
        severity: "error",
      });
      return;
    }

    try {
      const foundCustomer =
        await saleService.searchCustomerByPhone(customerPhone);
      if (foundCustomer) {
        setCustomer(foundCustomer);
        setSnackbar({
          open: true,
          message: "Customer found!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Customer not found. Please add new customer.",
          severity: "warning",
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Error searching for customer",
        severity: "error",
      });
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setSnackbar({ open: true, message: "Cart is empty", severity: "error" });
      return;
    }

    try {
      setLoading(true);

      // Prepare sale data
      const saleData: SaleRequest = {
        customerId: customer?.id,
        customerName: customer
          ? `${customer.firstName} ${customer.lastName}`.trim()
          : undefined,
        customerPhone: customer?.phoneNumber,
        items: cart.map((item) => ({
          medicineId: item.medicineId,
          inventoryId: item.inventoryId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paymentMethod,
        discount: discount > 0 ? discount : undefined,
        prescriptionId: linkedPrescription?.id,
      };

      // Create sale via API
      const createdSale = await saleService.createSale(saleData);

      // Prepare invoice data
      const invoice = {
        invoiceNumber: `INV${String(createdSale.id).slice(0, 8).toUpperCase()}`,
        date: new Date(createdSale.createdAt).toLocaleString(),
        customer: customer || {
          firstName: "Walk-in",
          lastName: "Customer",
          phoneNumber: "N/A",
        },
        items: cart,
        subtotal,
        discount: discountAmount,
        tax,
        total: Number(createdSale.total || total),
        paymentMethod,
        loyaltyPointsEarned: Math.floor(
          Number(createdSale.total || total) / 10,
        ),
      };

      setInvoiceData(invoice);
      setOpenInvoiceDialog(true);
      setSnackbar({
        open: true,
        message: "Sale completed successfully!",
        severity: "success",
      });

      // Refresh medicines to update stock
      fetchMedicines();
    } catch (error: any) {
      console.error("Checkout error:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to complete sale",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
    setOpenInvoiceDialog(false);
    clearCart();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        🛒 Point of Sale
      </h1>

      {/* Linked Prescription Banner */}
      {linkedPrescription && (
        <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-indigo-600" />
            <div>
              <p className="font-semibold text-indigo-900">
                Processing Prescription #{linkedPrescription.prescriptionNumber}
              </p>
              <p className="text-sm text-indigo-700">
                Patient: {linkedPrescription.patientName} &bull;{" "}
                {linkedPrescription.medications.length} medication(s)
              </p>
            </div>
          </div>
          <button
            onClick={() => setLinkedPrescription(null)}
            className="p-1 text-indigo-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-100"
            title="Unlink prescription"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side - Product Search */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {loading && medicines.length === 0 ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
            ) : filteredMedicines.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">
                  {searchQuery
                    ? "No medicines found matching your search"
                    : "No medicines available"}
                </p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredMedicines.map((medicine) => (
                    <div
                      key={medicine.id}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                      onClick={() => addToCart(medicine)}
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {medicine.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {medicine.genericName}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xl font-bold text-indigo-600">
                          Rs {medicine.unitPrice}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${medicine.stock < 50 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
                        >
                          Stock: {medicine.stock}
                        </span>
                      </div>
                      {medicine.requiresPrescription && (
                        <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                          Rx Required
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Cart & Checkout */}
        <div className="lg:col-span-5 space-y-4">
          {/* Customer Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" /> Customer
            </h2>
            {customer ? (
              <div>
                <p className="font-bold text-gray-900">
                  {`${customer.firstName || ""} ${customer.lastName || ""}`.trim()}
                </p>
                <p className="text-sm text-gray-500">{customer.phoneNumber}</p>
                <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                  {customer.loyaltyPoints} Loyalty Points
                </span>
                <button
                  onClick={() => setCustomer(null)}
                  className="ml-2 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleCustomerSearch()
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleCustomerSearch}
                  className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
                >
                  Search
                </button>
                <button
                  onClick={() => setOpenCustomerDialog(true)}
                  className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
                >
                  New
                </button>
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Cart ({cart.length})
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" /> Clear
                </button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Cart is empty
                </p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.medicineId}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.medicineName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Rs {item.unitPrice} × {item.quantity} = Rs{" "}
                            {(item.unitPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateQuantity(item.medicineId, -1)}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="px-2 text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.medicineId, 1)}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.medicineId)}
                          className="p-1 rounded hover:bg-red-50 ml-2"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Drug Interaction Warnings */}
          {cart.length >= 2 && (
            <div
              className={`bg-white rounded-xl shadow-md p-6 ${
                interactions.length > 0
                  ? interactions.some((i) => i.severity === "major")
                    ? "border-l-4 border-red-500"
                    : interactions.some((i) => i.severity === "moderate")
                      ? "border-l-4 border-yellow-500"
                      : "border-l-4 border-blue-500"
                  : ""
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle
                    className={`h-5 w-5 ${interactions.length > 0 ? "text-yellow-500" : "text-gray-400"}`}
                  />
                  Drug Interactions
                  {checkingInteractions && (
                    <Loader className="h-4 w-4 text-indigo-600 animate-spin" />
                  )}
                </h2>
                <button
                  onClick={() => setShowInteractions(!showInteractions)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  {showInteractions ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>

              {showInteractions && (
                <div className="mt-3">
                  {interactions.length === 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="text-sm text-green-800">
                          ✓ No known drug interactions detected
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {interactions.map((interaction, index) => (
                        <div
                          key={index}
                          className={`border rounded-lg p-3 ${
                            interaction.severity === "major"
                              ? "bg-red-50 border-red-200"
                              : interaction.severity === "moderate"
                                ? "bg-yellow-50 border-yellow-200"
                                : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <p className="font-semibold text-sm mb-1">
                            {interaction.drugs.join(" + ")}
                          </p>
                          <p className="text-xs text-gray-600 mb-2">
                            {interaction.description}
                          </p>
                          <span
                            className={`inline-block text-xs px-2 py-1 rounded-full ${
                              interaction.severity === "major"
                                ? "bg-red-100 text-red-800"
                                : interaction.severity === "moderate"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {interaction.severity.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Billing */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Billing Summary
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) =>
                  setDiscount(
                    Math.max(0, Math.min(100, Number(e.target.value))),
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile Payment</option>
              </select>
            </div>

            <hr className="my-4 border-gray-200" />

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">Rs {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount ({discount}%):</span>
                <span className="text-red-600">
                  -Rs {discountAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (5%):</span>
                <span className="text-gray-900">Rs {tax.toFixed(2)}</span>
              </div>
            </div>

            <hr className="my-3 border-gray-200" />

            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-indigo-600">
                Rs {total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Complete Sale
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add Customer Dialog */}
      {openCustomerDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Customer
              </h2>
              <button
                onClick={() => setOpenCustomerDialog(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={customerFormik.handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={customerFormik.values.firstName}
                    onChange={customerFormik.handleChange}
                    onBlur={customerFormik.handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      customerFormik.touched.firstName &&
                      customerFormik.errors.firstName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {customerFormik.touched.firstName &&
                    customerFormik.errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerFormik.errors.firstName}
                      </p>
                    )}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={customerFormik.values.lastName}
                    onChange={customerFormik.handleChange}
                    onBlur={customerFormik.handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      customerFormik.touched.lastName &&
                      customerFormik.errors.lastName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {customerFormik.touched.lastName &&
                    customerFormik.errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerFormik.errors.lastName}
                      </p>
                    )}
                </div>
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={customerFormik.values.phoneNumber}
                    onChange={customerFormik.handleChange}
                    onBlur={customerFormik.handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      customerFormik.touched.phoneNumber &&
                      customerFormik.errors.phoneNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {customerFormik.touched.phoneNumber &&
                    customerFormik.errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerFormik.errors.phoneNumber}
                      </p>
                    )}
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setOpenCustomerDialog(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Dialog */}
      {openInvoiceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Receipt className="h-6 w-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">Invoice</h2>
              </div>
              <button
                onClick={() => setOpenInvoiceDialog(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {invoiceData && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {invoiceData.invoiceNumber}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {invoiceData.date}
                  </p>
                  <hr className="my-4 border-gray-200" />
                  <p className="font-medium text-gray-900 mb-1">
                    Customer:{" "}
                    {`${invoiceData.customer.firstName || ""} ${invoiceData.customer.lastName || ""}`.trim()}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Phone: {invoiceData.customer.phoneNumber}
                  </p>
                  <hr className="my-4 border-gray-200" />
                  <div className="space-y-3 mb-4">
                    {invoiceData.items.map((item: CartItem) => (
                      <div key={item.medicineId}>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-900">
                            {item.medicineName}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            Rs {(item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × Rs {item.unitPrice}
                        </p>
                      </div>
                    ))}
                  </div>
                  <hr className="my-4 border-gray-200" />
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">
                        Rs {invoiceData.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-gray-900">
                        -Rs {invoiceData.discount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-900">
                        Rs {invoiceData.tax.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-4 pt-2 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-indigo-600">
                      Rs {invoiceData.total.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Payment: {invoiceData.paymentMethod.toUpperCase()}
                  </p>
                  {customer && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="text-sm text-green-800">
                          Loyalty Points Earned:{" "}
                          {invoiceData.loyaltyPointsEarned}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setOpenInvoiceDialog(false);
                  clearCart();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handlePrintInvoice}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
              >
                <Receipt className="h-4 w-4" />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar/Toast Notification */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-in">
          <div
            className={`rounded-lg shadow-lg p-4 flex items-start gap-3 ${
              snackbar.severity === "success"
                ? "bg-green-50 border border-green-200"
                : snackbar.severity === "error"
                  ? "bg-red-50 border border-red-200"
                  : snackbar.severity === "warning"
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-blue-50 border border-blue-200"
            }`}
          >
            {snackbar.severity === "success" && (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            )}
            {snackbar.severity === "error" && (
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            {snackbar.severity === "warning" && (
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <p
              className={`text-sm flex-1 ${
                snackbar.severity === "success"
                  ? "text-green-800"
                  : snackbar.severity === "error"
                    ? "text-red-800"
                    : snackbar.severity === "warning"
                      ? "text-yellow-800"
                      : "text-blue-800"
              }`}
            >
              {snackbar.message}
            </p>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="flex-shrink-0"
            >
              <X
                className={`h-4 w-4 ${
                  snackbar.severity === "success"
                    ? "text-green-600"
                    : snackbar.severity === "error"
                      ? "text-red-600"
                      : snackbar.severity === "warning"
                        ? "text-yellow-600"
                        : "text-blue-600"
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

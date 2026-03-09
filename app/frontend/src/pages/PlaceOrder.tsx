import { useState, useEffect } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  Search,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Package,
} from 'lucide-react';
import type { InventoryItem } from '../types';
import { saleService } from '../services/saleService';
import { inventoryService } from '../services/inventoryService';

interface CartItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  inventoryId: string;
  stock: number;
}

export const PlaceOrder = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' | 'warning' });

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventory(1, 1000);
      const items = (response as any).data?.inventory || response.data || [];
      setInventory(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = inventory.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.medicine?.name?.toLowerCase().includes(q) ||
      item.medicine?.genericName?.toLowerCase().includes(q) ||
      item.medicine?.category?.toLowerCase().includes(q)
    );
  });

  const addToCart = (item: InventoryItem) => {
    const existing = cart.find((c) => c.inventoryId === item.id);
    if (existing) {
      if (existing.quantity >= item.quantity) {
        setToast({ show: true, message: 'Not enough stock available', type: 'warning' });
        return;
      }
      setCart(cart.map((c) => (c.inventoryId === item.id ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setCart([
        ...cart,
        {
          medicineId: item.medicineId,
          medicineName: item.medicine?.name || 'Unknown',
          quantity: 1,
          unitPrice: item.sellingPrice || item.unitPrice || 0,
          inventoryId: item.id,
          stock: item.quantity,
        },
      ]);
    }
    setToast({ show: true, message: `${item.medicine?.name} added to cart`, type: 'success' });
  };

  const updateQuantity = (inventoryId: string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.inventoryId === inventoryId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item;
          if (newQty > item.stock) {
            setToast({ show: true, message: 'Not enough stock', type: 'warning' });
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (inventoryId: string) => {
    setCart(cart.filter((item) => item.inventoryId !== inventoryId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setToast({ show: true, message: 'Cart is empty', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      await saleService.createSale({
        items: cart.map((item) => ({
          medicineId: item.medicineId,
          inventoryId: item.inventoryId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paymentMethod,
      });
      setOrderSuccess(true);
      setCart([]);
    } catch (err: any) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to place order',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md">
          <div className="mx-auto bg-emerald-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-8">
            Your order has been placed successfully. You can view it in "My Orders".
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setOrderSuccess(false);
                fetchInventory();
              }}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Place Another Order
            </button>
            <a
              href="/my-orders"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              View Orders
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-600'
              : toast.type === 'error'
                ? 'bg-red-600'
                : 'bg-amber-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Place Order</h1>
        <p className="text-gray-600">Browse medicines and place your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Medicine Browser */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl shadow-md p-5">
            {/* Search */}
            <div className="relative mb-4">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines by name, generic name, or category..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Medicine List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Package size={40} className="mx-auto mb-3 text-gray-300" />
                <p>{searchQuery ? 'No medicines match your search' : 'No medicines available'}</p>
              </div>
            ) : (
              <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {filteredItems
                  .filter((item) => item.quantity > 0)
                  .map((item) => {
                    const inCart = cart.find((c) => c.inventoryId === item.id);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {item.medicine?.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.medicine?.genericName} • {item.medicine?.category}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-bold text-indigo-600">
                              Rs {(item.sellingPrice || item.unitPrice || 0).toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-400">
                              Stock: {item.quantity}
                            </span>
                            {item.medicine?.requiresPrescription && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                Rx Required
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className={`ml-3 p-2 rounded-lg transition font-medium text-sm ${
                            inCart
                              ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl shadow-md p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Your Cart ({cart.length})
              </h2>
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <ShoppingCart size={36} className="mx-auto mb-2" />
                <p className="text-sm">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-1 mb-4">
                  {cart.map((item) => (
                    <div key={item.inventoryId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {item.medicineName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Rs {item.unitPrice.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.inventoryId, -1)}
                          className="p-1 text-gray-400 hover:text-gray-700 bg-white rounded border"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.inventoryId, 1)}
                          className="p-1 text-gray-400 hover:text-gray-700 bg-white rounded border"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-gray-900 w-20 text-right">
                        Rs {(item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.inventoryId)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>Rs {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (5%)</span>
                    <span>Rs {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>Rs {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Payment Method</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'cash' as const, label: 'Cash', icon: Banknote },
                      { value: 'card' as const, label: 'Card', icon: CreditCard },
                      { value: 'mobile' as const, label: 'Mobile', icon: Smartphone },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setPaymentMethod(value)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-sm font-medium transition ${
                          paymentMethod === value
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={18} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting || cart.length === 0}
                  className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Place Order — Rs {total.toFixed(2)}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

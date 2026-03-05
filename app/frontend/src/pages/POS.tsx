import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  MenuItem,
  Chip,
  Stack,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  Search,
  ShoppingCart,
  Payment,
  Person,
  Receipt,
  Clear,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import type { Medicine, Customer, InventoryItem } from '../types';

// Mock data
const mockMedicines: (Medicine & { stock: number; batchNumber: string; inventoryId: string })[] = [
  { id: '1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', manufacturer: 'PharmaCorp', unitPrice: 5.99, requiresPrescription: false, stock: 450, batchNumber: 'BATCH001', inventoryId: 'INV001', createdAt: '', updatedAt: '' },
  { id: '2', name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotic', manufacturer: 'MediPharm', unitPrice: 12.50, requiresPrescription: true, stock: 45, batchNumber: 'BATCH002', inventoryId: 'INV002', createdAt: '', updatedAt: '' },
  { id: '3', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'NSAID', manufacturer: 'HealthPlus', unitPrice: 8.75, requiresPrescription: false, stock: 180, batchNumber: 'BATCH003', inventoryId: 'INV003', createdAt: '', updatedAt: '' },
  { id: '4', name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', category: 'Antihistamine', manufacturer: 'AllergyRelief', unitPrice: 7.50, requiresPrescription: false, stock: 200, batchNumber: 'BATCH004', inventoryId: 'INV004', createdAt: '', updatedAt: '' },
  { id: '5', name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'PPI', manufacturer: 'PharmaCorp', unitPrice: 15.25, requiresPrescription: true, stock: 120, batchNumber: 'BATCH005', inventoryId: 'INV005', createdAt: '', updatedAt: '' },
];

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
  name: yup.string().required('Name is required'),
  phone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').required('Phone is required'),
});

export const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });

  const customerFormik = useFormik({
    initialValues: {
      name: '',
      phone: '',
    },
    validationSchema: customerValidationSchema,
    onSubmit: (values) => {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: values.name,
        phone: values.phone,
        loyaltyPoints: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCustomer(newCustomer);
      setCustomerPhone(values.phone);
      setOpenCustomerDialog(false);
      setSnackbar({ open: true, message: 'Customer added successfully', severity: 'success' });
      customerFormik.resetForm();
    },
  });

  const filteredMedicines = mockMedicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (medicine: typeof mockMedicines[0]) => {
    const existingItem = cart.find((item) => item.medicineId === medicine.id);
    
    if (existingItem) {
      if (existingItem.quantity >= medicine.stock) {
        setSnackbar({ open: true, message: 'Insufficient stock', severity: 'warning' });
        return;
      }
      setCart(
        cart.map((item) =>
          item.medicineId === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
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
    setSnackbar({ open: true, message: `${medicine.name} added to cart`, severity: 'success' });
  };

  const updateQuantity = (medicineId: string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.medicineId === medicineId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return item;
          if (newQuantity > item.stock) {
            setSnackbar({ open: true, message: 'Insufficient stock', severity: 'warning' });
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCart(cart.filter((item) => item.medicineId !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
    setCustomerPhone('');
    setDiscount(0);
    setPaymentMethod('cash');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const tax = ((subtotal - discountAmount) * 5) / 100; // 5% tax
  const total = subtotal - discountAmount + tax;

  const handleCustomerSearch = () => {
    if (customerPhone.length === 10) {
      // Mock customer search
      const mockCustomer: Customer = {
        id: '1',
        name: 'John Doe',
        phone: customerPhone,
        loyaltyPoints: 125,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      setCustomer(mockCustomer);
      setSnackbar({ open: true, message: 'Customer found!', severity: 'success' });
    } else if (customerPhone.length > 0) {
      setSnackbar({ open: true, message: 'Invalid phone number', severity: 'error' });
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      setSnackbar({ open: true, message: 'Cart is empty', severity: 'error' });
      return;
    }

    const invoice = {
      invoiceNumber: `INV${Date.now()}`,
      date: new Date().toLocaleString(),
      customer: customer || { name: 'Walk-in Customer', phone: 'N/A' },
      items: cart,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      paymentMethod,
      loyaltyPointsEarned: Math.floor(total / 10),
    };

    setInvoiceData(invoice);
    setOpenInvoiceDialog(true);
    setSnackbar({ open: true, message: 'Sale completed successfully!', severity: 'success' });
  };

  const handlePrintInvoice = () => {
    window.print();
    setOpenInvoiceDialog(false);
    clearCart();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        🛒 Point of Sale
      </Typography>

      <Grid container spacing={3}>
        {/* Left Side - Product Search */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
                <Grid container spacing={2}>
                  {filteredMedicines.map((medicine) => (
                    <Grid item xs={12} sm={6} key={medicine.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-2px)',
                          },
                        }}
                        onClick={() => addToCart(medicine)}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {medicine.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {medicine.genericName}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="h6" color="primary">
                              ₹{medicine.unitPrice}
                            </Typography>
                            <Chip
                              label={`Stock: ${medicine.stock}`}
                              size="small"
                              color={medicine.stock < 50 ? 'warning' : 'success'}
                            />
                          </Box>
                          {medicine.requiresPrescription && (
                            <Chip label="Rx Required" size="small" color="error" sx={{ mt: 1 }} />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side - Cart & Checkout */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            {/* Customer Section */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person /> Customer
                </Typography>
                {customer ? (
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {customer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {customer.phone}
                    </Typography>
                    <Chip
                      label={`${customer.loyaltyPoints} Loyalty Points`}
                      size="small"
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                    <Button size="small" onClick={() => setCustomer(null)} sx={{ ml: 1 }}>
                      Change
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Phone Number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomerSearch()}
                    />
                    <Button variant="outlined" onClick={handleCustomerSearch}>
                      Search
                    </Button>
                    <Button variant="outlined" onClick={() => setOpenCustomerDialog(true)}>
                      New
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Cart */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCart /> Cart ({cart.length})
                  </Typography>
                  {cart.length > 0 && (
                    <Button size="small" startIcon={<Clear />} onClick={clearCart}>
                      Clear
                    </Button>
                  )}
                </Box>

                <List sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {cart.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                      Cart is empty
                    </Typography>
                  ) : (
                    cart.map((item) => (
                      <ListItem
                        key={item.medicineId}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemText
                          primary={item.medicineName}
                          secondary={`₹${item.unitPrice} × ${item.quantity} = ₹${(item.unitPrice * item.quantity).toFixed(2)}`}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton size="small" onClick={() => updateQuantity(item.medicineId, -1)}>
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => updateQuantity(item.medicineId, 1)}>
                            <Add fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => removeFromCart(item.medicineId)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>

            {/* Billing */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Billing Summary
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  label="Discount (%)"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="mobile">Mobile Payment</MenuItem>
                </TextField>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>₹{subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Discount ({discount}%):</Typography>
                  <Typography color="error">-₹{discountAmount.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax (5%):</Typography>
                  <Typography>₹{tax.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }} color="primary">
                    ₹{total.toFixed(2)}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Payment />}
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  Complete Sale
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Add Customer Dialog */}
      <Dialog open={openCustomerDialog} onClose={() => setOpenCustomerDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Customer</DialogTitle>
        <form onSubmit={customerFormik.handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Customer Name"
              value={customerFormik.values.name}
              onChange={customerFormik.handleChange}
              onBlur={customerFormik.handleBlur}
              error={customerFormik.touched.name && Boolean(customerFormik.errors.name)}
              helperText={customerFormik.touched.name && customerFormik.errors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              id="phone"
              name="phone"
              label="Phone Number"
              value={customerFormik.values.phone}
              onChange={customerFormik.handleChange}
              onBlur={customerFormik.handleBlur}
              error={customerFormik.touched.phone && Boolean(customerFormik.errors.phone)}
              helperText={customerFormik.touched.phone && customerFormik.errors.phone}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCustomerDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add Customer
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={openInvoiceDialog} onClose={() => setOpenInvoiceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Receipt /> Invoice
        </DialogTitle>
        <DialogContent>
          {invoiceData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {invoiceData.invoiceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {invoiceData.date}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Customer: {invoiceData.customer.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Phone: {invoiceData.customer.phone}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {invoiceData.items.map((item: CartItem) => (
                <Box key={item.medicineId} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{item.medicineName}</Typography>
                    <Typography variant="body2">₹{(item.unitPrice * item.quantity).toFixed(2)}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {item.quantity} × ₹{item.unitPrice}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>₹{invoiceData.subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Discount:</Typography>
                <Typography>-₹{invoiceData.discount.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tax:</Typography>
                <Typography>₹{invoiceData.tax.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ₹{invoiceData.total.toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Payment: {invoiceData.paymentMethod.toUpperCase()}
              </Typography>
              {customer && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Loyalty Points Earned: {invoiceData.loyaltyPointsEarned}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenInvoiceDialog(false); clearCart(); }}>Close</Button>
          <Button variant="contained" startIcon={<Receipt />} onClick={handlePrintInvoice}>
            Print Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

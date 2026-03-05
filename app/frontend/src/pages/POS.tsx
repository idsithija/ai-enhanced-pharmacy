import { useState, useEffect } from 'react';
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
  CircularProgress,
  Collapse,
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
  Warning as WarningIcon,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import type { Medicine, Customer, InventoryItem } from '../types';
import { saleService } from '../services/saleService';
import { inventoryService } from '../services/inventoryService';
import { drugInteractionService, type DrugInteraction } from '../services/drugInteractionService';

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
  name: yup.string().required('Name is required'),
  phone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').required('Phone is required'),
});

export const POS = () => {
  const [medicines, setMedicines] = useState<MedicineWithStock[]>([]);
  const [loading, setLoading] = useState(false);
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
  
  // Drug interaction checking
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [checkingInteractions, setCheckingInteractions] = useState(false);
  const [showInteractions, setShowInteractions] = useState(true);

  // Fetch inventory items (medicines with stock) on mount
  useEffect(() => {
    fetchMedicines();
  }, []);
  
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
      
      // Transform inventory items to medicine format for POS
      const medicinesWithStock: MedicineWithStock[] = response.data.map((item: any) => ({
        id: item.medicine?.id || item.medicineId,
        name: item.medicine?.name || item.medicineName || 'Unknown Medicine',
        genericName: item.medicine?.genericName || '',
        category: item.medicine?.category || '',
        manufacturer: item.medicine?.manufacturer || '',
        unitPrice: item.medicine?.unitPrice || 0,
        requiresPrescription: item.medicine?.requiresPrescription || false,
        stock: item.quantity || 0,
        batchNumber: item.batchNumber || '',
        inventoryId: item.id,
      }));
      
      setMedicines(medicinesWithStock);
    } catch (error: any) {
      console.error('Error fetching medicines:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to load medicines', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const checkDrugInteractions = async () => {
    try {
      setCheckingInteractions(true);
      const medicineNames = cart.map(item => item.medicineName);
      const result = await drugInteractionService.checkInteractions(medicineNames);
      setInteractions(result.interactions);
      
      // Show warning if major interactions found
      const majorInteractions = result.interactions.filter(i => i.severity === 'major');
      if (majorInteractions.length > 0) {
        setSnackbar({
          open: true,
          message: `⚠️ ${majorInteractions.length} major drug interaction(s) detected!`,
          severity: 'warning'
        });
      }
    } catch (error) {
      console.error('Error checking drug interactions:', error);
    } finally {
      setCheckingInteractions(false);
    }
  };

  const customerFormik = useFormik({
    initialValues: {
      name: '',
      phone: '',
    },
    validationSchema: customerValidationSchema,
    onSubmit: async (values) => {
      try {
        const newCustomer = await saleService.createQuickCustomer({
          name: values.name,
          phone: values.phone,
        });
        setCustomer(newCustomer);
        setCustomerPhone(values.phone);
        setOpenCustomerDialog(false);
        setSnackbar({ open: true, message: 'Customer added successfully', severity: 'success' });
        customerFormik.resetForm();
      } catch (error: any) {
        setSnackbar({ 
          open: true, 
          message: error.response?.data?.message || 'Failed to add customer', 
          severity: 'error' 
        });
      }
    },
  });

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (medicine: MedicineWithStock) => {
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

  const handleCustomerSearch = async () => {
    if (!customerPhone || customerPhone.length !== 10) {
      setSnackbar({ open: true, message: 'Please enter a valid 10-digit phone number', severity: 'error' });
      return;
    }

    try {
      const foundCustomer = await saleService.searchCustomerByPhone(customerPhone);
      if (foundCustomer) {
        setCustomer(foundCustomer);
        setSnackbar({ open: true, message: 'Customer found!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Customer not found. Please add new customer.', severity: 'warning' });
      }
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error searching for customer', 
        severity: 'error' 
      });
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setSnackbar({ open: true, message: 'Cart is empty', severity: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      // Prepare sale data
      const saleData = {
        customerId: customer?.id,
        items: cart.map(item => ({
          medicineId: item.medicineId,
          inventoryId: item.inventoryId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paymentMethod,
        discount: discount > 0 ? discount : undefined,
      };

      // Create sale via API
      const createdSale = await saleService.createSale(saleData);

      // Prepare invoice data
      const invoice = {
        invoiceNumber: `INV${createdSale.id.slice(0, 8).toUpperCase()}`,
        date: new Date(createdSale.createdAt).toLocaleString(),
        customer: customer || { name: 'Walk-in Customer', phone: 'N/A' },
        items: cart,
        subtotal,
        discount: discountAmount,
        tax,
        total: createdSale.total,
        paymentMethod,
        loyaltyPointsEarned: Math.floor(createdSale.total / 10),
      };

      setInvoiceData(invoice);
      setOpenInvoiceDialog(true);
      setSnackbar({ open: true, message: 'Sale completed successfully!', severity: 'success' });
      
      // Refresh medicines to update stock
      fetchMedicines();
    } catch (error: any) {
      console.error('Checkout error:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to complete sale', 
        severity: 'error' 
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

              {loading && medicines.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                  <CircularProgress />
                </Box>
              ) : filteredMedicines.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery ? 'No medicines found matching your search' : 'No medicines available'}
                  </Typography>
                </Box>
              ) : (
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
              )}
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

            {/* Drug Interaction Warnings */}
            {cart.length >= 2 && (
              <Card sx={{ 
                borderLeft: interactions.length > 0 ? '4px solid' : 'none',
                borderColor: interactions.some(i => i.severity === 'major') ? 'error.main' : 
                             interactions.some(i => i.severity === 'moderate') ? 'warning.main' : 'info.main'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon color={interactions.length > 0 ? 'warning' : 'action'} />
                      Drug Interactions
                      {checkingInteractions && <CircularProgress size={16} />}
                    </Typography>
                    <IconButton size="small" onClick={() => setShowInteractions(!showInteractions)}>
                      {showInteractions ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                  
                  <Collapse in={showInteractions}>
                    {interactions.length === 0 ? (
                      <Alert severity="success" sx={{ mt: 1 }}>
                        ✓ No known drug interactions detected
                      </Alert>
                    ) : (
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        {interactions.map((interaction, index) => (
                          <Alert 
                            key={index} 
                            severity={
                              interaction.severity === 'major' ? 'error' : 
                              interaction.severity === 'moderate' ? 'warning' : 'info'
                            }
                            sx={{ fontSize: '0.85rem' }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {interaction.drugs.join(' + ')}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {interaction.description}
                            </Typography>
                            <Chip 
                              label={interaction.severity.toUpperCase()} 
                              size="small" 
                              color={
                                interaction.severity === 'major' ? 'error' : 
                                interaction.severity === 'moderate' ? 'warning' : 'info'
                              }
                              sx={{ mt: 0.5 }}
                            />
                          </Alert>
                        ))}
                      </Stack>
                    )}
                  </Collapse>
                </CardContent>
              </Card>
            )}

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
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Payment />}
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || loading}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {loading ? 'Processing...' : 'Complete Sale'}
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

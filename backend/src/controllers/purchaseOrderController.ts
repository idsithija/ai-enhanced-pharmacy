import { Response, NextFunction } from 'express';
import { PurchaseOrder, Supplier, User, Inventory, Medicine } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { Op } from 'sequelize';

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
export const getPurchaseOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, supplierId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (startDate && endDate) {
      where.orderDate = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: orders } = await PurchaseOrder.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      include: [
        { model: Supplier, as: 'supplier', attributes: ['id', 'companyName', 'contactPerson', 'phoneNumber'] },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'role'] },
      ],
      order: [['orderDate', 'DESC']],
    } as any);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total: count,
          page: Number(page),
          pages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get single purchase order
// @route   GET /api/purchase-orders/:id
// @access  Private
export const getPurchaseOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        { model: Supplier, as: 'supplier' },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'role'] },
        { model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'firstName', 'lastName', 'role'] },
      ],
    } as any);

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: 'Purchase order not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Create purchase order
// @route   POST /api/purchase-orders
// @access  Private (admin, inventory_manager)
export const createPurchaseOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { supplierId, items, expectedDeliveryDate, tax, shippingCost, discount, notes } = req.body;

    // Validation
    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide supplierId and items array' },
      });
      return;
    }

    // Verify supplier exists
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      res.status(404).json({
        success: false,
        error: { message: 'Supplier not found' },
      });
      return;
    }

    // Calculate totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      if (!item.medicineId || !item.quantity || !item.unitPrice) {
        res.status(400).json({
          success: false,
          error: { message: 'Each item must have medicineId, quantity, and unitPrice' },
        });
        return;
      }

      // Get medicine name
      const medicine = await Medicine.findByPk(item.medicineId);
      if (!medicine) {
        res.status(404).json({
          success: false,
          error: { message: `Medicine with id ${item.medicineId} not found` },
        });
        return;
      }

      const totalPrice = item.quantity * item.unitPrice;
      subtotal += totalPrice;

      processedItems.push({
        medicineId: item.medicineId,
        medicineName: medicine.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        batchNumber: item.batchNumber || null,
        expiryDate: item.expiryDate || null,
        receivedQuantity: 0,
      });
    }

    const taxAmount = tax || 0;
    const shippingAmount = shippingCost || 0;
    const discountAmount = discount || 0;
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Generate order number
    const orderCount = await PurchaseOrder.count();
    const orderNumber = `PO-${new Date().getFullYear()}-${String(orderCount + 1).padStart(5, '0')}`;

    // Create purchase order
    const order = await PurchaseOrder.create({
      orderNumber,
      supplierId,
      orderDate: new Date(),
      expectedDeliveryDate: expectedDeliveryDate || null,
      status: 'draft',
      items: processedItems,
      subtotal,
      tax: taxAmount,
      shippingCost: shippingAmount,
      discount: discountAmount,
      totalAmount,
      paymentStatus: 'unpaid',
      paidAmount: 0,
      notes: notes || null,
      createdBy: req.user!.id,
    });

    res.status(201).json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Update purchase order
// @route   PUT /api/purchase-orders/:id
// @access  Private (admin, inventory_manager)
export const updatePurchaseOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: 'Purchase order not found' },
      });
      return;
    }

    // Cannot update orders that are received or cancelled
    if (order.status === 'received' || order.status === 'cancelled') {
      res.status(400).json({
        success: false,
        error: { message: `Cannot update ${order.status} orders` },
      });
      return;
    }

    await order.update(req.body);

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Approve purchase order
// @route   PUT /api/purchase-orders/:id/approve
// @access  Private (admin only)
export const approvePurchaseOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: 'Purchase order not found' },
      });
      return;
    }

    if (order.status !== 'draft' && order.status !== 'pending') {
      res.status(400).json({
        success: false,
        error: { message: 'Only draft or pending orders can be approved' },
      });
      return;
    }

    order.status = 'approved';
    order.approvedBy = req.user!.id;
    await order.save();

    res.status(200).json({
      success: true,
      data: { order, message: 'Purchase order approved successfully' },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Receive purchase order (update inventory)
// @route   PUT /api/purchase-orders/:id/receive
// @access  Private (admin, inventory_manager)
export const receivePurchaseOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { receivedItems } = req.body; // Array of { medicineId, receivedQuantity, batchNumber, expiryDate }

    const order = await PurchaseOrder.findByPk(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: 'Purchase order not found' },
      });
      return;
    }

    if (order.status !== 'approved' && order.status !== 'ordered') {
      res.status(400).json({
        success: false,
        error: { message: 'Only approved or ordered purchases can be received' },
      });
      return;
    }

    if (!receivedItems || !Array.isArray(receivedItems)) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide receivedItems array' },
      });
      return;
    }

    // Update inventory for each received item
    for (const receivedItem of receivedItems) {
      const orderItem = order.items.find((item: any) => item.medicineId === receivedItem.medicineId);
      
      if (!orderItem) {
        continue;
      }

      // Add to inventory
      await Inventory.create({
        medicineId: receivedItem.medicineId,
        batchNumber: receivedItem.batchNumber || orderItem.batchNumber || 'BATCH-' + Date.now(),
        quantity: receivedItem.receivedQuantity,
        unitPrice: orderItem.unitPrice,
        sellingPrice: orderItem.unitPrice * 1.3, // 30% markup (can be customized)
        manufacturingDate: new Date(),
        expiryDate: receivedItem.expiryDate || orderItem.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        reorderLevel: 10,
        status: 'in_stock',
      });

      // Update received quantity in order items
      orderItem.receivedQuantity = receivedItem.receivedQuantity;
    }

    // Update order status
    order.status = 'received';
    order.actualDeliveryDate = new Date();
    order.receivedBy = req.user!.id;
    await order.save();

    res.status(200).json({
      success: true,
      data: { order, message: 'Purchase order received and inventory updated' },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Cancel purchase order
// @route   PUT /api/purchase-orders/:id/cancel
// @access  Private (admin only)
export const cancelPurchaseOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: 'Purchase order not found' },
      });
      return;
    }

    if (order.status === 'received') {
      res.status(400).json({
        success: false,
        error: { message: 'Cannot cancel received orders' },
      });
      return;
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      data: { order, message: 'Purchase order cancelled successfully' },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get purchase order statistics
// @route   GET /api/purchase-orders/stats
// @access  Private
export const getPurchaseOrderStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalOrders = await PurchaseOrder.count();
    const pendingOrders = await PurchaseOrder.count({ where: { status: 'pending' } });
    const approvedOrders = await PurchaseOrder.count({ where: { status: 'approved' } });
    const receivedOrders = await PurchaseOrder.count({ where: { status: 'received' } });

    // Calculate total purchase value
    const orders = await PurchaseOrder.findAll({
      where: { status: 'received' },
      attributes: ['totalAmount'],
    } as any);

    const totalPurchaseValue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        approvedOrders,
        receivedOrders,
        totalPurchaseValue,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

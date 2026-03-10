import { Response, NextFunction } from 'express';
import { Inventory, Medicine } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { Op } from 'sequelize';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
export const getInventory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, medicineId, expiringSoon, page = 1, limit = 20 } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (medicineId) {
      where.medicineId = medicineId;
    }

    // Get items expiring in next 30 days
    if (expiringSoon === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.expiryDate = {
        [Op.lte]: thirtyDaysFromNow,
        [Op.gt]: new Date(),
      };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: inventory } = await Inventory.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      include: [{ model: Medicine, as: 'medicine' }],
      order: [['expiryDate', 'ASC']],
    } as any);

    res.status(200).json({
      success: true,
      data: {
        inventory,
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

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
export const getInventoryItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Inventory.findByPk(req.params.id, {
      include: [{ model: Medicine, as: 'medicine' }],
    } as any);

    if (!item) {
      res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { item },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Add inventory item
// @route   POST /api/inventory
// @access  Private (inventory_manager, admin)
export const addInventoryItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { purchasePrice, supplierId, ...rest } = req.body;
    const item = await Inventory.create({
      ...rest,
      unitPrice: purchasePrice ?? rest.unitPrice,
      supplierId: supplierId || undefined,
    });

    res.status(201).json({
      success: true,
      data: { item },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (inventory_manager, admin)
export const updateInventoryItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Inventory.findByPk(req.params.id);

    if (!item) {
      res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' },
      });
      return;
    }

    const { purchasePrice, supplierId, ...rest } = req.body;
    const updateData = { ...rest };
    if (purchasePrice !== undefined) updateData.unitPrice = purchasePrice;
    if (supplierId) updateData.supplierId = supplierId;

    await item.update(updateData);

    res.status(200).json({
      success: true,
      data: { item },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (admin)
export const deleteInventoryItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Inventory.findByPk(req.params.id);

    if (!item) {
      res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' },
      });
      return;
    }

    await item.destroy();

    res.status(200).json({
      success: true,
      data: { message: 'Inventory item deleted successfully' },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get low stock items
// @route   GET /api/inventory/alerts/low-stock
// @access  Private
export const getLowStockItems = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lowStockItems = await Inventory.findAll({
      where: {
        status: 'low_stock',
      },
      include: [{ model: Medicine, as: 'medicine' }],
      order: [['quantity', 'ASC']],
    } as any);

    res.status(200).json({
      success: true,
      data: { items: lowStockItems, count: lowStockItems.length },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Check stock availability for medicines
// @route   POST /api/inventory/check
// @access  Private
export const checkAvailability = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { items } = req.body; // Array of { medicineId, quantity }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide items array with medicineId and quantity' },
      });
      return;
    }

    const availabilityCheck = [];

    for (const item of items) {
      const { medicineId, quantity } = item;

      if (!medicineId || !quantity) {
        availabilityCheck.push({
          medicineId,
          available: false,
          message: 'Invalid request format',
        });
        continue;
      }

      // Get all inventory items for this medicine that are in stock and not expired
      const inventoryItems = await Inventory.findAll({
        where: {
          medicineId,
          status: { [Op.in]: ['in_stock', 'low_stock'] },
          expiryDate: { [Op.gt]: new Date() },
        },
        include: [{ model: Medicine, as: 'medicine' }],
        order: [['expiryDate', 'ASC']], // FIFO - First to expire should be sold first
      } as any);

      const totalAvailable = inventoryItems.reduce((sum, inv) => sum + inv.quantity, 0);

      if (totalAvailable >= quantity) {
        availabilityCheck.push({
          medicineId,
          available: true,
          requestedQuantity: quantity,
          availableQuantity: totalAvailable,
          batches: inventoryItems.map((inv) => ({
            batchNumber: inv.batchNumber,
            quantity: inv.quantity,
            expiryDate: inv.expiryDate,
          })),
        });
      } else if (totalAvailable > 0) {
        // Partial availability
        availabilityCheck.push({
          medicineId,
          available: false,
          requestedQuantity: quantity,
          availableQuantity: totalAvailable,
          shortage: quantity - totalAvailable,
          message: 'Partial stock available',
          batches: inventoryItems.map((inv) => ({
            batchNumber: inv.batchNumber,
            quantity: inv.quantity,
            expiryDate: inv.expiryDate,
          })),
        });
      } else {
        // Out of stock
        availabilityCheck.push({
          medicineId,
          available: false,
          requestedQuantity: quantity,
          availableQuantity: 0,
          message: 'Out of stock',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: { availabilityCheck },
    });
  } catch (error: any) {
    next(error);
  }
};

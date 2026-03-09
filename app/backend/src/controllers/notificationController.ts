import { Response, NextFunction } from 'express';
import { Notification, User, Inventory, Prescription, Medicine } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { Op } from 'sequelize';

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { isRead, type, priority, page = 1, limit = 20 } = req.query;

    const where: any = { userId: req.user!.id };

    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    if (type) {
      where.type = type;
    }

    if (priority) {
      where.priority = priority;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    } as any);

    const unreadCount = await Notification.count({
      where: { userId: req.user!.id, isRead: false },
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
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

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    } as any);

    if (!notification) {
      res.status(404).json({
        success: false,
        error: { message: 'Notification not found' },
      });
      return;
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      data: { notification },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          userId: req.user!.id,
          isRead: false,
        },
      } as any
    );

    res.status(200).json({
      success: true,
      data: { message: 'All notifications marked as read' },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    } as any);

    if (!notification) {
      res.status(404).json({
        success: false,
        error: { message: 'Notification not found' },
      });
      return;
    }

    await notification.destroy();

    res.status(200).json({
      success: true,
      data: { message: 'Notification deleted successfully' },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Create notification (system use)
// @route   POST /api/notifications
// @access  Private (admin only)
export const createNotification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, type, title, message, priority, actionUrl, metadata } = req.body;

    if (!userId || !type || !title || !message) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide userId, type, title, and message' },
      });
      return;
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      priority: priority || 'medium',
      actionUrl: actionUrl || null,
      metadata: metadata || null,
      isRead: false,
    });

    res.status(201).json({
      success: true,
      data: { notification },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Generate system notifications (low stock, expiring items, pending prescriptions)
// @route   POST /api/notifications/generate
// @access  Private (admin, inventory_manager)
export const generateSystemNotifications = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications: any[] = [];

    // Get admin and inventory manager users
    const users = await User.findAll({
      where: {
        role: { [Op.in]: ['admin', 'staff'] },
        isActive: true,
      },
    } as any);

    // Check for low stock items
    const lowStockItems: any = await Inventory.findAll({
      where: { status: 'low_stock' },
      include: [{ model: Medicine, as: 'medicine' }],
    } as any);

    for (const item of lowStockItems) {
      for (const user of users) {
        const existing = await Notification.findOne({
          where: {
            userId: user.id,
            type: 'low_stock',
            'metadata.medicineId': item.medicineId,
            isRead: false,
          },
        } as any);

        if (!existing) {
          const priority = item.quantity < 5 ? 'critical' : 'high';
          notifications.push({
            userId: user.id,
            type: 'low_stock' as const,
            title: 'Low Stock Alert',
            message: `${item.medicine.name} is running low (${item.quantity} remaining)`,
            priority,
            actionUrl: `/inventory/${item.id}`,
            metadata: { medicineId: item.medicineId, inventoryId: item.id, quantity: item.quantity },
            isRead: false,
          });
        }
      }
    }

    // Check for expiring items (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringItems: any = await Inventory.findAll({
      where: {
        expiryDate: {
          [Op.lte]: thirtyDaysFromNow,
          [Op.gt]: new Date(),
        },
      },
      include: [{ model: Medicine, as: 'medicine' }],
    } as any);

    for (const item of expiringItems) {
      for (const user of users) {
        const existing = await Notification.findOne({
          where: {
            userId: user.id,
            type: 'expiring_soon',
            'metadata.inventoryId': item.id,
            isRead: false,
          },
        } as any);

        if (!existing) {
          const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const priority = daysUntilExpiry < 7 ? 'critical' : daysUntilExpiry < 14 ? 'high' : 'medium';
          notifications.push({
            userId: user.id,
            type: 'expiring_soon' as const,
            title: 'Medicine Expiring Soon',
            message: `${item.medicine.name} (Batch: ${item.batchNumber}) expires in ${daysUntilExpiry} days`,
            priority,
            actionUrl: `/inventory/${item.id}`,
            metadata: { medicineId: item.medicineId, inventoryId: item.id, expiryDate: item.expiryDate },
            isRead: false,
          });
        }
      }
    }

    // Check for pending prescriptions
    const pharmacists = await User.findAll({
      where: {
        role: { [Op.in]: ['admin', 'staff'] },
        isActive: true,
      },
    } as any);

    const pendingPrescriptions = await Prescription.findAll({
      where: { status: 'pending' },
      limit: 10,
    } as any);

    for (const prescription of pendingPrescriptions) {
      for (const user of pharmacists) {
        const existing = await Notification.findOne({
          where: {
            userId: user.id,
            type: 'prescription_pending',
            'metadata.prescriptionId': prescription.id,
            isRead: false,
          },
        } as any);

        if (!existing) {
          notifications.push({
            userId: user.id,
            type: 'prescription_pending' as const,
            title: 'Prescription Awaiting Verification',
            message: `Prescription for ${prescription.patientName} is pending verification`,
            priority: 'medium' as const,
            actionUrl: `/prescriptions/${prescription.id}`,
            metadata: { prescriptionId: prescription.id, patientName: prescription.patientName },
            isRead: false,
          });
        }
      }
    }

    // Bulk create notifications
    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications as any);
    }

    res.status(200).json({
      success: true,
      data: {
        message: `Generated ${notifications.length} system notifications`,
        count: notifications.length,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

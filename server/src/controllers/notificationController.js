import { PrismaClient } from '@prisma/client';
import { enrichAssets } from '../services/depreciationService.js';

const prisma = new PrismaClient();

/**
 * GET /api/notifications
 * List notifications with pagination and optional unread filter.
 */
export async function listNotifications(req, res, next) {
  try {
    const { page = '1', pageSize = '20', unread } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 20));
    const skip = (pageNum - 1) * size;

    const where = {};
    if (unread === 'true') where.isRead = false;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          relatedAsset: {
            select: { name: true, assetTag: true },
          },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      success: true,
      data: notifications,
      meta: { total, page: pageNum, pageSize: size, totalPages: Math.ceil(total / size) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications.
 */
export async function getUnreadCount(req, res, next) {
  try {
    const count = await prisma.notification.count({ where: { isRead: false } });
    res.json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id: parseInt(id, 10) },
      data: { isRead: true },
    });
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read.
 */
export async function markAllAsRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'NOTIFICATIONS_CLEARED',
        entity: 'Notification',
        details: 'Marked all notifications as read',
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, data: { message: 'All notifications marked as read.' } });
  } catch (err) {
    next(err);
  }
}

/**
 * Auto-generate depreciation and warranty warning notifications.
 * Called internally — checks assets and creates warnings if needed.
 */
export async function generateAutoNotifications() {
  try {
    const assets = await prisma.asset.findMany();
    const enriched = enrichAssets(assets);
    const now = new Date();

    for (const asset of enriched) {
      // Depreciation warning: if percent remaining < 15% and not retired
      if (
        asset.depreciation.percentRemaining < 15 &&
        asset.depreciation.percentRemaining > 0 &&
        asset.status !== 'RETIRED'
      ) {
        const existing = await prisma.notification.findFirst({
          where: {
            type: 'DEPRECIATION_WARNING',
            relatedAssetId: asset.id,
            createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }, // within last 7 days
          },
        });

        if (!existing) {
          await prisma.notification.create({
            data: {
              type: 'DEPRECIATION_WARNING',
              title: `Asset Depreciation Warning: ${asset.name}`,
              description: `${asset.assetTag} has reached ${asset.depreciation.percentRemaining.toFixed(1)}% of its value. Consider scheduling replacement.`,
              relatedAssetId: asset.id,
            },
          });
        }
      }

      // Warranty expiring: within 30 days
      if (asset.warrantyExpiry) {
        const warrantyDate = new Date(asset.warrantyExpiry);
        const daysUntilExpiry = Math.ceil((warrantyDate - now) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
          const existing = await prisma.notification.findFirst({
            where: {
              type: 'WARRANTY_EXPIRING',
              relatedAssetId: asset.id,
              createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
            },
          });

          if (!existing) {
            await prisma.notification.create({
              data: {
                type: 'WARRANTY_EXPIRING',
                title: `Warranty Expiring: ${asset.name}`,
                description: `${asset.assetTag} warranty expires in ${daysUntilExpiry} days. Review renewal options.`,
                relatedAssetId: asset.id,
              },
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Auto-notification generation error:', err.message);
  }
}

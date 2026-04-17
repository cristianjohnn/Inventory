import { PrismaClient } from '@prisma/client';
import { enrichAssets } from '../services/depreciationService.js';

const prisma = new PrismaClient();

/**
 * GET /api/search?q=<query>
 * Search across assets, departments, and activity logs.
 */
export async function searchAll(req, res, next) {
  try {
    const { q = '' } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, data: { assets: [], activityLogs: [] } });
    }

    // Search assets
    const assets = await prisma.asset.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { assetTag: { contains: q, mode: 'insensitive' } },
          { serialNumber: { contains: q, mode: 'insensitive' } },
          { assignedEmployee: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 8,
      orderBy: { updatedAt: 'desc' },
    });

    const enrichedAssets = enrichAssets(assets);

    // Search activity logs
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        OR: [
          { details: { contains: q, mode: 'insensitive' } },
          { action: { contains: q, mode: 'insensitive' } },
          { entity: { contains: q, mode: 'insensitive' } },
          { user: { firstName: { contains: q, mode: 'insensitive' } } },
          { user: { lastName: { contains: q, mode: 'insensitive' } } },
        ],
      },
      take: 5,
      orderBy: { timestamp: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    res.json({
      success: true,
      data: {
        assets: enrichedAssets.map(a => ({
          id: a.id,
          name: a.name,
          assetTag: a.assetTag,
          category: a.category,
          status: a.status,
          department: a.department,
          assignedEmployee: a.assignedEmployee,
          currentValue: a.depreciation.currentValue,
        })),
        activityLogs: activityLogs.map(l => ({
          id: l.id,
          action: l.action,
          entity: l.entity,
          details: l.details,
          timestamp: l.timestamp,
          userName: `${l.user.firstName} ${l.user.lastName}`,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/activity-logs
 * List all user activity logs with search, filtering, and pagination.
 */
export async function listActivityLogs(req, res, next) {
  try {
    const {
      search = '',
      entity,
      action,
      startDate,
      endDate,
      page = '1',
      pageSize = '25',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25));
    const skip = (pageNum - 1) * size;

    const where = {};

    // Search across details, action, entity
    if (search) {
      where.OR = [
        { details: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { entity: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (entity) where.entity = entity;
    if (action) where.action = action;

    // Date/time range filter
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: size,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
      meta: { total, page: pageNum, pageSize: size, totalPages: Math.ceil(total / size) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/activity-logs/stats
 * Get summary stats for activity logs.
 */
export async function getActivityStats(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalToday, uniqueEntities, recentActions] = await Promise.all([
      prisma.activityLog.count({ where: { timestamp: { gte: today } } }),
      prisma.activityLog.groupBy({ by: ['entity'], _count: true, orderBy: { _count: { entity: 'desc' } } }),
      prisma.activityLog.groupBy({ by: ['action'], _count: true, orderBy: { _count: { action: 'desc' } }, take: 10 }),
    ]);

    res.json({
      success: true,
      data: {
        totalToday,
        entityBreakdown: uniqueEntities.map(e => ({ entity: e.entity, count: e._count })),
        actionBreakdown: recentActions.map(a => ({ action: a.action, count: a._count })),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Helper: Log an activity from any controller.
 */
export async function logActivity(userId, action, entity, entityId, details, ipAddress) {
  try {
    await prisma.activityLog.create({
      data: { userId, action, entity, entityId, details, ipAddress },
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
}

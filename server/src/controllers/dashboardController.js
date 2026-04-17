import { PrismaClient } from '@prisma/client';
import { enrichAssets } from '../services/depreciationService.js';

const prisma = new PrismaClient();

/**
 * GET /api/dashboard
 * Returns aggregate stats for the dashboard.
 */
export async function getDashboard(req, res, next) {
  try {
    // Get all assets for depreciation calculation
    const assets = await prisma.asset.findMany();
    const enriched = enrichAssets(assets);

    // Count by status
    const statusCounts = {
      total: assets.length,
      inUse: assets.filter((a) => a.status === 'IN_USE').length,
      available: assets.filter((a) => a.status === 'AVAILABLE').length,
      underRepair: assets.filter((a) => a.status === 'UNDER_REPAIR').length,
      retired: assets.filter((a) => a.status === 'RETIRED').length,
    };

    // Portfolio values
    const portfolio = {
      totalOriginalValue: enriched.reduce((sum, a) => sum + a.depreciation.originalValue, 0),
      totalCurrentValue: enriched.reduce((sum, a) => sum + a.depreciation.currentValue, 0),
      totalProjectedNextMonth: enriched.reduce(
        (sum, a) => sum + a.depreciation.projectedNextMonth,
        0
      ),
      totalDepreciated: enriched.reduce((sum, a) => sum + a.depreciation.totalDepreciated, 0),
    };

    // Round portfolio values
    Object.keys(portfolio).forEach((key) => {
      portfolio[key] = Math.round(portfolio[key] * 100) / 100;
    });

    // Value by category
    const categoryValues = {};
    enriched.forEach((a) => {
      if (!categoryValues[a.category]) {
        categoryValues[a.category] = { original: 0, current: 0, count: 0 };
      }
      categoryValues[a.category].original += a.depreciation.originalValue;
      categoryValues[a.category].current += a.depreciation.currentValue;
      categoryValues[a.category].count += 1;
    });

    // Recent activity (last 10 audit log entries)
    const recentActivity = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        asset: {
          select: { name: true, assetTag: true },
        },
      },
    });

    // Expiring warranties (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringWarranties = enriched
      .filter((a) => a.warrantyExpiry && new Date(a.warrantyExpiry) > now && new Date(a.warrantyExpiry) <= thirtyDaysFromNow)
      .map(a => ({
        id: a.id,
        name: a.name,
        assetTag: a.assetTag,
        daysLeft: Math.ceil((new Date(a.warrantyExpiry) - now) / (1000 * 60 * 60 * 24)),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft);

    // 6 Month Trend (Simple straight line projection based on current monthly loss)
    const monthlyDepreciation = portfolio.totalCurrentValue - portfolio.totalProjectedNextMonth;
    const trend = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let currentVal = portfolio.totalCurrentValue;
    
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      trend.push({
        month: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,
        value: currentVal
      });
      currentVal = Math.max(0, currentVal - monthlyDepreciation);
    }

    res.json({
      success: true,
      data: {
        statusCounts,
        portfolio,
        categoryValues,
        recentActivity,
        expiringWarranties,
        trend,
      },
    });
  } catch (err) {
    next(err);
  }
}

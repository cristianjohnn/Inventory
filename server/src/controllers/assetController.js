import { PrismaClient } from '@prisma/client';
import { enrichAsset, enrichAssets } from '../services/depreciationService.js';

const prisma = new PrismaClient();

// =============================================
// Asset CRUD Controllers
// =============================================

/**
 * GET /api/assets
 * List all assets with computed depreciation, pagination, search, and filters.
 */
export async function listAssets(req, res, next) {
  try {
    const {
      search = '',
      status,
      category,
      page = '1',
      pageSize = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
    const skip = (pageNum - 1) * size;

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { assignedEmployee: { contains: search, mode: 'insensitive' } },
        { assetTag: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.asset.count({ where }),
    ]);

    res.json({
      success: true,
      data: enrichAssets(assets),
      meta: {
        total,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(total / size),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/assets/:id
 * Get a single asset with computed depreciation.
 */
export async function getAsset(req, res, next) {
  try {
    const { id } = req.params;
    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Asset not found.' },
      });
    }

    res.json({ success: true, data: enrichAsset(asset) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/assets
 * Create a new asset with auto-generated asset tag.
 */
export async function createAsset(req, res, next) {
  try {
    const data = req.validatedBody;

    // Auto-generate asset tag
    const lastAsset = await prisma.asset.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });
    const nextId = (lastAsset?.id || 0) + 1;
    const assetTag = `IT-ASSET-${String(nextId).padStart(4, '0')}`;

    const asset = await prisma.asset.create({
      data: {
        ...data,
        assetTag,
        purchaseDate: new Date(data.purchaseDate),
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        assetId: asset.id,
        action: 'CREATED',
        details: `Asset "${asset.name}" created with tag ${assetTag}`,
      },
    });

    res.status(201).json({ success: true, data: enrichAsset(asset) });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/assets/:id
 * Update an existing asset.
 */
export async function updateAsset(req, res, next) {
  try {
    const { id } = req.params;
    const data = req.validatedBody;

    // Convert date strings if provided
    if (data.purchaseDate) data.purchaseDate = new Date(data.purchaseDate);
    if (data.warrantyExpiry) data.warrantyExpiry = new Date(data.warrantyExpiry);

    const existing = await prisma.asset.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Asset not found.' },
      });
    }

    const asset = await prisma.asset.update({
      where: { id: parseInt(id, 10) },
      data,
    });

    // Create audit log for status changes
    if (data.status && data.status !== existing.status) {
      await prisma.auditLog.create({
        data: {
          assetId: asset.id,
          action: 'STATUS_CHANGED',
          details: `Status changed from ${existing.status} to ${data.status}`,
        },
      });
    }

    // General update log
    await prisma.auditLog.create({
      data: {
        assetId: asset.id,
        action: 'UPDATED',
        details: `Asset "${asset.name}" updated`,
      },
    });

    res.json({ success: true, data: enrichAsset(asset) });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/assets/:id
 * Delete an asset (cascade deletes audit logs).
 */
export async function deleteAsset(req, res, next) {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Asset not found.' },
      });
    }

    await prisma.asset.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({
      success: true,
      data: { message: `Asset "${asset.name}" (${asset.assetTag}) deleted successfully.` },
    });
  } catch (err) {
    next(err);
  }
}

// =============================================
// Assignment Controllers
// =============================================

/**
 * POST /api/assets/:id/assign
 * Assign an employee to an asset.
 */
export async function assignEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const { employeeName } = req.validatedBody;

    const existing = await prisma.asset.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Asset not found.' },
      });
    }

    const wasReassigned = existing.assignedEmployee && existing.assignedEmployee !== employeeName;

    const asset = await prisma.asset.update({
      where: { id: parseInt(id, 10) },
      data: {
        assignedEmployee: employeeName,
        status: 'IN_USE',
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        assetId: asset.id,
        action: wasReassigned ? 'REASSIGNED' : 'ASSIGNED',
        employeeName,
        details: wasReassigned
          ? `Reassigned from "${existing.assignedEmployee}" to "${employeeName}"`
          : `Assigned to "${employeeName}"`,
      },
    });

    res.json({ success: true, data: enrichAsset(asset) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/assets/:id/unassign
 * Remove employee assignment and set status to Available.
 */
export async function unassignEmployee(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.asset.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Asset not found.' },
      });
    }

    if (!existing.assignedEmployee) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Asset is not assigned to anyone.' },
      });
    }

    const previousEmployee = existing.assignedEmployee;

    const asset = await prisma.asset.update({
      where: { id: parseInt(id, 10) },
      data: {
        assignedEmployee: null,
        status: 'AVAILABLE',
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        assetId: asset.id,
        action: 'UNASSIGNED',
        employeeName: previousEmployee,
        details: `Unassigned from "${previousEmployee}"`,
      },
    });

    res.json({ success: true, data: enrichAsset(asset) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/assets/:id/history
 * Get audit log for an asset.
 */
export async function getAssetHistory(req, res, next) {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Asset not found.' },
      });
    }

    const logs = await prisma.auditLog.findMany({
      where: { assetId: parseInt(id, 10) },
      orderBy: { timestamp: 'desc' },
    });

    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}

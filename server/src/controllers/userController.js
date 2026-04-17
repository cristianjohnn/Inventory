import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * GET /api/users/me
 * Get current user profile (full data).
 */
export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        preferences: true,
        lastPasswordChanged: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found.' },
      });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/me
 * Update current user's profile (name, department).
 */
export async function updateProfile(req, res, next) {
  try {
    const { firstName, lastName, department } = req.body;
    const updateData = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (department !== undefined) updateData.department = department || null;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        preferences: true,
        lastPasswordChanged: true,
        createdAt: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'PROFILE_UPDATED',
        entity: 'User',
        entityId: req.user.id,
        details: `Profile updated: ${Object.keys(updateData).join(', ')}`,
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/me/password
 * Change current user's password.
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Current password and new password are required.' },
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'New password must be at least 6 characters.' },
      });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect.' },
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash, lastPasswordChanged: new Date() },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'PASSWORD_CHANGED',
        entity: 'User',
        entityId: req.user.id,
        details: 'Password changed successfully',
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, data: { message: 'Password changed successfully.' } });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/me/preferences
 * Update user preferences (notification toggles, UI settings).
 */
export async function updatePreferences(req, res, next) {
  try {
    const { preferences } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { preferences: preferences || {} },
      select: {
        id: true,
        preferences: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

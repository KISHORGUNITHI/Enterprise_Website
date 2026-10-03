import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import prisma from '../../../config/prisma.js';

export class AdminProfileController {
  /**
   * GET /api/admin/profile
   * Fetch latest admin profile details from database
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          phone_number: true,
          gender: true,
          role: true,
          created_at: true,
          updated_at: true
        }
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const initials = (user.username || 'AU')
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'AU';

      return res.json({
        success: true,
        data: {
          ...user,
          avatar: initials
        }
      });
    } catch (err) {
      console.error('[AdminProfileController.getProfile Error]:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch admin profile' });
    }
  }

  /**
   * PUT /api/admin/profile
   * Update admin personal details (username, email, phone_number) in database
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { username, email, phone } = req.body;

      if (!username || !username.trim()) {
        return res.status(400).json({ success: false, message: 'Username is required.' });
      }
      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: 'Email address is required.' });
      }

      const cleanUsername = username.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = phone ? phone.trim() : '';

      // Check email uniqueness if modified
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: { equals: cleanEmail, mode: 'insensitive' },
          NOT: { id: userId }
        }
      });
      if (existingEmail) {
        return res.status(409).json({ success: false, message: 'Email address is already in use by another account.' });
      }

      // Check phone uniqueness if provided and modified
      if (cleanPhone) {
        const existingPhone = await prisma.user.findFirst({
          where: {
            phone_number: cleanPhone,
            NOT: { id: userId }
          }
        });
        if (existingPhone) {
          return res.status(409).json({ success: false, message: 'Phone number is already in use by another account.' });
        }
      }

      const updateData = {
        username: cleanUsername,
        email: cleanEmail
      };
      if (cleanPhone) {
        updateData.phone_number = cleanPhone;
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          phone_number: true,
          gender: true,
          role: true,
          created_at: true,
          updated_at: true
        }
      });

      // Re-sign JWT cookie so current session has updated claims
      const token = jwt.sign(
        {
          userId: updated.id,
          email: updated.email,
          role: updated.role,
          username: updated.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      const initials = updated.username
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'AU';

      return res.json({
        success: true,
        message: 'Admin profile updated successfully',
        data: {
          ...updated,
          avatar: initials
        }
      });
    } catch (err) {
      console.error('[AdminProfileController.updateProfile Error]:', err);
      if (err.code === 'P2002') {
        return res.status(409).json({ success: false, message: 'Email or phone number already in use.' });
      }
      return res.status(500).json({ success: false, message: 'Failed to update admin profile.' });
    }
  }

  /**
   * PUT /api/admin/profile/password
   * Verify current password and update new password in database
   */
  async updatePassword(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Please enter your current password.' });
      }
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
      }
      if (!/\d/.test(newPassword)) {
        return res.status(400).json({ success: false, message: 'New password must contain at least one number.' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password_hash: true }
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'Admin user not found.' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password_hash: hashedPassword }
      });

      return res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (err) {
      console.error('[AdminProfileController.updatePassword Error]:', err);
      return res.status(500).json({ success: false, message: 'Failed to update password.' });
    }
  }
}

export default new AdminProfileController();

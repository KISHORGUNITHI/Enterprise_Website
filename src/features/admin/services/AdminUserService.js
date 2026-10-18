import { AdminUserRepository } from '../repositories/AdminUserRepository.js';

export class AdminUserService {
  constructor() {
    this.repository = new AdminUserRepository();
  }

  /**
   * List users with optional filters
   * Query params: search (username/email), role (USER/ADMIN), page, limit
   */
  async list(filters = {}) {
    try {
      const where = {};

      // Search by username or email
      if (filters.search) {
        where.OR = [
          { username: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      // Filter by role
      if (filters.role && ['USER', 'ADMIN'].includes(filters.role)) {
        where.role = filters.role;
      }

      // Pagination
      const page = Math.max(1, parseInt(filters.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
      const skip = (page - 1) * limit;

      const { users, total } = await this.repository.findAll(where, skip, limit);

      return {
        success: true,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        count: users.length,
        data: users
      };
    } catch (err) {
      const error = new Error(`Failed to fetch users: ${err.message}`);
      error.status = 500;
      throw error;
    }
  }

  /**
   * Get user details with addresses and orders
   */
  async getDetail(userId) {
    try {
      const user = await this.repository.findById(userId);

      if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
      }

      // Compute total spent
      const totalSpent = await this.repository.getUserTotalSpent(userId);

      return {
        success: true,
        data: {
          ...user,
          totalSpent: parseFloat(totalSpent),
          orders: (user.orders || []).map(o => ({
            ...o,
            totalAmount: parseFloat(o.totalAmount),
            items: (o.items || []).map(item => ({
              ...item,
              unitPrice: parseFloat(item.unitPrice)
            }))
          })),
          stats: {
            addressCount: user.addresses.length,
            orderCount: user.orders.length
          }
        }
      };
    } catch (err) {
      const error = err.status ? err : new Error(`Failed to fetch user: ${err.message}`);
      if (!error.status) error.status = 500;
      throw error;
    }
  }
}

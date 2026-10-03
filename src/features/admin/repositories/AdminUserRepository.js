import prisma from '../../../config/prisma.js';

export class AdminUserRepository {
  /**
   * Find all users with optional filters
   */
  async findAll(where = {}, skip = 0, take = 20, orderBy = { created_at: 'desc' }) {
    const users = await prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        username: true,
        email: true,
        gender: true,
        role: true,
        phone_number: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            addresses: true,
            orders: true
          }
        }
      }
    });

    const total = await prisma.user.count({ where });

    return {
      users: users.map(u => ({
        ...u,
        addressCount: u._count.addresses,
        orderCount: u._count.orders,
        _count: undefined
      })),
      total
    };
  }

  /**
   * Find user by ID with full details
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        gender: true,
        role: true,
        phone_number: true,
        created_at: true,
        updated_at: true,
        addresses: {
          select: {
            id: true,
            full_name: true,
            phone_number: true,
            address_line_1: true,
            address_line_2: true,
            city: true,
            state: true,
            postal_code: true,
            country: true,
            landmark: true,
            is_default: true,
            created_at: true
          }
        },
        orders: {
          select: {
            id: true,
            shortId: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            items: {
              select: {
                id: true,
                productId: true,
                productName: true,
                quantity: true,
                unitPrice: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });
  }

  /**
   * Get total spent by user
   */
  async getUserTotalSpent(userId) {
    const result = await prisma.order.aggregate({
      where: { userId },
      _sum: { totalAmount: true }
    });
    return result._sum.totalAmount || 0;
  }
}

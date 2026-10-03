import { AdminOrderRepository } from '../repositories/AdminOrderRepository.js';

export class AdminOrderService {
  constructor() {
    this.repository = new AdminOrderRepository();
  }

  /**
   * List orders with optional filters
   * Query params: status (PROCESSING/CONFIRMED/OUT_FOR_DELIVERY/DELIVERED/CANCELLED), search (shortId/email), page, limit
   */
  async list(filters = {}) {
    try {
      const where = {};

      // Filter by status
      const validStatuses = ['PROCESSING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
      if (filters.status && validStatuses.includes(filters.status)) {
        where.status = filters.status;
      }

      // Search by shortId or user email
      if (filters.search) {
        where.OR = [
          { shortId: { contains: filters.search, mode: 'insensitive' } },
          { user: { email: { contains: filters.search, mode: 'insensitive' } } }
        ];
      }

      // Pagination
      const page = Math.max(1, parseInt(filters.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
      const skip = (page - 1) * limit;

      const { orders, total } = await this.repository.findAll(where, skip, limit);

      return {
        success: true,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        count: orders.length,
        data: orders
      };
    } catch (err) {
      const error = new Error(`Failed to fetch orders: ${err.message}`);
      error.status = 500;
      throw error;
    }
  }

  /**
   * Get order details with items and user info
   */
  async getDetail(orderId) {
    try {
      const order = await this.repository.findById(orderId);

      if (!order) {
        const error = new Error('Order not found');
        error.status = 404;
        throw error;
      }

      return {
        success: true,
        data: {
          ...order,
          totalAmount: parseFloat(order.totalAmount),
          subtotal: parseFloat(order.subtotal),
          discountAmount: parseFloat(order.discountAmount),
          deliveryFee: parseFloat(order.deliveryFee),
          items: order.items.map(item => ({
            ...item,
            unitPrice: parseFloat(item.unitPrice),
            lineTotal: parseFloat(item.lineTotal),
            review: item.review ? {
              id: item.review.id,
              rating: Number(item.review.rating),
              comment: item.review.comment || '',
              createdAt: item.review.createdAt,
              updatedAt: item.review.updatedAt
            } : null
          })),
          reviews: order.reviews || []
        }
      };
    } catch (err) {
      const error = err.status ? err : new Error(`Failed to fetch order: ${err.message}`);
      if (!error.status) error.status = 500;
      throw error;
    }
  }

  /**
   * Update order status
   * Valid statuses: PROCESSING, CONFIRMED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
   */
  async updateStatus(orderId, newStatus, cancelOptions = {}) {
    try {
      const validStatuses = ['PROCESSING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

      // Validate status
      if (!newStatus || !validStatuses.includes(newStatus)) {
        const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        error.status = 400;
        throw error;
      }

      // Check if order exists
      const existing = await this.repository.findById(orderId);
      if (!existing) {
        const error = new Error('Order not found');
        error.status = 404;
        throw error;
      }

      // Update status and deliveryDate if transitioning to DELIVERED
      const updateData = { status: newStatus };
      if (newStatus === 'DELIVERED' && !existing.deliveryDate) {
        updateData.deliveryDate = new Date().toISOString().split('T')[0];
      }

      if (newStatus === 'CANCELLED') {
        updateData.cancelReason = (cancelOptions.cancelReason && cancelOptions.cancelReason.trim())
          ? cancelOptions.cancelReason.trim()
          : 'Cancelled by store administrator';
        updateData.cancelledBy = 'ADMIN';
        updateData.cancelledAt = new Date();
      }

      const order = await this.repository.update(orderId, updateData);

      return {
        success: true,
        message: `Order status updated to ${newStatus}`,
        data: {
          ...order,
          totalAmount: parseFloat(order.totalAmount),
          subtotal: parseFloat(order.subtotal),
          discountAmount: parseFloat(order.discountAmount),
          deliveryFee: parseFloat(order.deliveryFee),
          itemCount: order._count.items,
          _count: undefined
        }
      };
    } catch (err) {
      const error = err.status ? err : new Error(`Failed to update order status: ${err.message}`);
      if (!error.status) error.status = 500;
      throw error;
    }
  }
}

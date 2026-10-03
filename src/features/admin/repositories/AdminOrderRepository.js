import prisma from '../../../config/prisma.js';

export class AdminOrderRepository {
  /**
   * Find all orders with user and item count
   */
  async findAll(where = {}, skip = 0, take = 20, orderBy = { createdAt: 'desc' }) {
    const orders = await prisma.order.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        shortId: true,
        userId: true,
        status: true,
        subtotal: true,
        discountAmount: true,
        deliveryFee: true,
        totalAmount: true,
        paymentMethod: true,
        paymentStatus: true,
        deliveryDate: true,
        cancelReason: true,
        cancelledBy: true,
        cancelledAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone_number: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    });

    const total = await prisma.order.count({ where });

    return {
      orders: orders.map(o => ({
        ...o,
        itemCount: o._count.items,
        _count: undefined
      })),
      total
    };
  }

  /**
   * Find order by ID with all items, product details, and customer reviews
   */
  async findById(id) {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { shortId: id }]
      },
      select: {
        id: true,
        shortId: true,
        userId: true,
        status: true,
        subtotal: true,
        discountAmount: true,
        deliveryFee: true,
        totalAmount: true,
        paymentMethod: true,
        paymentStatus: true,
        shippingAddress: true,
        deliveryDate: true,
        cancelReason: true,
        cancelledBy: true,
        cancelledAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone_number: true,
            addresses: {
              select: {
                id: true,
                full_name: true,
                address_line_1: true,
                city: true,
                state: true
              }
            }
          }
        },
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            variantDescription: true,
            unitPrice: true,
            quantity: true,
            lineTotal: true,
            product: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    if (!order) return null;

    // Fetch reviews authored by this specific customer for ordered products
    const productIds = (order.items || []).map(i => i.productId).filter(Boolean);
    let reviews = [];
    if (productIds.length > 0 && order.userId) {
      reviews = await prisma.review.findMany({
        where: {
          userId: order.userId,
          productId: { in: productIds }
        },
        select: {
          id: true,
          productId: true,
          userId: true,
          rating: true,
          comment: true,
          createdAt: true,
          updatedAt: true
        }
      });
    }

    const itemsWithReviews = (order.items || []).map(item => {
      const rev = reviews.find(r => r.productId === item.productId);
      return {
        ...item,
        review: rev ? {
          id: rev.id,
          rating: Number(rev.rating),
          comment: rev.comment || '',
          createdAt: rev.createdAt,
          updatedAt: rev.updatedAt
        } : null
      };
    });

    return {
      ...order,
      items: itemsWithReviews,
      reviews: reviews.map(r => ({
        id: r.id,
        productId: r.productId,
        rating: Number(r.rating),
        comment: r.comment || '',
        createdAt: r.createdAt
      }))
    };
  }

  /**
   * Update order status
   */
  async update(id, data) {
    return prisma.order.update({
      where: { id },
      data,
      select: {
        id: true,
        shortId: true,
        userId: true,
        status: true,
        subtotal: true,
        discountAmount: true,
        deliveryFee: true,
        totalAmount: true,
        paymentMethod: true,
        paymentStatus: true,
        shippingAddress: true,
        deliveryDate: true,
        cancelReason: true,
        cancelledBy: true,
        cancelledAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone_number: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    });
  }
}

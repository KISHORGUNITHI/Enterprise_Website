import prisma from '../../../config/prisma.js';

export class AdminStatsRepository {
  /**
   * Count total products
   */
  async countProducts() {
    return prisma.product.count();
  }

  /**
   * Count total users
   */
  async countUsers() {
    return prisma.user.count();
  }

  /**
   * Count total orders
   */
  async countOrders() {
    return prisma.order.count();
  }

  /**
   * Sum total revenue from all orders
   */
  async sumRevenue() {
    const result = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      }
    });
    return result._sum.totalAmount || 0;
  }

  /**
   * Count products with low stock (availability = NOT_AVAILABLE)
   */
  async countLowStock() {
    return prisma.product.count({
      where: {
        OR: [
          { availability: 'NOT_AVAILABLE' },
          { stock: { lte: 5 } }
        ]
      },
    });
  }

  /**
   * Count orders with pending status
   * return prisma.order.count({
   * where:{
   * status:"Processing"}})
   */
  async countPendingOrders() {
    return prisma.order.count({
      where: {
        status: 'PROCESSING'
      }
    });
  }

  /**
   * Count active banners
   * return prisma.banners.count({
   * where:{
   * status:"Active"}})
   */
  async countActiveBanners() {
    return prisma.banner.count({
      where: {
        status: 'ACTIVE'
      }
    });
  }

  async countInactveBanner(){
    return prisma.banner.count({
      where:{
        status:"INACTIVE"
      }
    })
  }
}

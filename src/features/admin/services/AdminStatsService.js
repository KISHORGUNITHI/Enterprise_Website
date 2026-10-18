import { AdminStatsRepository } from '../repositories/AdminStatsRepository.js';

export class AdminStatsService {
  constructor() {
    this.repository = new AdminStatsRepository();
  }

  /**
   * Aggregate all stats using Promise.all for concurrent queries
   */
  async aggregate() {
    try {
      const [
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        lowStockProducts,
        pendingOrders,
        activeBanners
      ] = await Promise.all([
        this.repository.countProducts(),
        this.repository.countUsers(),
        this.repository.countOrders(),
        this.repository.sumRevenue(),
        this.repository.countLowStock(),
        this.repository.countPendingOrders(),
        this.repository.countActiveBanners()
      ]);

      return {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: parseFloat(totalRevenue),
        lowStockProducts,
        pendingOrders,
        activeBanners
      };
    } catch (err) {
      const error = new Error(`Failed to aggregate stats: ${err.message}`);
      error.status = 500;
      throw error;
    }
  }
}

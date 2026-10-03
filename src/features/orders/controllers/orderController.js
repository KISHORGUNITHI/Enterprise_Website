import { OrderService } from '../services/orderService.js';

export class OrderController {
  constructor() {
    this.orderService = new OrderService();
  }

  createOrder = async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      const { addressId, items, paymentMethod } = req.body;

      const result = await this.orderService.createOrder({
        userId,
        addressId,
        items,
        paymentMethod,
      });

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        data: result.order,
        shortId: result.order.shortId,
        addressSnapshot: result.addressSnapshot,
      });
    } catch (error) {
      console.error('Create order error:', error);
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Internal server error while creating order.',
      });
    }
  };

  getUserOrders = async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      const orders = await this.orderService.getUserOrders(userId);

      return res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error('Fetch user orders error:', error);
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Internal server error while fetching orders.',
      });
    }
  };

  getOrderDetail = async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      const { id } = req.params;

      const order = await this.orderService.getUserOrderById(userId, id);

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error('Fetch order detail error:', error);
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Internal server error while fetching order details.',
      });
    }
  };

  cancelOrder = async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      const { id } = req.params;
      const { reason } = req.body;

      const order = await this.orderService.cancelOrder(userId, id, { reason });

      return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully.',
        data: order,
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Internal server error while cancelling order.',
      });
    }
  };
}

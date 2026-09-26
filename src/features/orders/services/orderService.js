import { OrderRepository } from '../repositories/orderRepository.js';

export class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
  }

  /**
   * Generates a unique, human-friendly order short ID
   */
  generateShortId() {
    const timestamp = Date.now().toString().slice(-4);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${timestamp}${rand}`;
  }

  /**
   * Format address object into a comprehensive snapshot
   */
  formatAddressSnapshot(address) {
    return {
      id: address.id,
      full_name: address.full_name,
      phone_number: address.phone_number,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country || 'India',
      formatted: `${address.address_line_1}${address.address_line_2 ? ', ' + address.address_line_2 : ''}${address.landmark ? ', ' + address.landmark : ''}, ${address.city}, ${address.state} - ${address.postal_code}`,
    };
  }

  /**
   * Validates cart/checkout items and creates the order inside a DB transaction
   */
  async createOrder({ userId, addressId, items, paymentMethod = 'COD' }) {
    if (!userId) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }

    if (!addressId) {
      const error = new Error('A delivery address is required to place an order.');
      error.status = 400;
      throw error;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      const error = new Error('Your cart is empty. Please add items before placing an order.');
      error.status = 400;
      throw error;
    }

    // 1. Verify address ownership from database
    const address = await this.orderRepository.findUserAddress(userId, addressId);
    if (!address) {
      const error = new Error('Selected delivery address was not found or does not belong to your account.');
      error.status = 404;
      throw error;
    }

    const addressSnapshot = this.formatAddressSnapshot(address);

    // 2. Validate products and calculate authoritative DB prices
    const orderItemsData = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const idOrSlug = item.productId || item.id || item.slug;
      if (!idOrSlug) {
        const error = new Error('Invalid product identifier provided in items.');
        error.status = 400;
        throw error;
      }

      const quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity < 1) {
        const error = new Error(`Invalid quantity (${item.quantity}) for item.`);
        error.status = 400;
        throw error;
      }

      const product = await this.orderRepository.findProductByIdOrSlug(idOrSlug);
      if (!product) {
        const error = new Error(`Product "${item.name || idOrSlug}" was not found in our catalog.`);
        error.status = 404;
        throw error;
      }

      if (product.availability !== 'AVAILABLE') {
        const error = new Error(`Sorry, "${product.name}" is currently out of stock.`);
        error.status = 400;
        throw error;
      }

      // Check variant price override if variantId is specified
      let unitPrice = Number(product.price);
      let variantDesc = item.variantDescription || '';

      if (item.variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) {
          if (variant.priceOverride) {
            unitPrice = Number(variant.priceOverride);
          }
          if (!variantDesc && variant.attributeValues) {
            variantDesc = variant.attributeValues
              .map((av) => `${av.attribute.displayName || av.attribute.name}: ${av.displayValue || av.value}`)
              .join(', ');
          }
        }
      }

      if (isNaN(unitPrice) || unitPrice <= 0) {
        const error = new Error(`Invalid price configuration for product "${product.name}".`);
        error.status = 400;
        throw error;
      }

      const lineTotal = unitPrice * quantity;
      calculatedSubtotal += lineTotal;

      orderItemsData.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name,
        variantDescription: variantDesc,
        unitPrice,
        quantity,
        lineTotal,
      });
    }

    // 3. Calculate final amounts
    const subtotal = calculatedSubtotal;
    const discountAmount = 0; // Promotional discount if applicable
    const deliveryFee = 0;   // Free delivery
    const totalAmount = subtotal - discountAmount + deliveryFee;

    const shortId = this.generateShortId();

    const orderData = {
      shortId,
      subtotal,
      discountAmount,
      deliveryFee,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed',
      deliveryDate: '3-5 Business Days',
    };

    // 4. Save to database in a transaction
    const createdOrder = await this.orderRepository.createOrder({
      userId,
      shippingAddressSnapshot: addressSnapshot.formatted,
      orderData,
      orderItemsData,
    });

    return {
      order: createdOrder,
      addressSnapshot,
    };
  }

  /**
   * Get all orders for the authenticated user
   */
  async getUserOrders(userId) {
    if (!userId) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }
    return this.orderRepository.getUserOrders(userId);
  }

  /**
   * Get single order details for the authenticated user
   */
  async getUserOrderById(userId, orderId) {
    if (!userId) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }
    const order = await this.orderRepository.getUserOrderById(userId, orderId);
    if (!order) {
      const error = new Error('Order not found or unauthorized');
      error.status = 404;
      throw error;
    }
    return order;
  }

  /**
   * Cancel an active order for the authenticated user
   */
  async cancelOrder(userId, orderId, { reason } = {}) {
    if (!userId) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }
    const order = await this.orderRepository.getUserOrderById(userId, orderId);
    if (!order) {
      const error = new Error('Order not found or unauthorized');
      error.status = 404;
      throw error;
    }

    const currentStatus = (order.status || '').toUpperCase();
    if (currentStatus === 'DELIVERED') {
      const error = new Error('Delivered orders cannot be cancelled.');
      error.status = 400;
      throw error;
    }

    if (currentStatus === 'CANCELLED') {
      const error = new Error('This order is already cancelled.');
      error.status = 400;
      throw error;
    }

    const cancelReason = (reason && reason.trim()) ? reason.trim() : 'Cancelled by customer';
    return this.orderRepository.updateOrderStatus(order.id, 'CANCELLED', {
      cancelReason,
      cancelledBy: 'USER',
      cancelledAt: new Date()
    });
  }
}

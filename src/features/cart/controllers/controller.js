import { CartService } from '../services/services.js';

export class CartController {
  constructor() {
    this.cartService = new CartService();
  }

  /**
   * GET /api/cart
   * Fetch current user's shopping cart
   */
  getCart = async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      const cart = await this.cartService.getCart(userId);
      return res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      console.error('Get cart error:', error);
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Internal server error while fetching cart.',
      });
    }
  };

  /**
   * POST /api/cart/add or POST /api/cart
   * Add item to cart
   */
  addItem = async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      const { productId, id, slug, variantId, quantity = 1 } = req.body;
      const productIdentifier = productId || id || slug;

      const result = await this.cartService.addItem(userId, {
        productId: productIdentifier,
        variantId: variantId || null,
        quantity,
      });

      return res.status(200).json({
        success: true,
        message: 'Item added to cart successfully',
        data: result,
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Internal server error while adding item to cart.',
      });
    }
  };

  /**
   * PUT /api/cart/update or PUT /api/cart/:id
   * Edit quantity of an item in cart
   */
  editQuantity = async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      const itemId = req.params.id || req.body.itemId || req.body.id;
      const { quantity, productId, variantId } = req.body;

      const result = await this.cartService.editQuantity(userId, {
        itemId,
        productId,
        variantId,
        quantity,
      });

      return res.status(200).json({
        success: true,
        message: 'Cart quantity updated successfully',
        data: result,
      });
    } catch (error) {
      console.error('Edit cart quantity error:', error);
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Internal server error while updating cart quantity.',
      });
    }
  };

  /**
   * DELETE /api/cart/delete/:id or DELETE /api/cart/:id
   * Delete item from cart
   */
  deleteItem = async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      const itemId = req.params.id || req.body.itemId || req.body.id;

      const result = await this.cartService.deleteItem(userId, itemId);

      return res.status(200).json({
        success: true,
        message: 'Item removed from cart successfully',
        data: result,
      });
    } catch (error) {
      console.error('Delete cart item error:', error);
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Internal server error while removing item from cart.',
      });
    }
  };

  /**
   * DELETE /api/cart
   * Clear all items from cart
   */
  clearCart = async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await this.cartService.clearCart(userId);

      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        data: result,
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Internal server error while clearing cart.',
      });
    }
  };

  /**
   * POST /api/cart/order-now or POST /api/cart/checkout
   * Order now option - creates order and clears ordered cart items
   */
  orderNow = async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      const { addressId, paymentMethod, items, productId, variantId, quantity } = req.body;

      const result = await this.cartService.orderNow(userId, {
        addressId,
        paymentMethod,
        items,
        productId,
        variantId,
        quantity,
      });

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        data: result.order,
        shortId: result.order.shortId,
        addressSnapshot: result.addressSnapshot,
      });
    } catch (error) {
      console.error('Order now error:', error);
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Internal server error while processing Order Now.',
      });
    }
  };
}

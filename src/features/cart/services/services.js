import { CartRepository } from '../repositories/repository.js';
import { OrderService } from '../../orders/services/orderService.js';

export class CartService {
  constructor() {
    this.cartRepository = new CartRepository();
    this.orderService = new OrderService();
  }

  /**
   * Helper to format readable variant description string
   */
  formatVariantDescription(variant) {
    if (!variant || !variant.attributeValues || variant.attributeValues.length === 0) {
      return '';
    }
    return variant.attributeValues
      .map((av) => `${av.attribute?.displayName || av.attribute?.name || 'Attribute'}: ${av.displayValue || av.value}`)
      .join(', ');
  }

  /**
   * Get user's cart with hydrated product & variant details and total summary
   */
  async getCart(userId) {
    if (!userId) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }

    const rawItems = await this.cartRepository.getCartItemsByUserId(userId);
    if (!rawItems || rawItems.length === 0) {
      return {
        items: [],
        summary: {
          itemsCount: 0,
          totalQuantity: 0,
          subtotal: 0,
          discountAmount: 0,
          deliveryFee: 0,
          totalAmount: 0,
        },
      };
    }

    const productIds = [...new Set(rawItems.map((item) => item.productId))];
    const products = await this.cartRepository.findProductsByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    let totalQuantity = 0;
    const enrichedItems = [];

    for (const rawItem of rawItems) {
      const product = productMap.get(rawItem.productId);
      if (!product) {
        // Product no longer exists in catalog, omit from current cart
        continue;
      }

      let unitPrice = Number(product.price);
      let variantInfo = null;

      if (rawItem.variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.find((v) => v.id === rawItem.variantId);
        if (variant) {
          if (variant.priceOverride) {
            unitPrice = Number(variant.priceOverride);
          }
          variantInfo = {
            id: variant.id,
            description: this.formatVariantDescription(variant),
            availability: variant.availability,
            priceOverride: variant.priceOverride ? Number(variant.priceOverride) : null,
          };
        }
      }

      const primaryImage = product.productImages?.find((img) => img.isPrimary)?.imageUrl ||
                           product.productImages?.[0]?.imageUrl || '';

      const lineTotal = unitPrice * rawItem.quantity;
      calculatedSubtotal += lineTotal;
      totalQuantity += rawItem.quantity;

      enrichedItems.push({
        id: rawItem.id,
        productId: product.id,
        variantId: rawItem.variantId || null,
        quantity: rawItem.quantity,
        unitPrice,
        lineTotal,
        createdAt: rawItem.createdAt,
        updatedAt: rawItem.updatedAt,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          brand: product.brand,
          basePrice: Number(product.price),
          availability: product.availability,
          stock: product.stock,
          image: primaryImage,
        },
        variant: variantInfo,
      });
    }

    const subtotal = calculatedSubtotal;
    const discountAmount = 0;
    const deliveryFee = 0;
    const totalAmount = subtotal - discountAmount + deliveryFee;

    return {
      items: enrichedItems,
      summary: {
        itemsCount: enrichedItems.length,
        totalQuantity,
        subtotal,
        discountAmount,
        deliveryFee,
        totalAmount,
      },
    };
  }

  /**
   * Add item to cart (increments quantity if already exists)
   */
  async addItem(userId, { productId, variantId = null, quantity = 1 }) {
    if (!userId) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }

    if (!productId) {
      const error = new Error('Product identifier is required');
      error.status = 400;
      throw error;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      const error = new Error('Quantity must be a positive integer');
      error.status = 400;
      throw error;
    }

    // Verify product exists and is available
    const product = await this.cartRepository.findProductByIdOrSlug(productId);
    if (!product) {
      const error = new Error('Product not found in catalog');
      error.status = 404;
      throw error;
    }

    if (product.availability !== 'AVAILABLE') {
      const error = new Error(`Sorry, "${product.name}" is currently unavailable.`);
      error.status = 400;
      throw error;
    }

    // If variant specified, verify variant
    let matchedVariantId = null;
    if (variantId && product.variants && product.variants.length > 0) {
      const matchedVariant = product.variants.find((v) => v.id === variantId);
      if (!matchedVariant) {
        const error = new Error('Selected variant was not found for this product.');
        error.status = 404;
        throw error;
      }
      matchedVariantId = matchedVariant.id;
    }

    // Check if product is already in user's cart
    const existingItem = await this.cartRepository.findCartItem(userId, product.id, matchedVariantId);

    let resultItem;
    if (existingItem) {
      const updatedQty = existingItem.quantity + qty;
      resultItem = await this.cartRepository.updateQuantity(existingItem.id, userId, updatedQty);
    } else {
      resultItem = await this.cartRepository.addItem({
        userId,
        productId: product.id,
        variantId: matchedVariantId,
        quantity: qty,
      });
    }

    // Non-blocking interaction recording
    this.cartRepository.recordCartAddInteraction(userId, product.id);

    return resultItem;
  }

  /**
   * Edit quantity of an existing item in cart
   */
  async editQuantity(userId, { itemId, productId, variantId, quantity }) {
    if (!userId) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }

    let targetItem = null;
    if (itemId) {
      targetItem = await this.cartRepository.findCartItemById(itemId, userId);
    } else if (productId) {
      const product = await this.cartRepository.findProductByIdOrSlug(productId);
      if (product) {
        targetItem = await this.cartRepository.findCartItem(userId, product.id, variantId || null);
      }
    }

    if (!targetItem) {
      const error = new Error('Cart item not found');
      error.status = 404;
      throw error;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty)) {
      const error = new Error('Valid quantity is required');
      error.status = 400;
      throw error;
    }

    // If quantity is 0 or negative, remove item from cart
    if (qty <= 0) {
      await this.cartRepository.deleteItem(targetItem.id, userId);
      return { message: 'Item removed from cart', deleted: true, itemId: targetItem.id };
    }

    const updated = await this.cartRepository.updateQuantity(targetItem.id, userId, qty);
    return updated;
  }

  /**
   * Delete item from cart
   */
  async deleteItem(userId, itemId) {
    if (!userId) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }

    if (!itemId) {
      const error = new Error('Cart item identifier is required');
      error.status = 400;
      throw error;
    }

    // Try finding by cart item id first
    let item = await this.cartRepository.findCartItemById(itemId, userId);
    if (!item) {
      // If not found by cart item ID, try checking if itemId was productId
      item = await this.cartRepository.findCartItem(userId, itemId);
    }

    if (!item) {
      const error = new Error('Cart item not found or does not belong to your account');
      error.status = 404;
      throw error;
    }

    await this.cartRepository.deleteItem(item.id, userId);
    return { success: true, removedItemId: item.id };
  }

  /**
   * Clear all items in user's cart
   */
  async clearCart(userId) {
    if (!userId) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }
    await this.cartRepository.clearCart(userId);
    return { success: true, message: 'Cart cleared successfully' };
  }

  /**
   * Order Now option:
   * Direct checkout from cart or specific item, creates order via OrderService, and clears ordered items from cart.
   */
  async orderNow(userId, { addressId, paymentMethod = 'COD', items, productId, variantId, quantity }) {
    if (!userId) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }

    // 1. Resolve delivery address
    let resolvedAddressId = addressId;
    if (!resolvedAddressId) {
      const defaultAddress = await this.cartRepository.findUserDefaultAddress(userId);
      if (defaultAddress) {
        resolvedAddressId = defaultAddress.id;
      } else {
        const error = new Error('A delivery address is required to place an order. Please select or add an address.');
        error.status = 400;
        throw error;
      }
    }

    // 2. Resolve items to order
    let itemsToOrder = [];
    let shouldClearEntireCart = false;

    if (productId) {
      // Direct single product Order Now
      itemsToOrder = [{
        productId,
        variantId: variantId || null,
        quantity: parseInt(quantity, 10) || 1,
      }];
    } else if (items && Array.isArray(items) && items.length > 0) {
      // Specific list of items passed
      itemsToOrder = items;
    } else {
      // Order all items from current cart
      const currentCart = await this.getCart(userId);
      if (!currentCart.items || currentCart.items.length === 0) {
        const error = new Error('Your cart is empty. Please add items before placing an order.');
        error.status = 400;
        throw error;
      }

      itemsToOrder = currentCart.items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId || null,
        productName: it.product?.name,
        variantDescription: it.variant?.description || '',
        quantity: it.quantity,
      }));
      shouldClearEntireCart = true;
    }

    // 3. Delegate to OrderService to validate, calculate, and create the order in a DB transaction
    const orderResult = await this.orderService.createOrder({
      userId,
      addressId: resolvedAddressId,
      items: itemsToOrder,
      paymentMethod,
    });

    // 4. Clear cart after successful order creation
    if (shouldClearEntireCart) {
      await this.cartRepository.clearCart(userId);
    } else {
      // Clear ordered items from cart if they were present
      for (const it of itemsToOrder) {
        const pid = it.productId || it.id;
        if (pid) {
          await this.cartRepository.deleteItemByProduct(userId, pid, it.variantId || null);
        }
      }
    }

    return orderResult;
  }
}

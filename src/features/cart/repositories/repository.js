import prisma from '../../../config/prisma.js';
import crypto from 'crypto';

let isTableEnsured = true;

export class CartRepository {
  /**
   * Ensures the CartItem table exists in the database
   */
  async ensureTable() {
    if (isTableEnsured) return;
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CartItem" (
          "id" TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
          "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
          "variantId" TEXT REFERENCES "ProductVariant"("id") ON DELETE CASCADE,
          "quantity" INTEGER NOT NULL DEFAULT 1,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      isTableEnsured = true;
    } catch (err) {
      console.error('CartRepository ensureTable warning:', err.message);
    }
  }

  /**
   * Get all cart items for a user
   */
  async getCartItemsByUserId(userId) {
    await this.ensureTable();
    const rows = await prisma.$queryRawUnsafe(
      `SELECT "id", "userId", "productId", "variantId", "quantity", "createdAt", "updatedAt"
       FROM "CartItem"
       WHERE "userId" = $1
       ORDER BY "createdAt" DESC`,
      userId
    );
    return rows;
  }

  /**
   * Find a specific cart item by user, product, and optional variant
   */
  async findCartItem(userId, productId, variantId = null) {
    await this.ensureTable();
    let rows;
    if (variantId) {
      rows = await prisma.$queryRawUnsafe(
        `SELECT "id", "userId", "productId", "variantId", "quantity", "createdAt", "updatedAt"
         FROM "CartItem"
         WHERE "userId" = $1 AND "productId" = $2 AND "variantId" = $3
         LIMIT 1`,
        userId, productId, variantId
      );
    } else {
      rows = await prisma.$queryRawUnsafe(
        `SELECT "id", "userId", "productId", "variantId", "quantity", "createdAt", "updatedAt"
         FROM "CartItem"
         WHERE "userId" = $1 AND "productId" = $2 AND ("variantId" IS NULL OR "variantId" = '')
         LIMIT 1`,
        userId, productId
      );
    }
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find cart item by its ID and verify ownership
   */
  async findCartItemById(id, userId) {
    await this.ensureTable();
    const rows = await prisma.$queryRawUnsafe(
      `SELECT "id", "userId", "productId", "variantId", "quantity", "createdAt", "updatedAt"
       FROM "CartItem"
       WHERE "id" = $1 AND "userId" = $2
       LIMIT 1`,
      id, userId
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Add a new cart item
   */
  async addItem({ userId, productId, variantId = null, quantity = 1 }) {
    await this.ensureTable();
    const id = `cart_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO "CartItem" ("id", "userId", "productId", "variantId", "quantity", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      id, userId, productId, variantId, quantity
    );

    return {
      id,
      userId,
      productId,
      variantId,
      quantity,
    };
  }

  /**
   * Update quantity of a cart item
   */
  async updateQuantity(id, userId, quantity) {
    await this.ensureTable();
    await prisma.$executeRawUnsafe(
      `UPDATE "CartItem"
       SET "quantity" = $1, "updatedAt" = NOW()
       WHERE "id" = $2 AND "userId" = $3`,
      quantity, id, userId
    );
    return this.findCartItemById(id, userId);
  }

  /**
   * Delete a cart item by ID
   */
  async deleteItem(id, userId) {
    await this.ensureTable();
    const item = await this.findCartItemById(id, userId);
    if (!item) return null;

    await prisma.$executeRawUnsafe(
      `DELETE FROM "CartItem" WHERE "id" = $1 AND "userId" = $2`,
      id, userId
    );
    return item;
  }

  /**
   * Delete a cart item by product ID and variant ID
   */
  async deleteItemByProduct(userId, productId, variantId = null) {
    await this.ensureTable();
    if (variantId) {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "CartItem" WHERE "userId" = $1 AND "productId" = $2 AND "variantId" = $3`,
        userId, productId, variantId
      );
    } else {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "CartItem" WHERE "userId" = $1 AND "productId" = $2 AND ("variantId" IS NULL OR "variantId" = '')`,
        userId, productId
      );
    }
  }

  /**
   * Clear all items in a user's cart
   */
  async clearCart(userId) {
    await this.ensureTable();
    await prisma.$executeRawUnsafe(
      `DELETE FROM "CartItem" WHERE "userId" = $1`,
      userId
    );
  }

  /**
   * Find product details with primary images and variants
   */
  async findProductByIdOrSlug(idOrSlug) {
    return prisma.product.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
      include: {
        productImages: true,
        variants: {
          include: {
            attributeValues: {
              include: {
                attribute: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Batch query products for cart hydration
   */
  async findProductsByIds(productIds) {
    if (!productIds || productIds.length === 0) return [];
    return prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        productImages: true,
        variants: {
          include: {
            attributeValues: {
              include: {
                attribute: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get user default address for Order Now fallback
   */
  async findUserDefaultAddress(userId) {
    return prisma.address.findFirst({
      where: { user_id: userId },
      orderBy: [
        { is_default: 'desc' },
        { created_at: 'desc' },
      ],
    });
  }

  /**
   * Record CART_ADD product interaction for trending deals algorithm
   */
  async recordCartAddInteraction(userId, productId) {
    try {
      await prisma.productInteraction.create({
        data: {
          productId,
          userId,
          type: 'CART_ADD',
        },
      });
    } catch (_) {
      // Non-blocking interaction recording
    }
  }
}

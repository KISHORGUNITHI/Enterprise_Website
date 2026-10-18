import prisma from "../../../config/prisma.js";

// ─── Trending window ──────────────────────────────────────────────────────────
// Only interactions from the last TRENDING_WINDOW_DAYS are considered.
// Old interactions fall off naturally — no manual purge needed.
const TRENDING_WINDOW_DAYS = 30;

export class TrendingRepository {
  /**
   * Fetch all ProductInteraction records within the trending window,
   * joined with their product (including category and primary image).
   *
   * The repository returns raw interaction rows. Scoring is done in
   * TrendingService so the math stays in one place.
   *
   * Inactive-category filtering: we return the category name on each
   * product so TrendingService can exclude inactive slugs without a
   * second DB round-trip.
   *
   * @returns {Promise<Array>}  interaction rows with product+category+images
   */
  async getRecentInteractions() {
    const since = new Date();
    since.setDate(since.getDate() - TRENDING_WINDOW_DAYS);

    return prisma.productInteraction.findMany({
      where: {
        createdAt: { gte: since },
      },
      include: {
        product: {
          include: {
            category:      true,
            productImages: true,
            giftsGiven: {
              include: {
                giftProduct: {
                  include: {
                    productImages: true
                  }
                }
              }
            }
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Fetch active (AVAILABLE) products from active categories as a fallback
   * when there are not enough interaction records to fill the trending list.
   *
   * @param {string[]} excludeCategorySlugs  — DB category names to exclude
   * @param {string[]} excludeProductIds     — already-included product ids
   * @param {number}   limit
   * @returns {Promise<Array>}  product rows with category and images
   */
  async getFallbackProducts(excludeCategoryNames, excludeProductIds, limit) {
    return prisma.product.findMany({
      where: {
        availability: "AVAILABLE",
        id:           { notIn: excludeProductIds },
        category: {
          name: { notIn: excludeCategoryNames },
        },
      },
      include: {
        category:      true,
        productImages: true,
        giftsGiven: {
          include: {
            giftProduct: {
              include: {
                productImages: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Record a single product interaction.
   * Validates that the product actually exists before inserting.
   *
   * @param {string}  productId
   * @param {string}  type        — one of InteractionType enum values
   * @param {string|null} userId
   * @param {string|null} sessionId
   * @returns {Promise<object>}   created interaction record
   */
  async createInteraction(productId, type, userId, sessionId) {
    // Validate product exists (prevents orphan records from invalid IDs)
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { slug: productId }] },
      select: { id: true },
    });

    if (!product) return null;

    return prisma.productInteraction.create({
      data: {
        productId: product.id,
        type,
        userId:    userId    || null,
        sessionId: sessionId || null,
      },
    });
  }

  /**
   * Duplicate-view guard: returns true when the same user or session has
   * already recorded a PRODUCT_VIEW for this product within the last hour.
   * Prevents artificial view inflation from page refreshes.
   *
   * @param {string}      productId
   * @param {string|null} userId
   * @param {string|null} sessionId
   * @returns {Promise<boolean>}
   */
  async hasRecentView(productId, userId, sessionId) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Build the identity condition — must have at least one identifier
    let identityWhere = null;
    if (userId) {
      identityWhere = { userId };
    } else if (sessionId) {
      identityWhere = { sessionId };
    } else {
      // No identity available — cannot deduplicate, allow the record
      return false;
    }

    const existing = await prisma.productInteraction.findFirst({
      where: {
        productId,
        type:      "PRODUCT_VIEW",
        createdAt: { gte: oneHourAgo },
        ...identityWhere,
      },
    });

    return !!existing;
  }
}

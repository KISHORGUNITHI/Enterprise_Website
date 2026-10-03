import { TrendingRepository } from "../repositories/trendingRepository.js";
import { INACTIVE_CATEGORIES } from "../../../config/categoryConfig.js";

// ─── Scoring configuration ────────────────────────────────────────────────────
//
// CURRENT TRENDING EQUATION
// ─────────────────────────
// FinalScore = Σ [ Weight(interaction) × e^(-λ × AgeInDays) ]
//
// where:
//   Weight:
//     PRODUCT_VIEW  = 1   (shows interest)
//     WISHLIST_ADD  = 3   (stronger purchase intent)
//     CART_ADD      = 5   (even stronger purchase intent)
//     PURCHASE      = 10  (strongest — confirmed intent)
//
//   AgeInDays = (now - interaction.createdAt) / 86_400_000
//
//   λ = 0.1  (time-decay constant)
//     → interaction from today   contributes 100 % of its weight
//     → interaction from 7 days  contributes ~50 % of its weight
//     → interaction from 30 days contributes ~5  % of its weight
//
// These values are intentionally kept in one place (this object) so they
// can be tuned later based on real user-behaviour data without hunting
// through multiple files.

const SCORING = {
  // Interaction weights — higher = stronger purchase intent signal
  weights: {
    PRODUCT_VIEW: 1,
    WISHLIST_ADD: 3,
    CART_ADD:     5,
    PURCHASE:     10,
  },

  // Time-decay constant λ.  Increase to decay faster; decrease to decay slower.
  lambda: 0.1,

  // Rolling interaction window in days (must match trendingRepository.js)
  windowDays: 30,

  // DB category names that correspond to inactive route slugs.
  // Derived from INACTIVE_CATEGORIES (route slugs) via SLUG_TO_CATEGORY_NAME.
  // Kept in sync with categoryConfig.js — no manual duplication needed.
};

// Map route slugs → DB category names (handles both singular and plural variants)
const SLUG_TO_CATEGORY_NAMES = {
  kitchen:         ["Kitchen Ware", "Kitchen Appliances", "Kitchen"],
  refrigerators:   ["Refrigerator", "Refrigerators", "Fridge"],
  acs:             ["AC", "Air Conditioners", "ACs"],
  "home-theatres": ["Home Theatre", "Home Theatres"],
  mobiles:         ["Mobile", "Mobiles"],
  tvs:             ["TV", "TVs"],
};

// Build the list of DB category names that are currently inactive
function getInactiveCategoryNames() {
  return INACTIVE_CATEGORIES.flatMap(
    slug => SLUG_TO_CATEGORY_NAMES[slug] || [slug]
  );
}

// ─── Scoring engine ───────────────────────────────────────────────────────────

/**
 * Calculate the time-decayed score for a single interaction.
 *
 * score = weight × e^(-λ × ageInDays)
 *
 * @param {string}   type        — InteractionType enum value
 * @param {Date}     createdAt   — when the interaction occurred
 * @returns {number}
 */
function scoreInteraction(type, createdAt) {
  const weight     = SCORING.weights[type] ?? 0;
  const ageInDays  = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  return weight * Math.exp(-SCORING.lambda * ageInDays);
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class TrendingService {
  constructor() {
    this.repo = new TrendingRepository();
  }

  /**
   * Return the top `limit` trending products based on weighted, time-decayed
   * interaction scores.  Products from inactive categories are excluded.
   *
   * Algorithm:
   *   1. Fetch all interactions within the trending window
   *   2. Skip interactions whose product belongs to an inactive category
   *   3. Accumulate FinalScore = Σ [ weight × e^(-λ × ageInDays) ] per product
   *   4. Sort descending by FinalScore
   *   5. Return top `limit` products
   *   6. If fewer than `limit` results, pad with recent AVAILABLE products
   *      (still respecting inactive categories)
   *
   * @param {number} limit  — how many products to return (default 10)
   * @returns {Promise<Array>}  shaped product objects safe for the frontend
   */
  async getTrendingProducts(limit = 10) {
    const inactiveNames = getInactiveCategoryNames();
    const interactions  = await this.repo.getRecentInteractions();

    // Accumulate score and product data per productId
    const scoreMap = new Map(); // productId → { score, product }

    for (const interaction of interactions) {
      const { product } = interaction;

      // Skip products from inactive categories
      if (inactiveNames.includes(product.category?.name)) continue;

      // Skip unavailable products
      if (product.availability !== "AVAILABLE") continue;

      const s = scoreInteraction(interaction.type, interaction.createdAt);

      if (scoreMap.has(product.id)) {
        scoreMap.get(product.id).score += s;
      } else {
        scoreMap.set(product.id, { score: s, product });
      }
    }

    // Sort by score descending
    const ranked = [...scoreMap.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Pad with fallback products if not enough interaction data yet
    if (ranked.length < limit) {
      const alreadyIncluded = ranked.map(r => r.product.id);
      const fallbackProducts = await this.repo.getFallbackProducts(
        inactiveNames,
        alreadyIncluded,
        limit - ranked.length
      );
      for (const p of fallbackProducts) {
        ranked.push({ score: 0, product: p });
      }
    }

    return ranked.map(({ score, product }) => this._formatProduct(product, score));
  }

  /**
   * Record a user interaction for a product.
   * For PRODUCT_VIEW: deduplicates within a 1-hour window per user/session
   * to prevent artificial inflation from repeated page refreshes.
   *
   * @param {string}      productId   — product id or slug
   * @param {string}      type        — InteractionType enum value
   * @param {string|null} userId      — from JWT if authenticated
   * @param {string|null} sessionId   — from request header/cookie if guest
   * @returns {Promise<object|null>}  created record, or null if deduped/invalid
   */
  async recordInteraction(productId, type, userId, sessionId) {
    // Validate interaction type
    if (!SCORING.weights.hasOwnProperty(type)) {
      throw new Error(`Invalid interaction type: ${type}`);
    }

    // Deduplicate views within the last hour per user or session
    if (type === "PRODUCT_VIEW") {
      const already = await this.repo.hasRecentView(productId, userId, sessionId);
      if (already) return null; // silently skip duplicate
    }

    return this.repo.createInteraction(productId, type, userId, sessionId);
  }

  /**
   * Shape a Prisma product record into the safe public format the frontend expects.
   * Does NOT expose interaction counts, internal IDs beyond what's needed, or scores.
   *
   * @param {object} product  — raw Prisma product with category and productImages
   * @param {number} score    — internal trending score (not exposed)
   * @returns {object}
   */
  _formatProduct(product, score) {
    const primaryImg =
      product.productImages?.find(img => img.isPrimary)?.imageUrl ||
      product.productImages?.[0]?.imageUrl ||
      "";

    const price = parseFloat(product.price) || 0;

    return {
      id:           product.id,
      slug:         product.slug,
      name:         product.name,
      brand:        product.brand,
      description:  product.description,
      price,
      rating:       product.rating,
      reviews:      product.reviews,
      availability: product.availability,
      category:     product.category?.name || "",
      imageUrl:     primaryImg,
      productImages: product.productImages,
      // trendingScore intentionally omitted from public response
    };
  }
}

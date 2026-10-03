import { ProductService } from "../services/productService.js";
import { TrendingService } from "../services/trendingService.js";

const CATEGORY_MAP = {
  mobiles: "Mobiles",
  mobile: "Mobiles",
  tvs: "TVs",
  tv: "TVs",
  acs: "Air Conditioners",
  ac: "Air Conditioners",
  "air-conditioners": "Air Conditioners",
  "air conditioners": "Air Conditioners",
  "home-theatres": "Home Theatres",
  hometheatres: "Home Theatres",
  "home theatres": "Home Theatres",
  kitchen: "Kitchen Appliances",
  refrigerators: "Refrigerators",
};


export class ProductController {
  constructor() {
    this.productService = new ProductService();
    this.trendingService = new TrendingService();
  }

  async getProducts(req, res) {
    try {
      const { category } = req.query;
      let products;
      if (category) {
        products = await this.productService.getProductsByCategory(category);
      } else {
        products = await this.productService.getAllProducts();
      }
      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Get products error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async getProductsByCategory(req, res) {
    try {
      const categoryParam = req.params.category;
      const products = await this.productService.getProductsByCategory(categoryParam);
      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Get products by category error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async getProductByIdOrSlug(req, res) {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductByIdOrSlug(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Get product detail error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  // ─── Trending Deals ──────────────────────────────────────────────────────────

  /**
   * GET /api/products/trending?limit=10
   *
   * Returns top trending products ranked by weighted, time-decayed interaction
   * scores. Products from inactive categories are always excluded.
   * Falls back to recent active products when interactions are sparse.
   */
  async getTrendingProducts(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 100); // cap at 100
      const products = await this.trendingService.getTrendingProducts(limit);
      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Get trending products error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  /**
   * POST /api/products/:id/interaction
   * Body: { type: "PRODUCT_VIEW" | "WISHLIST_ADD" | "CART_ADD" | "PURCHASE" }
   * Headers: x-session-id (optional, for guest deduplication)
   *
   * Records a user interaction event. PRODUCT_VIEW is deduplicated within
   * a 1-hour window per user/session to prevent artificial inflation.
   * Returns 204 No Content on success (or on a silently-skipped duplicate view).
   */
  async recordInteraction(req, res) {
    try {
      const { id } = req.params;
      const { type } = req.body;
      const userId = req.user?.userId || null;
      const sessionId = req.headers["x-session-id"] || null;

      if (!type) {
        return res.status(400).json({ success: false, message: "Interaction type is required" });
      }

      await this.trendingService.recordInteraction(id, type, userId, sessionId);

      // 204 — success with no body (avoids leaking internal interaction data)
      return res.status(204).send();
    } catch (error) {
      if (error.message?.startsWith("Invalid interaction type")) {
        return res.status(400).json({ success: false, message: error.message });
      }
      console.error("Record interaction error:", error.message, error.stack);
      return res.status(500).json({ success: false, message: "Internal server error", detail: error.message });
    }
  }
  async rateProduct(req, res) {
    try {
      const { id } = req.params;
      let { rating, comment } = req.body;
      const userId = req.user?.userId || req.user?.id; // user ID from JWT payload

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized: User ID not found" });
      }

      rating = parseInt(rating, 10);
      console.log(rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be an integer between 1 and 5" });
      }

      const updatedProduct = await this.productService.rateProduct(id, userId, rating, comment);
      return res.status(200).json({
        success: true,
        data: updatedProduct,
      });
    } catch (error) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      console.error("Rate product error:", error.message, error.stack);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}

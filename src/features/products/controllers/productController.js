import { ProductService } from "../services/productService.js";

const CATEGORY_MAP = {
  mobiles: "Mobile",
  mobile: "Mobile",
  tvs: "TV",
  tv: "TV",
  acs: "AC",
  ac: "AC",
  "home-theatres": "Home Theatre",
  hometheatres: "Home Theatre",
  kitchen: "Kitchen Ware",
  refrigerators: "Refrigerator",
};

export class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  async getProducts(req, res) {
    try {
      const { category } = req.query;
      let products;
      if (category) {
        const dbCategoryName = CATEGORY_MAP[category.toLowerCase()] || category;
        products = await this.productService.getProductsByCategory(dbCategoryName);
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
      const dbCategoryName = CATEGORY_MAP[categoryParam.toLowerCase()] || categoryParam;
      const products = await this.productService.getProductsByCategory(dbCategoryName);
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
}

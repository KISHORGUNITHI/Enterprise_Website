import { ProductRepository } from "../repositories/productRepository.js";

export class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAllProducts() {
    return await this.productRepository.findAll();
  }

  async getProductsByCategory(categoryName) {
    return await this.productRepository.findByCategory(categoryName);
  }

  async getProductByIdOrSlug(identifier) {
    return await this.productRepository.findByIdOrSlug(identifier);
  }

  async rateProduct(productId, userId, ratingValue, comment) {
    // We fetch product first to make sure it exists
    const product = await this.productRepository.findByIdOrSlug(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return await this.productRepository.rateProduct(product.id, userId, ratingValue, comment);
  }
}

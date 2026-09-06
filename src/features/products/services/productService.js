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
}

import express from "express";
import { ProductController } from "../controllers/productController.js";

const router = express.Router();
const productController = new ProductController();

router.get("/products", productController.getProducts.bind(productController));
router.get("/products/category/:category", productController.getProductsByCategory.bind(productController));
router.get("/products/:id", productController.getProductByIdOrSlug.bind(productController));

export default router;

import express from 'express';
import jwtAuthenticate from '../../../middleware/jwtmiddleware.js';
import { OrderController } from '../controllers/orderController.js';

const router = express.Router();
const orderController = new OrderController();

// All customer order endpoints require authentication
router.post('/orders', jwtAuthenticate, orderController.createOrder);
router.get('/orders', jwtAuthenticate, orderController.getUserOrders);
router.get('/orders/:id', jwtAuthenticate, orderController.getOrderDetail);
router.post('/orders/:id/cancel', jwtAuthenticate, orderController.cancelOrder);
router.patch('/orders/:id/cancel', jwtAuthenticate, orderController.cancelOrder);

export default router;

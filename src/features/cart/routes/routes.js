import express from 'express';
import jwtAuthenticate from '../../../middleware/jwtmiddleware.js';
import { CartController } from '../controllers/controller.js';

const router = express.Router();
const cartController = new CartController();

// All cart endpoints require user authentication
router.use(jwtAuthenticate);

// 1. Get Cart
router.get('/', cartController.getCart);

// 2. Add item to cart
router.post('/add', cartController.addItem);
router.post('/items', cartController.addItem);
router.post('/', cartController.addItem);

// 3. Edit quantity
router.put('/update', cartController.editQuantity);
router.put('/items/:id', cartController.editQuantity);
router.put('/:id', cartController.editQuantity);
router.patch('/:id', cartController.editQuantity);

// 4. Delete item from cart
router.delete('/delete/:id', cartController.deleteItem);
router.delete('/items/:id', cartController.deleteItem);
router.delete('/:id', cartController.deleteItem);
router.delete('/', cartController.clearCart);

// 5. Order now option
router.post('/order-now', cartController.orderNow);
router.post('/checkout', cartController.orderNow);

export default router;
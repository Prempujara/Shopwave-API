import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { addToCartSchema, updateCartItemSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/', validateRequest(addToCartSchema), addToCart);
router.put('/items/:productId', validateRequest(updateCartItemSchema), updateCartItem);
router.delete('/items/:productId', removeCartItem);
router.delete('/', clearCart);

export default router;

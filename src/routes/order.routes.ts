import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createOrderSchema } from '../validators';

const router = Router();

router.use(authenticate);

// User endpoints
router.post('/', validateRequest(createOrderSchema), createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

// Admin-only endpoints
router.get('/admin/all', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

export default router;

import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema } from '../validators';

const router = Router();

router.get('/categories/list', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only endpoints
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest(createProductSchema),
  createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(updateProductSchema),
  updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteProduct
);

export default router;

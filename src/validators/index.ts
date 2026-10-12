import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(60),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['user', 'admin']).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(120),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    price: z.number().positive('Price must be greater than 0'),
    category: z.string().min(2, 'Category is required'),
    stock: z.number().int().nonnegative('Stock cannot be negative'),
    imageUrl: z.string().url('Must be a valid URL').optional(),
    rating: z.number().min(0).max(5).optional()
  })
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required')
  }),
  body: z.object({
    name: z.string().min(3).max(120).optional(),
    description: z.string().min(5).optional(),
    price: z.number().positive().optional(),
    category: z.string().min(2).optional(),
    stock: z.number().int().nonnegative().optional(),
    imageUrl: z.string().url().optional(),
    rating: z.number().min(0).max(5).optional()
  })
});

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be at least 1').default(1)
  })
});

export const updateCartItemSchema = z.object({
  params: z.object({
    productId: z.string().min(1, 'Product ID is required')
  }),
  body: z.object({
    quantity: z.number().int().nonnegative('Quantity cannot be negative')
  })
});

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      street: z.string().min(3),
      city: z.string().min(2),
      state: z.string().min(2),
      postalCode: z.string().min(3),
      country: z.string().min(2)
    }).optional()
  }).optional()
});

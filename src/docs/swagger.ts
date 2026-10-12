export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Shopwave E-Commerce Backend REST API',
    version: '1.0.0',
    description: 'Production-ready E-Commerce REST API built with Node.js, Express, TypeScript, MongoDB, JWT, and Zod.',
    contact: {
      name: 'Shopwave Engineering Team',
      email: 'dev@shopwave.local'
    }
  },
  servers: [
    {
      url: '/api',
      description: 'API base server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66184a5e3c8812c8b9d09a12' },
          name: { type: 'string', example: 'Alex Morgan' },
          email: { type: 'string', example: 'alex@example.com' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66184a5e3c8812c8b9d09a33' },
          name: { type: 'string', example: 'Aura Studio Wireless ANC Headphones' },
          description: { type: 'string', example: 'High-fidelity audio with active noise cancellation' },
          price: { type: 'number', example: 299.99 },
          category: { type: 'string', example: 'Electronics' },
          stock: { type: 'number', example: 45 },
          imageUrl: { type: 'string', example: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' },
          rating: { type: 'number', example: 4.8 }
        }
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'number' },
                quantity: { type: 'number' }
              }
            }
          },
          totalAmount: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
          paymentStatus: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Jane Doe' },
                  email: { type: 'string', example: 'jane@example.com' },
                  password: { type: 'string', example: 'SecurePassword123' },
                  role: { type: 'string', enum: ['user', 'admin'], default: 'user' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Validation error or duplicate email' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in and obtain JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@shopwave.local' },
                  password: { type: 'string', example: 'AdminSecret123!' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Token issued successfully' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get currently authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Authenticated user profile' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List products with search, pagination and filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['-createdAt', 'price_asc', 'price_desc', 'rating_desc'] } }
        ],
        responses: {
          200: { description: 'Paginated list of products' }
        }
      },
      post: {
        tags: ['Products'],
        summary: 'Create a product (Admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'description', 'price', 'category', 'stock'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  category: { type: 'string' },
                  stock: { type: 'number' },
                  imageUrl: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Product created' },
          403: { description: 'Forbidden (Admins only)' }
        }
      }
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Product retrieved' },
          404: { description: 'Product not found' }
        }
      },
      put: {
        tags: ['Products'],
        summary: 'Update product (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Product updated' }
        }
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Product deleted' }
        }
      }
    },
    '/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get user shopping cart',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Shopping cart summary' } }
      },
      post: {
        tags: ['Cart'],
        summary: 'Add item to shopping cart',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId'],
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer', default: 1 }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Item added' } }
      },
      delete: {
        tags: ['Cart'],
        summary: 'Clear user shopping cart',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Cart emptied' } }
      }
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Convert cart to order and decrement stock',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  shippingAddress: {
                    type: 'object',
                    properties: {
                      street: { type: 'string' },
                      city: { type: 'string' },
                      state: { type: 'string' },
                      postalCode: { type: 'string' },
                      country: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Order created' },
          400: { description: 'Empty cart or insufficient stock' }
        }
      },
      get: {
        tags: ['Orders'],
        summary: 'Get current user order history',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User orders' } }
      }
    }
  }
};

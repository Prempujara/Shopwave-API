import { Response } from 'express';
import { Cart } from '../models/Cart.model';
import { Product } from '../models/Product.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError, NotFoundError } from '../utils/AppError';
import mongoose from 'mongoose';

// Helper to calculate cart summary
const formatCartResponse = (cart: any) => {
  let subtotal = 0;
  let totalItems = 0;

  const formattedItems = cart.items.map((item: any) => {
    const p = item.product;
    const price = p?.price || 0;
    const itemTotal = price * item.quantity;
    subtotal += itemTotal;
    totalItems += item.quantity;

    return {
      productId: p?._id || item.product,
      name: p?.name || 'Unknown Product',
      price,
      imageUrl: p?.imageUrl,
      stock: p?.stock ?? 0,
      quantity: item.quantity,
      itemTotal
    };
  });

  return {
    id: cart._id,
    userId: cart.user,
    items: formattedItems,
    totalItems,
    subtotal,
    updatedAt: cart.updatedAt
  };
};

// @desc    Get current user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;

  let cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  res.status(200).json({
    success: true,
    data: {
      cart: formatCartResponse(cart)
    }
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  if (product.stock < quantity) {
    throw new BadRequestError(`Only ${product.stock} units currently in stock`);
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].quantity + quantity;
    if (product.stock < newQty) {
      throw new BadRequestError(`Cannot add more. Only ${product.stock} units available in stock.`);
    }
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    cart.items.push({
      product: new mongoose.Types.ObjectId(productId),
      quantity
    });
  }

  await cart.save();
  await cart.populate('items.product');

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: {
      cart: formatCartResponse(cart)
    }
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new NotFoundError('Product not found in cart');
  }

  if (quantity <= 0) {
    // Remove item if quantity is zero or less
    cart.items.splice(itemIndex, 1);
  } else {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    if (product.stock < quantity) {
      throw new BadRequestError(`Only ${product.stock} units available in stock`);
    }
    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product');

  res.status(200).json({
    success: true,
    message: 'Cart updated',
    data: {
      cart: formatCartResponse(cart)
    }
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
export const removeCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();
  await cart.populate('items.product');

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: {
      cart: formatCartResponse(cart)
    }
  });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;

  const cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    data: {
      cart: {
        userId,
        items: [],
        totalItems: 0,
        subtotal: 0
      }
    }
  });
});

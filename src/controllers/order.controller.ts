import { Response } from 'express';
import { Order } from '../models/Order.model';
import { Cart } from '../models/Cart.model';
import { Product } from '../models/Product.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError, NotFoundError } from '../utils/AppError';

// @desc    Convert active cart to order, verify stock & decrement inventory
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { shippingAddress } = req.body;

  const cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new BadRequestError('Your cart is empty. Add products to cart before creating an order.');
  }

  // Stock validation pass
  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = item.product as any;
    if (!product) {
      throw new BadRequestError('One of the items in your cart is no longer available');
    }

    if (product.stock < item.quantity) {
      throw new BadRequestError(
        `Insufficient stock for "${product.name}". Available: ${product.stock}, in cart: ${item.quantity}`
      );
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      imageUrl: product.imageUrl
    });

    totalAmount += product.price * item.quantity;
  }

  // Atomic / Sequential stock deduction
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity }
    });
  }

  // Create the Order document
  const order = await Order.create({
    user: userId,
    items: orderItems,
    totalAmount,
    status: 'processing',
    paymentStatus: 'completed',
    shippingAddress: shippingAddress || {
      street: '123 Innovation Way',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'USA'
    }
  });

  // Empty the user's cart
  cart.items = [];
  await cart.save();

  res.status(201).json({
    success: true,
    message: 'Order created successfully and inventory updated',
    data: { order }
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;

  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      count: orders.length,
      orders
    }
  });
});

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    throw new NotFoundError(`Order not found with id ${req.params.id}`);
  }

  // Ensure user owns this order unless they are an admin
  if (order.user._id.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
    throw new NotFoundError('Order not found or unauthorized to view');
  }

  res.status(200).json({
    success: true,
    data: { order }
  });
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      count: orders.length,
      orders
    }
  });
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!order) {
    throw new NotFoundError(`Order not found with id ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    message: 'Order status updated',
    data: { order }
  });
});

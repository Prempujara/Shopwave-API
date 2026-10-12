import { Request, Response } from 'express';
import { Product } from '../models/Product.model';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError } from '../utils/AppError';

// @desc    Get all products with pagination, filtering & search
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '10',
    search,
    category,
    minPrice,
    maxPrice,
    sort = '-createdAt'
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Build filter query
  const query: any = {};

  if (category && category !== 'All') {
    query.category = { $regex: new RegExp(`^${category}$`, 'i') };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (search && (search as string).trim() !== '') {
    const searchRegex = new RegExp((search as string).trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { category: searchRegex }
    ];
  }

  // Handle sorting
  let sortOption: any = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };
  else if (sort === 'rating_desc') sortOption = { rating: -1 };
  else if (sort === 'name_asc') sortOption = { name: 1 };

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
    Product.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    data: {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }
  });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new NotFoundError(`Product not found with id ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    data: { product }
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product }
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    throw new NotFoundError(`Product not found with id ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product }
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new NotFoundError(`Product not found with id ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
    data: null
  });
});

// @desc    Get product categories list
// @route   GET /api/products/categories/list
// @access  Public
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Product.distinct('category');
  res.status(200).json({
    success: true,
    data: { categories }
  });
});

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  rating?: number;
  createdAt?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  stock: number;
  quantity: number;
  itemTotal: number;
}

export interface Cart {
  id?: string;
  userId?: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  _id: string;
  user: any;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

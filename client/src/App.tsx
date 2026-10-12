import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { apiFetch, setStoredToken, getStoredToken } from './services/api';
import type { User, Product, Cart, Order } from './types';
import {
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  User as UserIcon,
  Search,
  Plus,
  Trash2,
  Package,
  Layers,
  Sparkles,
  LogOut,
  ExternalLink,
  ArrowRight,
  Lock,
  Database,
  Zap
} from 'lucide-react';
import './App.css';

export const App: React.FC = () => {
  // Navigation & View tabs: 'store' | 'cart' | 'orders' | 'admin' | 'docs'
  const [activeTab, setActiveTab] = useState<'store' | 'cart' | 'orders' | 'admin' | 'docs'>('store');

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<'user' | 'admin'>('user');
  const [authError, setAuthError] = useState<string | null>(null);

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Cart State
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartLoading, setCartLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Admin New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(99.99);
  const [newProdCategory, setNewProdCategory] = useState('Electronics');
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdImage, setNewProdImage] = useState('');
  const [adminMessage, setAdminMessage] = useState<string | null>(null);

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#06b6d4']
    });
  };

  // Check existing token on mount
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      apiFetch('/auth/me')
        .then((res) => {
          if (res.success) {
            setCurrentUser(res.data.user);
          }
        })
        .catch(() => {
          setStoredToken(null);
        });
    }
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, searchQuery, sortBy]);

  // Fetch cart & orders if user logs in
  useEffect(() => {
    if (currentUser) {
      fetchCart();
      fetchOrders();
      if (currentUser.role === 'admin') {
        fetchAdminOrders();
      }
    } else {
      setCart(null);
      setOrders([]);
      setAdminOrders([]);
    }
  }, [currentUser]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      let url = `/products?page=${page}&limit=8&sort=${sortBy}`;
      if (selectedCategory && selectedCategory !== 'All') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await apiFetch(url);
      if (res.success) {
        setProducts(res.data.products);
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiFetch('/products/categories/list');
      if (res.success) {
        setCategories(['All', ...res.data.categories]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCart = async () => {
    if (!currentUser) return;
    try {
      const res = await apiFetch('/cart');
      if (res.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    if (!currentUser) return;
    setLoadingOrders(true);
    try {
      const res = await apiFetch('/orders');
      if (res.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAdminOrders = async () => {
    try {
      const res = await apiFetch('/orders/admin/all');
      if (res.success) {
        setAdminOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      let res;
      if (isRegisterMode) {
        res = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            password: authPassword,
            role: authRole
          })
        });
      } else {
        res = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: authEmail,
            password: authPassword
          })
        });
      }

      if (res.success) {
        setStoredToken(res.data.token);
        setCurrentUser(res.data.user);
        setAuthModalOpen(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
        showToast(`Welcome, ${res.data.user.name}! 🚀`);
        triggerConfetti();
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    setStoredToken(null);
    setCurrentUser(null);
    showToast('Signed out successfully');
  };

  const handleAddToCart = async (productId: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      showToast('Please sign in or register to add items to your cart.');
      return;
    }

    try {
      const res = await apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 })
      });
      if (res.success) {
        setCart(res.data.cart);
        showToast('Added to cart! 🛒');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleUpdateCartQuantity = async (productId: string, quantity: number) => {
    try {
      const res = await apiFetch(`/cart/items/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      });
      if (res.success) {
        setCart(res.data.cart);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleRemoveCartItem = async (productId: string) => {
    try {
      const res = await apiFetch(`/cart/items/${productId}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setCart(res.data.cart);
        showToast('Item removed from cart');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleCheckout = async () => {
    try {
      setCartLoading(true);
      const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: {
            street: '452 Innovation Blvd',
            city: 'Silicon Valley',
            state: 'CA',
            postalCode: '94025',
            country: 'USA'
          }
        })
      });
      if (res.success) {
        setCart({ items: [], totalItems: 0, subtotal: 0 });
        triggerConfetti();
        showToast('🎉 Order placed successfully! Stock was deducted.');
        setActiveTab('orders');
        fetchOrders();
      }
    } catch (err: any) {
      showToast(`Checkout failed: ${err.message}`);
    } finally {
      setCartLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: newProdName,
          description: newProdDesc,
          price: Number(newProdPrice),
          category: newProdCategory,
          stock: Number(newProdStock),
          imageUrl: newProdImage || undefined
        })
      });

      if (res.success) {
        setAdminMessage('Product published to live catalog successfully!');
        setNewProdName('');
        setNewProdDesc('');
        setNewProdPrice(99.99);
        setNewProdStock(25);
        setNewProdImage('');
        fetchProducts();
        fetchCategories();
        triggerConfetti();
        setTimeout(() => setAdminMessage(null), 3000);
      }
    } catch (err: any) {
      setAdminMessage(`Failed: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await apiFetch(`/products/${id}`, { method: 'DELETE' });
      if (res.success) {
        showToast('Product removed');
        fetchProducts();
      }
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="toast-banner animate-fade-in">
          <Zap size={18} color="#ec4899" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modern Cybernetic Navigation Header */}
      <header className="navbar glass-nav">
        <div className="navbar-inner">
          <div className="nav-brand" onClick={() => setActiveTab('store')}>
            <div className="brand-icon-wrapper">
              <Sparkles size={22} color="#fff" />
            </div>
            <div className="brand-text">
              <span className="brand-title">SHOPWAVE</span>
              <span className="brand-badge">HIGH-PERFORMANCE CORE</span>
            </div>
          </div>

          <nav className="nav-links">
            <button
              className={`nav-btn ${activeTab === 'store' ? 'active' : ''}`}
              onClick={() => setActiveTab('store')}
            >
              <ShoppingBag size={18} />
              <span>Storefront</span>
            </button>

            <button
              className={`nav-btn ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
            >
              <ShoppingCart size={18} />
              <span>Cart</span>
              {cart && cart.totalItems > 0 && (
                <span className="cart-counter">{cart.totalItems}</span>
              )}
            </button>

            <button
              className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => {
                if (!currentUser) {
                  setAuthModalOpen(true);
                  showToast('Please sign in to view your orders.');
                } else {
                  setActiveTab('orders');
                }
              }}
            >
              <Package size={18} />
              <span>Orders</span>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                className={`nav-btn admin-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                <ShieldCheck size={18} />
                <span>Admin Suite</span>
              </button>
            )}

            <a
              href="/api-docs"
              target="_blank"
              rel="noreferrer"
              className="nav-btn docs-link"
              title="Open Interactive Swagger OpenAPI Playground"
            >
              <Layers size={18} />
              <span>Swagger API</span>
              <ExternalLink size={13} style={{ marginLeft: 4 }} />
            </a>
          </nav>

          <div className="nav-actions">
            {currentUser ? (
              <div className="user-profile">
                <div className="user-avatar">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{currentUser.name}</span>
                  <span className="user-role-badge">{currentUser.role}</span>
                </div>
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setAuthModalOpen(true);
                  }}
                >
                  Sign In
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setAuthModalOpen(true);
                  }}
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* VIEW 1: STORE FRONT */}
        {activeTab === 'store' && (
          <div className="store-view animate-fade-in">
            {/* 3D Visual Hero Stage */}
            <section className="hero-stage">
              <div className="hero-stage-content">
                <div className="hero-pill">
                  <Sparkles size={14} color="#a855f7" /> Production Node.js & TypeScript API Architecture
                </div>
                <h1 className="hero-headline">
                  Next-Gen E-Commerce <br />
                  <span className="text-gradient">Engineered for Velocity.</span>
                </h1>
                <p className="hero-subtext">
                  A high-throughput backend architecture featuring JWT authentication, role-based security, Zod schema validation, real-time stock deductions, and live OpenAPI documentation.
                </p>
                <div className="hero-actions">
                  <button
                    className="btn-primary-large"
                    onClick={() => {
                      const el = document.getElementById('catalog-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Explore Catalog <ArrowRight size={18} />
                  </button>
                  <a
                    href="/api-docs"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline-large"
                  >
                    API Documentation <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              {/* Bespoke 3D Artwork Container */}
              <div className="hero-visual-wrapper">
                <div className="hero-art-container animate-float">
                  <img
                    src="/hero_art.jpg"
                    alt="Cybernetic Digital Commerce Prism"
                    className="hero-art-img"
                  />
                  <div className="art-floating-chip">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="chip-status-dot"></span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                        API Engine Live & Healthy
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#a855f7', fontFamily: 'var(--font-mono)' }}>
                      v1.0.0 TS
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Architecture Highlights Ribbon */}
            <section className="features-ribbon glass-panel">
              <div className="feature-tile">
                <div className="feature-icon-box">
                  <Lock size={22} />
                </div>
                <div>
                  <div className="feature-title">Role-Based Security</div>
                  <div className="feature-desc">JWT authentication, bcryptjs salt rounds, and granular user/admin RBAC.</div>
                </div>
              </div>

              <div className="feature-tile">
                <div className="feature-icon-box" style={{ background: 'rgba(236, 72, 153, 0.12)', borderColor: 'rgba(236, 72, 153, 0.3)', color: '#f472b6' }}>
                  <Zap size={22} />
                </div>
                <div>
                  <div className="feature-title">Atomic Inventory</div>
                  <div className="feature-desc">Cart-to-order pipeline with stock validations and immediate inventory reduction.</div>
                </div>
              </div>

              <div className="feature-tile">
                <div className="feature-icon-box" style={{ background: 'rgba(6, 182, 212, 0.12)', borderColor: 'rgba(6, 182, 212, 0.3)', color: '#22d3ee' }}>
                  <Database size={22} />
                </div>
                <div>
                  <div className="feature-title">Optimized Querying</div>
                  <div className="feature-desc">Mongoose text indexes for fast search, category filtering, and clean pagination.</div>
                </div>
              </div>
            </section>

            {/* Filter and Search Bar */}
            <section id="catalog-section" className="filter-section glass-panel">
              <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products by title, category or description..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="category-chips">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setPage(1);
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="sort-dropdown">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
              </div>
            </section>

            {/* Product Grid */}
            <section className="product-grid-section">
              {loadingProducts ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Querying Shopwave catalog...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="empty-state glass-panel">
                  <h3>No products found</h3>
                  <p>Try refining your search terms or filter criteria.</p>
                </div>
              ) : (
                <div className="product-grid">
                  {products.map((product) => (
                    <div key={product._id} className="product-card glass-panel">
                      <div className="product-image-container">
                        <img
                          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                          alt={product.name}
                          className="product-image"
                        />
                        <span className="product-category-tag">{product.category}</span>
                        {product.stock <= 5 && product.stock > 0 && (
                          <span className="low-stock-tag">Low Stock: {product.stock} left</span>
                        )}
                        {product.stock === 0 && (
                          <span className="out-of-stock-tag">Out of Stock</span>
                        )}
                      </div>

                      <div className="product-info">
                        <div className="product-header">
                          <h3 className="product-title">{product.name}</h3>
                          <div className="product-rating">
                            ★ {product.rating?.toFixed(1) || '4.8'}
                          </div>
                        </div>

                        <p className="product-desc">{product.description}</p>

                        <div className="product-footer">
                          <div className="price-tag">
                            <span className="currency">$</span>
                            <span className="amount">{product.price.toFixed(2)}</span>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            {currentUser?.role === 'admin' && (
                              <button
                                className="btn-remove"
                                onClick={() => handleDeleteProduct(product._id)}
                                title="Delete Product (Admin)"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            <button
                              className="btn-add-cart"
                              disabled={product.stock === 0}
                              onClick={() => handleAddToCart(product._id)}
                            >
                              <ShoppingCart size={16} />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="pagination glass-panel">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <span className="page-indicator">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: SHOPPING CART */}
        {activeTab === 'cart' && (
          <div className="cart-view animate-fade-in">
            <h2 className="view-title">
              <ShoppingCart size={28} /> Shopping Cart
            </h2>

            {!currentUser ? (
              <div className="empty-state glass-panel">
                <UserIcon size={52} className="empty-icon" />
                <h3>Authentication Required</h3>
                <p>Sign in or register an account to view and persist your cart items.</p>
                <button
                  className="btn-primary"
                  onClick={() => setAuthModalOpen(true)}
                  style={{ marginTop: 18 }}
                >
                  Sign In Now
                </button>
              </div>
            ) : !cart || cart.items.length === 0 ? (
              <div className="empty-state glass-panel">
                <ShoppingBag size={52} className="empty-icon" />
                <h3>Your Cart is Empty</h3>
                <p>Explore our premium product catalog to add your desired items.</p>
                <button
                  className="btn-primary"
                  onClick={() => setActiveTab('store')}
                  style={{ marginTop: 18 }}
                >
                  Return to Store
                </button>
              </div>
            ) : (
              <div className="cart-layout">
                <div className="cart-items-list">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="cart-item-card glass-panel">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                        alt={item.name}
                        className="cart-item-img"
                      />
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <div className="cart-item-price">${item.price.toFixed(2)} each</div>
                        <div className="cart-item-stock">Available stock: {item.stock}</div>
                      </div>

                      <div className="cart-item-controls">
                        <div className="quantity-controls">
                          <button
                            onClick={() => handleUpdateCartQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="qty-number">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateCartQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            +
                          </button>
                        </div>

                        <div className="item-subtotal">
                          ${item.itemTotal.toFixed(2)}
                        </div>

                        <button
                          className="btn-remove"
                          onClick={() => handleRemoveCartItem(item.productId)}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary glass-panel">
                  <h3>Order Summary</h3>
                  <div className="summary-row">
                    <span>Items Count</span>
                    <span>{cart.totalItems}</span>
                  </div>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Express Shipping</span>
                    <span className="text-free">FREE</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax Estimate (0%)</span>
                    <span>$0.00</span>
                  </div>

                  <hr className="divider" />

                  <div className="summary-total">
                    <span>Total Amount</span>
                    <span className="total-price">${cart.subtotal.toFixed(2)}</span>
                  </div>

                  <button
                    className="btn-checkout"
                    disabled={cartLoading}
                    onClick={handleCheckout}
                  >
                    {cartLoading ? 'Processing Order...' : 'Complete Checkout'}
                  </button>

                  <p className="checkout-note">
                    🔒 Protected with JWT authentication & atomic inventory verification.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div className="orders-view animate-fade-in">
            <h2 className="view-title">
              <Package size={28} /> Order History & Receipts
            </h2>

            {loadingOrders ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-state glass-panel">
                <Package size={52} className="empty-icon" />
                <h3>No orders placed yet</h3>
                <p>When you checkout items from your cart, your order records will show here.</p>
                <button
                  className="btn-primary"
                  onClick={() => setActiveTab('store')}
                  style={{ marginTop: 18 }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="order-card glass-panel">
                    <div className="order-header">
                      <div>
                        <div className="order-id">Order ID: #{order._id}</div>
                        <div className="order-date">
                          Placed on: {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </div>

                      <div className="order-status-badge">
                        {order.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                            alt={item.name}
                            className="order-item-thumb"
                          />
                          <div className="order-item-meta">
                            <span className="item-name">{item.name}</span>
                            <span className="item-detail">
                              Qty: {item.quantity} × ${item.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="item-row-total">
                            ${(item.quantity * item.price).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-footer">
                      <div className="shipping-info">
                        <strong>Shipping to:</strong> {order.shippingAddress?.street},{' '}
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                        {order.shippingAddress?.postalCode}
                      </div>
                      <div className="order-total-badge">
                        <span>Total Paid:</span>
                        <strong>${order.totalAmount.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: ADMIN SUITE */}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <div className="admin-view animate-fade-in">
            <h2 className="view-title">
              <ShieldCheck size={28} /> Admin Suite & Catalog Management
            </h2>

            {adminMessage && (
              <div className="admin-alert glass-panel">{adminMessage}</div>
            )}

            <div className="admin-grid">
              {/* Product Creation Form */}
              <div className="admin-form-card glass-panel">
                <h3>Add New Product</h3>
                <form onSubmit={handleCreateProduct}>
                  <div className="form-group">
                    <label>Product Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Smart Ambient Desk Light"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      required
                      placeholder="Detailed product features..."
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Stock Quantity</label>
                      <input
                        type="number"
                        required
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Smart Home, Wearables"
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Image URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                    <Plus size={16} /> Publish Product
                  </button>
                </form>
              </div>

              {/* Active Admin Order Oversight */}
              <div className="admin-orders-card glass-panel">
                <h3>System-Wide Orders ({adminOrders.length})</h3>
                {adminOrders.length === 0 ? (
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No store orders created yet.</p>
                ) : (
                  <div className="admin-orders-table">
                    {adminOrders.map((o) => (
                      <div key={o._id} className="admin-order-row">
                        <div>
                          <strong>#{o._id.slice(-6)}</strong>
                          <span className="customer-tag">
                            {o.user?.email || 'Customer'}
                          </span>
                        </div>
                        <div>${o.totalAmount.toFixed(2)}</div>
                        <span className="status-tag">{o.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal (Sign In / Register) */}
      {authModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card glass-panel animate-fade-in">
            <div className="modal-header">
              <h3>{isRegisterMode ? 'Create an Account' : 'Welcome to Shopwave'}</h3>
              <button
                className="close-btn"
                onClick={() => setAuthModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {authError && <div className="modal-error">{authError}</div>}

            <form onSubmit={handleAuthSubmit}>
              {isRegisterMode && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              {isRegisterMode && (
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={authRole}
                    onChange={(e) => setAuthRole(e.target.value as 'user' | 'admin')}
                  >
                    <option value="user">Customer (Standard User)</option>
                    <option value="admin">Administrator (Admin Suite Access)</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
                {isRegisterMode ? 'Register Account' : 'Sign In'}
              </button>
            </form>

            {/* Quick Demo Credentials Autofill */}
            <div className="demo-credentials-box">
              <span className="demo-title">⚡ Quick Demo Credentials:</span>
              <div className="demo-btn-group">
                <button
                  type="button"
                  className="demo-pill"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setAuthEmail('admin@shopwave.local');
                    setAuthPassword('AdminPassword123!');
                  }}
                >
                  Admin Login
                </button>
                <button
                  type="button"
                  className="demo-pill"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setAuthEmail('customer@shopwave.local');
                    setAuthPassword('CustomerPassword123!');
                  }}
                >
                  Customer Login
                </button>
              </div>
            </div>

            <div className="modal-footer">
              {isRegisterMode ? (
                <p>
                  Already have an account?{' '}
                  <span
                    className="link-span"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setAuthError(null);
                    }}
                  >
                    Sign In
                  </span>
                </p>
              ) : (
                <p>
                  Don't have an account?{' '}
                  <span
                    className="link-span"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setAuthError(null);
                    }}
                  >
                    Create one
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

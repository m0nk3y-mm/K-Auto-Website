/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCw, Phone, MapPin, Mail, ChevronLeft, ChevronRight, SlidersHorizontal
} from 'lucide-react';

import { Product, ProductCategory, User, OrderItem } from './types';
import { dbService } from './services/databaseService';
import { POPULAR_CAR_MODELS } from './data/initialData';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductQuickView } from './components/ProductQuickView';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';

const CART_STORAGE_KEY = 'apexauto_cart_v2';
const USER_STORAGE_KEY = 'apexauto_active_user_v2';
const PRODUCTS_PER_PAGE = 8; // Clean 8-item pages so 12+ items neatly create Page 1 | 2

export default function App() {
  // Navigation View: 'store' or 'admin'
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');

  // Products & Filtering
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [selectedCarModel, setSelectedCarModel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'stock'>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals & Drawers
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Cart & Auth State (Persisted)
  const [cartItems, setCartItems] = useState<OrderItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Order Success State
  const [latestOrderId, setLatestOrderId] = useState<string>('');
  const [latestOrderDetails, setLatestOrderDetails] = useState<{
    name: string;
    phone: string;
    address: string;
    total: number;
    method: string;
  } | null>(null);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState<boolean>(false);

  // Fetch products from persistent database
  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const items = await dbService.getProducts();
      setProducts(items);
    } catch (err) {
      console.error('Failed to load products from database:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadProducts();
  }, []);

  // Real-time reactive update whenever switching views or when database events fire
  useEffect(() => {
    if (currentView === 'store') {
      loadProducts();
    }
  }, [currentView]);

  useEffect(() => {
    const handleProductsUpdated = () => {
      loadProducts();
    };
    window.addEventListener('apexauto:products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('apexauto:products_updated', handleProductsUpdated);
    };
  }, []);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedCarModel, searchQuery, sortBy]);

  // Save cart changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Save user session changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [currentUser]);

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.ProductID === product.ProductID);
      if (existing) {
        return prev.map((item) =>
          item.ProductID === product.ProductID
            ? { ...item, Quantity: item.Quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          ProductID: product.ProductID,
          PartName: product.PartName,
          Price: product.Price,
          Quantity: quantity,
          ImageURL: product.ImageURL,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.ProductID === productId ? { ...item, Quantity: quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.ProductID !== productId));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (currentView === 'admin') {
      setCurrentView('store');
    }
  };

  const handleOrderSuccess = (
    orderId: string,
    details: { name: string; phone: string; address: string; total: number; method: string }
  ) => {
    setCartItems([]);
    setIsCheckoutOpen(false);
    setLatestOrderId(orderId);
    setLatestOrderDetails(details);
    setIsOrderSuccessOpen(true);
    loadProducts();
  };

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'All' || prod.Category === selectedCategory;

    const matchesSearch =
      !searchQuery.trim() ||
      prod.PartName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.ProductID.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.CarModelCompatibility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.Category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCarModel =
      !selectedCarModel.trim() ||
      prod.CarModelCompatibility.toLowerCase().includes(
        selectedCarModel.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim()
      ) ||
      prod.CarModelCompatibility.toLowerCase().includes('universal');

    return matchesCategory && matchesSearch && matchesCarModel;
  });

  // Sorted Products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.Price - b.Price;
    if (sortBy === 'price-high') return b.Price - a.Price;
    if (sortBy === 'stock') return b.StockQty - a.StockQty;
    return 0;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.Quantity, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Global Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      {/* VIEW 1: ADMIN DASHBOARD */}
      {currentView === 'admin' ? (
        <AdminDashboard
          currentUser={currentUser}
          onBackToStore={() => setCurrentView('store')}
          onOpenAuthModal={() => setIsAuthOpen(true)}
          onProductChange={loadProducts}
        />
      ) : (
        /* VIEW 2: CUSTOMER STOREFRONT */
        <main className="flex-1">
          
          {/* Hero Section with Vehicle Matcher */}
          <Hero
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedCarModel={selectedCarModel}
            onSelectCarModel={setSelectedCarModel}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onFindPartsClick={() => {
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Product Catalog Section */}
          <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
            {/* Catalog Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-3xl font-black text-white uppercase tracking-wider">
                    {selectedCategory === 'All' ? 'Automotive Spare Parts Catalog' : `${selectedCategory} Components`}
                  </h2>
                  <span className="font-mono text-xs text-zinc-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                    {sortedProducts.length} items
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {selectedCarModel ? (
                    <span>
                      Filtered for: <strong className="text-white">{selectedCarModel}</strong>
                    </span>
                  ) : (
                    <span>Showing OEM and performance parts with verified compatibility (Mouseover photo to zoom)</span>
                  )}
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ProductCategory)}
                  className="h-10 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Engine">Engine Parts</option>
                  <option value="Brakes">Brakes & Rotors</option>
                  <option value="Suspension">Suspension & Struts</option>
                  <option value="Lighting">LED & Headlights</option>
                  <option value="Oils">Oils & Lubricants</option>
                  <option value="Accessories">Accessories</option>
                </select>

                {/* Car Model Quick Filter */}
                <select
                  value={selectedCarModel}
                  onChange={(e) => setSelectedCarModel(e.target.value)}
                  className="h-10 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-red-500 cursor-pointer max-w-[180px]"
                >
                  <option value="">All Car Models</option>
                  {POPULAR_CAR_MODELS.filter((m) => m !== 'All Vehicles').map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                {/* Sort By Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="stock">Availability</option>
                </select>

                {/* Refresh Catalog */}
                <button
                  onClick={loadProducts}
                  disabled={isLoadingProducts}
                  className="h-10 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reload parts"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProducts ? 'animate-spin text-red-500' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

              </div>
            </div>

            {/* Active Filters Bar */}
            {(selectedCategory !== 'All' || selectedCarModel || searchQuery) && (
              <div className="py-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-zinc-500">Active filters:</span>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>Category: {selectedCategory}</span>
                    <span className="text-zinc-500 hover:text-red-400">&times;</span>
                  </button>
                )}
                {selectedCarModel && (
                  <button
                    onClick={() => setSelectedCarModel('')}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>Vehicle: {selectedCarModel}</span>
                    <span className="text-zinc-500 hover:text-red-400">&times;</span>
                  </button>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>Search: "{searchQuery}"</span>
                    <span className="text-zinc-500 hover:text-red-400">&times;</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedCarModel('');
                    setSearchQuery('');
                  }}
                  className="text-red-400 hover:underline text-xs ml-2 cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            )}

            {/* Product Cards Grid with Mouseover Zoom */}
            {isLoadingProducts ? (
              <div className="py-20 text-center space-y-4">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500" />
                <p className="text-sm text-slate-400 font-mono">
                  Loading auto parts catalog...
                </p>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-slate-900/40 rounded-2xl border border-slate-800 my-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-zinc-600">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-white">No automotive parts found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your vehicle model filter or search term. You can also view all parts across all models.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedCarModel('');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.ProductID}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>

                {/* PAGINATION SECTION (Page 1 | 2 Controls Requested by User) */}
                <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  
                  {/* Item counter */}
                  <div className="text-xs text-zinc-400 font-mono">
                    Showing <strong className="text-white">{startIndex + 1}</strong> –{' '}
                    <strong className="text-white">{Math.min(startIndex + PRODUCTS_PER_PAGE, sortedProducts.length)}</strong> of{' '}
                    <strong className="text-white">{sortedProducts.length}</strong> auto parts
                  </div>

                  {/* Page 1 | 2 Button Bar */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(Math.max(1, safeCurrentPage - 1))}
                      disabled={safeCurrentPage <= 1}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    {/* Numbered Pages with '|' separator */}
                    <div className="flex items-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum, index) => {
                        const isActive = pageNum === safeCurrentPage;
                        return (
                          <React.Fragment key={pageNum}>
                            <button
                              onClick={() => handlePageChange(pageNum)}
                              className={`min-w-[36px] h-8 px-2.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-red-600 text-white shadow-md shadow-red-950 scale-105'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                              }`}
                            >
                              Page {pageNum}
                            </button>
                            {index < totalPages - 1 && (
                              <span className="mx-1 text-slate-700 select-none" aria-hidden="true">
                                |
                              </span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, safeCurrentPage + 1))}
                      disabled={safeCurrentPage >= totalPages}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                      aria-label="Next Page"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </>
            )}

          </section>

        </main>
      )}

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-3">
              <span className="font-heading text-2xl font-black tracking-wider text-white uppercase">
                K<span className="text-red-600">AUTO</span>
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Myanmar's premier automotive spare parts & performance platform inspired by clean e-commerce engineering.
              </p>
              <p className="text-[11px] font-mono text-zinc-500">
                Yangon Distribution Hub · Mandalay Express Hub
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-mono text-xs uppercase font-semibold text-white tracking-wider">
                Categories
              </h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><button onClick={() => { setSelectedCategory('Brakes'); setCurrentView('store'); }} className="hover:text-white cursor-pointer">Brake Rotors & Pads</button></li>
                <li><button onClick={() => { setSelectedCategory('Suspension'); setCurrentView('store'); }} className="hover:text-white cursor-pointer">Coilovers & Shocks</button></li>
                <li><button onClick={() => { setSelectedCategory('Engine'); setCurrentView('store'); }} className="hover:text-white cursor-pointer">Engine & Intake Filters</button></li>
                <li><button onClick={() => { setSelectedCategory('Oils'); setCurrentView('store'); }} className="hover:text-white cursor-pointer">Synthetic Motor Oils</button></li>
                <li><button onClick={() => { setSelectedCategory('Lighting'); setCurrentView('store'); }} className="hover:text-white cursor-pointer">Philips LED Headlamps</button></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-mono text-xs uppercase font-semibold text-white tracking-wider">
                Vehicle Compatibility
              </h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><button onClick={() => { setSelectedCarModel('Toyota Crown'); setCurrentView('store'); }} className="hover:text-white cursor-pointer">Toyota Crown GRS200/204</button></li>
                <li><button onClick={() => { setSelectedCarModel('Toyota Hilux'); setCurrentView('store'); }} className="hover:text-white cursor-pointer">Toyota Hilux Revo / Rocco</button></li>
                <li><button onClick={() => { setSelectedCarModel('Toyota Probox'); setCurrentView('store'); }} className="hover:text-white cursor-pointer">Toyota Probox / Succeed</button></li>
                <li><button onClick={() => { setSelectedCarModel('Honda Fit'); setCurrentView('store'); }} className="hover:text-white cursor-pointer">Honda Fit / Jazz GK5</button></li>
                <li><button onClick={() => setCurrentView('admin')} className="hover:text-white cursor-pointer">Admin Management</button></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-mono text-xs uppercase font-semibold text-white tracking-wider">
                Contact & Delivery
              </h4>
              <div className="space-y-2 text-slate-400">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-red-500" />
                  <span className="font-mono">09-971234567 / 09-798765432</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>Kamayut Township, Yangon, Myanmar</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-red-500" />
                  <span>support@kauto.mm</span>
                </p>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 font-mono">
            <span>&copy; {new Date().getFullYear()} Kauto Myanmar. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span>KBZPay · WavePay · AYA Bank · Cash on Delivery</span>
            </div>
          </div>

        </div>
      </footer>

      {/* QUICK VIEW MODAL */}
      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        currentUser={currentUser}
        onOrderSuccess={handleOrderSuccess}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* ORDER SUCCESS MODAL */}
      <OrderSuccessModal
        isOpen={isOrderSuccessOpen}
        onClose={() => setIsOrderSuccessOpen(false)}
        orderId={latestOrderId}
        orderDetails={latestOrderDetails}
        onViewInAdmin={() => {
          setCurrentView('admin');
        }}
      />

      {/* AUTH MODAL (LOGIN & REGISTER) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

    </div>
  );
}

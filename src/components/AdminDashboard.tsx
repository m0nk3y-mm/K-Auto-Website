import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingCart, DollarSign, AlertTriangle, Plus, Search, 
  Trash2, RefreshCw, Database, ArrowLeft, CheckCircle2, 
  ShieldCheck, Download, Upload, RotateCcw, Image as ImageIcon, Link as LinkIcon, X
} from 'lucide-react';
import { User, Product, Order, AnalyticsSummary, OrderPaymentStatus, DatabaseStats } from '../types';
import { dbService } from '../services/databaseService';

interface AdminDashboardProps {
  currentUser: User | null;
  onBackToStore: () => void;
  onOpenAuthModal: () => void;
  onProductChange?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onBackToStore,
  onOpenAuthModal,
  onProductChange
}) => {
  const [activeTab, setActiveTab] = useState<'kpi' | 'orders' | 'products' | 'users' | 'database'>('kpi');
  
  // Data states
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseStats>({
    usersCount: 0,
    productsCount: 0,
    ordersCount: 0,
    lastUpdated: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & filter states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('All');

  const [userSearch, setUserSearch] = useState('');

  // Add Product Modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newCategory, setNewCategory] = useState('Engine');
  const [newCompatibility, setNewCompatibility] = useState('Toyota Crown, Mark X, Hilux');
  const [newPrice, setNewPrice] = useState('185000');
  const [newStock, setNewStock] = useState('15');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageUploadType, setImageUploadType] = useState<'upload' | 'url'>('upload');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // File Upload Handler for Part Image
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be under 5MB');
        return;
      }
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setNewImageUrl(result);
        showToast(`Image "${file.name}" loaded successfully!`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Status feedback toast
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadAllAdminData = async () => {
    setRefreshing(true);
    try {
      const [kpi, fetchedOrders, fetchedProducts, fetchedUsers, stats] = await Promise.all([
        dbService.getAnalytics(),
        dbService.getOrders(),
        dbService.getProducts(),
        dbService.getUsers(),
        dbService.getDatabaseStats()
      ]);
      setAnalytics(kpi);
      setOrders(fetchedOrders);
      setProducts(fetchedProducts);
      setUsersList(fetchedUsers);
      setDbStats(stats);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Update order payment status
  const handleStatusChange = async (orderId: string, newStatus: OrderPaymentStatus) => {
    try {
      await dbService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.OrderID === orderId ? { ...o, PaymentStatus: newStatus } : o));
      showToast(`Order ${orderId} status updated to "${newStatus}".`);
      const kpi = await dbService.getAnalytics();
      setAnalytics(kpi);
    } catch {
      showToast('Failed to update order status');
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(`Are you sure you want to delete product ${productId}?`)) return;
    try {
      await dbService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.ProductID !== productId));
      showToast(`Product ${productId} deleted.`);
      const kpi = await dbService.getAnalytics();
      setAnalytics(kpi);
      onProductChange?.();
    } catch {
      showToast('Failed to delete product');
    }
  };

  // Quick stock adjuster
  const handleStockUpdate = async (productId: string, currentStock: number, delta: number) => {
    const nextStock = Math.max(0, currentStock + delta);
    await dbService.updateProductStock(productId, nextStock);
    setProducts(prev => prev.map(p => p.ProductID === productId ? { ...p, StockQty: nextStock } : p));
    showToast(`Stock updated for ${productId}`);
    onProductChange?.();
  };

  // Add Product Handler
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim()) return;

    setIsSubmittingProduct(true);
    try {
      const created = await dbService.addProduct({
        PartName: newPartName.trim(),
        Category: newCategory,
        CarModelCompatibility: newCompatibility.trim(),
        Price: Number(newPrice) || 0,
        StockQty: Number(newStock) || 0,
        ImageURL: newImageUrl.trim(),
        Description: newDescription.trim()
      });

      setProducts(prev => [created, ...prev]);
      setShowAddProductModal(false);
      setNewPartName('');
      setNewDescription('');
      showToast(`New part ${created.ProductID} added to database!`);
      const kpi = await dbService.getAnalytics();
      setAnalytics(kpi);
      onProductChange?.();
    } catch {
      showToast('Error adding product');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const jsonStr = dbService.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kauto_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database backup downloaded successfully!');
  };

  // Factory reset
  const handleResetFactory = () => {
    if (confirm('Restore initial factory inventory & user data? Current modifications will be reset.')) {
      dbService.resetToFactoryDemo();
      loadAllAdminData();
      showToast('Database reset to factory demo values.');
      onProductChange?.();
    }
  };

  // Filtered lists
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.OrderID.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.CustomerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.Phone.includes(orderSearch);
    const matchesStatus = orderStatusFilter === 'All' || o.PaymentStatus === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.PartName.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.ProductID.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.CarModelCompatibility.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCategoryFilter === 'All' || p.Category === productCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredUsers = usersList.filter(u => {
    return (
      u.FullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.Email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.Phone.includes(userSearch)
    );
  });

  // Admin access gate
  if (!currentUser || currentUser.Role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-3xl font-black text-white uppercase tracking-wider">
            Admin Access Protected
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            This dashboard manages database tables (Users, Products, Orders) and requires administrator privileges.
          </p>
        </div>

        <div className="p-5 max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <p className="text-xs text-zinc-300">
            For demonstration & review, sign in with the pre-seeded admin credentials:
          </p>
          <div className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-left space-y-1 border border-slate-800">
            <div><span className="text-zinc-500">Email:</span> <strong className="text-white">admin@uedcmm.com</strong></div>
            <div><span className="text-zinc-500">Password:</span> <strong className="text-white">admin123</strong></div>
            <div><span className="text-zinc-500">Role:</span> <span className="text-red-400">admin</span></div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onOpenAuthModal}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
            >
              Sign In as Admin
            </button>
            <button
              onClick={onBackToStore}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Return to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-medium rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-black text-white uppercase tracking-wider">
                  Admin Dashboard
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                  Internal Database Active
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Persistent storage across <strong>Users</strong>, <strong>Products</strong>, and <strong>Orders</strong> tables
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={loadAllAdminData}
              disabled={refreshing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-red-400' : ''}`} />
              <span>Refresh Tables</span>
            </button>

            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shadow-red-950 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Part</span>
            </button>
          </div>

        </div>

        {/* Tab Subnavigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 overflow-x-auto text-xs font-semibold border-t border-slate-800/40">
          <button
            onClick={() => setActiveTab('kpi')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'kpi'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & KPIs
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Orders Management</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-zinc-300">
              {orders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Products Catalog</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-zinc-300">
              {products.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Registered Users</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-zinc-300">
              {usersList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-red-500" />
            <span>Database Tables & Backup</span>
          </button>
        </div>
      </div>

      {/* Main Admin Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPI SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Registered Users */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black font-mono tabular-nums text-white">
                {analytics.totalUsers}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">`Users` Table</span>
            </div>
          </div>

          {/* KPI 2: Total Orders */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Total Orders</span>
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black font-mono tabular-nums text-white">
                {analytics.totalOrders}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">`Orders` Table</span>
            </div>
          </div>

          {/* KPI 3: Total Revenue MMK */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Total Revenue (MMK)</span>
              <DollarSign className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono tabular-nums text-white">
                {analytics.totalRevenue.toLocaleString()}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">Kyats</span>
            </div>
          </div>

          {/* KPI 4: Low Stock Alert */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Low Stock (&le; 10)</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className={`text-3xl font-black font-mono tabular-nums ${analytics.lowStockCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                {analytics.lowStockCount}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">Items Need Restock</span>
            </div>
          </div>

        </div>

        {/* TAB 1: OVERVIEW & QUICK ACTIONS */}
        {activeTab === 'kpi' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Recent Orders Snapshot */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-sm">Recent Store Purchases</h3>
                  <p className="text-xs text-zinc-400">Real-time records from Orders table</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-red-400 hover:underline cursor-pointer"
                >
                  View All ({orders.length}) &rarr;
                </button>
              </div>

              <div className="divide-y divide-slate-800/80 overflow-x-auto">
                {orders.slice(0, 4).map(o => (
                  <div key={o.OrderID} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-red-400">{o.OrderID}</span>
                        <span className="text-white font-medium">{o.CustomerName}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5 font-mono">{o.Phone} · {new Date(o.OrderDate).toLocaleDateString()}</p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="font-mono font-bold text-white block">{o.TotalAmount.toLocaleString()} MMK</span>
                        <span className="text-[10px] text-zinc-400">{o.PaymentMethod || 'KPay/COD'}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        o.PaymentStatus === 'Paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        o.PaymentStatus === 'Shipped' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                        o.PaymentStatus === 'Cancelled' ? 'bg-red-950 text-red-400 border border-red-800' :
                        'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {o.PaymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Restock / Low Inventory List */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-sm">Inventory Watchlist</h3>
                  <p className="text-xs text-zinc-400">Critical stock thresholds</p>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-xs text-red-400 hover:underline cursor-pointer"
                >
                  Manage Catalog &rarr;
                </button>
              </div>

              <div className="space-y-2.5">
                {products.filter(p => p.StockQty <= 10).slice(0, 5).map(prod => (
                  <div key={prod.ProductID} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="text-white font-medium truncate">{prod.PartName}</p>
                      <p className="text-zinc-500 font-mono text-[10px]">{prod.ProductID} · {prod.Category}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        prod.StockQty <= 3 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {prod.StockQty} left
                      </span>
                      <button
                        onClick={() => handleStockUpdate(prod.ProductID, prod.StockQty, 5)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold rounded cursor-pointer"
                        title="Restock +5 units"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                ))}

                {products.filter(p => p.StockQty <= 10).length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-500">
                    All inventory levels are healthy (&gt; 10 units).
                  </p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ORDERS TRACKING TABLE */}
        {activeTab === 'orders' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-5">
            
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by Order ID, customer, phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono">Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-zinc-400 font-mono uppercase text-[11px] bg-slate-950/40">
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Customer & Phone</th>
                    <th className="py-3 px-3">Purchased Parts</th>
                    <th className="py-3 px-3 text-right">Total Amount</th>
                    <th className="py-3 px-3">Order Date</th>
                    <th className="py-3 px-3 text-center">Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No orders match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.OrderID} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-red-400 whitespace-nowrap">
                          {order.OrderID}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-white">{order.CustomerName}</p>
                          <p className="text-[11px] text-zinc-400 font-mono">{order.Phone}</p>
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <div className="space-y-0.5">
                            {order.Items && order.Items.length > 0 ? (
                              order.Items.map((it, idx) => (
                                <p key={idx} className="truncate text-slate-300 text-[11px]">
                                  <span className="font-mono text-zinc-400">{it.Quantity}x</span> {it.PartName}
                                </p>
                              ))
                            ) : (
                              <span className="text-zinc-500 text-[11px]">1x Auto Spare Part</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-white whitespace-nowrap">
                          {Number(order.TotalAmount).toLocaleString()} MMK
                        </td>
                        <td className="py-3 px-3 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                          {new Date(order.OrderDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <select
                            value={order.PaymentStatus}
                            onChange={(e) => handleStatusChange(order.OrderID, e.target.value as OrderPaymentStatus)}
                            className={`h-7 px-2 rounded text-xs font-mono font-semibold border cursor-pointer focus:outline-none ${
                              order.PaymentStatus === 'Paid'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                                : order.PaymentStatus === 'Shipped'
                                ? 'bg-blue-950/80 text-blue-300 border-blue-700'
                                : order.PaymentStatus === 'Delivered'
                                ? 'bg-purple-950/80 text-purple-300 border-purple-700'
                                : order.PaymentStatus === 'Cancelled'
                                ? 'bg-red-950/80 text-red-300 border-red-700'
                                : 'bg-amber-950/80 text-amber-300 border-amber-700'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 3: PRODUCTS CATALOG MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-5">
            
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products, SKU, or vehicle..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Engine">Engine</option>
                  <option value="Brakes">Brakes</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Oils">Oils</option>
                  <option value="Accessories">Accessories</option>
                </select>

                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="h-9 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Part</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-zinc-400 font-mono uppercase text-[11px] bg-slate-950/40">
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3">Part Name & Category</th>
                    <th className="py-3 px-3">Vehicle Compatibility</th>
                    <th className="py-3 px-3 text-right">Price (MMK)</th>
                    <th className="py-3 px-3 text-center">Stock Control</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.map((p) => (
                    <tr key={p.ProductID} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-red-400 whitespace-nowrap">
                        {p.ProductID}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.ImageURL}
                            alt=""
                            className="w-8 h-8 rounded object-cover bg-slate-950 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/src/assets/images/hero_automotive_parts_1793961736556.jpg';
                            }}
                          />
                          <div>
                            <p className="font-semibold text-white max-w-xs truncate">{p.PartName}</p>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase">{p.Category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate text-slate-300 text-[11px]">
                        {p.CarModelCompatibility}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-white whitespace-nowrap">
                        {Number(p.Price).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded px-2 py-0.5">
                          <button
                            onClick={() => handleStockUpdate(p.ProductID, p.StockQty, -1)}
                            className="text-slate-400 hover:text-white px-1 cursor-pointer"
                            title="Decrement stock"
                          >
                            -
                          </button>
                          <span className={`font-mono font-bold text-[11px] ${p.StockQty <= 8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {p.StockQty}
                          </span>
                          <button
                            onClick={() => handleStockUpdate(p.ProductID, p.StockQty, 1)}
                            className="text-slate-400 hover:text-white px-1 cursor-pointer"
                            title="Increment stock"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDeleteProduct(p.ProductID)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 4: USERS MANAGEMENT TABLE */}
        {activeTab === 'users' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-5">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search registered users by name, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Total accounts in `Users` table: <strong>{usersList.length}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-zinc-400 font-mono uppercase text-[11px] bg-slate-950/40">
                    <th className="py-3 px-3">User ID</th>
                    <th className="py-3 px-3">Full Name</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Delivery Address</th>
                    <th className="py-3 px-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((user) => (
                    <tr key={user.UserID} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-zinc-400 whitespace-nowrap">
                        {user.UserID}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                        {user.FullName}
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                        {user.Email}
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                        {user.Phone}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          user.Role === 'admin'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {user.Role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 max-w-xs truncate text-[11px]">
                        {user.Address || 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                        {user.CreatedAt ? new Date(user.CreatedAt).toLocaleDateString() : 'Active'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: DATABASE TABLES & BACKUP */}
        {activeTab === 'database' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                Internal Database Table Architecture
              </h3>
              <p className="text-xs text-zinc-400">
                100% self-contained database engine managing Users, Products, and Orders
              </p>
            </div>

            {/* Table Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs font-mono text-zinc-400">Users Table</span>
                <p className="text-2xl font-bold font-mono text-white">{dbStats.usersCount} rows</p>
                <p className="text-[11px] text-zinc-500 font-mono">Customer & Admin accounts</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs font-mono text-zinc-400">Products Table</span>
                <p className="text-2xl font-bold font-mono text-white">{dbStats.productsCount} rows</p>
                <p className="text-[11px] text-zinc-500 font-mono">Brakes, Suspension, Oils, Spares</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs font-mono text-zinc-400">Orders Table</span>
                <p className="text-2xl font-bold font-mono text-white">{dbStats.ordersCount} rows</p>
                <p className="text-[11px] text-zinc-500 font-mono">Orders with delivery details</p>
              </div>
            </div>

            {/* Data Management Actions */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                Data Maintenance & Backup
              </h4>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Export JSON Backup</span>
                </button>

                <button
                  onClick={handleResetFactory}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-red-500" />
                  <span>Reset Factory Data</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add New Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                  Add New Auto Part
                </h3>
                <p className="text-xs text-zinc-400">
                  Appends directly to Products table
                </p>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Part Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brembo High Carbon Brake Rotor"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-9 px-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="Engine">Engine</option>
                    <option value="Brakes">Brakes</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Oils">Oils</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Price in MMK *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="185000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Initial Stock Units *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Car Model Fitment *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota Crown, Hilux Revo, Fit"
                    value={newCompatibility}
                    onChange={(e) => setNewCompatibility(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Product Image Upload Section */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-red-500" />
                    <span>Product Photo (ပစ္စည်းဓာတ်ပုံတင်ရန်)</span>
                  </label>
                  <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadType('upload')}
                      className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
                        imageUploadType === 'upload' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Device Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadType('url')}
                      className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
                        imageUploadType === 'url' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageUploadType === 'upload' ? (
                  <div>
                    <label
                      htmlFor="part-image-file"
                      className="border-2 border-dashed border-slate-800 hover:border-red-500/60 bg-slate-900/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Upload className="w-6 h-6 text-red-500" />
                      <div className="text-center">
                        <span className="text-xs font-semibold text-white block">
                          Click to browse image from your device
                        </span>
                        <span className="text-[11px] text-zinc-500 block mt-0.5">
                          Supports JPG, PNG, WEBP (Max 5MB)
                        </span>
                      </div>
                      <input
                        id="part-image-file"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    {uploadedFileName && (
                      <p className="text-[11px] text-zinc-400 font-mono mt-1 truncate">
                        Selected file: <strong className="text-slate-200">{uploadedFileName}</strong>
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                      <input
                        type="url"
                        placeholder="https://example.com/part-photo.jpg"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="w-full h-9 pl-8 pr-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Live Image Preview */}
                {newImageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 p-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={newImageUrl}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded bg-slate-950 shrink-0 border border-slate-800"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/src/assets/images/hero_automotive_parts_1793961736556.jpg';
                        }}
                      />
                      <div className="truncate">
                        <span className="text-xs font-semibold text-white block">Photo Preview Ready</span>
                        <span className="text-[10px] text-emerald-400 font-mono">Image attached</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewImageUrl('');
                        setUploadedFileName('');
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Technical Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Engineered specifications, material, and performance attributes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-lg cursor-pointer shadow-lg shadow-red-950"
                >
                  {isSubmittingProduct ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

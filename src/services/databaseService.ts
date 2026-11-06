import { Product, User, Order, AnalyticsSummary, DatabaseStats } from '../types';
import { INITIAL_PRODUCTS, INITIAL_USERS, INITIAL_ORDERS } from '../data/initialData';

const TABLE_USERS = 'apexauto_db_users_v2';
const TABLE_PRODUCTS = 'apexauto_db_products_v2';
const TABLE_ORDERS = 'apexauto_db_orders_v2';

class DatabaseService {
  constructor() {
    this.initializeTables();
  }

  // --- Table Initialization ---
  private initializeTables() {
    try {
      if (!localStorage.getItem(TABLE_PRODUCTS)) {
        localStorage.setItem(TABLE_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      }
      if (!localStorage.getItem(TABLE_USERS)) {
        localStorage.setItem(TABLE_USERS, JSON.stringify(INITIAL_USERS));
      }
      if (!localStorage.getItem(TABLE_ORDERS)) {
        localStorage.setItem(TABLE_ORDERS, JSON.stringify(INITIAL_ORDERS));
      }
    } catch (e) {
      console.error('Failed to initialize local tables:', e);
    }
  }

  // --- Products Table Operations ---
  public async getProducts(): Promise<Product[]> {
    this.initializeTables();
    try {
      const data = localStorage.getItem(TABLE_PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  public async addProduct(product: Omit<Product, 'ProductID'> & { ProductID?: string }): Promise<Product> {
    const products = await this.getProducts();
    const newProduct: Product = {
      ProductID: product.ProductID || `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      PartName: product.PartName.trim(),
      Category: product.Category,
      CarModelCompatibility: product.CarModelCompatibility.trim(),
      Price: Number(product.Price) || 0,
      StockQty: Number(product.StockQty) || 0,
      ImageURL: product.ImageURL || '/src/assets/images/hero_automotive_parts_1793961736556.jpg',
      Description: product.Description || ''
    };

    const updated = [newProduct, ...products];
    localStorage.setItem(TABLE_PRODUCTS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apexauto:products_updated', { detail: updated }));
    }
    return newProduct;
  }

  public async deleteProduct(productId: string): Promise<boolean> {
    const products = await this.getProducts();
    const updated = products.filter(p => p.ProductID !== productId);
    localStorage.setItem(TABLE_PRODUCTS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apexauto:products_updated', { detail: updated }));
    }
    return true;
  }

  public async updateProductStock(productId: string, newStock: number): Promise<void> {
    const products = await this.getProducts();
    const updated = products.map(p => 
      p.ProductID === productId ? { ...p, StockQty: Math.max(0, newStock) } : p
    );
    localStorage.setItem(TABLE_PRODUCTS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apexauto:products_updated', { detail: updated }));
    }
  }

  // --- Users Table Operations ---
  public async getUsers(): Promise<User[]> {
    this.initializeTables();
    try {
      const data = localStorage.getItem(TABLE_USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  public async register(payload: {
    FullName: string;
    Phone: string;
    Email: string;
    Password: string;
    Address: string;
    Role?: 'customer' | 'admin';
  }): Promise<{ success: boolean; user?: User; message: string }> {
    const users = await this.getUsers();
    const cleanEmail = payload.Email.trim().toLowerCase();

    if (users.some(u => u.Email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'ဤ Email ဖြင့် အကောင့်ဖွင့်ပြီးသား ဖြစ်နေပါသည် (Account already exists).' };
    }

    const newUser: User = {
      UserID: `USR-${Math.floor(10000 + Math.random() * 90000)}`,
      FullName: payload.FullName.trim(),
      Phone: payload.Phone.trim(),
      Email: cleanEmail,
      Address: payload.Address.trim(),
      Role: payload.Role || 'customer',
      CreatedAt: new Date().toISOString()
    };

    const updated = [newUser, ...users];
    localStorage.setItem(TABLE_USERS, JSON.stringify(updated));
    return { success: true, user: newUser, message: 'အကောင့်အသစ် အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ (Registration successful)!' };
  }

  public async login(payload: {
    Email: string;
    Password: string;
  }): Promise<{ success: boolean; user?: User; message: string }> {
    const users = await this.getUsers();
    const cleanEmail = payload.Email.trim().toLowerCase();

    // Default admin shortcut
    if (cleanEmail === 'admin@uedcmm.com' && payload.Password === 'admin123') {
      const admin = users.find(u => u.Role === 'admin') || {
        UserID: 'USR-ADMIN01',
        FullName: 'Apex Administrator',
        Phone: '09971234567',
        Email: 'admin@uedcmm.com',
        Address: 'Yangon, Myanmar',
        Role: 'admin' as const,
        CreatedAt: new Date().toISOString()
      };
      return { success: true, user: admin, message: 'Admin အကောင့်သို့ ဝင်ရောက်ပြီးပါပြီ' };
    }

    const found = users.find(u => u.Email.toLowerCase() === cleanEmail);
    if (found) {
      return { success: true, user: found, message: `ကြိုဆိုပါတယ် ${found.FullName}` };
    }

    return { success: false, message: 'အကောင့်မတွေ့ပါ သို့မဟုတ် Email/Password မှားယွင်းနေပါသည်' };
  }

  // --- Orders Table Operations ---
  public async getOrders(): Promise<Order[]> {
    this.initializeTables();
    try {
      const data = localStorage.getItem(TABLE_ORDERS);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  }

  public async createOrder(payload: {
    UserID: string;
    CustomerName: string;
    Phone: string;
    Address: string;
    Items: Order['Items'];
    TotalAmount: number;
    PaymentMethod: string;
  }): Promise<{ success: boolean; orderId: string; message: string }> {
    const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderDate = new Date().toISOString();

    const newOrder: Order = {
      OrderID: orderId,
      UserID: payload.UserID,
      CustomerName: payload.CustomerName,
      Phone: payload.Phone,
      Address: payload.Address,
      ItemsJSON: JSON.stringify(payload.Items),
      Items: payload.Items,
      TotalAmount: payload.TotalAmount,
      PaymentStatus: 'Pending',
      PaymentMethod: payload.PaymentMethod,
      OrderDate: orderDate
    };

    // 1. Save order to Orders table
    const orders = await this.getOrders();
    localStorage.setItem(TABLE_ORDERS, JSON.stringify([newOrder, ...orders]));

    // 2. Automatically decrement stock in Products table
    const products = await this.getProducts();
    const updatedProducts = products.map(p => {
      const ordered = payload.Items.find(i => i.ProductID === p.ProductID);
      if (ordered) {
        return {
          ...p,
          StockQty: Math.max(0, p.StockQty - ordered.Quantity)
        };
      }
      return p;
    });
    localStorage.setItem(TABLE_PRODUCTS, JSON.stringify(updatedProducts));

    return {
      success: true,
      orderId: orderId,
      message: 'အော်ဒါကို စနစ်တွင်း Database သို့ အောင်မြင်စွာ မှတ်တမ်းတင်ပြီးပါပြီ!'
    };
  }

  public async updateOrderStatus(orderId: string, newStatus: Order['PaymentStatus']): Promise<boolean> {
    const orders = await this.getOrders();
    const updated = orders.map(o => o.OrderID === orderId ? { ...o, PaymentStatus: newStatus } : o);
    localStorage.setItem(TABLE_ORDERS, JSON.stringify(updated));
    return true;
  }

  // --- Analytics & KPIs ---
  public async getAnalytics(): Promise<AnalyticsSummary> {
    const [users, orders, products] = await Promise.all([
      this.getUsers(),
      this.getOrders(),
      this.getProducts()
    ]);

    const totalUsers = users.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => {
      if (o.PaymentStatus !== 'Cancelled') {
        return sum + (Number(o.TotalAmount) || 0);
      }
      return sum;
    }, 0);
    const lowStockCount = products.filter(p => p.StockQty <= 10).length;

    return {
      totalUsers,
      totalOrders,
      totalRevenue,
      lowStockCount
    };
  }

  public async getDatabaseStats(): Promise<DatabaseStats> {
    const [users, products, orders] = await Promise.all([
      this.getUsers(),
      this.getProducts(),
      this.getOrders()
    ]);
    return {
      usersCount: users.length,
      productsCount: products.length,
      ordersCount: orders.length,
      lastUpdated: new Date().toISOString()
    };
  }

  // --- Backup & Data Management ---
  public exportDatabaseJSON(): string {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      tables: {
        Users: JSON.parse(localStorage.getItem(TABLE_USERS) || '[]'),
        Products: JSON.parse(localStorage.getItem(TABLE_PRODUCTS) || '[]'),
        Orders: JSON.parse(localStorage.getItem(TABLE_ORDERS) || '[]')
      }
    };
    return JSON.stringify(data, null, 2);
  }

  public importDatabaseJSON(jsonStr: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.tables && parsed.tables.Products && parsed.tables.Users && parsed.tables.Orders) {
        localStorage.setItem(TABLE_PRODUCTS, JSON.stringify(parsed.tables.Products));
        localStorage.setItem(TABLE_USERS, JSON.stringify(parsed.tables.Users));
        localStorage.setItem(TABLE_ORDERS, JSON.stringify(parsed.tables.Orders));
        return { success: true, message: 'Database imported successfully!' };
      }
      return { success: false, message: 'Invalid backup format' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Import error: ${msg}` };
    }
  }

  public resetToFactoryDemo(): void {
    localStorage.setItem(TABLE_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(TABLE_USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(TABLE_ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
}

export const dbService = new DatabaseService();
// Backward compatibility alias
export const googleSheetsService = dbService;

export type ProductCategory = 
  | 'All'
  | 'Engine'
  | 'Brakes'
  | 'Suspension'
  | 'Lighting'
  | 'Oils'
  | 'Accessories';

export interface Product {
  ProductID: string;
  PartName: string;
  Category: 'Engine' | 'Brakes' | 'Suspension' | 'Lighting' | 'Oils' | 'Accessories' | string;
  CarModelCompatibility: string;
  Price: number;
  StockQty: number;
  ImageURL: string;
  Description: string;
}

export interface User {
  UserID: string;
  FullName: string;
  Phone: string;
  Email: string;
  Address?: string;
  Role: 'customer' | 'admin';
  CreatedAt: string;
}

export interface OrderItem {
  ProductID: string;
  PartName: string;
  Price: number;
  Quantity: number;
  ImageURL?: string;
}

export type OrderPaymentStatus = 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  OrderID: string;
  UserID: string;
  CustomerName: string;
  Phone: string;
  ItemsJSON: string;
  Items: OrderItem[];
  TotalAmount: number;
  PaymentStatus: OrderPaymentStatus;
  OrderDate: string;
  Address?: string;
  PaymentMethod?: string;
}

export interface AnalyticsSummary {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
}

export interface DatabaseStats {
  usersCount: number;
  productsCount: number;
  ordersCount: number;
  lastUpdated: string;
}

// ============ Data Models ============

export interface Order {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  products: string;
  amount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  orderStatus: 'Dispatched' | 'Pending' | 'Cancelled' | 'Delivered' | 'Processing';
  city: string;
  state: string;
}

export interface DispatchedOrder {
  orderId: string;
  dispatchDate: string;
  logisticsPartner: string;
  trackingId: string;
  customerName: string;
  orderValue: number;
}

export interface ShippingRecord {
  orderId: string;
  carrier: string;
  shippingCost: number;
  deliveryDate: string;
  deliveryStatus: 'Delivered' | 'In Transit' | 'Returned' | 'Failed';
  region: string;
  estimatedDays: number;
  actualDays: number;
}

export interface CashFlowRecord {
  date: string;
  revenue: number;
  refunds: number;
  adjustments: number;
  shippingCosts: number;
  netAmount: number;
}

export interface TaxRecord {
  date: string;
  taxCollected: number;
  jurisdiction: string;
  taxType: string;
  orderCount: number;
}

export interface ProductPerformance {
  productName: string;
  sku: string;
  revenue: number;
  unitsSold: number;
  returns: number;
  margin: number;
  category: string;
}

export interface ProductTypePerformance {
  productType: string;
  revenue: number;
  unitsSold: number;
  margin: number;
  productCount: number;
}

export interface WhatsAppHSM {
  campaignName: string;
  date: string;
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
  conversions: number;
}

export interface PurchasedCustomer {
  customerId: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
  city: string;
}

export interface CustomerLastBuy {
  customerId: string;
  customerName: string;
  lastPurchaseDate: string;
  lastClickedDate: string;
  daysSincePurchase: number;
  totalSpent: number;
  segment: 'Active' | 'At Risk' | 'Lapsed' | 'Lost';
}

// ============ Dashboard State ============

export interface DashboardData {
  orders: Order[];
  dispatchedOrders: DispatchedOrder[];
  shipping: ShippingRecord[];
  cashFlow: CashFlowRecord[];
  tax: TaxRecord[];
  products: ProductPerformance[];
  productTypes: ProductTypePerformance[];
  whatsapp: WhatsAppHSM[];
  customers: PurchasedCustomer[];
  customerLastBuy: CustomerLastBuy[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface FilterState {
  dateRange: DateRange;
  productType: string;
  orderStatus: string;
  customerSegment: string;
}

export type TabId = 
  | 'overview'
  | 'sales'
  | 'fulfillment'
  | 'customers'
  | 'financial'
  | 'marketing'
  | 'products'
  | 'traffic';

export interface KPICard {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
  color: string;
}

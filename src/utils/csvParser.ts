import Papa from 'papaparse';
import type {
  Order,
  DispatchedOrder,
  ShippingRecord,
  CashFlowRecord,
  TaxRecord,
  ProductPerformance,
  ProductTypePerformance,
  WhatsAppHSM,
  PurchasedCustomer,
  CustomerLastBuy,
} from '../types';

export type CSVReportType =
  | 'orders'
  | 'dispatchedOrders'
  | 'shipping'
  | 'cashFlow'
  | 'tax'
  | 'products'
  | 'productTypes'
  | 'whatsapp'
  | 'customers'
  | 'customerLastBuy';

export function parseCSVFile<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header: string) => {
        // Normalize headers: trim, camelCase
        return header
          .trim()
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
          .replace(/^\w/, (c) => c.toLowerCase());
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parse warnings:', results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function normalizeOrder(raw: Record<string, unknown>): Order {
  return {
    orderId: String(raw.orderId || raw.orderID || raw.id || ''),
    orderDate: String(raw.orderDate || raw.date || ''),
    customerName: String(raw.customerName || raw.customer || ''),
    customerEmail: String(raw.customerEmail || raw.email || ''),
    products: String(raw.products || raw.product || ''),
    amount: Number(raw.amount || raw.orderValue || raw.total || 0),
    paymentStatus: normalizePaymentStatus(String(raw.paymentStatus || 'Pending')),
    orderStatus: normalizeOrderStatus(String(raw.orderStatus || raw.status || 'Processing')),
    city: String(raw.city || ''),
    state: String(raw.state || ''),
  };
}

export function normalizeDispatchedOrder(raw: Record<string, unknown>): DispatchedOrder {
  return {
    orderId: String(raw.orderId || raw.orderID || ''),
    dispatchDate: String(raw.dispatchDate || raw.date || ''),
    logisticsPartner: String(raw.logisticsPartner || raw.carrier || ''),
    trackingId: String(raw.trackingId || raw.trackingID || ''),
    customerName: String(raw.customerName || raw.customer || ''),
    orderValue: Number(raw.orderValue || raw.amount || 0),
  };
}

export function normalizeShipping(raw: Record<string, unknown>): ShippingRecord {
  return {
    orderId: String(raw.orderId || raw.orderID || ''),
    carrier: String(raw.carrier || raw.logisticsPartner || ''),
    shippingCost: Number(raw.shippingCost || raw.cost || 0),
    deliveryDate: String(raw.deliveryDate || raw.date || ''),
    deliveryStatus: normalizeDeliveryStatus(String(raw.deliveryStatus || raw.status || 'In Transit')),
    region: String(raw.region || raw.zone || ''),
    estimatedDays: Number(raw.estimatedDays || raw.estimated || 5),
    actualDays: Number(raw.actualDays || raw.actual || 5),
  };
}

export function normalizeCashFlow(raw: Record<string, unknown>): CashFlowRecord {
  return {
    date: String(raw.date || ''),
    revenue: Number(raw.revenue || raw.income || 0),
    refunds: Number(raw.refunds || raw.refund || 0),
    adjustments: Number(raw.adjustments || raw.adjustment || 0),
    shippingCosts: Number(raw.shippingCosts || raw.shipping || 0),
    netAmount: Number(raw.netAmount || raw.net || 0),
  };
}

export function normalizeTax(raw: Record<string, unknown>): TaxRecord {
  return {
    date: String(raw.date || ''),
    taxCollected: Number(raw.taxCollected || raw.tax || 0),
    jurisdiction: String(raw.jurisdiction || raw.state || ''),
    taxType: String(raw.taxType || raw.type || 'GST'),
    orderCount: Number(raw.orderCount || raw.orders || 0),
  };
}

export function normalizeProduct(raw: Record<string, unknown>): ProductPerformance {
  return {
    productName: String(raw.productName || raw.product || raw.name || ''),
    sku: String(raw.sku || raw.SKU || ''),
    revenue: Number(raw.revenue || raw.sales || 0),
    unitsSold: Number(raw.unitsSold || raw.units || raw.quantity || 0),
    returns: Number(raw.returns || raw.returned || 0),
    margin: Number(raw.margin || raw.profitMargin || 0),
    category: String(raw.category || raw.type || ''),
  };
}

export function normalizeProductType(raw: Record<string, unknown>): ProductTypePerformance {
  return {
    productType: String(raw.productType || raw.category || raw.type || ''),
    revenue: Number(raw.revenue || raw.sales || 0),
    unitsSold: Number(raw.unitsSold || raw.units || 0),
    margin: Number(raw.margin || 0),
    productCount: Number(raw.productCount || raw.products || 0),
  };
}

export function normalizeWhatsApp(raw: Record<string, unknown>): WhatsAppHSM {
  return {
    campaignName: String(raw.campaignName || raw.campaign || raw.name || ''),
    date: String(raw.date || ''),
    sent: Number(raw.sent || 0),
    delivered: Number(raw.delivered || 0),
    read: Number(raw.read || 0),
    clicked: Number(raw.clicked || 0),
    conversions: Number(raw.conversions || raw.converted || 0),
  };
}

export function normalizeCustomer(raw: Record<string, unknown>): PurchasedCustomer {
  return {
    customerId: String(raw.customerId || raw.customerID || raw.id || ''),
    name: String(raw.name || raw.customerName || ''),
    email: String(raw.email || raw.customerEmail || ''),
    totalOrders: Number(raw.totalOrders || raw.orders || 0),
    totalSpent: Number(raw.totalSpent || raw.spent || raw.revenue || 0),
    firstPurchaseDate: String(raw.firstPurchaseDate || raw.firstOrder || ''),
    lastPurchaseDate: String(raw.lastPurchaseDate || raw.lastOrder || ''),
    city: String(raw.city || ''),
  };
}

export function normalizeCustomerLastBuy(raw: Record<string, unknown>): CustomerLastBuy {
  return {
    customerId: String(raw.customerId || raw.customerID || ''),
    customerName: String(raw.customerName || raw.name || ''),
    lastPurchaseDate: String(raw.lastPurchaseDate || raw.lastBuy || ''),
    lastClickedDate: String(raw.lastClickedDate || raw.lastClicked || ''),
    daysSincePurchase: Number(raw.daysSincePurchase || raw.daysSince || 0),
    totalSpent: Number(raw.totalSpent || raw.spent || 0),
    segment: normalizeSegment(String(raw.segment || 'Active')),
  };
}

// Helper functions
function normalizePaymentStatus(status: string): Order['paymentStatus'] {
  const s = status.toLowerCase();
  if (s.includes('paid') || s.includes('complete')) return 'Paid';
  if (s.includes('fail')) return 'Failed';
  if (s.includes('refund')) return 'Refunded';
  return 'Pending';
}

function normalizeOrderStatus(status: string): Order['orderStatus'] {
  const s = status.toLowerCase();
  if (s.includes('dispatch') || s.includes('ship')) return 'Dispatched';
  if (s.includes('deliver')) return 'Delivered';
  if (s.includes('cancel')) return 'Cancelled';
  if (s.includes('process')) return 'Processing';
  return 'Pending';
}

function normalizeDeliveryStatus(status: string): ShippingRecord['deliveryStatus'] {
  const s = status.toLowerCase();
  if (s.includes('deliver')) return 'Delivered';
  if (s.includes('return')) return 'Returned';
  if (s.includes('fail')) return 'Failed';
  return 'In Transit';
}

function normalizeSegment(segment: string): CustomerLastBuy['segment'] {
  const s = segment.toLowerCase();
  if (s.includes('active')) return 'Active';
  if (s.includes('risk')) return 'At Risk';
  if (s.includes('lapse')) return 'Lapsed';
  return 'Lost';
}

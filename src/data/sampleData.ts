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
  DashboardData,
} from '../types';
import { format, subDays, subMonths } from 'date-fns';

// Helper to generate dates
const today = new Date(2026, 5, 25); // June 25, 2026
const dateStr = (daysAgo: number) => format(subDays(today, daysAgo), 'yyyy-MM-dd');
const monthStr = (monthsAgo: number) => format(subMonths(today, monthsAgo), 'yyyy-MM-dd');

// ============ Sample Orders ============
const orderStatuses: Order['orderStatus'][] = ['Dispatched', 'Delivered', 'Pending', 'Processing', 'Cancelled'];
const paymentStatuses: Order['paymentStatus'][] = ['Paid', 'Paid', 'Paid', 'Pending', 'Refunded'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Lucknow'];
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Maharashtra', 'Rajasthan', 'Gujarat', 'Uttar Pradesh'];
const products = [
  'Premium Cotton T-Shirt', 'Denim Jeans Classic', 'Silk Saree Royal', 'Leather Wallet Slim',
  'Sports Shoes Pro', 'Formal Shirt Elite', 'Kurti Designer Set', 'Watch Chronograph',
  'Sunglasses Aviator', 'Backpack Adventure', 'Ethnic Dress Gold', 'Sneakers Urban',
  'Handbag Luxury', 'Perfume Oud Premium', 'Bracelet Sterling'
];
const customerNames = [
  'Priya Sharma', 'Rahul Patel', 'Anita Kumar', 'Vikram Singh', 'Sneha Reddy',
  'Amit Joshi', 'Deepa Nair', 'Rajesh Gupta', 'Kavya Iyer', 'Mohit Agarwal',
  'Neha Verma', 'Suresh Bhat', 'Pooja Malhotra', 'Karthik Rajan', 'Divya Saxena',
  'Arjun Menon', 'Ritu Chopra', 'Sanjay Das', 'Meera Pillai', 'Vivek Sharma'
];

function generateOrders(count: number): Order[] {
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const cityIdx = Math.floor(Math.random() * cities.length);
    orders.push({
      orderId: `ORD-${String(10000 + i).padStart(6, '0')}`,
      orderDate: dateStr(Math.floor(Math.random() * 90)),
      customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
      customerEmail: `customer${i}@example.com`,
      products: products[Math.floor(Math.random() * products.length)],
      amount: Math.floor(Math.random() * 8000) + 500,
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      orderStatus: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
      city: cities[cityIdx],
      state: states[cityIdx],
    });
  }
  return orders;
}

// ============ Sample Dispatched Orders ============
const carriers = ['Delhivery', 'BlueDart', 'DTDC', 'Ecom Express', 'Shadowfax'];

function generateDispatchedOrders(count: number): DispatchedOrder[] {
  const dispatched: DispatchedOrder[] = [];
  for (let i = 0; i < count; i++) {
    dispatched.push({
      orderId: `ORD-${String(10000 + i).padStart(6, '0')}`,
      dispatchDate: dateStr(Math.floor(Math.random() * 60)),
      logisticsPartner: carriers[Math.floor(Math.random() * carriers.length)],
      trackingId: `TRK${Math.floor(Math.random() * 900000000) + 100000000}`,
      customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
      orderValue: Math.floor(Math.random() * 8000) + 500,
    });
  }
  return dispatched;
}

// ============ Sample Shipping Records ============
const regions = ['North', 'South', 'East', 'West', 'Central', 'North East'];

function generateShipping(count: number): ShippingRecord[] {
  const records: ShippingRecord[] = [];
  const statuses: ShippingRecord['deliveryStatus'][] = ['Delivered', 'Delivered', 'Delivered', 'In Transit', 'Returned', 'Failed'];
  for (let i = 0; i < count; i++) {
    const estimated = Math.floor(Math.random() * 5) + 3;
    const actual = estimated + Math.floor(Math.random() * 4) - 1;
    records.push({
      orderId: `ORD-${String(10000 + i).padStart(6, '0')}`,
      carrier: carriers[Math.floor(Math.random() * carriers.length)],
      shippingCost: Math.floor(Math.random() * 150) + 40,
      deliveryDate: dateStr(Math.floor(Math.random() * 60)),
      deliveryStatus: statuses[Math.floor(Math.random() * statuses.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      estimatedDays: estimated,
      actualDays: Math.max(1, actual),
    });
  }
  return records;
}

// ============ Sample Cash Flow ============
function generateCashFlow(): CashFlowRecord[] {
  const records: CashFlowRecord[] = [];
  for (let i = 89; i >= 0; i--) {
    const revenue = Math.floor(Math.random() * 80000) + 30000;
    const refunds = Math.floor(Math.random() * 5000);
    const adjustments = Math.floor(Math.random() * 2000) - 1000;
    const shippingCosts = Math.floor(Math.random() * 8000) + 3000;
    records.push({
      date: dateStr(i),
      revenue,
      refunds,
      adjustments,
      shippingCosts,
      netAmount: revenue - refunds + adjustments - shippingCosts,
    });
  }
  return records;
}

// ============ Sample Tax Records ============
const jurisdictions = ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat', 'Rajasthan'];

function generateTax(): TaxRecord[] {
  const records: TaxRecord[] = [];
  for (let i = 0; i < 12; i++) {
    jurisdictions.forEach((j) => {
      records.push({
        date: monthStr(i),
        taxCollected: Math.floor(Math.random() * 50000) + 10000,
        jurisdiction: j,
        taxType: 'GST',
        orderCount: Math.floor(Math.random() * 200) + 50,
      });
    });
  }
  return records;
}

// ============ Sample Product Performance ============
const categories = ['Clothing', 'Accessories', 'Footwear', 'Bags', 'Ethnic Wear', 'Fragrances'];

function generateProducts(): ProductPerformance[] {
  return products.map((name, idx) => ({
    productName: name,
    sku: `SKU-${String(1000 + idx).padStart(5, '0')}`,
    revenue: Math.floor(Math.random() * 500000) + 50000,
    unitsSold: Math.floor(Math.random() * 500) + 50,
    returns: Math.floor(Math.random() * 30),
    margin: Math.floor(Math.random() * 30) + 20,
    category: categories[idx % categories.length],
  }));
}

// ============ Sample Product Type Performance ============
function generateProductTypes(): ProductTypePerformance[] {
  return categories.map((cat) => ({
    productType: cat,
    revenue: Math.floor(Math.random() * 800000) + 200000,
    unitsSold: Math.floor(Math.random() * 2000) + 500,
    margin: Math.floor(Math.random() * 20) + 25,
    productCount: Math.floor(Math.random() * 20) + 5,
  }));
}

// ============ Sample WhatsApp HSM ============
const campaigns = [
  'Summer Sale 2026', 'New Arrivals Alert', 'Flash Deal Friday',
  'Loyalty Rewards', 'Abandoned Cart Reminder', 'Festival Collection',
  'Back in Stock', 'Exclusive Offer'
];

function generateWhatsApp(): WhatsAppHSM[] {
  return campaigns.map((name, idx) => {
    const sent = Math.floor(Math.random() * 10000) + 2000;
    const delivered = Math.floor(sent * (0.85 + Math.random() * 0.1));
    const read = Math.floor(delivered * (0.4 + Math.random() * 0.3));
    const clicked = Math.floor(read * (0.15 + Math.random() * 0.2));
    const conversions = Math.floor(clicked * (0.1 + Math.random() * 0.15));
    return {
      campaignName: name,
      date: dateStr(idx * 7 + Math.floor(Math.random() * 5)),
      sent,
      delivered,
      read,
      clicked,
      conversions,
    };
  });
}

// ============ Sample Purchased Customers ============
function generateCustomers(): PurchasedCustomer[] {
  return customerNames.map((name, idx) => {
    const totalOrders = Math.floor(Math.random() * 15) + 1;
    return {
      customerId: `CUST-${String(1000 + idx).padStart(5, '0')}`,
      name,
      email: `${name.toLowerCase().replace(/\s/g, '.')}@example.com`,
      totalOrders,
      totalSpent: totalOrders * (Math.floor(Math.random() * 3000) + 1000),
      firstPurchaseDate: dateStr(Math.floor(Math.random() * 365) + 90),
      lastPurchaseDate: dateStr(Math.floor(Math.random() * 60)),
      city: cities[idx % cities.length],
    };
  });
}

// ============ Sample Customer Last Buy ============

function generateCustomerLastBuy(): CustomerLastBuy[] {
  return customerNames.map((name, idx) => {
    const daysSince = Math.floor(Math.random() * 180);
    let segment: CustomerLastBuy['segment'] = 'Active';
    if (daysSince > 120) segment = 'Lost';
    else if (daysSince > 90) segment = 'Lapsed';
    else if (daysSince > 45) segment = 'At Risk';
    
    return {
      customerId: `CUST-${String(1000 + idx).padStart(5, '0')}`,
      customerName: name,
      lastPurchaseDate: dateStr(daysSince),
      lastClickedDate: dateStr(Math.max(0, daysSince - Math.floor(Math.random() * 10))),
      daysSincePurchase: daysSince,
      totalSpent: Math.floor(Math.random() * 50000) + 5000,
      segment,
    };
  });
}

// ============ Generate Complete Dataset ============
export function generateSampleData(): DashboardData {
  return {
    orders: generateOrders(500),
    dispatchedOrders: generateDispatchedOrders(350),
    shipping: generateShipping(400),
    cashFlow: generateCashFlow(),
    tax: generateTax(),
    products: generateProducts(),
    productTypes: generateProductTypes(),
    whatsapp: generateWhatsApp(),
    customers: generateCustomers(),
    customerLastBuy: generateCustomerLastBuy(),
  };
}

import type { DashboardData, DateRange } from '../types';
import { isWithinInterval, parseISO, subDays, format, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';

// ============ Filtering ============

export function filterByDateRange<T extends { date?: string; orderDate?: string; dispatchDate?: string }>(
  data: T[],
  dateRange: DateRange
): T[] {
  return data.filter((item) => {
    const dateStr = item.date || item.orderDate || item.dispatchDate;
    if (!dateStr) return true;
    try {
      const date = parseISO(dateStr);
      return isWithinInterval(date, { start: dateRange.start, end: dateRange.end });
    } catch {
      return true;
    }
  });
}

// ============ KPI Calculations ============

export function calculateTotalRevenue(data: DashboardData): number {
  return data.orders.reduce((sum, o) => sum + o.amount, 0);
}

export function calculateOrderCount(data: DashboardData): number {
  return data.orders.length;
}

export function calculateAOV(data: DashboardData): number {
  const total = calculateTotalRevenue(data);
  const count = calculateOrderCount(data);
  return count > 0 ? total / count : 0;
}

export function calculateNewCustomers(data: DashboardData): number {
  return data.customers.filter((c) => c.totalOrders === 1).length;
}

export function calculateRepeatCustomers(data: DashboardData): number {
  return data.customers.filter((c) => c.totalOrders > 1).length;
}

export function calculateRepeatRate(data: DashboardData): number {
  const total = data.customers.length;
  if (total === 0) return 0;
  return (calculateRepeatCustomers(data) / total) * 100;
}

export function calculateDispatchRate(data: DashboardData): number {
  const dispatched = data.orders.filter(
    (o) => o.orderStatus === 'Dispatched' || o.orderStatus === 'Delivered'
  ).length;
  const total = data.orders.length;
  return total > 0 ? (dispatched / total) * 100 : 0;
}

export function calculateOnTimeDelivery(data: DashboardData): number {
  const delivered = data.shipping.filter((s) => s.deliveryStatus === 'Delivered');
  if (delivered.length === 0) return 0;
  const onTime = delivered.filter((s) => s.actualDays <= s.estimatedDays).length;
  return (onTime / delivered.length) * 100;
}

export function calculateAvgDeliveryTime(data: DashboardData): number {
  const delivered = data.shipping.filter((s) => s.deliveryStatus === 'Delivered');
  if (delivered.length === 0) return 0;
  return delivered.reduce((sum, s) => sum + s.actualDays, 0) / delivered.length;
}

export function calculateNetCashFlow(data: DashboardData): number {
  return data.cashFlow.reduce((sum, c) => sum + c.netAmount, 0);
}

export function calculateRefundRate(data: DashboardData): number {
  const totalRevenue = data.cashFlow.reduce((sum, c) => sum + c.revenue, 0);
  const totalRefunds = data.cashFlow.reduce((sum, c) => sum + c.refunds, 0);
  return totalRevenue > 0 ? (totalRefunds / totalRevenue) * 100 : 0;
}

export function calculateTotalTax(data: DashboardData): number {
  return data.tax.reduce((sum, t) => sum + t.taxCollected, 0);
}

// ============ Time Series ============

export function getRevenueTrend(data: DashboardData, dateRange: DateRange): { date: string; revenue: number; orders: number }[] {
  const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  
  return days.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayOrders = data.orders.filter((o) => o.orderDate.startsWith(dateStr));
    return {
      date: format(day, 'MMM dd'),
      revenue: dayOrders.reduce((sum, o) => sum + o.amount, 0),
      orders: dayOrders.length,
    };
  });
}

export function getMonthlyRevenue(data: DashboardData, dateRange: DateRange): { month: string; revenue: number; orders: number }[] {
  const months = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
  
  return months.map((month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthOrders = data.orders.filter((o) => {
      try {
        const d = parseISO(o.orderDate);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      } catch {
        return false;
      }
    });
    return {
      month: format(month, 'MMM yyyy'),
      revenue: monthOrders.reduce((sum, o) => sum + o.amount, 0),
      orders: monthOrders.length,
    };
  });
}

export function getCashFlowTrend(data: DashboardData): { date: string; revenue: number; refunds: number; net: number }[] {
  return data.cashFlow.map((c) => ({
    date: c.date,
    revenue: c.revenue,
    refunds: c.refunds,
    net: c.netAmount,
  }));
}

// ============ Aggregations ============

export function getOrderStatusBreakdown(data: DashboardData): { status: string; count: number; percentage: number }[] {
  const total = data.orders.length;
  const statusMap = new Map<string, number>();
  
  data.orders.forEach((o) => {
    statusMap.set(o.orderStatus, (statusMap.get(o.orderStatus) || 0) + 1);
  });
  
  return Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }));
}

export function getTopProducts(data: DashboardData, limit = 10): { name: string; revenue: number; units: number }[] {
  return [...data.products]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((p) => ({
      name: p.productName,
      revenue: p.revenue,
      units: p.unitsSold,
    }));
}

export function getRevenueByCategory(data: DashboardData): { category: string; revenue: number; units: number }[] {
  return data.productTypes.map((pt) => ({
    category: pt.productType,
    revenue: pt.revenue,
    units: pt.unitsSold,
  }));
}

export function getCarrierPerformance(data: DashboardData): { carrier: string; deliveries: number; onTime: number; avgDays: number }[] {
  const carrierMap = new Map<string, { total: number; onTime: number; totalDays: number }>();
  
  data.shipping.forEach((s) => {
    const current = carrierMap.get(s.carrier) || { total: 0, onTime: 0, totalDays: 0 };
    current.total++;
    if (s.actualDays <= s.estimatedDays) current.onTime++;
    current.totalDays += s.actualDays;
    carrierMap.set(s.carrier, current);
  });
  
  return Array.from(carrierMap.entries()).map(([carrier, stats]) => ({
    carrier,
    deliveries: stats.total,
    onTime: stats.total > 0 ? Math.round((stats.onTime / stats.total) * 100) : 0,
    avgDays: stats.total > 0 ? Math.round((stats.totalDays / stats.total) * 10) / 10 : 0,
  }));
}

export function getCustomerSegments(data: DashboardData): { segment: string; count: number; revenue: number }[] {
  const segmentMap = new Map<string, { count: number; revenue: number }>();
  
  data.customerLastBuy.forEach((c) => {
    const current = segmentMap.get(c.segment) || { count: 0, revenue: 0 };
    current.count++;
    current.revenue += c.totalSpent;
    segmentMap.set(c.segment, current);
  });
  
  return Array.from(segmentMap.entries()).map(([segment, stats]) => ({
    segment,
    count: stats.count,
    revenue: stats.revenue,
  }));
}

export function getShippingByRegion(data: DashboardData): { region: string; orders: number; avgDays: number; cost: number }[] {
  const regionMap = new Map<string, { orders: number; totalDays: number; totalCost: number }>();
  
  data.shipping.forEach((s) => {
    const current = regionMap.get(s.region) || { orders: 0, totalDays: 0, totalCost: 0 };
    current.orders++;
    current.totalDays += s.actualDays;
    current.totalCost += s.shippingCost;
    regionMap.set(s.region, current);
  });
  
  return Array.from(regionMap.entries()).map(([region, stats]) => ({
    region,
    orders: stats.orders,
    avgDays: stats.orders > 0 ? Math.round((stats.totalDays / stats.orders) * 10) / 10 : 0,
    cost: stats.totalCost,
  }));
}

// ============ Formatting ============

export function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(2)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getDefaultDateRange(): DateRange {
  const end = new Date();
  const start = subDays(end, 30);
  return { start, end };
}

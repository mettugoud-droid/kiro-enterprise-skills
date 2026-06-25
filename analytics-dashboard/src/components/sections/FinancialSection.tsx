import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts';
import { DollarSign, TrendingDown, Receipt, PiggyBank } from 'lucide-react';
import type { DashboardData } from '../../types';
import { KPICard } from '../common/KPICard';
import { ChartCard } from '../common/ChartCard';
import {
  calculateTotalRevenue,
  calculateNetCashFlow,
  calculateRefundRate,
  calculateTotalTax,
  getCashFlowTrend,
  formatCurrency,
  formatPercentage,
} from '../../utils/calculations';

interface FinancialSectionProps {
  data: DashboardData;
}

export function FinancialSection({ data }: FinancialSectionProps) {
  const totalRevenue = calculateTotalRevenue(data);
  const netCashFlow = calculateNetCashFlow(data);
  const refundRate = calculateRefundRate(data);
  const totalTax = calculateTotalTax(data);
  const cashFlowTrend = getCashFlowTrend(data);

  const totalShippingCosts = data.cashFlow.reduce((sum, c) => sum + c.shippingCosts, 0);
  const totalRefunds = data.cashFlow.reduce((sum, c) => sum + c.refunds, 0);

  // Revenue vs costs
  const revenueVsCosts = cashFlowTrend.slice(-30).map((item) => {
    const cfItem = data.cashFlow.find((c) => c.date === item.date);
    return {
      date: item.date.slice(5), // MM-DD
      revenue: item.revenue,
      shipping: cfItem?.shippingCosts || 0,
      refunds: item.refunds,
    };
  });

  // Profit margin by product
  const profitByProduct = data.products
    .map((p) => ({
      name: p.productName.length > 15 ? p.productName.slice(0, 15) + '...' : p.productName,
      margin: p.margin,
      revenue: p.revenue,
    }))
    .sort((a, b) => b.margin - a.margin);

  // Monthly tax liability
  const taxByMonth = data.tax.reduce((acc, t) => {
    const month = t.date.slice(0, 7);
    acc[month] = (acc[month] || 0) + t.taxCollected;
    return acc;
  }, {} as Record<string, number>);
  
  const monthlyTax = Object.entries(taxByMonth)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={12.5}
          changeLabel="vs last period"
          icon={<DollarSign className="w-5 h-5" />}
          color="blue"
        />
        <KPICard
          title="Net Cash Flow"
          value={formatCurrency(netCashFlow)}
          change={5.1}
          changeLabel="vs last period"
          icon={<PiggyBank className="w-5 h-5" />}
          color="green"
        />
        <KPICard
          title="Refund Rate"
          value={formatPercentage(refundRate)}
          change={-0.3}
          changeLabel="improvement"
          icon={<TrendingDown className="w-5 h-5" />}
          color="orange"
        />
        <KPICard
          title="Tax Liability"
          value={formatCurrency(totalTax)}
          change={8.2}
          changeLabel="vs last period"
          icon={<Receipt className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Cash Flow Trend */}
      <ChartCard title="Cash Flow Trend" subtitle="Revenue, refunds, and net amount over time">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowTrend.slice(-30)}>
              <defs>
                <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#netGradient)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="net" stroke="#10b981" fill="url(#netGradient)" strokeWidth={2} name="Net" />
              <Line type="monotone" dataKey="refunds" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Refunds" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Revenue vs Costs + Tax */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue vs Costs" subtitle="Shipping and refund impact">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueVsCosts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[2, 2, 0, 0]} />
                <Bar dataKey="shipping" fill="#f59e0b" name="Shipping" radius={[2, 2, 0, 0]} />
                <Bar dataKey="refunds" fill="#ef4444" name="Refunds" radius={[2, 2, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Total Shipping</p>
              <p className="text-sm font-bold text-amber-600">{formatCurrency(totalShippingCosts)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Refunds</p>
              <p className="text-sm font-bold text-red-600">{formatCurrency(totalRefunds)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Net Profit</p>
              <p className="text-sm font-bold text-emerald-600">{formatCurrency(netCashFlow)}</p>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Monthly Tax Liability" subtitle="Tax collected over time">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTax}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Tax']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Profit Margin by Product */}
      <ChartCard title="Profit Margin by Product" subtitle="Margin percentage across products">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profitByProduct} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={130} />
              <Tooltip
                formatter={(value) => [`${Number(value)}%`, 'Margin']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="margin" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

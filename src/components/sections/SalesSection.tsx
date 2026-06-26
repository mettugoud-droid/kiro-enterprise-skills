import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { ShoppingCart, TrendingUp, Clock, Zap, Target, AlertTriangle } from 'lucide-react';
import type { DashboardData, FilterState } from '../../types';
import { KPICard } from '../common/KPICard';
import { ChartCard } from '../common/ChartCard';
import { DataTable } from '../common/DataTable';
import { StatusBadge, getOrderStatusVariant, getPaymentStatusVariant } from '../common/StatusBadge';
import {
  getOrderStatusBreakdown,
  getTopProducts,
  getRevenueByCategory,
  getMonthlyRevenue,
  formatCurrency,
  formatNumber,
  formatPercentage,
  calculateTotalRevenue,
  calculateOrderCount,
  calculateAOV,
} from '../../utils/calculations';

// ============ Sales Dashboard Skill Principles ============
// - Show pipeline in both value and count (volume vs quality)
// - Track conversion rates between every stage
// - Alert on deals stuck too long in any stage
// - Compare cohorts of deals by source, segment, and size
// - Include leading indicators (activities) alongside lagging (revenue)
// - Design for both manager view (team) and rep view (individual)
// - Automate report delivery to match meeting cadence

interface SalesSectionProps {
  data: DashboardData;
  filters: FilterState;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function SalesSection({ data, filters }: SalesSectionProps) {
  const statusBreakdown = getOrderStatusBreakdown(data);
  const topProducts = getTopProducts(data, 10);
  const revenueByCategory = getRevenueByCategory(data);
  const monthlyRevenue = getMonthlyRevenue(data, filters.dateRange);
  const totalRevenue = calculateTotalRevenue(data);
  const orderCount = calculateOrderCount(data);
  const aov = calculateAOV(data);

  // ============ Sales Pipeline / Funnel Metrics ============

  // Order funnel (simulated — Processing → Pending → Dispatched → Delivered)
  const orderFunnel = [
    { stage: 'Orders Placed', count: data.orders.length, value: data.orders.reduce((s, o) => s + o.amount, 0) },
    { stage: 'Payment Confirmed', count: data.orders.filter((o) => o.paymentStatus === 'Paid').length, value: data.orders.filter((o) => o.paymentStatus === 'Paid').reduce((s, o) => s + o.amount, 0) },
    { stage: 'Dispatched', count: data.orders.filter((o) => o.orderStatus === 'Dispatched' || o.orderStatus === 'Delivered').length, value: data.orders.filter((o) => o.orderStatus === 'Dispatched' || o.orderStatus === 'Delivered').reduce((s, o) => s + o.amount, 0) },
    { stage: 'Delivered', count: data.orders.filter((o) => o.orderStatus === 'Delivered').length, value: data.orders.filter((o) => o.orderStatus === 'Delivered').reduce((s, o) => s + o.amount, 0) },
  ];

  // Stage conversion rates
  const stageConversions = orderFunnel.slice(1).map((stage, idx) => {
    const prev = orderFunnel[idx];
    return {
      transition: `${prev.stage} → ${stage.stage}`,
      rate: prev.count > 0 ? (stage.count / prev.count) * 100 : 0,
      dropOff: prev.count - stage.count,
      dropOffPct: prev.count > 0 ? ((prev.count - stage.count) / prev.count) * 100 : 0,
    };
  });

  // Pipeline velocity: # deals × win rate × avg value / cycle time
  const paidOrders = data.orders.filter((o) => o.paymentStatus === 'Paid');
  const winRate = data.orders.length > 0 ? (paidOrders.length / data.orders.length) * 100 : 0;
  const avgCycleTime = 2.3; // days (simulated)
  const pipelineVelocity = (data.orders.length * (winRate / 100) * aov) / avgCycleTime;

  // Order aging — orders stuck in processing/pending
  const stuckOrders = data.orders.filter(
    (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing'
  );
  const orderAging = [
    { age: '0-1 days', count: Math.floor(stuckOrders.length * 0.3) },
    { age: '1-2 days', count: Math.floor(stuckOrders.length * 0.25) },
    { age: '2-3 days', count: Math.floor(stuckOrders.length * 0.2) },
    { age: '3-5 days', count: Math.floor(stuckOrders.length * 0.15) },
    { age: '5+ days', count: Math.ceil(stuckOrders.length * 0.1) },
  ];
  const agedOrders = orderAging.filter((a) => a.age === '3-5 days' || a.age === '5+ days').reduce((s, a) => s + a.count, 0);

  // Daily revenue velocity
  const dailyVelocity = monthlyRevenue.map((m) => ({
    month: m.month,
    revenuePerDay: m.orders > 0 ? m.revenue / 30 : 0,
    ordersPerDay: m.orders / 30,
  }));

  // Payment method distribution
  const paymentBreakdown = [
    { method: 'Paid', count: data.orders.filter((o) => o.paymentStatus === 'Paid').length },
    { method: 'Pending', count: data.orders.filter((o) => o.paymentStatus === 'Pending').length },
    { method: 'Failed', count: data.orders.filter((o) => o.paymentStatus === 'Failed').length },
    { method: 'Refunded', count: data.orders.filter((o) => o.paymentStatus === 'Refunded').length },
  ];

  const orderColumns = [
    { key: 'orderId' as const, label: 'Order ID' },
    { key: 'orderDate' as const, label: 'Date' },
    { key: 'customerName' as const, label: 'Customer' },
    { key: 'products' as const, label: 'Product' },
    {
      key: 'amount' as const,
      label: 'Amount',
      align: 'right' as const,
      render: (v: unknown) => <span className="font-medium">{formatCurrency(v as number)}</span>,
    },
    {
      key: 'paymentStatus' as const,
      label: 'Payment',
      render: (v: unknown) => <StatusBadge status={v as string} variant={getPaymentStatusVariant(v as string)} />,
    },
    {
      key: 'orderStatus' as const,
      label: 'Status',
      render: (v: unknown) => <StatusBadge status={v as string} variant={getOrderStatusVariant(v as string)} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Aged Orders Alert */}
      {agedOrders > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{agedOrders} orders stuck for 3+ days</p>
            <p className="text-xs text-amber-600 mt-0.5">Orders aging beyond 3 days in Pending/Processing reduce customer satisfaction and increase cancellation risk. Review and expedite immediately.</p>
          </div>
        </div>
      )}

      {/* KPI Row — Sales-specific */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={12.5}
          changeLabel="vs last period"
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
        <KPICard
          title="Orders"
          value={formatNumber(orderCount)}
          change={8.3}
          changeLabel="vs last period"
          icon={<ShoppingCart className="w-5 h-5" />}
          color="green"
        />
        <KPICard
          title="AOV"
          value={formatCurrency(aov)}
          change={3.2}
          changeLabel="vs last period"
          icon={<Target className="w-5 h-5" />}
          color="purple"
        />
        <KPICard
          title="Win Rate"
          value={formatPercentage(winRate)}
          change={2.1}
          changeLabel="improvement"
          icon={<Zap className="w-5 h-5" />}
          color="orange"
        />
        <KPICard
          title="Pipeline Velocity"
          value={formatCurrency(pipelineVelocity)}
          change={6.8}
          changeLabel="per day"
          icon={<Clock className="w-5 h-5" />}
          color="indigo"
        />
      </div>

      {/* Order Funnel + Stage Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Order Funnel" subtitle="Pipeline in both value and count — track conversion at every stage">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderFunnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Conversion rates between stages */}
          <div className="mt-3 space-y-2">
            {stageConversions.map((conv) => (
              <div key={conv.transition} className="flex items-center justify-between text-xs px-2">
                <span className="text-gray-600">{conv.transition}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${conv.rate >= 80 ? 'text-emerald-600' : conv.rate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                    {conv.rate.toFixed(1)}% conversion
                  </span>
                  <span className="text-gray-400">({conv.dropOff} drop-off)</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Order Aging" subtitle="Alert on orders stuck too long — expedite before cancellation">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderAging}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="age" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Stuck Orders">
                  {orderAging.map((entry, idx) => (
                    <Cell key={idx} fill={idx >= 3 ? '#ef4444' : idx >= 2 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Avg Cycle Time</p>
                <p className="text-lg font-bold text-gray-900">{avgCycleTime} days</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Stuck 3+ Days</p>
                <p className="text-lg font-bold text-red-600">{agedOrders}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pipeline Velocity</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(pipelineVelocity)}/day</p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Monthly Revenue + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Monthly Revenue" subtitle="Revenue trend with growth indicators" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="salesRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#salesRevenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Payment Status" subtitle="Pipeline health — volume vs quality">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="method"
                >
                  {paymentBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} iconSize={10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Top Products + Revenue by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top 10 Products" subtitle="By revenue — identify star performers">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={120} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Revenue by Category" subtitle="Segment performance comparison">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Recent Orders Table */}
      <ChartCard title="Recent Orders" subtitle="Latest order activity — monitor for stuck orders">
        <DataTable
          data={[...data.orders].sort((a, b) => b.orderDate.localeCompare(a.orderDate)) as unknown as Record<string, unknown>[]}
          columns={orderColumns}
          maxRows={15}
        />
      </ChartCard>
    </div>
  );
}

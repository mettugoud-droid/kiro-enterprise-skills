import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Wallet,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import type { DashboardData, FilterState } from '../../types';
import { KPICard } from '../common/KPICard';
import { ChartCard } from '../common/ChartCard';
import {
  calculateTotalRevenue,
  calculateOrderCount,
  calculateAOV,
  calculateNewCustomers,
  calculateNetCashFlow,
  calculateDispatchRate,
  calculateOnTimeDelivery,
  calculateRefundRate,
  calculateRepeatRate,
  getRevenueTrend,
  formatCurrency,
  formatNumber,
  formatPercentage,
} from '../../utils/calculations';

// ============ Executive Dashboard Principles ============
// - One page: critical metrics visible without scrolling
// - Context: every number needs comparison (vs target, vs plan)
// - Trend: show direction, not just current state
// - Action: every metric suggests an action
// - RAG status: Red/Amber/Green for instant health assessment

interface OverviewSectionProps {
  data: DashboardData;
  filters: FilterState;
}

// RAG (Red/Amber/Green) status logic
type RAGStatus = 'green' | 'amber' | 'red';

interface MetricWithRAG {
  label: string;
  value: string;
  target: string;
  achievement: number; // percentage of target achieved
  status: RAGStatus;
  owner: string;
  trend: 'up' | 'down' | 'flat';
  action?: string;
}

function getRAGStatus(achievement: number, higherIsBetter = true): RAGStatus {
  if (higherIsBetter) {
    if (achievement >= 90) return 'green';
    if (achievement >= 70) return 'amber';
    return 'red';
  } else {
    // Lower is better (e.g., refund rate)
    if (achievement <= 110) return 'green';
    if (achievement <= 130) return 'amber';
    return 'red';
  }
}

const RAG_COLORS: Record<RAGStatus, string> = {
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
};

const RAG_BG: Record<RAGStatus, string> = {
  green: 'bg-emerald-50 border-emerald-200',
  amber: 'bg-amber-50 border-amber-200',
  red: 'bg-red-50 border-red-200',
};

const RAG_TEXT: Record<RAGStatus, string> = {
  green: 'text-emerald-700',
  amber: 'text-amber-700',
  red: 'text-red-700',
};

export function OverviewSection({ data, filters }: OverviewSectionProps) {
  const totalRevenue = calculateTotalRevenue(data);
  const orderCount = calculateOrderCount(data);
  const aov = calculateAOV(data);
  const newCustomers = calculateNewCustomers(data);
  const netCashFlow = calculateNetCashFlow(data);
  const dispatchRate = calculateDispatchRate(data);
  const onTimeDelivery = calculateOnTimeDelivery(data);
  const refundRate = calculateRefundRate(data);
  const repeatRate = calculateRepeatRate(data);
  const revenueTrend = getRevenueTrend(data, filters.dateRange);

  // Define targets (these would come from business planning in production)
  const targets = {
    revenue: 2500000,
    orders: 600,
    aov: 3500,
    newCustomers: 12,
    netCashFlow: 2000000,
    dispatchRate: 90,
    onTimeDelivery: 85,
    refundRate: 5,
    repeatRate: 50,
  };

  // Build RAG scorecard — Executive Dashboard principle: 5-8 north star metrics
  const ragMetrics: MetricWithRAG[] = [
    {
      label: 'Revenue',
      value: formatCurrency(totalRevenue),
      target: formatCurrency(targets.revenue),
      achievement: (totalRevenue / targets.revenue) * 100,
      status: getRAGStatus((totalRevenue / targets.revenue) * 100),
      owner: 'CEO / Head of Sales',
      trend: totalRevenue >= targets.revenue * 0.9 ? 'up' : 'down',
    },
    {
      label: 'Order Count',
      value: formatNumber(orderCount),
      target: formatNumber(targets.orders),
      achievement: (orderCount / targets.orders) * 100,
      status: getRAGStatus((orderCount / targets.orders) * 100),
      owner: 'Head of Sales',
      trend: orderCount >= targets.orders * 0.9 ? 'up' : 'down',
    },
    {
      label: 'Avg Order Value',
      value: formatCurrency(aov),
      target: formatCurrency(targets.aov),
      achievement: (aov / targets.aov) * 100,
      status: getRAGStatus((aov / targets.aov) * 100),
      owner: 'Marketing Lead',
      trend: aov >= targets.aov ? 'up' : 'flat',
    },
    {
      label: 'Dispatch Rate',
      value: formatPercentage(dispatchRate),
      target: `${targets.dispatchRate}%`,
      achievement: (dispatchRate / targets.dispatchRate) * 100,
      status: getRAGStatus((dispatchRate / targets.dispatchRate) * 100),
      owner: 'Operations Head',
      trend: dispatchRate >= targets.dispatchRate ? 'up' : 'down',
      action: dispatchRate < targets.dispatchRate * 0.85 ? 'Review pending orders immediately' : undefined,
    },
    {
      label: 'On-Time Delivery',
      value: formatPercentage(onTimeDelivery),
      target: `${targets.onTimeDelivery}%`,
      achievement: (onTimeDelivery / targets.onTimeDelivery) * 100,
      status: getRAGStatus((onTimeDelivery / targets.onTimeDelivery) * 100),
      owner: 'Logistics Manager',
      trend: onTimeDelivery >= targets.onTimeDelivery ? 'up' : 'down',
      action: onTimeDelivery < 75 ? 'Escalate to carrier partners' : undefined,
    },
    {
      label: 'Refund Rate',
      value: formatPercentage(refundRate),
      target: `<${targets.refundRate}%`,
      achievement: (refundRate / targets.refundRate) * 100,
      status: getRAGStatus((refundRate / targets.refundRate) * 100, false),
      owner: 'Customer Success',
      trend: refundRate <= targets.refundRate ? 'up' : 'down',
      action: refundRate > 8 ? 'Investigate return reasons' : undefined,
    },
  ];

  // Anomaly detection — highlight metrics that need immediate attention
  const anomalies = ragMetrics.filter((m) => m.status === 'red');
  const warnings = ragMetrics.filter((m) => m.status === 'amber');

  // Weekly performance bars for progressive disclosure
  const weeklyPerformance = revenueTrend.reduce((acc: { week: string; revenue: number; orders: number }[], item, idx) => {
    const weekNum = Math.floor(idx / 7);
    if (!acc[weekNum]) {
      acc[weekNum] = { week: `Week ${weekNum + 1}`, revenue: 0, orders: 0 };
    }
    acc[weekNum].revenue += item.revenue;
    acc[weekNum].orders += item.orders;
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Anomaly Alerts — Executive Dashboard principle: surface issues immediately */}
      {anomalies.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-semibold text-red-800">Action Required — {anomalies.length} metric(s) below threshold</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {anomalies.map((metric) => (
              <div key={metric.label} className="flex items-center gap-2 text-sm text-red-700">
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <span className="font-medium">{metric.label}:</span>
                <span>{metric.value} (target: {metric.target})</span>
              </div>
            ))}
          </div>
          {anomalies.some((m) => m.action) && (
            <div className="mt-2 pt-2 border-t border-red-200">
              {anomalies.filter((m) => m.action).map((m) => (
                <p key={m.label} className="text-xs text-red-600 font-medium">
                  → {m.label}: {m.action}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {warnings.length > 0 && anomalies.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">Watch — {warnings.length} metric(s) approaching threshold</h3>
          </div>
        </div>
      )}

      {anomalies.length === 0 && warnings.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-emerald-800">All metrics on track</h3>
          </div>
        </div>
      )}

      {/* KPI Cards — Kept to 6 per Executive Dashboard principle (5-8 max) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={12.5}
          changeLabel="vs last period"
          icon={<DollarSign className="w-5 h-5" />}
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
          title="Avg Order Value"
          value={formatCurrency(aov)}
          change={3.2}
          changeLabel="vs last period"
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
        <KPICard
          title="New Customers"
          value={formatNumber(newCustomers)}
          change={15.7}
          changeLabel="vs last period"
          icon={<Users className="w-5 h-5" />}
          color="orange"
        />
        <KPICard
          title="Net Cash Flow"
          value={formatCurrency(netCashFlow)}
          change={5.1}
          changeLabel="vs last period"
          icon={<Wallet className="w-5 h-5" />}
          color="indigo"
        />
        <KPICard
          title="Dispatch Rate"
          value={formatPercentage(dispatchRate)}
          change={-2.1}
          changeLabel="vs last period"
          icon={<Package className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* RAG Scorecard — Executive Dashboard principle: every metric has target, owner, status */}
      <ChartCard
        title="Business Health Scorecard"
        subtitle="RAG status against targets — every KPI has definition, target, and owner"
        action={
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> On Track</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> At Risk</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Off Track</span>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2.5 px-3 text-left font-medium text-gray-600">Metric</th>
                <th className="py-2.5 px-3 text-left font-medium text-gray-600">Status</th>
                <th className="py-2.5 px-3 text-right font-medium text-gray-600">Actual</th>
                <th className="py-2.5 px-3 text-right font-medium text-gray-600">Target</th>
                <th className="py-2.5 px-3 text-right font-medium text-gray-600">Achievement</th>
                <th className="py-2.5 px-3 text-left font-medium text-gray-600">Owner</th>
              </tr>
            </thead>
            <tbody>
              {ragMetrics.map((metric) => (
                <tr key={metric.label} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-medium text-gray-900">{metric.label}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${RAG_BG[metric.status]} ${RAG_TEXT[metric.status]}`}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RAG_COLORS[metric.status] }} />
                      {metric.status === 'green' ? 'On Track' : metric.status === 'amber' ? 'At Risk' : 'Off Track'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium">{metric.value}</td>
                  <td className="py-2.5 px-3 text-right text-gray-500">{metric.target}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`font-medium ${metric.status === 'green' ? 'text-emerald-600' : metric.status === 'amber' ? 'text-amber-600' : 'text-red-600'}`}>
                      {metric.achievement.toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-500 text-xs">{metric.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* RAG Bar Visualization */}
        <div className="mt-4 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ragMetrics.map((m) => ({ name: m.label, achievement: Math.min(m.achievement, 120), status: m.status }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 120]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={100} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} formatter={(value) => [`${Number(value).toFixed(0)}%`, 'Achievement']} />
              <Bar dataKey="achievement" radius={[0, 4, 4, 0]}>
                {ragMetrics.map((metric, idx) => (
                  <Cell key={idx} fill={RAG_COLORS[metric.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Revenue & Orders Trend — show direction, not just current state */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue Trend" subtitle="Daily revenue vs target (₹83K/day)">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGradient)" />
                {/* Target line */}
                <Line type="monotone" dataKey={() => 83000} stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Daily Target" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Weekly Performance" subtitle="Progressive view — revenue by week">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Leading vs Lagging Indicators — KPI Dashboard principle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Lagging Indicators" subtitle="Outcome metrics (results already happened)">
          <div className="space-y-3 py-2">
            {[
              { label: 'Revenue', value: formatCurrency(totalRevenue), target: formatCurrency(targets.revenue), pct: (totalRevenue / targets.revenue) * 100 },
              { label: 'Net Cash Flow', value: formatCurrency(netCashFlow), target: formatCurrency(targets.netCashFlow), pct: (netCashFlow / targets.netCashFlow) * 100 },
              { label: 'Repeat Rate', value: formatPercentage(repeatRate), target: `${targets.repeatRate}%`, pct: (repeatRate / targets.repeatRate) * 100 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-28 text-sm font-medium text-gray-700">{item.label}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">{item.value}</span>
                    <span className="text-gray-400">Target: {item.target}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(item.pct, 100)}%`,
                        backgroundColor: item.pct >= 90 ? '#10b981' : item.pct >= 70 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-xs font-medium" style={{ color: item.pct >= 90 ? '#10b981' : item.pct >= 70 ? '#f59e0b' : '#ef4444' }}>
                  {item.pct.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Leading Indicators" subtitle="Predictive metrics (signal future outcomes)">
          <div className="space-y-3 py-2">
            {[
              { label: 'New Customers', value: formatNumber(newCustomers), target: formatNumber(targets.newCustomers), pct: (newCustomers / targets.newCustomers) * 100 },
              { label: 'Dispatch Rate', value: formatPercentage(dispatchRate), target: `${targets.dispatchRate}%`, pct: (dispatchRate / targets.dispatchRate) * 100 },
              { label: 'On-Time Delivery', value: formatPercentage(onTimeDelivery), target: `${targets.onTimeDelivery}%`, pct: (onTimeDelivery / targets.onTimeDelivery) * 100 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-28 text-sm font-medium text-gray-700">{item.label}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">{item.value}</span>
                    <span className="text-gray-400">Target: {item.target}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(item.pct, 100)}%`,
                        backgroundColor: item.pct >= 90 ? '#10b981' : item.pct >= 70 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-xs font-medium" style={{ color: item.pct >= 90 ? '#10b981' : item.pct >= 70 ? '#f59e0b' : '#ef4444' }}>
                  {item.pct.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Data Freshness — Executive Dashboard principle */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pt-2">
        <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Targets set for current quarter</span>
        <span>|</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Metrics refresh: Daily</span>
        <span>|</span>
        <span>Period: {filters.dateRange.start.toLocaleDateString()} – {filters.dateRange.end.toLocaleDateString()}</span>
      </div>
    </div>
  );
}

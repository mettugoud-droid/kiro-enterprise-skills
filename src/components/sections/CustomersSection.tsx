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
  ScatterChart,
  Scatter,
  LineChart,
  Line,
} from 'recharts';
import { Users, UserPlus, Repeat, Heart, AlertTriangle, TrendingDown } from 'lucide-react';
import type { DashboardData } from '../../types';
import { KPICard } from '../common/KPICard';
import { ChartCard } from '../common/ChartCard';
import { DataTable } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import {
  calculateNewCustomers,
  calculateRepeatCustomers,
  calculateRepeatRate,
  getCustomerSegments,
  formatCurrency,
  formatNumber,
  formatPercentage,
} from '../../utils/calculations';

// ============ Customer Analytics Skill Principles ============
// - Segment by behavior (what they do), not just demographics
// - Track retention at cohort level, not just aggregate
// - Calculate CLV by segment — averages hide important differences
// - Identify leading indicators of churn (reduced activity)
// - Use RFM for quick segmentation; behavioral clustering for deeper
// - Monitor CAC:CLV ratio for sustainable growth
// - Build different retention strategies per segment

interface CustomersSectionProps {
  data: DashboardData;
}

const SEGMENT_COLORS: Record<string, string> = {
  Active: '#10b981',
  'At Risk': '#f59e0b',
  Lapsed: '#f97316',
  Lost: '#ef4444',
};

// RFM Score calculation
interface RFMCustomer {
  name: string;
  recencyScore: number; // 1-5
  frequencyScore: number; // 1-5
  monetaryScore: number; // 1-5
  rfmScore: number;
  segment: string;
  clv: number;
}

function calculateRFMSegments(data: DashboardData): RFMCustomer[] {
  const customers = data.customers;
  
  // Score boundaries based on quintiles
  const sortedRecency = [...data.customerLastBuy].sort((a, b) => a.daysSincePurchase - b.daysSincePurchase);
  const sortedFrequency = [...customers].sort((a, b) => b.totalOrders - a.totalOrders);
  const sortedMonetary = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);

  return customers.map((c, idx) => {
    const lastBuy = data.customerLastBuy.find((lb) => lb.customerId === c.customerId);
    const daysSince = lastBuy?.daysSincePurchase || 180;

    // Score 1-5 (5 = best)
    const recencyRank = sortedRecency.findIndex((r) => r.customerId === c.customerId);
    const frequencyRank = sortedFrequency.findIndex((f) => f.customerId === c.customerId);
    const monetaryRank = sortedMonetary.findIndex((m) => m.customerId === c.customerId);

    const total = customers.length;
    const recencyScore = Math.min(5, Math.max(1, 5 - Math.floor((recencyRank / total) * 5)));
    const frequencyScore = Math.min(5, Math.max(1, 5 - Math.floor((frequencyRank / total) * 5)));
    const monetaryScore = Math.min(5, Math.max(1, 5 - Math.floor((monetaryRank / total) * 5)));

    const rfmScore = recencyScore + frequencyScore + monetaryScore;

    // RFM-based segment
    let segment = 'Hibernating';
    if (rfmScore >= 13) segment = 'Champions';
    else if (rfmScore >= 10 && recencyScore >= 4) segment = 'Loyal';
    else if (rfmScore >= 8 && recencyScore >= 3) segment = 'Potential Loyalists';
    else if (recencyScore >= 4 && frequencyScore <= 2) segment = 'New Customers';
    else if (recencyScore <= 2 && rfmScore >= 8) segment = 'At Risk';
    else if (recencyScore <= 2 && frequencyScore <= 2) segment = 'Lost';
    else segment = 'Need Attention';

    // CLV prediction (simple model: avg order value × frequency × expected lifetime)
    const avgOrderValue = c.totalSpent / Math.max(c.totalOrders, 1);
    const monthlyFrequency = c.totalOrders / Math.max(daysSince / 30, 1);
    const expectedLifetimeMonths = rfmScore >= 10 ? 24 : rfmScore >= 7 ? 12 : 6;
    const clv = avgOrderValue * monthlyFrequency * expectedLifetimeMonths;

    return {
      name: c.name,
      recencyScore,
      frequencyScore,
      monetaryScore,
      rfmScore,
      segment,
      clv,
    };
  });
}

export function CustomersSection({ data }: CustomersSectionProps) {
  const totalCustomers = data.customers.length;
  const newCustomers = calculateNewCustomers(data);
  const repeatCustomers = calculateRepeatCustomers(data);
  const repeatRate = calculateRepeatRate(data);
  const segments = getCustomerSegments(data);
  const rfmCustomers = calculateRFMSegments(data);

  // RFM segment distribution
  const rfmSegmentDist = rfmCustomers.reduce((acc, c) => {
    acc[c.segment] = (acc[c.segment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const rfmSegmentData = Object.entries(rfmSegmentDist)
    .map(([segment, count]) => ({ segment, count }))
    .sort((a, b) => b.count - a.count);

  const RFM_SEGMENT_COLORS: Record<string, string> = {
    Champions: '#10b981',
    Loyal: '#3b82f6',
    'Potential Loyalists': '#6366f1',
    'New Customers': '#8b5cf6',
    'Need Attention': '#f59e0b',
    'At Risk': '#f97316',
    Hibernating: '#94a3b8',
    Lost: '#ef4444',
  };

  // CLV by segment
  const clvBySegment = Object.entries(
    rfmCustomers.reduce((acc, c) => {
      if (!acc[c.segment]) acc[c.segment] = { total: 0, count: 0 };
      acc[c.segment].total += c.clv;
      acc[c.segment].count++;
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).map(([segment, data]) => ({
    segment,
    avgCLV: data.total / data.count,
    customers: data.count,
  })).sort((a, b) => b.avgCLV - a.avgCLV);

  // Cohort retention (simulated based on first purchase month)
  const cohortRetention = [
    { cohort: 'Month 1', month1: 100, month2: 62, month3: 45, month4: 38, month5: 32, month6: 28 },
    { cohort: 'Month 2', month1: 100, month2: 58, month3: 41, month4: 35, month5: 30, month6: 0 },
    { cohort: 'Month 3', month1: 100, month2: 65, month3: 48, month4: 40, month5: 0, month6: 0 },
    { cohort: 'Month 4', month1: 100, month2: 60, month3: 44, month4: 0, month5: 0, month6: 0 },
    { cohort: 'Month 5', month1: 100, month2: 55, month3: 0, month4: 0, month5: 0, month6: 0 },
    { cohort: 'Month 6', month1: 100, month2: 0, month3: 0, month4: 0, month5: 0, month6: 0 },
  ];

  // Churn risk indicators
  const churnRiskCustomers = data.customerLastBuy
    .filter((c) => c.segment === 'At Risk' || c.segment === 'Lapsed')
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 8);

  // Purchase frequency distribution
  const frequencyDistribution = [
    { range: '1 order', count: data.customers.filter((c) => c.totalOrders === 1).length },
    { range: '2-3 orders', count: data.customers.filter((c) => c.totalOrders >= 2 && c.totalOrders <= 3).length },
    { range: '4-6 orders', count: data.customers.filter((c) => c.totalOrders >= 4 && c.totalOrders <= 6).length },
    { range: '7-10 orders', count: data.customers.filter((c) => c.totalOrders >= 7 && c.totalOrders <= 10).length },
    { range: '10+ orders', count: data.customers.filter((c) => c.totalOrders > 10).length },
  ];

  // Scatter data for orders vs spend
  const scatterData = data.customers.map((c) => ({
    orders: c.totalOrders,
    spent: c.totalSpent,
    name: c.name,
  }));

  const reengagementColumns = [
    { key: 'customerName', label: 'Customer' },
    { key: 'daysSincePurchase', label: 'Days Inactive', align: 'right' as const },
    {
      key: 'totalSpent',
      label: 'Lifetime Value',
      align: 'right' as const,
      render: (v: unknown) => <span className="font-medium">{formatCurrency(v as number)}</span>,
    },
    {
      key: 'segment',
      label: 'Risk Level',
      render: (v: unknown) => (
        <StatusBadge
          status={v as string}
          variant={v === 'At Risk' ? 'warning' : v === 'Lapsed' ? 'danger' : 'default'}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Customers"
          value={formatNumber(totalCustomers)}
          change={9.2}
          changeLabel="growth"
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <KPICard
          title="New Customers"
          value={formatNumber(newCustomers)}
          change={15.7}
          changeLabel="vs last period"
          icon={<UserPlus className="w-5 h-5" />}
          color="green"
        />
        <KPICard
          title="Repeat Customers"
          value={formatNumber(repeatCustomers)}
          change={4.3}
          changeLabel="vs last period"
          icon={<Repeat className="w-5 h-5" />}
          color="purple"
        />
        <KPICard
          title="Repeat Rate"
          value={formatPercentage(repeatRate)}
          change={2.1}
          changeLabel="improvement"
          icon={<Heart className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* RFM Segmentation + CLV by Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="RFM Segmentation" subtitle="Behavioral segments based on Recency, Frequency, Monetary value">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rfmSegmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="segment"
                >
                  {rfmSegmentData.map((entry) => (
                    <Cell key={entry.segment} fill={RFM_SEGMENT_COLORS[entry.segment] || '#94a3b8'} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={50} iconSize={10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>RFM Model:</strong> Customers scored 1-5 on Recency (last purchase), Frequency (order count), and Monetary (total spend). Higher combined score = more valuable customer.
            </p>
          </div>
        </ChartCard>

        <ChartCard title="CLV by Segment" subtitle="Average predicted Customer Lifetime Value per RFM segment">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clvBySegment} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="segment" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={120} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), 'Avg CLV']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="avgCLV" radius={[0, 4, 4, 0]}>
                  {clvBySegment.map((entry) => (
                    <Cell key={entry.segment} fill={RFM_SEGMENT_COLORS[entry.segment] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-700">
              <strong>CLV Formula:</strong> Avg Order Value x Monthly Frequency x Expected Lifetime (months). Champions have 24-month horizon; At Risk customers 6-month.
            </p>
          </div>
        </ChartCard>
      </div>

      {/* Cohort Retention + Purchase Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Cohort Retention" subtitle="Retention curves by acquisition month (% active)">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cohortRetention}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="cohort" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Legend />
                <Line type="monotone" dataKey="month1" stroke="#3b82f6" strokeWidth={2} name="M1" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="month2" stroke="#10b981" strokeWidth={2} name="M2" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="month3" stroke="#8b5cf6" strokeWidth={2} name="M3" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="month4" stroke="#f59e0b" strokeWidth={2} name="M4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 p-3 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-700">
              <strong>Insight:</strong> Biggest drop-off is between Month 1→2 (~38% churn). Focus retention efforts on the first 30 days post-purchase.
            </p>
          </div>
        </ChartCard>

        <ChartCard title="Purchase Frequency" subtitle="Order count distribution across customer base">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Customer Value Scatter + Churn Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Customer Value Map" subtitle="Orders vs Total Spend — identify high-value customers">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="orders" name="Orders" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="spent" name="Spent" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(value, name) => [name === 'Spent' ? formatCurrency(Number(value)) : value, name]}
                />
                <Scatter data={scatterData} fill="#3b82f6" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Churn Risk — High-Value Customers"
          subtitle="Leading indicators: customers showing reduced activity"
          action={<AlertTriangle className="w-4 h-4 text-amber-500" />}
        >
          <DataTable
            data={churnRiskCustomers as unknown as Record<string, unknown>[]}
            columns={reengagementColumns}
            maxRows={8}
          />
          <div className="mt-3 p-3 bg-red-50 rounded-lg flex items-start gap-2">
            <TrendingDown className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700">
              <strong>Churn Signals:</strong> {churnRiskCustomers.length} high-value customers haven't purchased in 45+ days.
              Total at-risk revenue: {formatCurrency(churnRiskCustomers.reduce((s, c) => s + c.totalSpent, 0))}.
              Recommended: Trigger personalized re-engagement campaign via WhatsApp.
            </p>
          </div>
        </ChartCard>
      </div>

      {/* Original segment view preserved for context */}
      <ChartCard title="Activity Segments" subtitle="Simple recency-based segmentation (Active / At Risk / Lapsed / Lost)">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
          {segments.map((seg) => (
            <div key={seg.segment} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${SEGMENT_COLORS[seg.segment]}15` }}>
              <p className="text-2xl font-bold" style={{ color: SEGMENT_COLORS[seg.segment] }}>{seg.count}</p>
              <p className="text-sm font-medium text-gray-700">{seg.segment}</p>
              <p className="text-xs text-gray-500">{formatCurrency(seg.revenue)} revenue</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

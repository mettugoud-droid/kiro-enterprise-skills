import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Package, TrendingUp, AlertTriangle, Award } from 'lucide-react';
import type { DashboardData } from '../../types';
import { KPICard } from '../common/KPICard';
import { ChartCard } from '../common/ChartCard';
import { DataTable } from '../common/DataTable';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/calculations';

interface ProductsSectionProps {
  data: DashboardData;
}

export function ProductsSection({ data }: ProductsSectionProps) {
  const totalProducts = data.products.length;
  const totalUnitsSold = data.products.reduce((sum, p) => sum + p.unitsSold, 0);
  const avgMargin = data.products.reduce((sum, p) => sum + p.margin, 0) / totalProducts;
  const totalReturns = data.products.reduce((sum, p) => sum + p.returns, 0);
  const returnRate = totalUnitsSold > 0 ? (totalReturns / totalUnitsSold) * 100 : 0;

  // Product performance sorted by revenue
  const productsByRevenue = [...data.products].sort((a, b) => b.revenue - a.revenue);
  const topPerformers = productsByRevenue.slice(0, 5);
  const slowMoving = [...data.products].sort((a, b) => a.unitsSold - b.unitsSold).slice(0, 5);

  // Category comparison radar
  const categoryRadar = data.productTypes.map((pt) => ({
    category: pt.productType,
    revenue: pt.revenue / 1000,
    units: pt.unitsSold,
    margin: pt.margin,
  }));

  // Category bar chart
  const categoryBar = data.productTypes.map((pt) => ({
    category: pt.productType,
    revenue: pt.revenue,
    units: pt.unitsSold,
  }));

  const productColumns = [
    { key: 'productName', label: 'Product' },
    { key: 'category', label: 'Category' },
    {
      key: 'revenue',
      label: 'Revenue',
      align: 'right' as const,
      render: (v: unknown) => <span className="font-medium">{formatCurrency(v as number)}</span>,
    },
    { key: 'unitsSold', label: 'Units', align: 'right' as const },
    { key: 'returns', label: 'Returns', align: 'right' as const },
    {
      key: 'margin',
      label: 'Margin',
      align: 'right' as const,
      render: (v: unknown) => (
        <span className={`font-medium ${(v as number) >= 35 ? 'text-emerald-600' : (v as number) >= 25 ? 'text-amber-600' : 'text-red-600'}`}>
          {String(v)}%
        </span>
      ),
    },
  ];

  const slowMovingColumns = [
    { key: 'productName', label: 'Product' },
    { key: 'category', label: 'Category' },
    { key: 'unitsSold', label: 'Units Sold', align: 'right' as const },
    {
      key: 'revenue',
      label: 'Revenue',
      align: 'right' as const,
      render: (v: unknown) => formatCurrency(v as number),
    },
    {
      key: 'margin',
      label: 'Margin',
      align: 'right' as const,
      render: (v: unknown) => `${v}%`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Products"
          value={formatNumber(totalProducts)}
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <KPICard
          title="Total Units Sold"
          value={formatNumber(totalUnitsSold)}
          change={11.3}
          changeLabel="vs last period"
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <KPICard
          title="Avg Margin"
          value={formatPercentage(avgMargin)}
          change={1.5}
          changeLabel="improvement"
          icon={<Award className="w-5 h-5" />}
          color="purple"
        />
        <KPICard
          title="Return Rate"
          value={formatPercentage(returnRate)}
          change={-0.8}
          changeLabel="improvement"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Category Revenue" subtitle="Revenue by product type">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBar}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value, name) => [name === 'revenue' ? formatCurrency(Number(value)) : value, name]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="units" fill="#10b981" name="Units" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Category Comparison" subtitle="Multi-dimension radar view">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={categoryRadar}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fontSize: 9 }} />
                <Radar name="Revenue (K)" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Radar name="Margin %" dataKey="margin" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Legend />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Top Performers */}
      <ChartCard title="Top Performers" subtitle="Highest revenue products">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topPerformers.map((p) => ({ name: p.productName.slice(0, 20), revenue: p.revenue, units: p.unitsSold }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(value, name) => [name === 'revenue' ? formatCurrency(Number(value)) : value, name]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="revenue" fill="#6366f1" name="Revenue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* All Products Table */}
      <ChartCard title="All Products" subtitle="Complete product performance data">
        <DataTable
          data={productsByRevenue as unknown as Record<string, unknown>[]}
          columns={productColumns}
        />
      </ChartCard>

      {/* Slow Moving Products */}
      <ChartCard title="Slow-Moving Products" subtitle="Products with lowest sales - consider promotions or discontinuation">
        <DataTable
          data={slowMoving as unknown as Record<string, unknown>[]}
          columns={slowMovingColumns}
        />
      </ChartCard>
    </div>
  );
}

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
} from 'recharts';
import { MessageCircle, Send, Eye, MousePointer } from 'lucide-react';
import type { DashboardData } from '../../types';
import { KPICard } from '../common/KPICard';
import { ChartCard } from '../common/ChartCard';
import { DataTable } from '../common/DataTable';
import { formatNumber, formatPercentage } from '../../utils/calculations';

interface MarketingSectionProps {
  data: DashboardData;
}

const FUNNEL_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#10b981'];

export function MarketingSection({ data }: MarketingSectionProps) {
  const totalSent = data.whatsapp.reduce((sum, w) => sum + w.sent, 0);
  const totalDelivered = data.whatsapp.reduce((sum, w) => sum + w.delivered, 0);
  const totalRead = data.whatsapp.reduce((sum, w) => sum + w.read, 0);
  const totalClicked = data.whatsapp.reduce((sum, w) => sum + w.clicked, 0);
  const totalConversions = data.whatsapp.reduce((sum, w) => sum + w.conversions, 0);

  const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
  const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;
  const clickRate = totalRead > 0 ? (totalClicked / totalRead) * 100 : 0;
  const conversionRate = totalClicked > 0 ? (totalConversions / totalClicked) * 100 : 0;

  // Funnel data
  const funnelData = [
    { name: 'Sent', value: totalSent },
    { name: 'Delivered', value: totalDelivered },
    { name: 'Read', value: totalRead },
    { name: 'Clicked', value: totalClicked },
    { name: 'Converted', value: totalConversions },
  ];

  // Campaign comparison
  const campaignComparison = data.whatsapp.map((w) => ({
    campaign: w.campaignName.length > 20 ? w.campaignName.slice(0, 20) + '...' : w.campaignName,
    sent: w.sent,
    delivered: w.delivered,
    read: w.read,
    clicked: w.clicked,
    conversions: w.conversions,
    convRate: w.clicked > 0 ? ((w.conversions / w.clicked) * 100).toFixed(1) : '0',
  }));

  // Re-engagement metrics from customerLastBuy
  const reengagementMetrics = {
    nowClicked: data.customerLastBuy.filter((c) => {
      const clickDate = new Date(c.lastClickedDate);
      const purchaseDate = new Date(c.lastPurchaseDate);
      return clickDate > purchaseDate;
    }).length,
    atRisk: data.customerLastBuy.filter((c) => c.segment === 'At Risk').length,
    lapsed: data.customerLastBuy.filter((c) => c.segment === 'Lapsed').length,
    reengaged: data.customerLastBuy.filter(
      (c) => c.segment === 'Active' && c.daysSincePurchase < 30
    ).length,
  };

  const campaignColumns = [
    { key: 'campaign', label: 'Campaign' },
    { key: 'sent', label: 'Sent', align: 'right' as const, render: (v: unknown) => formatNumber(v as number) },
    { key: 'delivered', label: 'Delivered', align: 'right' as const, render: (v: unknown) => formatNumber(v as number) },
    { key: 'read', label: 'Read', align: 'right' as const, render: (v: unknown) => formatNumber(v as number) },
    { key: 'clicked', label: 'Clicked', align: 'right' as const, render: (v: unknown) => formatNumber(v as number) },
    { key: 'conversions', label: 'Conversions', align: 'right' as const, render: (v: unknown) => <span className="font-medium text-emerald-600">{String(v)}</span> },
    { key: 'convRate', label: 'Conv. Rate', align: 'right' as const, render: (v: unknown) => <span className="font-medium">{String(v)}%</span> },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Messages Sent"
          value={formatNumber(totalSent)}
          change={22.1}
          changeLabel="vs last period"
          icon={<Send className="w-5 h-5" />}
          color="blue"
        />
        <KPICard
          title="Delivery Rate"
          value={formatPercentage(deliveryRate)}
          change={1.2}
          changeLabel="improvement"
          icon={<MessageCircle className="w-5 h-5" />}
          color="green"
        />
        <KPICard
          title="Read Rate"
          value={formatPercentage(readRate)}
          change={3.5}
          changeLabel="improvement"
          icon={<Eye className="w-5 h-5" />}
          color="purple"
        />
        <KPICard
          title="Click Rate"
          value={formatPercentage(clickRate)}
          change={-1.0}
          changeLabel="vs last period"
          icon={<MousePointer className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* Funnel + Re-engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="WhatsApp Campaign Funnel" subtitle="Message journey from sent to conversion">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  {funnelData.map((_, idx) => (
                    <Cell key={idx} fill={FUNNEL_COLORS[idx]} />
                  ))}
                  <LabelList position="right" fill="#374151" fontSize={12} dataKey="name" />
                  <LabelList position="center" fill="#fff" fontSize={11} dataKey="value" formatter={(v) => formatNumber(Number(v))} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500">Delivery</p>
              <p className="text-sm font-bold text-blue-600">{formatPercentage(deliveryRate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Read</p>
              <p className="text-sm font-bold text-indigo-600">{formatPercentage(readRate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Click</p>
              <p className="text-sm font-bold text-purple-600">{formatPercentage(clickRate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Conversion</p>
              <p className="text-sm font-bold text-emerald-600">{formatPercentage(conversionRate)}</p>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Re-engagement Metrics" subtitle="Customer purchase intent signals">
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">"Now Clicked" Customers</p>
                <p className="text-xs text-gray-500">Showed purchase intent after last buy</p>
              </div>
              <span className="text-2xl font-bold text-blue-600">{reengagementMetrics.nowClicked}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">At Risk Customers</p>
                <p className="text-xs text-gray-500">45-90 days since purchase</p>
              </div>
              <span className="text-2xl font-bold text-amber-600">{reengagementMetrics.atRisk}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Lapsed Customers</p>
                <p className="text-xs text-gray-500">90-120 days since purchase</p>
              </div>
              <span className="text-2xl font-bold text-red-600">{reengagementMetrics.lapsed}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Recently Re-engaged</p>
                <p className="text-xs text-gray-500">Active within last 30 days</p>
              </div>
              <span className="text-2xl font-bold text-emerald-600">{reengagementMetrics.reengaged}</span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Campaign Performance Chart */}
      <ChartCard title="Campaign Performance Comparison" subtitle="Metrics across all campaigns">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={campaignComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="campaign" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend />
              <Bar dataKey="delivered" fill="#3b82f6" name="Delivered" radius={[2, 2, 0, 0]} />
              <Bar dataKey="read" fill="#8b5cf6" name="Read" radius={[2, 2, 0, 0]} />
              <Bar dataKey="clicked" fill="#f59e0b" name="Clicked" radius={[2, 2, 0, 0]} />
              <Bar dataKey="conversions" fill="#10b981" name="Conversions" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Campaign Table */}
      <ChartCard title="Campaign Details" subtitle="All WhatsApp HSM campaigns">
        <DataTable
          data={campaignComparison as unknown as Record<string, unknown>[]}
          columns={campaignColumns}
        />
      </ChartCard>
    </div>
  );
}

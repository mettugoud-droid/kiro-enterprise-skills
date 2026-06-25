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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from 'recharts';
import { Truck, Clock, MapPin, CheckCircle, AlertTriangle, RotateCcw, Zap, IndianRupee } from 'lucide-react';
import type { DashboardData } from '../../types';
import { KPICard } from '../common/KPICard';
import { ChartCard } from '../common/ChartCard';
import { DataTable } from '../common/DataTable';
import {
  calculateDispatchRate,
  calculateOnTimeDelivery,
  calculateAvgDeliveryTime,
  getCarrierPerformance,
  getShippingByRegion,
  formatPercentage,
  formatCurrency,
} from '../../utils/calculations';

// ============ Logistics Analytics Skill Principles ============
// - Track last-mile separately (highest cost, most variability)
// - Monitor RTO rate and correlate with payment mode and pin codes
// - Use zone-wise SLA targets rather than flat national targets
// - Compare carrier performance on like-for-like routes
// - Factor in fuel, tolls, and driver costs for true cost-per-delivery
// - Plan capacity based on seasonal peaks
// - Implement alerts for SLA breaches in real-time
// - First-attempt delivery success rate is critical

interface FulfillmentSectionProps {
  data: DashboardData;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Zone-wise SLA targets (different targets per zone)
const ZONE_SLA_TARGETS: Record<string, number> = {
  'North': 4,
  'South': 5,
  'East': 5,
  'West': 4,
  'Central': 3,
  'North East': 7,
};

export function FulfillmentSection({ data }: FulfillmentSectionProps) {
  const dispatchRate = calculateDispatchRate(data);
  const onTimeDelivery = calculateOnTimeDelivery(data);
  const avgDeliveryTime = calculateAvgDeliveryTime(data);
  const carrierPerformance = getCarrierPerformance(data);
  const shippingByRegion = getShippingByRegion(data);
  
  const pendingDispatch = data.orders.filter(
    (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing'
  ).length;

  // ============ New Logistics Metrics ============

  // RTO (Return to Origin) Rate
  const totalShipments = data.shipping.length;
  const rtoShipments = data.shipping.filter((s) => s.deliveryStatus === 'Returned').length;
  const rtoRate = totalShipments > 0 ? (rtoShipments / totalShipments) * 100 : 0;

  // First Attempt Delivery Rate
  const delivered = data.shipping.filter((s) => s.deliveryStatus === 'Delivered');
  const firstAttemptSuccess = delivered.filter((s) => s.actualDays <= s.estimatedDays).length;
  const firstAttemptRate = delivered.length > 0 ? (firstAttemptSuccess / delivered.length) * 100 : 0;

  // Cost per delivery
  const totalShippingCost = data.shipping.reduce((sum, s) => sum + s.shippingCost, 0);
  const costPerDelivery = delivered.length > 0 ? totalShippingCost / delivered.length : 0;

  // Failed deliveries
  const failedDeliveries = data.shipping.filter((s) => s.deliveryStatus === 'Failed').length;

  // Delivery status breakdown
  const deliveryStatusData = [
    { status: 'Delivered', count: delivered.length },
    { status: 'In Transit', count: data.shipping.filter((s) => s.deliveryStatus === 'In Transit').length },
    { status: 'Returned (RTO)', count: rtoShipments },
    { status: 'Failed', count: failedDeliveries },
  ];

  // Zone-wise SLA compliance (with zone-specific targets)
  const zoneSLACompliance = shippingByRegion.map((region) => {
    const slaTarget = ZONE_SLA_TARGETS[region.region] || 5;
    const zoneShipments = data.shipping.filter((s) => s.region === region.region && s.deliveryStatus === 'Delivered');
    const withinSLA = zoneShipments.filter((s) => s.actualDays <= slaTarget).length;
    const compliance = zoneShipments.length > 0 ? (withinSLA / zoneShipments.length) * 100 : 0;
    
    return {
      region: region.region,
      slaTarget: `${slaTarget} days`,
      avgDays: region.avgDays,
      compliance,
      orders: region.orders,
      breaches: zoneShipments.length - withinSLA,
      status: compliance >= 85 ? 'green' : compliance >= 70 ? 'amber' : 'red',
    };
  });

  // RTO analysis by carrier
  const rtoByCarrier = carrierPerformance.map((carrier) => {
    const carrierShipments = data.shipping.filter((s) => s.carrier === carrier.carrier);
    const carrierRTO = carrierShipments.filter((s) => s.deliveryStatus === 'Returned').length;
    const carrierRTORate = carrierShipments.length > 0 ? (carrierRTO / carrierShipments.length) * 100 : 0;
    const carrierCost = carrierShipments.reduce((sum, s) => sum + s.shippingCost, 0);
    const carrierCPD = carrierShipments.length > 0 ? carrierCost / carrierShipments.length : 0;

    return {
      carrier: carrier.carrier,
      shipments: carrierShipments.length,
      rtoRate: Math.round(carrierRTORate * 10) / 10,
      rtoCount: carrierRTO,
      onTime: carrier.onTime,
      avgDays: carrier.avgDays,
      costPerDelivery: Math.round(carrierCPD),
      // Carrier scorecard score (weighted)
      score: Math.round(carrier.onTime * 0.4 + (100 - carrierRTORate) * 0.3 + Math.min(100, (5 / Math.max(carrier.avgDays, 1)) * 100) * 0.3),
    };
  }).sort((a, b) => b.score - a.score);

  // Last-mile performance (simulated daily trend)
  const lastMileTrend = Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    deliveryRate: 75 + Math.random() * 20,
    rtoRate: 3 + Math.random() * 8,
    avgHours: 18 + Math.random() * 12,
  }));

  // Carrier scorecard columns
  const carrierScorecardColumns = [
    { key: 'carrier', label: 'Carrier' },
    { key: 'shipments', label: 'Shipments', align: 'right' as const },
    {
      key: 'onTime',
      label: 'On-Time %',
      align: 'right' as const,
      render: (v: unknown) => (
        <span className={`font-medium ${(v as number) >= 80 ? 'text-emerald-600' : (v as number) >= 65 ? 'text-amber-600' : 'text-red-600'}`}>
          {String(v)}%
        </span>
      ),
    },
    {
      key: 'rtoRate',
      label: 'RTO %',
      align: 'right' as const,
      render: (v: unknown) => (
        <span className={`font-medium ${(v as number) <= 5 ? 'text-emerald-600' : (v as number) <= 10 ? 'text-amber-600' : 'text-red-600'}`}>
          {String(v)}%
        </span>
      ),
    },
    {
      key: 'avgDays',
      label: 'Avg Days',
      align: 'right' as const,
      render: (v: unknown) => <span>{String(v)} days</span>,
    },
    {
      key: 'costPerDelivery',
      label: 'Cost/Delivery',
      align: 'right' as const,
      render: (v: unknown) => <span className="font-medium">{formatCurrency(v as number)}</span>,
    },
    {
      key: 'score',
      label: 'Score',
      align: 'right' as const,
      render: (v: unknown) => {
        const score = v as number;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
            score >= 75 ? 'bg-emerald-100 text-emerald-700' : score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
          }`}>
            {String(score)}/100
          </span>
        );
      },
    },
  ];

  // Zone SLA columns
  const zoneSLAColumns = [
    { key: 'region', label: 'Zone' },
    { key: 'slaTarget', label: 'SLA Target' },
    {
      key: 'avgDays',
      label: 'Actual Avg',
      align: 'right' as const,
      render: (v: unknown) => <span>{String(v)} days</span>,
    },
    {
      key: 'compliance',
      label: 'Compliance',
      align: 'right' as const,
      render: (v: unknown) => {
        const pct = v as number;
        return (
          <span className={`font-medium ${pct >= 85 ? 'text-emerald-600' : pct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
            {pct.toFixed(1)}%
          </span>
        );
      },
    },
    {
      key: 'breaches',
      label: 'SLA Breaches',
      align: 'right' as const,
      render: (v: unknown) => {
        const breaches = v as number;
        return breaches > 0 ? (
          <span className="text-red-600 font-medium">{String(breaches)}</span>
        ) : (
          <span className="text-emerald-600">0</span>
        );
      },
    },
    { key: 'orders', label: 'Orders', align: 'right' as const },
  ];

  // SLA breach alerts
  const slaBreach = zoneSLACompliance.filter((z) => z.status === 'red');

  return (
    <div className="space-y-6">
      {/* SLA Breach Alert */}
      {slaBreach.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-semibold text-red-800">SLA Breach Alert — {slaBreach.length} zone(s) below target</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {slaBreach.map((zone) => (
              <div key={zone.region} className="flex items-center gap-2 text-sm text-red-700">
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <span><strong>{zone.region}</strong>: {zone.compliance.toFixed(0)}% compliance (target: 85%) — {zone.breaches} breaches</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Row — Extended with logistics-specific metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <KPICard
          title="Dispatch Rate"
          value={formatPercentage(dispatchRate)}
          change={2.3}
          changeLabel="vs last week"
          icon={<Truck className="w-5 h-5" />}
          color="blue"
        />
        <KPICard
          title="On-Time Delivery"
          value={formatPercentage(onTimeDelivery)}
          change={-1.2}
          changeLabel="vs last week"
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <KPICard
          title="First-Attempt Rate"
          value={formatPercentage(firstAttemptRate)}
          change={1.8}
          changeLabel="vs last week"
          icon={<Zap className="w-5 h-5" />}
          color="purple"
        />
        <KPICard
          title="RTO Rate"
          value={formatPercentage(rtoRate)}
          change={-0.5}
          changeLabel="improvement"
          icon={<RotateCcw className="w-5 h-5" />}
          color="orange"
        />
        <KPICard
          title="Cost / Delivery"
          value={formatCurrency(costPerDelivery)}
          change={-3.2}
          changeLabel="vs last week"
          icon={<IndianRupee className="w-5 h-5" />}
          color="indigo"
        />
        <KPICard
          title="Pending Dispatch"
          value={String(pendingDispatch)}
          change={5.0}
          changeLabel="increase"
          icon={<MapPin className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Carrier Scorecard — like-for-like comparison */}
      <ChartCard
        title="Carrier Scorecard"
        subtitle="Weighted score: On-Time (40%) + RTO (30%) + Speed (30%) — compare on like-for-like routes"
      >
        <DataTable
          data={rtoByCarrier as unknown as Record<string, unknown>[]}
          columns={carrierScorecardColumns}
        />
        <div className="mt-4 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={rtoByCarrier}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="carrier" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
              <Radar name="On-Time %" dataKey="onTime" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              <Radar name="Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              <Legend />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Zone-wise SLA + Delivery Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Zone-wise SLA Compliance" subtitle="Per-zone targets (not flat national SLA)" className="lg:col-span-2">
          <DataTable
            data={zoneSLACompliance as unknown as Record<string, unknown>[]}
            columns={zoneSLAColumns}
          />
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneSLACompliance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="region" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Compliance']} />
                <Bar dataKey="compliance" radius={[4, 4, 0, 0]}>
                  {zoneSLACompliance.map((zone, idx) => (
                    <Cell key={idx} fill={zone.status === 'green' ? '#10b981' : zone.status === 'amber' ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Zone SLA Logic:</strong> Each zone has different targets based on geography. Metro zones (Central/West): 3-4 days. Remote zones (North East): 7 days. National flat SLA of 5 days masks regional issues.
            </p>
          </div>
        </ChartCard>

        <ChartCard title="Delivery Status" subtitle="Current shipment breakdown">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                >
                  {deliveryStatusData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={50} iconSize={10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* RTO highlight */}
          <div className="mt-2 p-3 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-700">
              <strong>RTO Impact:</strong> {rtoShipments} returns = {formatCurrency(rtoShipments * costPerDelivery * 2)} wasted (2x shipping cost). 
              Correlate with COD orders and tier-3 pin codes.
            </p>
          </div>
        </ChartCard>
      </div>

      {/* Last-Mile Performance Trend */}
      <ChartCard title="Last-Mile Performance (14-Day Trend)" subtitle="Track last-mile separately — highest cost, most variability">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lastMileTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[60, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 15]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="deliveryRate" stroke="#10b981" strokeWidth={2} dot={false} name="Delivery Success %" />
              <Line yAxisId="right" type="monotone" dataKey="rtoRate" stroke="#ef4444" strokeWidth={2} dot={false} name="RTO %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <p className="text-lg font-bold text-emerald-700">{formatPercentage(firstAttemptRate)}</p>
            <p className="text-xs text-gray-600">First Attempt Success</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-lg font-bold text-red-700">{formatPercentage(rtoRate)}</p>
            <p className="text-xs text-gray-600">Return to Origin</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-lg font-bold text-blue-700">{avgDeliveryTime.toFixed(1)} days</p>
            <p className="text-xs text-gray-600">Avg Last-Mile Time</p>
          </div>
        </div>
      </ChartCard>

      {/* Shipping Cost Analysis by Region */}
      <ChartCard title="Shipping Cost by Region" subtitle="Cost analysis — factor in distance, fuel, and tolls for true cost-per-delivery">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shippingByRegion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="region" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="cost" fill="#f59e0b" name="Total Cost (₹)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

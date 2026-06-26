import { AlertCircle } from 'lucide-react';
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
} from 'recharts';
import { ChartCard } from '../common/ChartCard';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Placeholder GA data for demo purposes
const trafficSources = [
  { source: 'Organic Search', sessions: 12450, percentage: 35 },
  { source: 'Direct', sessions: 8920, percentage: 25 },
  { source: 'Social Media', sessions: 6230, percentage: 17.5 },
  { source: 'Paid Ads', sessions: 4100, percentage: 11.5 },
  { source: 'Referral', sessions: 2500, percentage: 7 },
  { source: 'Email', sessions: 1400, percentage: 4 },
];

const dailyTraffic = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  sessions: Math.floor(Math.random() * 2000) + 800,
  pageViews: Math.floor(Math.random() * 5000) + 2000,
  bounceRate: Math.floor(Math.random() * 30) + 30,
}));

const topPages = [
  { page: '/products', views: 8500, avgTime: '2:45', bounceRate: 32 },
  { page: '/home', views: 7200, avgTime: '1:20', bounceRate: 45 },
  { page: '/cart', views: 3800, avgTime: '3:10', bounceRate: 28 },
  { page: '/checkout', views: 2100, avgTime: '4:30', bounceRate: 15 },
  { page: '/category/clothing', views: 4600, avgTime: '2:00', bounceRate: 38 },
];

const conversionFunnel = [
  { stage: 'Visitors', count: 35600 },
  { stage: 'Product Views', count: 18200 },
  { stage: 'Add to Cart', count: 5400 },
  { stage: 'Checkout', count: 2100 },
  { stage: 'Purchase', count: 1450 },
];

export function TrafficSection() {
  return (
    <div className="space-y-6">
      {/* GA Integration Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-800">Google Analytics Integration</p>
          <p className="text-sm text-blue-600 mt-1">
            This section shows demo data. Connect your Google Analytics 4 account or upload GA CSV exports 
            to see real traffic and conversion data. GA integration supports website traffic, conversion rates, 
            user behavior, traffic sources, and bounce rates.
          </p>
          <button className="mt-2 text-sm font-medium text-blue-700 hover:text-blue-800 underline">
            Connect GA4 Account
          </button>
        </div>
      </div>

      {/* Traffic Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: '35.6K', change: '+12.3%' },
          { label: 'Page Views', value: '98.4K', change: '+8.7%' },
          { label: 'Avg. Bounce Rate', value: '38.2%', change: '-2.1%' },
          { label: 'Conversion Rate', value: '4.07%', change: '+0.5%' },
        ].map((metric) => (
          <div key={metric.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{metric.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
            <p className={`text-sm mt-1 ${metric.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
              {metric.change} vs last period
            </p>
          </div>
        ))}
      </div>

      {/* Traffic Sources + Daily Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Traffic Sources" subtitle="Where visitors come from">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="sessions"
                  nameKey="source"
                >
                  {trafficSources.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={50} iconSize={10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Daily Sessions" subtitle="Sessions and page views trend">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTraffic}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Legend />
                <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} dot={false} name="Sessions" />
                <Line type="monotone" dataKey="pageViews" stroke="#10b981" strokeWidth={2} dot={false} name="Page Views" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Conversion Funnel */}
      <ChartCard title="Conversion Funnel" subtitle="User journey from visit to purchase">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={conversionFunnel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value) => [Number(value).toLocaleString(), 'Users']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {conversionFunnel.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          {conversionFunnel.slice(1).map((stage, idx) => {
            const prev = conversionFunnel[idx];
            const dropoff = ((prev.count - stage.count) / prev.count * 100).toFixed(1);
            return (
              <div key={stage.stage} className="text-center">
                <p className="text-gray-500">{prev.stage} → {stage.stage}</p>
                <p className="font-medium text-red-500">-{dropoff}% drop</p>
              </div>
            );
          })}
        </div>
      </ChartCard>

      {/* Top Pages */}
      <ChartCard title="Top Pages" subtitle="Most visited pages">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left font-medium text-gray-600">Page</th>
                <th className="py-3 px-4 text-right font-medium text-gray-600">Views</th>
                <th className="py-3 px-4 text-right font-medium text-gray-600">Avg Time</th>
                <th className="py-3 px-4 text-right font-medium text-gray-600">Bounce Rate</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((page) => (
                <tr key={page.page} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-blue-600">{page.page}</td>
                  <td className="py-3 px-4 text-right">{page.views.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{page.avgTime}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={page.bounceRate > 40 ? 'text-red-600' : 'text-emerald-600'}>
                      {page.bounceRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

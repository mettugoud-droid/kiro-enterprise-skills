import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  orange: 'bg-amber-50 text-amber-600 border-amber-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
};

const iconBgMap = {
  blue: 'bg-blue-100',
  green: 'bg-emerald-100',
  purple: 'bg-purple-100',
  orange: 'bg-amber-100',
  red: 'bg-red-100',
  indigo: 'bg-indigo-100',
};

export function KPICard({ title, value, change, changeLabel, icon, color = 'blue' }: KPICardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className={clsx('rounded-xl border p-5 transition-shadow hover:shadow-md', colorMap[color])}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive && <TrendingUp className="w-4 h-4 text-emerald-500" />}
              {isNegative && <TrendingDown className="w-4 h-4 text-red-500" />}
              {!isPositive && !isNegative && <Minus className="w-4 h-4 text-gray-400" />}
              <span
                className={clsx(
                  'text-sm font-medium',
                  isPositive && 'text-emerald-600',
                  isNegative && 'text-red-600',
                  !isPositive && !isNegative && 'text-gray-500'
                )}
              >
                {isPositive ? '+' : ''}{change.toFixed(1)}%
              </span>
              {changeLabel && <span className="text-xs text-gray-500 ml-1">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className={clsx('p-3 rounded-lg', iconBgMap[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

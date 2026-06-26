import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

const variantStyles = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-700',
};

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variantStyles[variant])}>
      {status}
    </span>
  );
}

export function getOrderStatusVariant(status: string): StatusBadgeProps['variant'] {
  switch (status) {
    case 'Delivered': return 'success';
    case 'Dispatched': return 'info';
    case 'Processing': return 'warning';
    case 'Pending': return 'warning';
    case 'Cancelled': return 'danger';
    default: return 'default';
  }
}

export function getPaymentStatusVariant(status: string): StatusBadgeProps['variant'] {
  switch (status) {
    case 'Paid': return 'success';
    case 'Pending': return 'warning';
    case 'Failed': return 'danger';
    case 'Refunded': return 'info';
    default: return 'default';
  }
}

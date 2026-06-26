import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  MessageCircle,
  Package,
  Globe,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { TabId } from '../../types';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'sales', label: 'Sales & Orders', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'fulfillment', label: 'Fulfillment', icon: <Truck className="w-4 h-4" /> },
  { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
  { id: 'financial', label: 'Financial', icon: <Wallet className="w-4 h-4" /> },
  { id: 'marketing', label: 'Marketing', icon: <MessageCircle className="w-4 h-4" /> },
  { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
  { id: 'traffic', label: 'Traffic', icon: <Globe className="w-4 h-4" /> },
];

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

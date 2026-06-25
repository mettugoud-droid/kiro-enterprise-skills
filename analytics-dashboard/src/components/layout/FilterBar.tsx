import { Calendar, Filter } from 'lucide-react';
import type { FilterState } from '../../types';
import { format } from 'date-fns';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="bg-white border-b border-gray-100 py-3">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters:</span>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={format(filters.dateRange.start, 'yyyy-MM-dd')}
              onChange={(e) =>
                onFilterChange({
                  dateRange: { ...filters.dateRange, start: new Date(e.target.value) },
                })
              }
              className="text-sm bg-transparent border-none outline-none text-gray-700 w-32"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={format(filters.dateRange.end, 'yyyy-MM-dd')}
              onChange={(e) =>
                onFilterChange({
                  dateRange: { ...filters.dateRange, end: new Date(e.target.value) },
                })
              }
              className="text-sm bg-transparent border-none outline-none text-gray-700 w-32"
            />
          </div>

          {/* Order Status */}
          <select
            value={filters.orderStatus}
            onChange={(e) => onFilterChange({ orderStatus: e.target.value })}
            className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Product Type */}
          <select
            value={filters.productType}
            onChange={(e) => onFilterChange({ productType: e.target.value })}
            className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none"
          >
            <option value="">All Products</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
            <option value="Footwear">Footwear</option>
            <option value="Bags">Bags</option>
            <option value="Ethnic Wear">Ethnic Wear</option>
            <option value="Fragrances">Fragrances</option>
          </select>

          {/* Customer Segment */}
          <select
            value={filters.customerSegment}
            onChange={(e) => onFilterChange({ customerSegment: e.target.value })}
            className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none"
          >
            <option value="">All Segments</option>
            <option value="Active">Active</option>
            <option value="At Risk">At Risk</option>
            <option value="Lapsed">Lapsed</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>
    </div>
  );
}

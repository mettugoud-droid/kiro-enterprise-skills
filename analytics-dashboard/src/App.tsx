import { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import type { TabId, FilterState, DashboardData } from './types';
import type { CSVReportType } from './utils/csvParser';
import { getDefaultDateRange } from './utils/calculations';
import { exportToCSV } from './utils/exportUtils';
import {
  parseCSVFile,
  normalizeOrder,
  normalizeDispatchedOrder,
  normalizeShipping,
  normalizeCashFlow,
  normalizeTax,
  normalizeProduct,
  normalizeProductType,
  normalizeWhatsApp,
  normalizeCustomer,
  normalizeCustomerLastBuy,
} from './utils/csvParser';
import { generateSampleData } from './data/sampleData';
import { Header } from './components/layout/Header';
import { TabNav } from './components/layout/TabNav';
import { FilterBar } from './components/layout/FilterBar';
import { OverviewSection } from './components/sections/OverviewSection';
import { SalesSection } from './components/sections/SalesSection';
import { FulfillmentSection } from './components/sections/FulfillmentSection';
import { CustomersSection } from './components/sections/CustomersSection';
import { FinancialSection } from './components/sections/FinancialSection';
import { MarketingSection } from './components/sections/MarketingSection';
import { ProductsSection } from './components/sections/ProductsSection';
import { TrafficSection } from './components/sections/TrafficSection';
import { UploadModal } from './components/common/UploadModal';

function App() {
  const [data, setData] = useState<DashboardData>(() => generateSampleData());
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: getDefaultDateRange(),
    productType: '',
    orderStatus: '',
    customerSegment: '',
  });
  const [showUpload, setShowUpload] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(format(new Date(), 'MMM dd, yyyy HH:mm'));

  const handleFilterChange = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleRefresh = useCallback(() => {
    setData(generateSampleData());
    setLastUpdated(format(new Date(), 'MMM dd, yyyy HH:mm'));
  }, []);

  const handleExport = useCallback(() => {
    const exportData = data.orders.map((o) => ({
      'Order ID': o.orderId,
      'Date': o.orderDate,
      'Customer': o.customerName,
      'Product': o.products,
      'Amount': o.amount,
      'Payment Status': o.paymentStatus,
      'Order Status': o.orderStatus,
    }));
    exportToCSV(exportData, `dashboard-export-${format(new Date(), 'yyyy-MM-dd')}`);
  }, [data]);

  const handleUpload = useCallback(async (file: File, reportType: CSVReportType) => {
    const rawData = await parseCSVFile<Record<string, unknown>>(file);
    
    setData((prev) => {
      const updated = { ...prev };
      switch (reportType) {
        case 'orders':
          updated.orders = rawData.map(normalizeOrder);
          break;
        case 'dispatchedOrders':
          updated.dispatchedOrders = rawData.map(normalizeDispatchedOrder);
          break;
        case 'shipping':
          updated.shipping = rawData.map(normalizeShipping);
          break;
        case 'cashFlow':
          updated.cashFlow = rawData.map(normalizeCashFlow);
          break;
        case 'tax':
          updated.tax = rawData.map(normalizeTax);
          break;
        case 'products':
          updated.products = rawData.map(normalizeProduct);
          break;
        case 'productTypes':
          updated.productTypes = rawData.map(normalizeProductType);
          break;
        case 'whatsapp':
          updated.whatsapp = rawData.map(normalizeWhatsApp);
          break;
        case 'customers':
          updated.customers = rawData.map(normalizeCustomer);
          break;
        case 'customerLastBuy':
          updated.customerLastBuy = rawData.map(normalizeCustomerLastBuy);
          break;
      }
      return updated;
    });
    setLastUpdated(format(new Date(), 'MMM dd, yyyy HH:mm'));
  }, []);

  // Filter data based on active filters
  const filteredData = useMemo(() => {
    let result = { ...data };
    
    if (filters.orderStatus) {
      result.orders = result.orders.filter((o) => o.orderStatus === filters.orderStatus);
    }
    
    if (filters.productType) {
      result.products = result.products.filter((p) => p.category === filters.productType);
      result.productTypes = result.productTypes.filter((pt) => pt.productType === filters.productType);
    }
    
    if (filters.customerSegment) {
      result.customerLastBuy = result.customerLastBuy.filter((c) => c.segment === filters.customerSegment);
    }
    
    return result;
  }, [data, filters]);

  const renderSection = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection data={filteredData} filters={filters} />;
      case 'sales':
        return <SalesSection data={filteredData} filters={filters} />;
      case 'fulfillment':
        return <FulfillmentSection data={filteredData} />;
      case 'customers':
        return <CustomersSection data={filteredData} />;
      case 'financial':
        return <FinancialSection data={filteredData} />;
      case 'marketing':
        return <MarketingSection data={filteredData} />;
      case 'products':
        return <ProductsSection data={filteredData} />;
      case 'traffic':
        return <TrafficSection />;
      default:
        return <OverviewSection data={filteredData} filters={filters} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onUpload={() => setShowUpload(true)}
        onExport={handleExport}
        onRefresh={handleRefresh}
        lastUpdated={lastUpdated}
      />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderSection()}
      </main>

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleUpload}
      />

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 mt-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-gray-500">
          <span>Analytics Dashboard - Shopdeck E-Commerce Insights</span>
          <span>Data includes {data.orders.length} orders, {data.customers.length} customers, {data.products.length} products</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

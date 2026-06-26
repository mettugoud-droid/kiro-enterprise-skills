import { useState, useCallback } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import type { CSVReportType } from '../../utils/csvParser';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, reportType: CSVReportType) => Promise<void>;
}

const reportTypes: { value: CSVReportType; label: string; description: string }[] = [
  { value: 'orders', label: 'Order Report', description: 'Complete order details, values, payment status' },
  { value: 'dispatchedOrders', label: 'Dispatched Order Report', description: 'Shipped orders, fulfillment dates' },
  { value: 'shipping', label: 'Shipping Report', description: 'Delivery performance, shipping costs' },
  { value: 'cashFlow', label: 'CashFlow Report', description: 'Revenue, refunds, adjustments' },
  { value: 'tax', label: 'Tax Report', description: 'Tax collected, compliance tracking' },
  { value: 'products', label: 'Product-wise Performance', description: 'Revenue, units by product' },
  { value: 'productTypes', label: 'Product Type Performance', description: 'Metrics by category' },
  { value: 'whatsapp', label: 'WhatsApp HSM Report', description: 'Campaign performance metrics' },
  { value: 'customers', label: 'Purchased Customer Report', description: 'Buyer demographics, LTV' },
  { value: 'customerLastBuy', label: 'Customer Last Buy Report', description: 'Re-engagement data' },
];

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [selectedType, setSelectedType] = useState<CSVReportType>('orders');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setStatus('error');
      setStatusMessage('Please upload a CSV file');
      return;
    }
    
    setUploading(true);
    setStatus('idle');
    try {
      await onUpload(file, selectedType);
      setStatus('success');
      setStatusMessage(`Successfully imported ${file.name}`);
    } catch (err) {
      setStatus('error');
      setStatusMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  }, [onUpload, selectedType]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Upload CSV Report</h2>
            <p className="text-sm text-gray-500 mt-0.5">Import Shopdeck data into the dashboard</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as CSVReportType)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {reportTypes.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label} - {rt.description}
                </option>
              ))}
            </select>
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-2">
              {uploading ? 'Processing...' : 'Drag & drop your CSV file here'}
            </p>
            <p className="text-xs text-gray-400 mb-3">or</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
              <FileText className="w-4 h-4" />
              Browse Files
              <input
                type="file"
                accept=".csv"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Status */}
          {status !== 'idle' && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
              {status === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{statusMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

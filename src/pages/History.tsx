import React, { useState, useMemo } from 'react';
import { useCalculations } from '../hooks/useCalculations';
import { useTranslation } from 'react-i18next';
import { Trash2, Search, Download, Filter, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface FilterOptions {
  type: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
}

const History: React.FC = () => {
  const { calculations, deleteCalculation, clearHistory } = useCalculations();
  const { t } = useTranslation();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'tax'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Show toast notification
  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Get unique calculation types for filter
  const calculationTypes = useMemo(() => {
    const types = new Set(calculations.map(c => c.type));
    return ['all', ...Array.from(types)];
  }, [calculations]);

  // Filter and sort calculations
  const filteredAndSortedCalculations = useMemo(() => {
    let filtered = [...calculations];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(calc => 
        calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (calc.description && calc.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(calc => calc.type === filters.type);
    }
    
    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(calc => new Date(calc.date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(calc => new Date(calc.date) <= new Date(filters.dateTo));
    }
    
    // Amount range filter
    if (filters.minAmount) {
      filtered = filtered.filter(calc => calc.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(calc => calc.amount <= parseFloat(filters.maxAmount));
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'tax') {
        comparison = a.taxAmount - b.taxAmount;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [calculations, searchTerm, filters, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCalculations.length / itemsPerPage);
  const paginatedCalculations = filteredAndSortedCalculations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortBy, sortOrder]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = [t('name'), t('type'), t('amount'), t('tax'), t('rate'), t('date'), t('description_label')];
    const rows = filteredAndSortedCalculations.map(calc => [
      calc.name,
      calc.type,
      calc.amount,
      calc.taxAmount,
      calc.taxRate,
      new Date(calc.date).toLocaleDateString('en-US'),
      calc.description || ''
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('📥 ' + t('export_success'));
  };

  // Delete single calculation
  const handleDelete = (id: string) => {
    deleteCalculation(id);
    setShowDeleteConfirm(null);
    showToast('🗑️ ' + t('delete_success'));
  };

  // Clear all history
  const handleClearAll = () => {
    clearHistory();
    setShowClearConfirm(false);
    setCurrentPage(1);
    showToast('🗑️ ' + t('delete_success'));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      type: 'all',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    });
    setSearchTerm('');
    setSortBy('date');
    setSortOrder('desc');
    showToast('🔄 ' + t('reset_success'));
  };

  // Get statistics
  const stats = useMemo(() => {
    const totalCalculations = filteredAndSortedCalculations.length;
    const totalTax = filteredAndSortedCalculations.reduce((sum, c) => sum + c.taxAmount, 0);
    const totalAmount = filteredAndSortedCalculations.reduce((sum, c) => sum + c.amount, 0);
    const averageTaxRate = totalCalculations > 0 
      ? filteredAndSortedCalculations.reduce((sum, c) => sum + c.taxRate, 0) / totalCalculations 
      : 0;
    
    return { totalCalculations, totalTax, totalAmount, averageTaxRate };
  }, [filteredAndSortedCalculations]);

  // Get type label
  const getTypeLabel = (type: string): string => {
    const types: Record<string, string> = {
      income: t('income_tax'),
      profit: t('profit_tax'),
      property: t('property_tax'),
      fixed: t('fixed_tax'),
      wealth: t('wealth_tax'),
      custom: t('custom_tax'),
      salary: t('salary_tax'),
      contract: t('contract_tax'),
      rental: t('rental_tax'),
      business: t('business_tax'),
      legalEntity: t('legal_entity_tax'),
      fixedImport: t('fixed_import_tax'),
      fixedNoLicense: t('fixed_no_license_tax'),
      exhibition: t('exhibition_tax'),
      smallBusiness: t('small_business_tax'),
      asset: t('asset_tax'),
      businessTransaction: t('business_transaction_tax'),
      legalEntityAsset: t('legal_entity_asset_tax')
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('history')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('history_subtitle')}</p>
        </div>
        {calculations.length > 0 && (
          <div className="flex gap-3">
            <button 
              onClick={exportToCSV} 
              className="btn btn-secondary flex items-center gap-2"
              aria-label="Export history"
            >
              <Download className="w-4 h-4" />
              {t('export')}
            </button>
            <button 
              onClick={() => setShowClearConfirm(true)} 
              className="btn btn-danger flex items-center gap-2"
              aria-label="Clear all history"
            >
              <Trash2 className="w-4 h-4" />
              {t('clear_all')}
            </button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {filteredAndSortedCalculations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('total_calculations')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCalculations}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('total_taxes')}</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.totalTax.toLocaleString()} <span className="text-sm">AFN</span></p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('total_amount')}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalAmount.toLocaleString()} <span className="text-sm">AFN</span></p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tax_rate')}</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.averageTaxRate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('search') + '...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                aria-label="Search calculations"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary flex items-center gap-2"
              aria-label="Filters"
            >
              <Filter className="w-4 h-4" />
              {t('filter')}
              {(filters.type !== 'all' || filters.dateFrom || filters.dateTo || filters.minAmount || filters.maxAmount) && (
                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={resetFilters}
              className="btn btn-secondary flex items-center gap-2"
              aria-label="Reset filters"
            >
              {t('reset_settings')}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('type')}
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="input"
                  aria-label="Filter by type"
                >
                  {calculationTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? t('select_type') : getTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('from')} {t('date')}
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="input"
                  aria-label="Date from"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('to')} {t('date')}
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="input"
                  aria-label="Date to"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('min_amount')}
                </label>
                <input
                  type="number"
                  placeholder="AFN"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                  className="input"
                  aria-label="Minimum amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('max_amount')}
                </label>
                <input
                  type="number"
                  placeholder="AFN"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                  className="input"
                  aria-label="Maximum amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('sort_by')}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'tax')}
                  className="input"
                  aria-label="Sort by"
                >
                  <option value="date">{t('date')}</option>
                  <option value="amount">{t('amount')}</option>
                  <option value="tax">{t('tax')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('sort_order')}
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="input"
                  aria-label="Sort order"
                >
                  <option value="desc">{t('newest_first')}</option>
                  <option value="asc">{t('oldest_first')}</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredAndSortedCalculations.length} {t('records')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('type')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('amount')} (AFN)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('tax')} (AFN)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('rate')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('date')}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedCalculations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-12 h-12 text-gray-300" />
                      <p>{t('no_records')}</p>
                      <p className="text-sm">{t('adjust_search_criteria')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCalculations.map((calc) => (
                  <tr key={calc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{calc.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium
                        ${calc.type === 'income' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                        ${calc.type === 'profit' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : ''}
                        ${calc.type === 'property' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : ''}
                        ${calc.type === 'fixed' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : ''}
                        ${calc.type === 'wealth' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' : ''}
                        ${calc.type === 'custom' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : ''}
                      `}>
                        {getTypeLabel(calc.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {calc.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-red-600 dark:text-red-400">
                      {calc.taxAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {calc.taxRate}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(calc.date).toLocaleDateString('en-US')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setShowDeleteConfirm(calc.id)}
                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
                        aria-label={`Delete ${calc.name}`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('items_per_page')}:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="input w-20 py-1"
                aria-label="Items per page"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Previous page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('page')} {currentPage} {t('of')} {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Next page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('showing')} {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedCalculations.length)} {t('of')} {filteredAndSortedCalculations.length}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('delete')}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('confirm_delete')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('clear_all')}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('confirm_clear_all')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
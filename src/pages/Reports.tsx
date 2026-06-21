import React, { useState, useMemo } from 'react';
import { useCalculations } from '../hooks/useCalculations';
import { useTranslation } from 'react-i18next';
import { 
  Printer, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Search,
  ChevronDown,
  CheckSquare,
  Square
} from 'lucide-react';
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
  LineChart,
  Line,
  Legend
} from 'recharts';

// Colors for charts
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const Reports: React.FC = () => {
  const { calculations } = useCalculations();
  const { t } = useTranslation();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Tax type data for charts
  const taxTypeData = useMemo(() => {
    const data = [
      { 
        name: 'Income', 
        value: calculations.filter(c => c.type === 'income').reduce((s, c) => s + c.taxAmount, 0),
        count: calculations.filter(c => c.type === 'income').length,
        color: COLORS[0] 
      },
      { 
        name: 'Profit', 
        value: calculations.filter(c => c.type === 'profit').reduce((s, c) => s + c.taxAmount, 0),
        count: calculations.filter(c => c.type === 'profit').length,
        color: COLORS[1] 
      },
      { 
        name: 'Property', 
        value: calculations.filter(c => c.type === 'property').reduce((s, c) => s + c.taxAmount, 0),
        count: calculations.filter(c => c.type === 'property').length,
        color: COLORS[2] 
      },
      { 
        name: 'Fixed', 
        value: calculations.filter(c => c.type === 'fixed').reduce((s, c) => s + c.taxAmount, 0),
        count: calculations.filter(c => c.type === 'fixed').length,
        color: COLORS[3] 
      },
      { 
        name: 'Wealth', 
        value: calculations.filter(c => c.type === 'wealth').reduce((s, c) => s + c.taxAmount, 0),
        count: calculations.filter(c => c.type === 'wealth').length,
        color: COLORS[4] 
      },
      { 
        name: 'Custom', 
        value: calculations.filter(c => c.type === 'custom').reduce((s, c) => s + c.taxAmount, 0),
        count: calculations.filter(c => c.type === 'custom').length,
        color: COLORS[5] 
      },
    ].filter(d => d.value > 0);
    return data;
  }, [calculations]);

  // Monthly data
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return {
        month: date.toLocaleDateString('en', { month: 'short' }),
        fullMonth: date.toLocaleDateString('en', { month: 'long' }),
        year: date.getFullYear(),
        tax: 0,
        amount: 0,
        count: 0
      };
    });

    calculations.forEach(calc => {
      const calcDate = new Date(calc.date);
      const monthIndex = calcDate.getMonth();
      const currentMonthIndex = new Date().getMonth();
      const diff = (currentMonthIndex - monthIndex + 12) % 12;
      const arrayIndex = 11 - diff;
      if (arrayIndex >= 0 && arrayIndex < 12) {
        months[arrayIndex].tax += calc.taxAmount;
        months[arrayIndex].amount += calc.amount;
        months[arrayIndex].count += 1;
      }
    });

    return months.slice(-6);
  }, [calculations]);

  // Statistics
  const stats = useMemo(() => {
    const totalTax = calculations.reduce((s, c) => s + c.taxAmount, 0);
    const totalAmount = calculations.reduce((s, c) => s + c.amount, 0);
    const averageTaxRate = calculations.length > 0 
      ? calculations.reduce((s, c) => s + c.taxRate, 0) / calculations.length 
      : 0;
    
    return {
      totalCalculations: calculations.length,
      totalTax,
      totalAmount,
      averageTaxRate,
      maxTax: calculations.length > 0 ? Math.max(...calculations.map(c => c.taxAmount)) : 0,
      minTax: calculations.length > 0 ? Math.min(...calculations.map(c => c.taxAmount)) : 0,
    };
  }, [calculations]);

  // Filtered calculations
  const filteredCalculations = useMemo(() => {
    let filtered = [...calculations];
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.type === filterType);
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [calculations, searchTerm, filterType]);

  // Export to CSV
  const exportToCSV = (data: any) => {
    const headers = [t('name'), t('type'), t('amount'), t('tax'), t('rate'), t('date'), t('description_label')];
    const rows = data.details.map((calc: any) => [
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
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `tax_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to Excel
  const exportToExcel = (data: any) => {
    let html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Tax Report</title>
          <style>
            th { background: #4f46e5; color: white; padding: 10px; }
            td { padding: 8px; border: 1px solid #ddd; }
            table { border-collapse: collapse; width: 100%; }
          </style>
        </head>
        <body>
          <h1>${t('reports')}</h1>
          <p>${t('date')}: ${new Date().toLocaleDateString('en-US')}</p>
          <h2>${t('summary')}</h2>
          <table>
            <tr><th>${t('total_calculations')}</th><td>${data.summary.totalCalculations}</td></tr>
            <tr><td>${t('total_taxes')}</td><td>${data.summary.totalTax.toLocaleString()} AFN</td></tr>
            <tr><td>${t('total_amount')}</td><td>${data.summary.totalAmount.toLocaleString()} AFN</td></tr>
            <tr><td>${t('tax_rate')}</td><td>${data.summary.averageTaxRate.toFixed(2)}%</td></tr>
          </table>
          <h2>${t('detailed_report')}</h2>
          <table border="1" cellpadding="5" cellspacing="0">
            <thead>
              <tr>
                <th>${t('name')}</th><th>${t('type')}</th><th>${t('amount')}</th><th>${t('tax')}</th><th>${t('rate')}</th><th>${t('date')}</th>
              </tr>
            </thead>
            <tbody>
              ${data.details.map((calc: any) => `
                <tr>
                  <td>${calc.name}</td>
                  <td>${calc.type}</td>
                  <td>${calc.amount.toLocaleString()}</td>
                  <td>${calc.taxAmount.toLocaleString()}</td>
                  <td>${calc.taxRate}%</td>
                  <td>${new Date(calc.date).toLocaleDateString('en-US')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `tax_report_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to PDF
  const exportToPDF = (data: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Tax Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #4f46e5; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #4f46e5; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border: 1px solid #ddd; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
            .summary-card { background: #f3f4f6; padding: 10px; border-radius: 8px; text-align: center; }
            .summary-value { font-size: 20px; font-weight: bold; color: #4f46e5; }
          </style>
        </head>
        <body>
          <h1>${t('reports')}</h1>
          <p>${t('date')}: ${new Date().toLocaleDateString('en-US')}</p>
          <div class="summary">
            <div class="summary-card">${t('total_calculations')}<br><span class="summary-value">${data.summary.totalCalculations}</span></div>
            <div class="summary-card">${t('total_taxes')}<br><span class="summary-value">${data.summary.totalTax.toLocaleString()} AFN</span></div>
            <div class="summary-card">${t('total_amount')}<br><span class="summary-value">${data.summary.totalAmount.toLocaleString()} AFN</span></div>
            <div class="summary-card">${t('tax_rate')}<br><span class="summary-value">${data.summary.averageTaxRate.toFixed(2)}%</span></div>
          </div>
          <h2>${t('detailed_report')}</h2>
          <table>
            <thead>
              <tr><th>${t('name')}</th><th>${t('type')}</th><th>${t('amount')}</th><th>${t('tax')}</th><th>${t('rate')}</th><th>${t('date')}</th></tr>
            </thead>
            <tbody>
              ${data.details.map((calc: any) => `
                <tr>
                  <td>${calc.name}</td>
                  <td>${calc.type}</td>
                  <td>${calc.amount.toLocaleString()}</td>
                  <td>${calc.taxAmount.toLocaleString()}</td>
                  <td>${calc.taxRate}%</td>
                  <td>${new Date(calc.date).toLocaleDateString('en-US')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  // Generate report
  const generateReport = (format: 'PDF' | 'Excel' | 'CSV') => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const reportData = {
        generatedAt: new Date().toISOString(),
        summary: stats,
        monthlyData,
        taxTypeData,
        details: filteredCalculations,
        totalRecords: filteredCalculations.length
      };
      
      if (format === 'CSV') {
        exportToCSV(reportData);
      } else if (format === 'Excel') {
        exportToExcel(reportData);
      } else {
        exportToPDF(reportData);
      }
      
      setIsGenerating(false);
      setShowExportMenu(false);
      alert(`✅ ${t('export_success')}`);
    }, 1000);
  };

  // Select all functionality
  const handleSelectAll = () => {
    if (selectedReports.size === filteredCalculations.length && filteredCalculations.length > 0) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(filteredCalculations.map(c => c.id)));
    }
  };

  // Single selection functionality
  const handleSelectReport = (id: string) => {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReports(newSelected);
  };

  // Batch download
  const handleBatchDownload = () => {
    if (selectedReports.size === 0) {
      alert('Please select at least one report');
      return;
    }
    
    const selectedData = filteredCalculations.filter(c => selectedReports.has(c.id));
    exportToCSV({ details: selectedData, summary: stats, monthlyData, taxTypeData });
  };

  const handlePrint = () => {
    window.print();
  };

  const printStyles = `
    @media print {
      .no-print { display: none !important; }
      .card { break-inside: avoid; box-shadow: none; border: 1px solid #ddd; }
      body { padding: 20px; background: white; color: black; }
      .dark .card, .dark body { background: white; color: black; }
    }
  `;

  return (
    <div className="space-y-6">
      <style>{printStyles}</style>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reports')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('reports_subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn btn-primary flex items-center gap-2"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {t('export')}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={() => generateReport('CSV')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV File
                </button>
                <button
                  onClick={() => generateReport('Excel')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Excel File
                </button>
                <button
                  onClick={() => generateReport('PDF')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  PDF File
                </button>
              </div>
            )}
          </div>
          
          <button onClick={handlePrint} className="btn btn-secondary flex items-center gap-2">
            <Printer className="w-4 h-4" />
            {t('print')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
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

      {/* Filters */}
      <div className="card p-4 no-print">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`${t('search')}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input w-40"
            >
              <option value="all">{t('select_type')}</option>
              <option value="income">{t('income_tax')}</option>
              <option value="profit">{t('profit_tax')}</option>
              <option value="property">{t('property_tax')}</option>
              <option value="fixed">{t('fixed_tax')}</option>
              <option value="wealth">{t('wealth_tax')}</option>
              <option value="custom">{t('custom_tax')}</option>
            </select>
            
            {selectedReports.size > 0 && (
              <button
                onClick={handleBatchDownload}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t('download')} ({selectedReports.size})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('monthly_tax')} (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} AFN`} />
              <Legend />
              <Bar dataKey="tax" name={t('tax')} fill="#6366f1" radius={[8, 8, 0, 0]} />
              <Bar dataKey="amount" name={t('amount')} fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {taxTypeData.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('tax_distribution')}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taxTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {taxTypeData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} AFN`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Trend Chart */}
      {monthlyData.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('trend')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} AFN`} />
              <Legend />
              <Line type="monotone" dataKey="tax" name={t('tax')} stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
              <Line type="monotone" dataKey="amount" name={t('amount')} stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('detailed_report')}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({filteredCalculations.length} {t('total_calculations')})
            </span>
          </h3>
          <button
            onClick={handleSelectAll}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            {selectedReports.size === filteredCalculations.length && filteredCalculations.length > 0 ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {t('select_type')}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 w-10">
                  <input
                    type="checkbox"
                    checked={selectedReports.size === filteredCalculations.length && filteredCalculations.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('type')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('amount')} (AFN)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('tax')} (AFN)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('rate')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCalculations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 text-gray-300" />
                      <p>{t('no_data')}</p>
                      <p className="text-sm">{t('create_first_document')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCalculations.map((calc) => (
                  <tr key={calc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedReports.has(calc.id)}
                        onChange={() => handleSelectReport(calc.id)}
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
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
                        {calc.type === 'income' ? t('income_tax') :
                         calc.type === 'profit' ? t('profit_tax') :
                         calc.type === 'property' ? t('property_tax') :
                         calc.type === 'fixed' ? t('fixed_tax') :
                         calc.type === 'wealth' ? t('wealth_tax') : t('custom_tax')}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        {filteredCalculations.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('showing')} {filteredCalculations.length} {t('of')} {calculations.length} {t('total_calculations')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
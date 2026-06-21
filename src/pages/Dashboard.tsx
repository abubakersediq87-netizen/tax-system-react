import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCalculations } from '../hooks/useCalculations';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Calculator, 
  TrendingUp, 
  DollarSign
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
  Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { calculations } = useCalculations();
  const { t } = useTranslation();

  const totalTaxes = calculations.reduce((sum, c) => sum + c.taxAmount, 0);
  const totalAmount = calculations.reduce((sum, c) => sum + c.amount, 0);
  
  const monthlyData = [
    { month: 'Jan', tax: 4500, amount: 50000 },
    { month: 'Feb', tax: 5200, amount: 58000 },
    { month: 'Mar', tax: 4800, amount: 53000 },
    { month: 'Apr', tax: 6100, amount: 67000 },
    { month: 'May', tax: 5500, amount: 61000 },
    { month: 'Jun', tax: 5900, amount: 65000 },
  ];

  const taxTypeData = [
    { name: 'Income', value: 45, color: '#6366f1' },
    { name: 'Profit', value: 25, color: '#10b981' },
    { name: 'Property', value: 15, color: '#f59e0b' },
    { name: 'Others', value: 15, color: '#ef4444' },
  ];

  const stats = [
    { title: t('total_calculations'), value: calculations.length, icon: Calculator, color: 'bg-blue-500' },
    { title: t('total_taxes'), value: totalTaxes.toLocaleString(), icon: DollarSign, color: 'bg-green-500', prefix: 'AFN' },
    { title: t('total_amount'), value: totalAmount.toLocaleString(), icon: TrendingUp, color: 'bg-purple-500', prefix: 'AFN' },
    { title: t('active_reports'), value: '8', icon: FileText, color: 'bg-orange-500' },
  ];

  const recentCalculations = calculations.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('welcome_back')}, {user?.name}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t('dashboard_subtitle')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.prefix && <span className="text-sm">{stat.prefix} </span>}
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('monthly_tax')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="tax" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

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
                label
              >
                {taxTypeData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Calculations */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('history')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">{t('name')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">{t('amount')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">{t('tax')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentCalculations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('no_data')}
                  </td>
                </tr>
              ) : (
                recentCalculations.map((calc) => (
                  <tr key={calc.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{calc.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {calc.amount.toLocaleString()} AFN
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {calc.taxAmount.toLocaleString()} AFN
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
      </div>
    </div>
  );
};

export default Dashboard;
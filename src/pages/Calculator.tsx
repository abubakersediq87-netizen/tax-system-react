import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalculations } from '../hooks/useCalculations';
import { TaxType } from '../types';
import {
  Calculator as CalcIcon,
  Save,
  TrendingUp,
  Building,
  Home,
  Wallet,
  Settings,
  Percent,
  Briefcase,
  Landmark,
  Truck,
  AlertTriangle,
  Store,
  Building2,
  FileText,
  Receipt,
} from 'lucide-react';

// ============================================================
// Tax Result Interface
// ============================================================
interface TaxResult {
  taxAmount: number;
  taxRate: number;
  netAmount: number;
  taxSlab?: string;
  dueDate?: string;
  taxType?: string;
  breakdown?: string;
}

// ============================================================
// Tax Configuration Settings
// ============================================================
const TAX_CONFIGS = {
  income: {
    name: 'income_tax',
    icon: TrendingUp,
    rates: [
      { min: 0, max: 60000, rate: 0, slab: '0% (Up to 60,000 AFN)' },
      { min: 60001, max: 150000, rate: 2, slab: '2% (60,001 – 150,000 AFN)' },
      { min: 150001, max: 1200000, rate: 10, slab: '10% (150,001 – 1,200,000 AFN)' },
      { min: 1200001, max: Infinity, rate: 20, slab: '20% (Above 1,200,000 AFN)' },
    ],
  },
  profit: {
    name: 'profit_tax',
    icon: Building,
    defaultRate: 2,
  },
  property: {
    name: 'property_tax',
    icon: Home,
    defaultRate: 1,
  },
  fixed: {
    name: 'fixed_tax',
    icon: Wallet,
    defaultRate: 2,
  },
  wealth: {
    name: 'wealth_tax',
    icon: Percent,
    defaultRate: 1.5,
  },
  salary: {
    name: 'salary_tax',
    icon: Briefcase,
    rates: [
      { min: 0, max: 5000, rate: 0, slab: '0% (Up to 5,000 AFN)' },
      { min: 5001, max: 12500, rate: 2, slab: '2% (5,001 – 12,500 AFN)' },
      { min: 12501, max: 100000, rate: 10, slab: '10% (12,501 – 100,000 AFN)' },
      { min: 100001, max: Infinity, rate: 20, slab: '20% (Above 100,000 AFN)' },
    ],
  },
  contract: {
    name: 'contract_tax',
    icon: FileText,
    rates: [
      { min: 0, max: 9999, rate: 0, slab: '0% (Up to 9,999 AFN)' },
      { min: 10000, max: 100000, rate: 10, slab: '10% (10,000 – 100,000 AFN)' },
      { min: 100001, max: Infinity, rate: 15, slab: '15% (Above 100,000 AFN)' },
    ],
  },
  rental: {
    name: 'rental_tax',
    icon: Home,
    rates: [
      { min: 0, max: 49999, rate: 0, slab: '0% (Up to 49,999 AFN)' },
      { min: 50000, max: Infinity, rate: 2, slab: '2% (Above 50,000 AFN)' },
    ],
  },
  business: {
    name: 'business_tax',
    icon: Store,
    rates: [
      { min: 0, max: 2000000, rate: 0, slab: '0% (Up to 2,000,000 AFN)' },
      { min: 2000001, max: Infinity, rate: 0.3, slab: '0.3% (Above 2,000,001 AFN)' },
    ],
  },
  legalEntity: {
    name: 'legal_entity_tax',
    icon: Building2,
    defaultRate: 20,
  },
  fixedImport: {
    name: 'fixed_import_tax',
    icon: Truck,
    defaultRate: 2,
  },
  fixedNoLicense: {
    name: 'fixed_no_license_tax',
    icon: AlertTriangle,
    rates: [
      { min: 0, max: 49999, rate: 0, slab: '0% (Up to 49,999 AFN)' },
      { min: 50000, max: Infinity, rate: 7, slab: '7% (Above 50,000 AFN)' },
    ],
  },
  exhibition: {
    name: 'exhibition_tax',
    icon: Landmark,
    defaultRate: 10,
  },
  smallBusiness: {
    name: 'small_business_tax',
    icon: Store,
    rates: [
      { min: 0, max: 2000000, rate: 0, slab: '0% (Up to 2,000,000 AFN)' },
      { min: 2000001, max: Infinity, rate: 0.3, slab: '0.3% (Above 2,000,001 AFN)' },
    ],
  },
  asset: {
    name: 'asset_tax',
    icon: Landmark,
    defaultRate: 1,
  },
  businessTransaction: {
    name: 'business_transaction_tax',
    icon: Receipt,
    defaultRate: 2,
  },
  legalEntityAsset: {
    name: 'legal_entity_asset_tax',
    icon: Building2,
    defaultRate: 20,
  },
  custom: {
    name: 'custom_tax',
    icon: Settings,
    defaultRate: 10,
  },
};

// ============================================================
// Calculator Component
// ============================================================
const Calculator: React.FC = () => {
  const { t } = useTranslation();
  const { addCalculation } = useCalculations();

  // ============================================================
  // State Management
  // ============================================================
  const [activeTab, setActiveTab] = useState<TaxType>('income');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<TaxResult | null>(null);
  const [customRate, setCustomRate] = useState<number>(10);
  const [customName, setCustomName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [sectorType, setSectorType] = useState<string>('general_business');

  // ============================================================
  // Tax Type Tabs List
  // ============================================================
  const tabs: { id: TaxType; label: string; icon: React.ElementType }[] = [
    { id: 'income', label: t('income_tax'), icon: TAX_CONFIGS.income.icon },
    { id: 'salary', label: t('salary_tax'), icon: TAX_CONFIGS.salary.icon },
    { id: 'contract', label: t('contract_tax'), icon: TAX_CONFIGS.contract.icon },
    { id: 'rental', label: t('rental_tax'), icon: TAX_CONFIGS.rental.icon },
    { id: 'business', label: t('business_tax'), icon: TAX_CONFIGS.business.icon },
    { id: 'profit', label: t('profit_tax'), icon: TAX_CONFIGS.profit.icon },
    { id: 'property', label: t('property_tax'), icon: TAX_CONFIGS.property.icon },
    { id: 'fixed', label: t('fixed_tax'), icon: TAX_CONFIGS.fixed.icon },
    { id: 'wealth', label: t('wealth_tax'), icon: TAX_CONFIGS.wealth.icon },
    { id: 'legalEntity', label: t('legal_entity_tax'), icon: TAX_CONFIGS.legalEntity.icon },
    { id: 'fixedImport', label: t('fixed_import_tax'), icon: TAX_CONFIGS.fixedImport.icon },
    { id: 'fixedNoLicense', label: t('fixed_no_license_tax'), icon: TAX_CONFIGS.fixedNoLicense.icon },
    { id: 'exhibition', label: t('exhibition_tax'), icon: TAX_CONFIGS.exhibition.icon },
    { id: 'smallBusiness', label: t('small_business_tax'), icon: TAX_CONFIGS.smallBusiness.icon },
    { id: 'asset', label: t('asset_tax'), icon: TAX_CONFIGS.asset.icon },
    { id: 'businessTransaction', label: t('business_transaction_tax'), icon: TAX_CONFIGS.businessTransaction.icon },
    { id: 'legalEntityAsset', label: t('legal_entity_asset_tax'), icon: TAX_CONFIGS.legalEntityAsset.icon },
    { id: 'custom', label: t('custom_tax'), icon: TAX_CONFIGS.custom.icon },
  ];

  // ============================================================
  // Sector Types (for Business Transaction Tax)
  // ============================================================
  const sectorTypes = [
    { id: 'hospital_first_year', label: 'Hospitals (First Year of Activity)', rate: 1 },
    { id: 'industrial_manufacturing', label: 'Industrial & Manufacturing, Restaurants, Hospitals (2nd Year+)', rate: 2 },
    { id: 'hospital_third_year', label: 'Hospitals (Third Year+)', rate: 3 },
    { id: 'general_business', label: 'General Business (Goods Sales & Services)', rate: 4 },
    { id: 'air_transport_wedding', label: 'Air Transport Companies & Wedding Hotels', rate: 5 },
    { id: 'luxury_hotels_restaurants', label: 'Luxury Hotels, Restaurants & Telecom Companies', rate: 10 },
  ];

  // ============================================================
  // Tax Calculation Functions
  // ============================================================

  // Income Tax Calculation
  const calculateIncomeTax = (incomeAmount: number): TaxResult => {
    const slab = TAX_CONFIGS.income.rates.find(
      (r) => incomeAmount >= r.min && incomeAmount <= r.max
    );
    const taxRate = slab?.rate || 20;
    const taxAmount = (incomeAmount * taxRate) / 100;
    const netAmount = incomeAmount - taxAmount;

    let breakdown = '';
    if (taxRate === 0) {
      breakdown = `Up to ${slab?.max?.toLocaleString()} AFN: 0% = 0 AFN`;
    } else if (taxRate === 2) {
      breakdown = `(${incomeAmount.toLocaleString()} - ${slab?.min?.toLocaleString()}) × 2% = ${taxAmount.toLocaleString()} AFN`;
    } else if (taxRate === 10) {
      breakdown = `1,800 + (${incomeAmount.toLocaleString()} - 150,000) × 10% = ${taxAmount.toLocaleString()} AFN`;
    } else {
      breakdown = `106,800 + (${incomeAmount.toLocaleString()} - 1,200,000) × 20% = ${taxAmount.toLocaleString()} AFN`;
    }

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: slab?.slab || '20% (Above 1,200,000 AFN)',
      dueDate: 'Monthly or Annually',
      taxType: 'Income Tax',
      breakdown,
    };
  };

  // Salary Tax Calculation
  const calculateSalaryTax = (salaryAmount: number): TaxResult => {
    const slab = TAX_CONFIGS.salary.rates.find(
      (r) => salaryAmount >= r.min && salaryAmount <= r.max
    );
    const taxRate = slab?.rate || 20;
    let taxAmount = 0;
    let breakdown = '';

    if (taxRate === 0) {
      taxAmount = 0;
      breakdown = `Up to ${slab?.max?.toLocaleString()} AFN: 0% = 0 AFN`;
    } else if (taxRate === 2) {
      taxAmount = (salaryAmount - 5000) * 0.02;
      breakdown = `(${salaryAmount.toLocaleString()} - 5,000) × 2% = ${taxAmount.toLocaleString()} AFN`;
    } else if (taxRate === 10) {
      taxAmount = 150 + (salaryAmount - 12500) * 0.1;
      breakdown = `150 + (${salaryAmount.toLocaleString()} - 12,500) × 10% = ${taxAmount.toLocaleString()} AFN`;
    } else {
      taxAmount = 10350 + (salaryAmount - 100000) * 0.2;
      breakdown = `10,350 + (${salaryAmount.toLocaleString()} - 100,000) × 20% = ${taxAmount.toLocaleString()} AFN`;
    }

    const netAmount = salaryAmount - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: slab?.slab || '20% (Above 100,000 AFN)',
      dueDate: 'Monthly',
      taxType: 'Salary Tax',
      breakdown,
    };
  };

  // Contract Tax Calculation
  const calculateContractTax = (contractAmount: number): TaxResult => {
    const slab = TAX_CONFIGS.contract.rates.find(
      (r) => contractAmount >= r.min && contractAmount <= r.max
    );
    const taxRate = slab?.rate || 15;
    const taxAmount = (contractAmount * taxRate) / 100;
    const netAmount = contractAmount - taxAmount;

    let breakdown = '';
    if (taxRate === 0) {
      breakdown = `Up to 9,999 AFN: 0% = 0 AFN`;
    } else {
      breakdown = `${contractAmount.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`;
    }

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: slab?.slab || '15% (Above 100,000 AFN)',
      dueDate: 'Per Contract Terms',
      taxType: 'Contract Tax',
      breakdown,
    };
  };

  // Rental Tax Calculation
  const calculateRentalTax = (rentalAmount: number): TaxResult => {
    const slab = TAX_CONFIGS.rental.rates.find(
      (r) => rentalAmount >= r.min && rentalAmount <= r.max
    );
    const taxRate = slab?.rate || 2;
    const taxAmount = (rentalAmount * taxRate) / 100;
    const netAmount = rentalAmount - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: slab?.slab || '2% (Above 50,000 AFN)',
      dueDate: 'Annually',
      taxType: 'Rental Tax',
      breakdown: `${rentalAmount.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // Business Tax Calculation
  const calculateBusinessTax = (businessAmount: number): TaxResult => {
    const slab = TAX_CONFIGS.business.rates.find(
      (r) => businessAmount >= r.min && businessAmount <= r.max
    );
    const taxRate = slab?.rate || 0.3;
    const taxAmount = (businessAmount * taxRate) / 100;
    const netAmount = businessAmount - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: slab?.slab || '0.3% (Above 2,000,001 AFN)',
      dueDate: 'Annually',
      taxType: 'Business Tax',
      breakdown: `${businessAmount.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // Profit Tax Calculation
  const calculateProfitTax = (profitAmount: number): TaxResult => {
    const taxRate = TAX_CONFIGS.profit.defaultRate;
    const taxAmount = (profitAmount * taxRate) / 100;
    const netAmount = profitAmount - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: `${taxRate}% Flat Rate`,
      dueDate: 'Quarterly',
      taxType: 'Profit Tax',
      breakdown: `${profitAmount.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // Property Tax Calculation
  const calculatePropertyTax = (propertyValue: number): TaxResult => {
    let taxRate = TAX_CONFIGS.property.defaultRate;
    if (propertyValue > 1000000) taxRate = 2.5;
    else if (propertyValue > 500000) taxRate = 1.5;

    const taxAmount = (propertyValue * taxRate) / 100;
    const netAmount = propertyValue - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab:
        taxRate === 1
          ? '1% (Up to 500,000 AFN)'
          : taxRate === 1.5
          ? '1.5% (500,001 - 1,000,000 AFN)'
          : '2.5% (Above 1,000,000 AFN)',
      dueDate: 'Annually',
      taxType: 'Property Tax',
      breakdown: `${propertyValue.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // Fixed Tax Calculation
  const calculateFixedTax = (fixedAmount: number): TaxResult => {
    const taxRate = TAX_CONFIGS.fixed.defaultRate;
    const taxAmount = (fixedAmount * taxRate) / 100;
    const netAmount = fixedAmount - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: `${taxRate}% Fixed Rate`,
      dueDate: 'At Time of Payment',
      taxType: 'Fixed Tax',
      breakdown: `${fixedAmount.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // Wealth Tax Calculation
  const calculateWealthTax = (wealthAmount: number): TaxResult => {
    const taxRate = TAX_CONFIGS.wealth.defaultRate;
    const taxAmount = (wealthAmount * taxRate) / 100;
    const netAmount = wealthAmount - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: `${taxRate}% Annual`,
      dueDate: 'Annually',
      taxType: 'Wealth Tax',
      breakdown: `${wealthAmount.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // Legal Entity Tax Calculation
  const calculateLegalEntityTax = (entityAmount: number): TaxResult => {
    const taxRate = TAX_CONFIGS.legalEntity.defaultRate;
    const taxAmount = (entityAmount * taxRate) / 100;
    const netAmount = entityAmount - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: `${taxRate}% of Taxable Income`,
      dueDate: 'Annually (Fiscal Year)',
      taxType: 'Legal Entity Tax',
      breakdown: `${entityAmount.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // Fixed Import Tax Calculation
  const calculateFixedImportTax = (importAmount: number): TaxResult => {
    const taxRate = TAX_CONFIGS.fixedImport.defaultRate;
    const taxAmount = (importAmount * taxRate) / 100;
    const netAmount = importAmount - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: `${taxRate}% of Goods Value`,
      dueDate: 'At Time of Import',
      taxType: 'Fixed Import Tax',
      breakdown: `${importAmount.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // Fixed No License Tax Calculation
  const calculateFixedNoLicenseTax = (noLicenseAmount: number): TaxResult => {
    const slab = TAX_CONFIGS.fixedNoLicense.rates.find(
      (r) => noLicenseAmount >= r.min && noLicenseAmount <= r.max
    );
    const taxRate = slab?.rate || 7;
    const taxAmount = (noLicenseAmount * taxRate) / 100;
    const netAmount = noLicenseAmount - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: slab?.slab || '7% (Above 50,000 AFN)',
      dueDate: 'Annually',
      taxType: 'Fixed No License Tax',
      breakdown: `${noLicenseAmount.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // Exhibition Tax Calculation
  const calculateExhibitionTax = (exhibitionAmount: number): TaxResult => {
    const taxRate = TAX_CONFIGS.exhibition.defaultRate;
    const taxAmount = (exhibitionAmount * taxRate) / 100;
    const netAmount = exhibitionAmount - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: `${taxRate}% of Revenue`,
      dueDate: 'After Exhibition',
      taxType: 'Exhibition Tax',
      breakdown: `${exhibitionAmount.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // Small Business Tax Calculation
  const calculateSmallBusinessTax = (smallBusinessAmount: number): TaxResult => {
    const slab = TAX_CONFIGS.smallBusiness.rates.find(
      (r) => smallBusinessAmount >= r.min && smallBusinessAmount <= r.max
    );
    const taxRate = slab?.rate || 0.3;
    const taxAmount = (smallBusinessAmount * taxRate) / 100;
    const netAmount = smallBusinessAmount - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: slab?.slab || '0.3% (Above 2,000,001 AFN)',
      dueDate: 'Annually',
      taxType: 'Small Business Tax',
      breakdown: `${smallBusinessAmount.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // Asset Tax Calculation
  const calculateAssetTax = (assetAmount: number): TaxResult => {
    const taxRate = TAX_CONFIGS.asset.defaultRate;
    const taxAmount = (assetAmount * taxRate) / 100;
    const netAmount = assetAmount - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: `${taxRate}% from Sale`,
      dueDate: 'At Time of Sale',
      taxType: 'Asset Tax',
      breakdown: `${assetAmount.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // Business Transaction Tax Calculation (with Sector)
  const calculateBusinessTransactionTax = (
    transactionAmount: number,
    sector: string
  ): TaxResult => {
    const sectorInfo = sectorTypes.find((s) => s.id === sector);
    const taxRate = sectorInfo?.rate || 4;
    const taxAmount = (transactionAmount * taxRate) / 100;
    const netAmount = transactionAmount - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: `${taxRate}% - ${sectorInfo?.label || 'General Business'}`,
      dueDate: 'Quarterly',
      taxType: 'Business Transaction Tax',
      breakdown: `${sectorInfo?.label || 'General Business'}\n${transactionAmount.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // Legal Entity Asset Sale Tax Calculation
  const calculateLegalEntityAssetTax = (assetSaleAmount: number): TaxResult => {
    const taxRate = TAX_CONFIGS.legalEntityAsset.defaultRate;
    const taxAmount = (assetSaleAmount * taxRate) / 100;
    const netAmount = assetSaleAmount - taxAmount;

    return {
      taxAmount,
      taxRate,
      netAmount,
      taxSlab: `${taxRate}% Annual`,
      dueDate: 'Annually',
      taxType: 'Legal Entity Asset Sale Tax',
      breakdown: `${assetSaleAmount.toLocaleString()} × ${taxRate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // Custom Tax Calculation
  const calculateCustomTax = (customAmount: number, rate: number): TaxResult => {
    const taxAmount = (customAmount * rate) / 100;
    const netAmount = customAmount - taxAmount;

    return {
      taxAmount,
      taxRate: rate,
      netAmount,
      taxSlab: `${rate}% Custom Rate`,
      dueDate: 'Per Agreement',
      taxType: customName || 'Custom Tax',
      breakdown: `${customAmount.toLocaleString()} × ${rate}% = ${taxAmount.toLocaleString()} AFN`,
    };
  };

  // ============================================================
  // Calculate Handler
  // ============================================================
  const handleCalculate = () => {
    if (amount <= 0) {
      setError('Please enter a valid tax amount');
      return;
    }

    if (activeTab === 'custom' && customRate <= 0) {
      setError('Please enter a valid tax rate');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      let calculationResult: TaxResult;

      switch (activeTab) {
        case 'income':
          calculationResult = calculateIncomeTax(amount);
          break;
        case 'salary':
          calculationResult = calculateSalaryTax(amount);
          break;
        case 'contract':
          calculationResult = calculateContractTax(amount);
          break;
        case 'rental':
          calculationResult = calculateRentalTax(amount);
          break;
        case 'business':
          calculationResult = calculateBusinessTax(amount);
          break;
        case 'profit':
          calculationResult = calculateProfitTax(amount);
          break;
        case 'property':
          calculationResult = calculatePropertyTax(amount);
          break;
        case 'fixed':
          calculationResult = calculateFixedTax(amount);
          break;
        case 'wealth':
          calculationResult = calculateWealthTax(amount);
          break;
        case 'legalEntity':
          calculationResult = calculateLegalEntityTax(amount);
          break;
        case 'fixedImport':
          calculationResult = calculateFixedImportTax(amount);
          break;
        case 'fixedNoLicense':
          calculationResult = calculateFixedNoLicenseTax(amount);
          break;
        case 'exhibition':
          calculationResult = calculateExhibitionTax(amount);
          break;
        case 'smallBusiness':
          calculationResult = calculateSmallBusinessTax(amount);
          break;
        case 'asset':
          calculationResult = calculateAssetTax(amount);
          break;
        case 'businessTransaction':
          calculationResult = calculateBusinessTransactionTax(amount, sectorType);
          break;
        case 'legalEntityAsset':
          calculationResult = calculateLegalEntityAssetTax(amount);
          break;
        case 'custom':
          calculationResult = calculateCustomTax(amount, customRate);
          break;
        default:
          calculationResult = calculateIncomeTax(amount);
      }

      setResult(calculationResult);
    } catch (err) {
      setError('An error occurred during calculation');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // Save Handler
  // ============================================================
  const handleSave = () => {
    if (!result || amount <= 0) {
      setError('Please calculate the tax before saving');
      return;
    }

    const taxName =
      activeTab === 'custom' && customName
        ? customName
        : tabs.find((t) => t.id === activeTab)?.label || 'Tax Calculation';

    addCalculation({
      name: `${taxName} - ${new Date().toLocaleDateString('en-US')}`,
      type: activeTab,
      amount: amount,
      taxAmount: result.taxAmount,
      taxRate: result.taxRate,
      date: new Date().toISOString(),
      description: description || `${taxName} Calculation`,
    });

    setDescription('');
    setCustomName('');
    setCustomRate(10);

    alert('✅ Calculation saved successfully!');
  };

  // ============================================================
  // Reset on Tab Change
  // ============================================================
  useEffect(() => {
    setResult(null);
    setError('');
    setSectorType('general_business');
  }, [activeTab]);

  // ============================================================
  // JSX Render
  // ============================================================
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('calculator')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Accurate and Fast Tax Calculation
        </p>
      </div>

      {/* Main Card */}
      <div className="card">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 pt-4">
          <div className="flex flex-wrap gap-1 max-h-64 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setResult(null);
                  setError('');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-all duration-200 text-sm ${
                  activeTab === tab.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Custom Name (only for custom tax) */}
          {activeTab === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tax Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="input"
                placeholder="e.g., Service Tax, Transfer Tax, etc."
              />
            </div>
          )}

          {/* Sector Type (only for business transaction tax) */}
          {activeTab === 'businessTransaction' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sector Type
              </label>
              <select
                value={sectorType}
                onChange={(e) => setSectorType(e.target.value)}
                className="input"
                title="Select sector type"
                aria-label="Sector type"
              >
                {sectorTypes.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.label} ({sector.rate}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('amount')}
            </label>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="input"
              placeholder="Amount in AFN"
              step="100"
            />
          </div>

          {/* Custom Rate (only for custom tax) */}
          {activeTab === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={customRate}
                onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                className="input"
                placeholder="e.g., 5, 10, 15"
                step="0.5"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={3}
              placeholder="Optional description (e.g., Company Profit, Property Tax, etc.)"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Calculate Button */}
          <div className="flex gap-4">
            <button
              onClick={handleCalculate}
              className="btn btn-primary flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CalcIcon className="w-4 h-4 ml-2" />
                  {t('calculate')}
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-6 p-5 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                  <CalcIcon className="w-4 h-4 text-primary-600" />
                </div>
                Calculation Result:
              </h3>

              <div className="space-y-3">
                {/* Tax Type */}
                {result.taxType && (
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax Type:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {result.taxType}
                    </span>
                  </div>
                )}

                {/* Amount */}
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Original Amount:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {amount.toLocaleString()} AFN
                  </span>
                </div>

                {/* Tax Rate */}
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tax Rate:
                  </span>
                  <span className="font-medium text-primary-600 dark:text-primary-400">
                    {result.taxRate}%
                  </span>
                </div>

                {/* Tax Slab */}
                {result.taxSlab && (
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax Slab:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {result.taxSlab}
                    </span>
                  </div>
                )}

                {/* Breakdown */}
                {result.breakdown && (
                  <div className="flex flex-col py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 mb-1">
                      Calculation Breakdown:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm whitespace-pre-line">
                      {result.breakdown}
                    </span>
                  </div>
                )}

                {/* Tax Amount */}
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tax Amount:
                  </span>
                  <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                    {result.taxAmount.toLocaleString()} AFN
                  </span>
                </div>

                {/* Net Amount */}
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Net Amount (After Tax):
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-xl">
                    {result.netAmount.toLocaleString()} AFN
                  </span>
                </div>

                {/* Due Date */}
                {result.dueDate && (
                  <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Due Date:
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {result.dueDate}
                    </span>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="btn btn-success w-full mt-6 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('save')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tax Information Card */}
<div className="card p-6">
  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
      <span className="text-primary-600 text-xs">i</span>
    </div>
    {t('tax_information_title')}
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
    <div className="space-y-2">
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-primary-600">
          • {t('income_tax')}:
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {' '}
          {t('income_tax_info')}
        </span>
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-primary-600">
          • {t('salary_tax')}:
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {' '}
          {t('salary_tax_info')}
        </span>
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-primary-600">
          • {t('contract_tax')}:
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {' '}
          {t('contract_tax_info')}
        </span>
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-primary-600">
          • {t('rental_tax')}:
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {' '}
          {t('rental_tax_info')}
        </span>
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-primary-600">
          • {t('business_tax')}:
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {' '}
          {t('business_tax_info')}
        </span>
      </p>
    </div>
    <div className="space-y-2">
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-primary-600">
          • {t('profit_tax')}:
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {' '}
          {t('profit_tax_info')}
        </span>
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-primary-600">
          • {t('property_tax')}:
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {' '}
          {t('property_tax_info')}
        </span>
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-primary-600">
          • {t('legal_entity_tax')}:
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {' '}
          {t('legal_entity_tax_info')}
        </span>
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-primary-600">
          • {t('business_transaction_tax')}:
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {' '}
          {t('business_transaction_tax_info')}
        </span>
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-primary-600">
          • {t('asset_sale_tax')}:
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {' '}
          {t('asset_sale_tax_info')}
        </span>
      </p>
    </div>
  </div>
</div>
    </div>
  );
};

export default Calculator;
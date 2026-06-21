import { useState, useEffect } from 'react';
import { Calculation, TaxCalculationResult, TaxType } from '../types';

export const useCalculations = () => {
  const [calculations, setCalculations] = useState<Calculation[]>(() => {
    const saved = localStorage.getItem('calculations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('calculations', JSON.stringify(calculations));
  }, [calculations]);

  const addCalculation = (calc: Omit<Calculation, 'id'>) => {
    const newCalc: Calculation = {
      ...calc,
      id: Date.now().toString(),
    };

    setCalculations(prev => [newCalc, ...prev]);
  };

  const deleteCalculation = (id: string) => {
    setCalculations(prev => prev.filter(c => c.id !== id));
  };

  const clearHistory = () => {
    setCalculations([]);
  };

  const calculateTax = (
    type: TaxType,
    amount: number
  ): TaxCalculationResult => {
    const taxRate = (() => {
      switch (type) {
        case 'income':
          if (amount <= 60000) return 0;
          if (amount <= 150000) return 2;
          if (amount <= 1200000) return 10;
          return 20;

        case 'profit':
          return 2;

        case 'property':
          return 1;

        case 'fixed':
          return 2;

        case 'wealth':
          return 1.5;

        case 'custom':
          return 10;

        default:
          return 10;
      }
    })();

    const taxAmount = (amount * taxRate) / 100;
    const netAmount = amount - taxAmount;

    return {
      amount,
      taxRate,
      taxAmount,
      netAmount,
      description: `${type} tax calculation`,
    };
  };

  return {
    calculations,
    addCalculation,
    deleteCalculation,
    clearHistory,
    calculateTax,
  };
};
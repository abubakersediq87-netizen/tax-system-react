export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Calculation {
  id: string;
  name: string;
  type: string;
  amount: number;
  taxAmount: number;
  taxRate: number;
  date: string;
  description?: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
}

export interface TaxCalculationResult {
  amount: number;
  taxRate: number;
  taxAmount: number;
  netAmount: number;
  description?: string;
}

export // ==================== د مالیاتو د ډولونو ټایپ تعریف ====================
type TaxType = 
  | 'income' 
  | 'profit' 
  | 'property' 
  | 'fixed' 
  | 'wealth' 
  | 'custom'
  | 'salary'
  | 'contract'
  | 'rental'
  | 'business'
  | 'legalEntity'
  | 'fixedImport'
  | 'fixedNoLicense'
  | 'exhibition'
  | 'smallBusiness'
  | 'asset'
  | 'businessTransaction'
  | 'legalEntityAsset';

export interface TaxRates {
  income: { [key: string]: number };
  profit: { [key: string]: number };
  property: { [key: string]: number };
  fixed: { [key: string]: number };
  wealth: { [key: string]: number };
}
import api from './api';

export interface Balance {
  USD: number;
  EUR: number;
  MDL: number;
}

export interface Transaction {
  _id: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  currency: 'USD' | 'EUR' | 'MDL';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  paymentMethod?: string;
  createdAt: string;
}

export const balanceService = {
  getBalance: async () => {
    const response = await api.get('/balance/balance');
    return response.data;
  },

  deposit: async (amount: number, currency: 'USD' | 'EUR' | 'MDL', paymentMethod: string = 'card') => {
    const response = await api.post('/balance/deposit', {
      amount,
      currency,
      paymentMethod,
    });
    return response.data;
  },

  withdraw: async (amount: number, currency: 'USD' | 'EUR' | 'MDL', paymentMethod: string = 'bank_transfer') => {
    const response = await api.post('/balance/withdraw', {
      amount,
      currency,
      paymentMethod,
    });
    return response.data;
  },

  convertCurrency: async (amount: number, fromCurrency: string, toCurrency: string) => {
    const response = await api.post('/balance/convert', {
      amount,
      fromCurrency,
      toCurrency,
    });
    return response.data;
  },

  getTransactions: async (params?: { type?: string; currency?: string; status?: string; limit?: number; skip?: number }) => {
    const response = await api.get('/balance/transactions', { params });
    return response.data;
  },

  updatePreferredCurrency: async (currency: 'USD' | 'EUR' | 'MDL') => {
    const response = await api.patch('/balance/preferred-currency', { currency });
    return response.data;
  },

  // Admin
  getAllTransactions: async (params?: { type?: string; currency?: string; status?: string; limit?: number; skip?: number }) => {
    const response = await api.get('/balance/admin/transactions', { params });
    return response.data;
  },

  updateTransactionStatus: async (id: string, status: string) => {
    const response = await api.patch(`/balance/admin/transactions/${id}`, { status });
    return response.data;
  },
};

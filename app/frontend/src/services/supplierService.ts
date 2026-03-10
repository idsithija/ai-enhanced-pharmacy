import api from './api';
import type { Supplier } from '../types';

export const supplierService = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await api.get('/suppliers?limit=1000');
    return response.data.data.suppliers || response.data.data || [];
  },
};

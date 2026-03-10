import api from './api';

export const reportService = {
  getSalesReport: async (startDate: string, endDate: string, groupBy = 'day') => {
    const params = new URLSearchParams({ startDate, endDate, groupBy });
    const response = await api.get(`/reports/sales?${params}`);
    return response.data.data;
  },

  getInventoryReport: async (type = 'full') => {
    const params = new URLSearchParams({ type });
    const response = await api.get(`/reports/inventory?${params}`);
    return response.data.data;
  },

  getProfitLossReport: async (startDate: string, endDate: string) => {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await api.get(`/reports/profit-loss?${params}`);
    return response.data.data;
  },

  getPrescriptionReport: async (startDate?: string, endDate?: string, status?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status) params.append('status', status);
    const response = await api.get(`/reports/prescriptions?${params}`);
    return response.data.data;
  },

  getTopMedicines: async (period = 'month', limit = 10) => {
    const params = new URLSearchParams({ period, limit: String(limit) });
    const response = await api.get(`/reports/top-medicines?${params}`);
    return response.data.data;
  },
};

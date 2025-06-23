import axios from 'axios';
import { config } from './config';
import { authApi } from './auth-api';
import { promises } from 'dns';

// Create axios instance
const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors and auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          try {
            // Try to refresh token
            const response = await authApi.refreshToken(refreshToken);
            
            if (response.code === 200 && response.result) {
              // Update stored token
              localStorage.setItem('access_token', response.result.access_token);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.result.access_token}`;
              return apiClient(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // No refresh token or refresh failed
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  code: number;
  status: string;
  message?: string;
  result?: T;
}

// Products API - Based on your exact endpoints "/api/product"
export const productsApi = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/api/product');
    return response.data;
  },
  
  create: async (product: { prod_name: string; unit_price?: number; amount?: number }): Promise<ApiResponse> => {
    const response = await apiClient.post('/api/product', product);
    return response.data;
  },
  
  update: async (updateData: { prod_id?: number; prod_name?: string; unit_price?: number; amount?: number }): Promise<ApiResponse> => {
    const response = await apiClient.put('/api/product', updateData);
    return response.data;
  },
  
  delete: async (productId: number): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/api/product/${productId}`);
    return response.data;
  },
  
  getClientOrderSearch: async (params: { phone_number?: string; cus_name?: string; cus_id?: number }): Promise<ApiResponse> => {
    const searchParams = new URLSearchParams();
    if (params.cus_id) searchParams.append('cus_id', params.cus_id.toString());
    if (params.cus_name) searchParams.append('cus_name', params.cus_name);
    if (params.phone_number) searchParams.append('phone_number', params.phone_number);

    const response = await apiClient.get(`/api/order/search?${searchParams.toString()}`);
    return response.data;
  }
  
  // getNextId: async (): Promise<ApiResponse> => {
  //   const response = await apiClient.get('/api/product/next-id');
  //   return response.data;
  // }
};

// Clients API - Based on your Swagger "/api/client"
export const clientsApi = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/api/client');
    return response.data;
  },
  
  create: async (client: { cus_name: string; address: string; phone_number: string }): Promise<ApiResponse> => {
    const response = await apiClient.post('/api/client', client);
    return response.data;
  },

  search: async (searchTerm: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`/api/client/${searchTerm}`);
    return response.data;
  }
};

// Orders API - Based on your Swagger "/api/order"
export const ordersApi = {

  // These Point was changed
  // getOrderAccount: async (phone_number: string): Promise<ApiResponse> => {
  //   const response = await apiClient.get(`/order/client_phone?phone_number=${phone_number}`);
  //   return response.data;
  // },

  // getClientOrder: async (params: { phone_number?: string; cus_name?: string; cus_id?: number }): Promise<ApiResponse> => {
  //   const searchParams = new URLSearchParams();
  //   if (params.phone_number) searchParams.append('phone_number', params.phone_number);
  //   if (params.cus_name) searchParams.append('cus_name', params.cus_name);
  //   if (params.cus_id) searchParams.append('cus_id', params.cus_id.toString());
    
  //   const response = await apiClient.get(`/order?${searchParams}`);
  //   return response.data;
  // },

  getorder: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/api/order');
    return response.data;
  },

  create: async (order: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/api/order', order);
    return response.data;
  },
  
  getClientOrders: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/api/order/all_client');
    return response.data;
  },

  getClientOrderById: async (clientId: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`/api/order/client/${clientId}`);
    return response.data;
  },

  getClientOrderSearch: async (params: { phone_number?: string; cus_name?: string; cus_id?: number }): Promise<ApiResponse> => {
    const searchParams = new URLSearchParams();
    if (params.cus_id) searchParams.append('cus_id', params.cus_id.toString());
    if (params.cus_name) searchParams.append('cus_name', params.cus_name);
    if (params.phone_number) searchParams.append('phone_number', params.phone_number);

    const response = await apiClient.get(`/api/order/search?${searchParams.toString()}`);
    return response.data;
  },

  getNextOrderId: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/api/order/next-id');
    return response.data;
  },

  getLastOrders: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/api/order/last');
    return response.data;
  },

  printOrder: async (orderId: number): Promise<ApiResponse> => {
    const response = await apiClient.get(`/api/orders/print?order_id=${orderId}`);
    return response.data;
  },
};

// Pawns API - Based on your Swagger "/api/pawn"
export const pawnsApi = {
  getpawn: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/api/pawn');
    return response.data;
  },
  
  create: async (pawn: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/api/pawn', pawn);
    return response.data;
  },

  getClientPawns: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/api/pawn/all_client');
    return response.data;
  },

  getClientPawnById: async (clientId: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`/api/pawn/client/${clientId}`);
    return response.data;
  },
  
  getClientPawnSearch: async (params: { phone_number?: string; cus_name?: string; cus_id?: number }): Promise<ApiResponse> => {
    const searchParams = new URLSearchParams();
    if (params.cus_id) searchParams.append('cus_id', params.cus_id.toString());
    if (params.cus_name) searchParams.append('cus_name', params.cus_name);
    if (params.phone_number) searchParams.append('phone_number', params.phone_number);

    const response = await apiClient.get(`/api/pawn/search?${searchParams.toString()}`);
    return response.data;
  },

  getNextPawnId: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/api/pawn/next-id');
    return response.data;
  },

  getLastPawns: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/api/pawn/last');
    return response.data;
  },

  // NEW: Print pawn function
  printPawn: async (pawnId: number): Promise<ApiResponse> => {
    const response = await apiClient.get(`/api/pawn/${pawnId}/print`);
    return response.data;
  },
};

export default apiClient;
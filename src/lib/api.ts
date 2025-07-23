import axios from 'axios';
import { config } from './config';
import { authApi } from './auth-api';

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
export interface ApiResponse<T = unknown> {
  code: number;
  status: string;
  message?: string;
  result?: T;
}

// Product types
export interface Product {
  id: number;
  name: string;
  price?: number | null;
  amount?: number | null;
}

export interface ProductCreateData {
  prod_name: string;
  unit_price?: number;
  amount?: number;
}

export interface ProductUpdateData {
  prod_id?: number;
  prod_name?: string;
  unit_price?: number;
  amount?: number;
}

// Client types
export interface Client {
  cus_id?: number;
  cus_name: string;
  address: string;
  phone_number: string;
}

export interface ClientCreateData {
  cus_name: string;
  address: string;
  phone_number: string;
}

// Search parameters
export interface ClientSearchParams {
  phone_number?: string;
  cus_name?: string;
  cus_id?: number;
}

// Order types
export interface OrderItem {
  prod_id: number;
  prod_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Order {
  order_id?: number;
  cus_id: number;
  cus_name: string;
  phone_number: string;
  order_date: string;
  total_amount: number;
  items: OrderItem[];
}

export interface OrderCreateData {
  order_id?: number;
  cus_id: number;
  cus_name: string;
  address: string;
  phone_number: string;
  order_date: string;
  order_deposit: number;
  order_product_detail: {
    prod_id: number;
    prod_name: string;
    order_weight: string | number;
    order_amount: number;
    product_sell_price: number;
    product_labor_cost: number;
    product_buy_price: number;
  }[];
}

// Pawn types
export interface PawnItem {
  item_name: string;
  item_description?: string;
  estimated_value: number;
}

export interface Pawn {
  pawn_id?: number;
  cus_id: number;
  cus_name: string;
  phone_number: string;
  pawn_date: string;
  total_value: number;
  interest_rate: number;
  duration_months: number;
  items: PawnItem[];
}

export interface PawnCreateData {
  pawn_id?: number;
  cus_id: number;
  cus_name: string;
  address: string;
  phone_number: string;
  pawn_date: string;
  pawn_expire_date: string;
  pawn_deposit: number;
  pawn_product_detail: {
    prod_id: number;
    prod_name: string;
    pawn_weight: string;
    pawn_amount: number;
    pawn_unit_price: number;
  }[];
}

// Products API - Based on your exact endpoints "/api/product"
export const productsApi = {
  getAll: async (page = 1, limit = 10): Promise<ApiResponse<{products: Product[], pagination: any}>> => {
    const response = await apiClient.get(`/products/api/product?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  create: async (product: ProductCreateData): Promise<ApiResponse<Product>> => {
    const response = await apiClient.post('/products/api/product', product);
    return response.data;
  },
  
  update: async (updateData: ProductUpdateData): Promise<ApiResponse<Product>> => {
    const response = await apiClient.put('/products/api/product', updateData);
    return response.data;
  },
  
  delete: async (productId: number): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/products/api/product/${productId}`);
    return response.data;
  },
  
  getClientOrderSearch: async (params: ClientSearchParams): Promise<ApiResponse> => {
    const searchParams = new URLSearchParams();
    if (params.cus_id) searchParams.append('cus_id', params.cus_id.toString());
    if (params.cus_name) searchParams.append('cus_name', params.cus_name);
    if (params.phone_number) searchParams.append('phone_number', params.phone_number);

    const response = await apiClient.get(`/orders/api/order/search?${searchParams.toString()}`);
    return response.data;
  }
  
  // getNextId: async (): Promise<ApiResponse> => {
  //   const response = await apiClient.get('/api/product/next-id');
  //   return response.data;
  // }
};

// Clients API - Based on your Swagger "/api/client"
export const clientsApi = {
  getAll: async (): Promise<ApiResponse<Client[]>> => {
    const response = await apiClient.get('/client/api/client');
    return response.data;
  },
  
  create: async (client: ClientCreateData): Promise<ApiResponse<Client>> => {
    const response = await apiClient.post('/client/api/client', client);
    return response.data;
  },

  search: async (searchTerm: string): Promise<ApiResponse<Client[]>> => {
    const response = await apiClient.get(`/client/api/client/${searchTerm}`);
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

  getorder: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/orders/api/order');
    return response.data;
  },

  create: async (order: OrderCreateData): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post('/orders/api/order', order);
    return response.data;
  },
  
  getClientOrders: async (params?: { page?: number; search_id?: number; search_name?: string; search_phone?: string; search_address?: string }): Promise<ApiResponse<Order[]>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.search_id) {
      queryParams.append('search_id', params.search_id.toString());
    }
    if (params?.search_name) {
      queryParams.append('search_name', params.search_name);
    }
    if (params?.search_phone) {
      queryParams.append('search_phone', params.search_phone);
    }
    if (params?.search_address) {
      queryParams.append('search_address', params.search_address);
    }
    
    const url = queryParams.toString() 
      ? `/orders/api/order/all_client?${queryParams.toString()}`
      : '/orders/api/order/all_client';

    const response = await apiClient.get(url);
    return response.data;
  },

  getClientOrderById: async (clientId: string): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get(`orders/api/order/client/${clientId}`);
    return response.data;
  },

  getClientOrderSearch: async (params: ClientSearchParams): Promise<ApiResponse<Order[]>> => {
    const searchParams = new URLSearchParams();
    if (params.cus_id) searchParams.append('cus_id', params.cus_id.toString());
    if (params.cus_name) searchParams.append('cus_name', params.cus_name);
    if (params.phone_number) searchParams.append('phone_number', params.phone_number);

    const response = await apiClient.get(`/api/order/search?${searchParams.toString()}`);
    return response.data;
  },

  getNextOrderId: async (): Promise<ApiResponse<{ next_order_id: number }>> => {
    const response = await apiClient.get('/api/order/next-id');
    return response.data;
  },

  getLastOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/api/order/last');
    return response.data;
  },

  printOrder: async (orderId: number): Promise<ApiResponse> => {
    const response = await apiClient.get(`/api/order/print?order_id=${orderId}`);
    return response.data;
  },
};

// Pawns API - Based on your Swagger "/api/pawn"
export const pawnsApi = {
  getpawn: async (): Promise<ApiResponse<Pawn[]>> => {
    const response = await apiClient.get('/api/pawn');
    return response.data;
  },
  
  create: async (pawn: PawnCreateData): Promise<ApiResponse<Pawn>> => {
    const response = await apiClient.post('/api/pawn', pawn);
    return response.data;
  },

  getClientPawns: async (): Promise<ApiResponse<Pawn[]>> => {
    const response = await apiClient.get('/api/pawn/all_client');
    return response.data;
  },

  getClientPawnById: async (clientId: string): Promise<ApiResponse<Pawn[]>> => {
    const response = await apiClient.get(`/api/pawn/client/${clientId}`);
    return response.data;
  },
  
  getClientPawnSearch: async (params: ClientSearchParams): Promise<ApiResponse<Pawn[]>> => {
    const searchParams = new URLSearchParams();
    if (params.cus_id) searchParams.append('cus_id', params.cus_id.toString());
    if (params.cus_name) searchParams.append('cus_name', params.cus_name);
    if (params.phone_number) searchParams.append('phone_number', params.phone_number);

    const response = await apiClient.get(`/api/pawn/search?${searchParams.toString()}`);
    return response.data;
  },

  getNextPawnId: async (): Promise<ApiResponse<{ next_id: number }>> => {
    const response = await apiClient.get('/api/pawn/next-id');
    return response.data;
  },

  getLastPawns: async (): Promise<ApiResponse<Pawn[]>> => {
    const response = await apiClient.get('/api/pawn/last');
    return response.data;
  },

  // NEW: Print pawn function
  printPawn: async (pawnId: number): Promise<ApiResponse> => {
    const response = await apiClient.get(`/api/pawn/print?pawn_id=${pawnId}`);
    return response.data;
  },
};

export default apiClient;
import axios from 'axios';
import { config } from './config';
import { 
  LoginCredentials, 
  AuthResponse, 
  RefreshTokenResponse,
  DecodedToken 
} from '@/types/auth';

// Create separate auth API client (no auth interceptor to avoid loops)
const authApiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT decode function (simple implementation)
function decodeJWT(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Auth API for business management system
export const authApi = {
  // POST /sign_in - Login with phone number and password
  signIn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await authApiClient.post('/sign_in', {
      phone_number: credentials.phone_number,
      password: credentials.password
    });
    return response.data;
  },

  // POST /refresh_token - Refresh access token
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    // Send as query parameter since FastAPI expects refresh_token: str parameter
    const response = await authApiClient.post('/refresh_token', null, {
      params: { refresh_token: refreshToken }
    });
    return response.data;
  },

  // Utility functions
  decodeToken: (token: string): DecodedToken | null => {
    return decodeJWT(token);
  },

  isTokenExpired: (token: string): boolean => {
    const decoded = decodeJWT(token);
    if (!decoded) return true;
    return Date.now() >= decoded.exp * 1000;
  },

  // Get user info from token
  getUserFromToken: (token: string): DecodedToken | null => {
    const decoded = decodeJWT(token);
    if (!decoded || decoded.type !== 'access_token') return null;
    return decoded;
  }
};
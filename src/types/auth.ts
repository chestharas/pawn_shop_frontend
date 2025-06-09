// Auth Types for business management system
export interface LoginCredentials {
  phone_number: string;
  password: string;
}

export interface AuthResponse {
  code: number;
  status: string;
  message?: string;
  result?: {
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
}

export interface RefreshTokenResponse {
  code: number;
  status: string;
  result?: {
    access_token: string;
    token_type: string;
  };
}

export interface User {
  id: number;
  phone_number: string;
  role: string;
  cus_name?: string;
}

export interface DecodedToken {
  sub: string; // phone_number
  id: number;
  type: 'access_token' | 'refresh_token';
  role: string;
  exp: number;
}
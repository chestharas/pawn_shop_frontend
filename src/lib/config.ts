// src/lib/config.ts - Centralized configuration
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://pawnshop-683608653401.asia-southeast1.run.app/api/v1',
  
  // App Configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Pawn Shop System',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Request Configuration
  timeout: parseInt(process.env.NEXT_PUBLIC_TIMEOUT || '30000'),
  enableDebug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Validate required environment variables
  validate() {
    if (!this.apiUrl) {
      throw new Error('NEXT_PUBLIC_API_URL is required');
    }
    
    if (this.enableDebug) {
      console.log('🔧 App Configuration:', {
        apiUrl: this.apiUrl,
        appName: this.appName,
        environment: process.env.NODE_ENV,
      });
    }
  }
};

// Validate config on import
config.validate();
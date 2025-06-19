// buyandsell/page.tsx - Updated with LastOrders Component
'use client';

import { useState, useEffect } from 'react';
import { clientsApi, productsApi, ordersApi } from '@/lib/api';
import { colors } from '@/lib/colors';

// Import UI components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import LastOrders from '@/components/ui/LastOrders';

// Import local components from the same folder
import ClientForm from './ClientForm';
import OrderForm from './OrderForm';
import Notification from './Notification';

// Client interface based on API response
interface Client {
  cus_id: number;
  cus_name: string;
  address: string;
  phone_number: string;
}

interface Product {
  id: number;
  name: string;
}

interface FormData {
  cus_name: string;
  address: string;
  phone_number: string;
}

interface NotificationState {
  type: 'success' | 'error';
  message: string;
}

// Last Orders Interfaces
interface OrderProduct {
  prod_name: string;
  prod_id: number;
  order_weight: string;
  order_amount: number;
  product_sell_price: number;
  product_labor_cost: number;
  product_buy_price: number;
  subtotal: number;
}

interface OrderInfo {
  order_id: number;
  order_date: string;
  order_deposit: number;
  total_amount: number;
  remaining_balance: number;
}

interface ClientInfo {
  cus_id: number;
  cus_name: string;
  address: string;
  phone_number: string;
}

interface OrderSummary {
  total_products: number;
  total_amount: number;
  deposit_paid: number;
  balance_due: number;
}

interface Order {
  order_info: OrderInfo;
  client_info: ClientInfo;
  products: OrderProduct[];
  summary: OrderSummary;
}

export default function BuyAndSellPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [foundClient, setFoundClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<FormData>({
    cus_name: '',
    address: '',
    phone_number: ''
  });

  // Last Orders State
  const [lastOrders, setLastOrders] = useState<Order[]>([]);
  const [loadingLastOrders, setLoadingLastOrders] = useState(false);

  useEffect(() => {
    loadClients();
    loadProducts();
    loadLastOrders(); // Load last orders on component mount
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productsApi.getAll();
      if (response.code === 200 && response.result) {
        setProducts(response.result);
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientsApi.getAll();
      if (response.code === 200 && response.result) {
        setClients(response.result);
      } else {
        showNotification('error', 'មិនអាចទាញយកបញ្ជីអតិថិជនបានទេ');
      }
    } catch (error: any) {
      console.error('Error loading clients:', error);
      showNotification('error', 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យ');
    } finally {
      setLoading(false);
    }
  };

  // Load Last 3 Orders Function - Using API
  const loadLastOrders = async () => {
    setLoadingLastOrders(true);
    try {
      const response = await ordersApi.getLastOrders();
      
      if (response.code === 200 && response.result) {
        setLastOrders(response.result);
        console.log('✅ Last orders loaded successfully:', response.result);
        if (response.result.length > 0) {
          // showNotification('success', `ទាញយកការបញ្ជាទិញចុងក្រោយ ${response.result.length} ចំនួនបានជោគជ័យ`);
        }
      } else {
        console.log('❌ No orders found:', response);
        setLastOrders([]);
        showNotification('error', response.message || 'មិនអាចទាញយកការបញ្ជាទិញចុងក្រោយបានទេ');
      }
    } catch (error: any) {
      console.error('❌ Error loading last orders:', error);
      
      // Check if it's a JSON parsing error (HTML response)
      if (error.message?.includes('Unexpected token') || error.message?.includes('JSON')) {
        showNotification('error', 'Backend មិនត្រឹមត្រូវ - សូមពិនិត្យ API endpoint');
      } else if (error.response?.status === 404) {
        showNotification('error', 'API endpoint មិនត្រូវបានរកឃើញ');
      } else if (error.response?.status === 401) {
        showNotification('error', 'សូមចូលប្រើប្រាស់ម្តងទៀត');
      } else {
        showNotification('error', 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យ');
      }
      
      setLastOrders([]);
    } finally {
      setLoadingLastOrders(false);
    }
  };

  const handleClientCreated = () => {
    loadClients();
  };

  const handleOrderCreated = () => {
    // Reset client form (left panel)
    setFormData({
      cus_name: '',
      address: '',
      phone_number: ''
    });
    // Clear found client
    setFoundClient(null);
    // Reload clients to update the next ID
    loadClients();
    // Reload last orders to show the new order
    loadLastOrders();
  };

  const handleClientFound = (client: Client | null) => {
    setFoundClient(client);
  };

  const handleFormDataChange = (newFormData: FormData) => {
    setFormData(newFormData);
  };

  return (
    <div 
      className="h-full overflow-hidden flex flex-col" 
      style={{ backgroundColor: colors.secondary[50] }}
    >
      {/* Notification */}
      <Notification 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />

      {/* Main Content */}
      <div className="flex-1 p-2 overflow-auto">
        <div className="h-full flex flex-col gap-4">
          
          {/* Top Row - Client Form and Order Form */}
          <div className="flex-shrink-0 grid grid-cols-1 xl:grid-cols-3 gap-4" style={{ minHeight: '400px' }}>
            {/* Left Panel - Client Form (1/3 width on xl screens) */}
            <div className="xl:col-span-1 flex flex-col">
              <ClientForm
                clients={clients}
                onClientCreated={handleClientCreated}
                onNotification={showNotification}
                onClientFound={handleClientFound}
                onFormDataChange={handleFormDataChange}
                formData={formData}
                foundClient={foundClient}
              />
            </div>

            {/* Right Panel - Order Form (2/3 width on xl screens) */}
            <div className="xl:col-span-2 flex flex-col">
              <OrderForm
                products={products}
                onNotification={showNotification}
                onOrderCreated={handleOrderCreated}
                formData={formData}
                foundClient={foundClient}
              />
            </div>  
          </div>

          {/* Bottom Row - Last Orders Panel */}
          <div className="flex-shrink-0" style={{ minHeight: '300px' }}>
            <LastOrders
              orders={lastOrders}
              loading={loadingLastOrders}
              onRefresh={loadLastOrders}
              onNotification={showNotification}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 
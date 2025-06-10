// pawn/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { clientsApi, productsApi } from '@/lib/api';
import { colors } from '@/lib/colors';

// Import local components from the same folder
import ClientForm from './ClientForm';
import PawnForm from './PawnForm';
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

export default function PawnPage() {
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

  useEffect(() => {
    loadClients();
    loadProducts();
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

  const handleClientCreated = () => {
    loadClients();
  };

  const handlePawnCreated = () => {
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
      <div className="flex-1 p-4 overflow-hidden" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-4 max-w-full">
          
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

          {/* Right Panel - Pawn Form (2/3 width on xl screens) */}
          <div className="xl:col-span-2 flex flex-col">
            <PawnForm
              products={products}
              onNotification={showNotification}
              onPawnCreated={handlePawnCreated}
              formData={formData}
              foundClient={foundClient}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
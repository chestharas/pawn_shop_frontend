// pawn/page.tsx - Updated with Reset Both Forms Functionality
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { clientsApi, productsApi, pawnsApi } from '@/lib/api';
import { colors } from '@/lib/colors';

// Import local components from the same folder
import ClientForm from './ClientForm';
import PawnForm from './PawnForm';
import Notification from './Notification';
import LastPawn from '@/components/ui/LastPawn';

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

// Real API interfaces based on your actual response
interface PawnProduct {
  prod_name: string;
  prod_id: number;
  pawn_weight: string;
  pawn_amount: number;
  pawn_unit_price: number;
  subtotal: number;
}

interface PawnInfo {
  pawn_id: number;
  pawn_date: string;
  pawn_expire_date: string;
  pawn_deposit: number;
  total_amount: number;
  remaining_balance: number;
}

interface PawnSummary {
  total_products: number;
  total_amount: number;
  deposit_paid: number;
  balance_due: number;
}

interface Pawn {
  pawn_info: PawnInfo;
  client_info: Client;
  products: PawnProduct[];
  summary: PawnSummary;
}

// Helper function to calculate days remaining and status
const calculatePawnStatus = (expireDate: string) => {
  const today = new Date();
  const expire = new Date(expireDate);
  const daysRemaining = Math.ceil((expire.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining < 0) {
    return { status: 'overdue', urgent: true, daysRemaining: Math.abs(daysRemaining) };
  } else if (daysRemaining <= 7) {
    return { status: 'warning', urgent: true, daysRemaining };
  } else {
    return { status: 'active', urgent: false, daysRemaining };
  }
};

export default function PawnPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lastPawns, setLastPawns] = useState<Pawn[]>([]);
  const [loadingLastPawns, setLoadingLastPawns] = useState(true);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [foundClient, setFoundClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<FormData>({
    cus_name: '',
    address: '',
    phone_number: ''
  });

  // Ref to trigger pawn form reset
  const pawnFormResetRef = useRef<(() => void) | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const loadProducts = useCallback(async () => {
    try {
      const response = await productsApi.getAll();
      if (response.code === 200 && response.result) {
        setProducts(response.result);
      }
    } catch (error: unknown) {
      console.error('Error loading products:', error);
    }
  }, []);

  // Real API call for last pawns
  const loadLastPawns = useCallback(async () => {
    try {
      setLoadingLastPawns(true);
      const response = await pawnsApi.getLastPawns();
      
      if (response.code === 200 && response.result) {
        // Transform the API response to match our component's expected format
        const transformedPawns: Pawn[] = response.result.map((pawn: unknown) => {
          const pawnData = pawn as {
            pawn_info: PawnInfo;
            client_info: Client;
            products: PawnProduct[];
            summary: PawnSummary;
          };
          
          const statusInfo = calculatePawnStatus(pawnData.pawn_info.pawn_expire_date);
          
          return {
            pawn_info: {
              ...pawnData.pawn_info,
              // Add calculated fields for compatibility
              loan_amount: pawnData.pawn_info.pawn_deposit, // Using deposit as loan amount
              interest_rate: 3, // Default interest rate - you might want to get this from API
              loan_period_days: 30, // Default period - you might want to calculate this
              due_date: pawnData.pawn_info.pawn_expire_date,
              status: statusInfo.status as 'active' | 'redeemed' | 'defaulted' | 'extended',
              total_amount_due: pawnData.pawn_info.total_amount
            },
            client_info: pawnData.client_info,
            // Transform products to items for LastPawn component
            items: pawnData.products.map((product: PawnProduct) => ({
              item_name: product.prod_name,
              item_id: product.prod_id,
              item_weight: product.pawn_weight,
              item_quantity: product.pawn_amount,
              estimated_value: product.pawn_unit_price * product.pawn_amount,
              pawn_amount: product.subtotal,
              item_condition: 'ល្អ', // Default condition
              subtotal: product.subtotal
            })),
            // Transform summary for compatibility
            summary: {
              total_items: pawnData.summary.total_products,
              total_estimated_value: pawnData.summary.total_amount,
              loan_amount: pawnData.summary.deposit_paid,
              interest_amount: pawnData.summary.total_amount * 0.03, // Calculate 3% interest
              total_due: pawnData.summary.total_amount,
              days_remaining: statusInfo.daysRemaining
            }
          };
        });
        
        setLastPawns(transformedPawns);
      } else {
        showNotification('error', 'មិនអាចទាញយកបញ្ជីការបញ្ចាំបានទេ');
      }
    } catch (error: unknown) {
      console.error('Error loading recent pawns:', error);
      showNotification('error', 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យការបញ្ចាំ');
    } finally {
      setLoadingLastPawns(false);
    }
  }, []);

  const loadClients = useCallback(async () => {
    try {
      const response = await clientsApi.getAll();
      if (response.code === 200 && response.result) {
        setClients(response.result);
      } else {
        showNotification('error', 'មិនអាចទាញយកបញ្ជីអតិថិជនបានទេ');
      }
    } catch (error: unknown) {
      console.error('Error loading clients:', error);
      showNotification('error', 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យ');
    }
  }, []);

  useEffect(() => {
    loadClients();
    loadProducts();
    loadLastPawns();
  }, [loadClients, loadProducts, loadLastPawns]);

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
    // Reload recent pawns to show the new pawn
    loadLastPawns();
    // Show success notification
    showNotification('success', 'បានបង្កើតការបញ្ចាំថ្មីដោយជោគជ័យ');
  };

  const handleClientFound = (client: Client | null) => {
    setFoundClient(client);
  };

  const handleFormDataChange = (newFormData: FormData) => {
    setFormData(newFormData);
  };

  // Function to reset both forms when called from ClientForm
  const handleResetBothForms = () => {
    console.log('🔄 Resetting both forms from pawn page component');
    
    // Reset client form data
    setFormData({
      cus_name: '',
      address: '',
      phone_number: ''
    });
    setFoundClient(null);
    
    // Reset pawn form by calling the ref function
    if (pawnFormResetRef.current) {
      pawnFormResetRef.current();
    }
  };

  // Function to register pawn form reset function
  const registerPawnFormReset = (resetFunction: () => void) => {
    pawnFormResetRef.current = resetFunction;
  };

  return (
    <div 
      className="min-h-screen w-full" 
      style={{ backgroundColor: colors.secondary[50] }}
    >
      {/* Notification */}
      <Notification 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />

      {/* Main Content */}
      <div className="w-full p-2">
        <div className="w-full flex flex-col gap-4">
          
          {/* Top Row - Main Forms */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4" style={{ minHeight: '400px' }}>
            
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
                onResetBothForms={handleResetBothForms}
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
                onRegisterResetFunction={registerPawnFormReset}
              />
            </div>
          </div>

          {/* Bottom Row - Last Pawns Panel */}
          <div className="w-full" style={{ minHeight: '300px' }}>
            <LastPawn
              pawns={lastPawns}
              loading={loadingLastPawns}
              onRefresh={loadLastPawns}
              onNotification={showNotification}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
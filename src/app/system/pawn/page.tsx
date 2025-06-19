// pawn/page.tsx - Complete Rewrite Following BuyAndSell Pattern
'use client';

import { useState, useEffect } from 'react';
import { clientsApi, productsApi } from '@/lib/api';
import { colors } from '@/lib/colors';
import { 
  Clock,
  User,
  Package,
  DollarSign,
  Printer,
  RefreshCw,
  Calendar,
  Phone,
  MapPin,
  Eye,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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

// Last Pawns Interfaces
interface PawnProduct {
  prod_name: string;
  prod_id: number;
  pawn_weight: string;
  pawn_amount: number;
  product_pawn_price: number;
  subtotal: number;
}

interface PawnInfo {
  pawn_id: number;
  pawn_date: string;
  total_amount: number;
  interest_rate: number;
  pawn_period: number;
  status: string;
  due_date: string;
}

interface ClientInfo {
  cus_id: number;
  cus_name: string;
  address: string;
  phone_number: string;
}

interface PawnSummary {
  total_products: number;
  total_amount: number;
  interest_amount: number;
  total_with_interest: number;
}

interface Pawn {
  pawn_info: PawnInfo;
  client_info: ClientInfo;
  products: PawnProduct[];
  summary: PawnSummary;
}

// Pawn API functions
const pawnApi = {
  getLastPawns: async () => {
    const response = await fetch('/api/pawn/last', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },
  
  printPawn: async (pawnId: number) => {
    const response = await fetch(`/api/pawn/${pawnId}/print`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  }
};

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

  // Last Pawns State
  const [lastPawns, setLastPawns] = useState<Pawn[]>([]);
  const [loadingLastPawns, setLoadingLastPawns] = useState(false);
  const [printing, setPrinting] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadClients();
    loadProducts();
    loadLastPawns(); // Load last pawns on component mount
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

  // Load Last 3 Pawns Function - Using API
  const loadLastPawns = async () => {
    setLoadingLastPawns(true);
    try {
      const response = await pawnApi.getLastPawns();
      
      if (response.code === 200 && response.result) {
        setLastPawns(response.result);
        console.log('✅ Last pawns loaded successfully:', response.result);
        if (response.result.length > 0) {
          showNotification('success', `ទាញយកដេញចុងក្រោយ ${response.result.length} ចំនួនបានជោគជ័យ`);
        }
      } else {
        console.log('❌ No pawns found:', response);
        setLastPawns([]);
        showNotification('error', response.message || 'មិនអាចទាញយកដេញចុងក្រោយបានទេ');
      }
    } catch (error: any) {
      console.error('❌ Error loading last pawns:', error);
      
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
      
      setLastPawns([]);
    } finally {
      setLoadingLastPawns(false);
    }
  };

  // Print Pawn Function - Using API
  const handlePrintPawn = async (pawnId: number) => {
    setPrinting(prev => ({ ...prev, [pawnId]: true }));
    
    try {
      console.log(`🖨️ Starting print for pawn ID: ${pawnId}`);
      const response = await pawnApi.printPawn(pawnId);
      
      if (response.code === 200 && response.result) {
        console.log('✅ Print data received:', response.result);
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const printData = response.result;
          
          // Generate HTML for printing
          const printHTML = generatePrintHTML(printData);
          
          printWindow.document.write(printHTML);
          printWindow.document.close();
          
          // Print after a short delay to ensure content is loaded
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
          
          showNotification('success', 'បានបើកទំព័របោះពុម្ពដោយជោគជ័យ');
        } else {
          showNotification('error', 'មិនអាចបើកទំព័របោះពុម្ពបានទេ - browser បានរារាំង popup');
        }
      } else {
        console.log('❌ Print failed:', response);
        showNotification('error', response.message || 'មានបញ្ហាក្នុងការរៀបចំទិន្នន័យសម្រាប់បោះពុម្ព');
      }
    } catch (error: any) {
      console.error('❌ Error printing pawn:', error);
      
      // Better error handling for print functionality
      if (error.message?.includes('Unexpected token') || error.message?.includes('JSON')) {
        showNotification('error', 'Print API មិនត្រឹមត្រូវ - សូមពិនិត្យ backend');
      } else if (error.response?.status === 404) {
        showNotification('error', `ដេញលេខ ${pawnId} មិនត្រូវបានរកឃើញ`);
      } else if (error.response?.status === 401) {
        showNotification('error', 'សូមចូលប្រើប្រាស់ម្តងទៀត');
      } else {
        showNotification('error', 'មានបញ្ហាក្នុងការបោះពុម្ព');
      }
    } finally {
      setPrinting(prev => ({ ...prev, [pawnId]: false }));
    }
  };

  // Generate Print HTML Function - Enhanced for Pawn
  const generatePrintHTML = (printData: any) => {
    try {
      // Validate print data structure
      if (!printData || !printData.header || !printData.customer || !printData.items || !printData.totals) {
        console.error('❌ Invalid print data structure:', printData);
        throw new Error('Print data is missing required fields');
      }

      const currentDate = new Date().toLocaleDateString('km-KH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <!DOCTYPE html>
        <html lang="km">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>វិក្កយបត្រដេញ #${printData.header.pawn_id || 'N/A'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;700&display=swap');
            
            body { 
              font-family: 'Noto Sans Khmer', 'Khmer OS', Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #dc2626;
              margin-bottom: 10px;
              font-size: 24px;
            }
            .pawn-info { 
              margin-bottom: 20px; 
              background-color: #fef2f2;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #dc2626;
            }
            .customer-info { 
              margin-bottom: 20px; 
              background-color: #f0f8ff;
              padding: 15px;
              border-radius: 5px;
            }
            .customer-info h3 {
              color: #2563eb;
              margin-bottom: 10px;
              font-size: 18px;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .items-table th, .items-table td { 
              border: 1px solid #ddd; 
              padding: 12px 8px; 
              text-align: left; 
              font-size: 14px;
            }
            .items-table th { 
              background-color: #dc2626; 
              font-weight: bold;
              color: white;
            }
            .items-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .items-table tr:hover {
              background-color: #fef2f2;
            }
            .totals { 
              text-align: right; 
              margin-bottom: 20px; 
              background-color: #fef2f2;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #dc2626;
            }
            .totals p {
              margin: 5px 0;
              font-size: 14px;
            }
            .totals .grand-total {
              font-size: 18px;
              font-weight: bold;
              color: #dc2626;
              border-top: 2px solid #333;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              font-style: italic; 
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .warning-box {
              background-color: #fef3c7;
              border: 2px solid #f59e0b;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .header { page-break-inside: avoid; }
              .customer-info { page-break-inside: avoid; }
              .totals { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${printData.header.title || 'វិក្កយបត្រដេញ'}</h1>
            <p><strong>លេខដេញ: ${printData.header.pawn_id || 'N/A'}</strong></p>
            <p>កាលបរិច្ចេទដេញ: ${printData.header.pawn_date || 'N/A'}</p>
            <p>កាលបរិច្ចេទផុតកំណត់: ${printData.header.due_date || 'N/A'}</p>
            <p>បោះពុម្ពនៅ: ${currentDate}</p>
          </div>
          
          <div class="pawn-info">
            <h3>ព័ត៌មានដេញ:</h3>
            <p><strong>រយៈពេលដេញ:</strong> ${printData.pawn_info.period || 'N/A'} ខែ</p>
            <p><strong>អត្រាការប្រាក់:</strong> ${printData.pawn_info.interest_rate || 0}% ក្នុងមួយខែ</p>
            <p><strong>ស្ថានភាព:</strong> ${printData.pawn_info.status || 'សកម្ម'}</p>
          </div>
          
          <div class="customer-info">
            <h3>ព័ត៌មានអតិថិជន:</h3>
            <p><strong>ឈ្មោះ:</strong> ${printData.customer.name || 'មិនបានបញ្ចូល'}</p>
            <p><strong>លេខទូរសព្ទ:</strong> ${printData.customer.phone || 'មិនបានបញ្ចូល'}</p>
            <p><strong>អាសយដ្ឋាន:</strong> ${printData.customer.address || 'មិនបានបញ្ចូល'}</p>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 5%">#</th>
                <th style="width: 35%">ផលិតផល</th>
                <th style="width: 15%">ទម្ងន់</th>
                <th style="width: 10%">ចំនួន</th>
                <th style="width: 15%">តម្លៃដេញ</th>
                <th style="width: 20%">សរុប</th>
              </tr>
            </thead>
            <tbody>
              ${printData.items.map((item: any, index: number) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${item.prod_name || 'មិនបានបញ្ចូល'}</td>
                  <td class="text-center">${item.weight || '-'}</td>
                  <td class="text-center">${item.quantity || 0}</td>
                  <td class="text-right">$${(item.pawn_price || 0).toFixed(2)}</td>
                  <td class="text-right font-bold">$${(item.subtotal || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p><strong>សរុបប្រាក់ដេញ: $${(printData.totals.total_amount || 0).toFixed(2)}</strong></p>
            <p><strong>ការប្រាក់រយៈពេល ${printData.pawn_info.period || 0} ខែ: $${(printData.totals.interest_amount || 0).toFixed(2)}</strong></p>
            <p class="grand-total">សរុបត្រូវបង់វិញ: $${(printData.totals.total_with_interest || 0).toFixed(2)}</p>
          </div>

          <div class="warning-box">
            <h4 style="color: #92400e; margin-bottom: 10px;">លក្ខខណ្ឌដេញ:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #92400e;">
              <li>ត្រូវមកបង់ការប្រាក់រៀងរាល់ខែ</li>
              <li>ប្រសិនបើមិនបង់ការប្រាក់ក្នុងរយៈពេល 3 ខែ របស់នឹងត្រូវលក់</li>
              <li>សូមរក្សាវិក្កយបត្រនេះសម្រាប់យកទំនិញមកវិញ</li>
              <li>ការផុតកំណត់: ${printData.header.due_date || 'N/A'}</li>
            </ul>
          </div>

          <div class="footer">
            <p><strong>${printData.footer?.thank_you || 'អរគុណសម្រាប់ការទុកចិត្ត!'}</strong></p>
            <p>${printData.footer?.note || 'សូមអាននិងយល់ដល់លក្ខខណ្ឌនៃការដេញ។'}</p>
          </div>
        </body>
        </html>
      `;
    } catch (error) {
      console.error('❌ Error generating print HTML:', error);
      showNotification('error', 'មានបញ្ហាក្នុងការបង្កើតទំព័របោះពុម្ព');
      return '<html><body><h1>Error generating print content</h1></body></html>';
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
    // Reload last pawns to show the new pawn
    loadLastPawns();
  };

  const handleClientFound = (client: Client | null) => {
    setFoundClient(client);
  };

  const handleFormDataChange = (newFormData: FormData) => {
    setFormData(newFormData);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'សកម្ម':
        return { bg: colors.success[100], text: colors.success[700] };
      case 'overdue':
      case 'ហួសកំណត់':
        return { bg: colors.error[100], text: colors.error[700] };
      case 'completed':
      case 'បានបញ្ចប់':
        return { bg: colors.secondary[100], text: colors.secondary[700] };
      default:
        return { bg: colors.warning[100], text: colors.warning[700] };
    }
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
        <div className="h-full flex flex-col gap-4">
          
          {/* Top Row - Client Form and Pawn Form */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
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

          {/* Bottom Row - Last Pawns Panel */}
          <div className="flex-1 min-h-0">
            <Card 
              title="ដេញចុងក្រោយ"
              className="h-full flex flex-col"
              action={
                <Button
                  onClick={loadLastPawns}
                  loading={loadingLastPawns}
                  icon={<RefreshCw className="h-4 w-4" />}
                  size="sm"
                  variant="secondary"
                >
                  ទាញយកថ្មី
                </Button>
              }
            >
              <div className="flex-1 overflow-y-auto">
                {loadingLastPawns ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" style={{ color: colors.primary[500] }} />
                      <p style={{ color: colors.secondary[600] }}>កំពុងទាញយកទិន្នន័យ...</p>
                    </div>
                  </div>
                ) : lastPawns.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="h-12 w-12 mx-auto mb-4" style={{ color: colors.secondary[400] }} />
                    <p style={{ color: colors.secondary[600] }}>មិនមានដេញណាមួយទេ</p>
                    <p className="text-xs mt-2" style={{ color: colors.secondary[500] }}>
                      ដេញថ្មីនឹងបង្ហាញនៅទីនេះ
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                    {lastPawns.map((pawn, index) => (
                      <div 
                        key={pawn.pawn_info.pawn_id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        style={{ 
                          borderColor: colors.secondary[200],
                          backgroundColor: index === 0 ? colors.error[25] : 'white'
                        }}
                      >
                        {/* Pawn Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{
                                backgroundColor: index === 0 ? colors.error[100] : colors.primary[100],
                                color: index === 0 ? colors.error[700] : colors.primary[700]
                              }}
                            >
                              #{pawn.pawn_info.pawn_id}
                              {index === 0 && ' (ថ្មីបំផុត)'}
                            </div>
                            <div 
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{
                                backgroundColor: getStatusColor(pawn.pawn_info.status).bg,
                                color: getStatusColor(pawn.pawn_info.status).text
                              }}
                            >
                              {pawn.pawn_info.status}
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handlePrintPawn(pawn.pawn_info.pawn_id)}
                            loading={printing[pawn.pawn_info.pawn_id]}
                            icon={<Printer className="h-4 w-4" />}
                            size="sm"
                            variant="secondary"
                            disabled={printing[pawn.pawn_info.pawn_id]}
                          >
                            {printing[pawn.pawn_info.pawn_id] ? 'កំពុងបោះពុម្ព...' : 'បោះពុម្ព'}
                          </Button>
                        </div>

                        {/* Pawn Date */}
                        <div className="flex items-center text-sm mb-3" style={{ color: colors.secondary[600] }}>
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(pawn.pawn_info.pawn_date).toLocaleDateString('km-KH')}
                        </div>

                        {/* Due Date Warning */}
                        <div className="flex items-center text-sm mb-3">
                          <Clock className="h-4 w-4 mr-1" style={{ color: colors.warning[500] }} />
                          <span style={{ color: colors.warning[600] }}>
                            ផុតកំណត់: {new Date(pawn.pawn_info.due_date).toLocaleDateString('km-KH')}
                          </span>
                        </div>

                        {/* Customer Info */}
                        <div className="mb-4">
                          <div className="flex items-center mb-1">
                            <User className="h-4 w-4 mr-2" style={{ color: colors.secondary[500] }} />
                            <span className="text-sm font-medium" style={{ color: colors.secondary[700] }}>
                              {pawn.client_info.cus_name}
                            </span>
                          </div>
                          <div className="flex items-center mb-1">
                            <Phone className="h-4 w-4 mr-2" style={{ color: colors.secondary[500] }} />
                            <span className="text-sm" style={{ color: colors.secondary[600] }}>
                              {pawn.client_info.phone_number}
                            </span>
                          </div>
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: colors.secondary[500] }} />
                            <span className="text-sm" style={{ color: colors.secondary[600] }}>
                              {pawn.client_info.address || 'មិនបានបញ្ចូល'}
                            </span>
                          </div>
                        </div>

                        {/* Pawn Summary */}
                        <div className="space-y-2 mb-4 p-3 rounded" style={{ backgroundColor: colors.secondary[50] }}>
                          <div className="flex justify-between">
                            <span className="text-sm" style={{ color: colors.secondary[600] }}>ផលិតផល:</span>
                            <span className="text-sm font-medium">{pawn.summary.total_products} ប្រភេទ</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm" style={{ color: colors.secondary[600] }}>ប្រាក់ដេញ:</span>
                            <span className="text-sm font-medium">${pawn.summary.total_amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm" style={{ color: colors.secondary[600] }}>ការប្រាក់:</span>
                            <span className="text-sm font-medium" style={{ color: colors.warning[600] }}>
                              ${pawn.summary.interest_amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2" style={{ borderColor: colors.secondary[200] }}>
                            <span className="text-sm font-medium" style={{ color: colors.secondary[700] }}>សរុបត្រូវបង់:</span>
                            <span 
                              className="text-sm font-bold"
                              style={{ color: colors.error[600] }}
                            >
                              ${pawn.summary.total_with_interest.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Products List */}
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2" style={{ color: colors.secondary[500] }} />
                            <span className="text-sm font-medium" style={{ color: colors.secondary[700] }}>
                              បញ្ជីទំនិញដេញ
                            </span>
                          </div>
                          <div className="space-y-1">
                            {pawn.products.slice(0, 3).map((product, prodIndex) => (
                              <div 
                                key={prodIndex}
                                className="flex justify-between items-center py-1 px-2 rounded text-sm"
                                style={{ backgroundColor: colors.secondary[25] }}
                              >
                                <span className="truncate mr-2" title={product.prod_name}>
                                  {product.prod_name}
                                </span>
                                <div className="flex items-center space-x-2 text-xs flex-shrink-0" style={{ color: colors.secondary[600] }}>
                                  <span>{product.pawn_weight}</span>
                                  <span className="font-medium">${product.subtotal.toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                            {pawn.products.length > 3 && (
                              <div className="text-xs text-center py-1" style={{ color: colors.secondary[500] }}>
                                ... និង {pawn.products.length - 3} ផលិតផលផ្សេងទៀត
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
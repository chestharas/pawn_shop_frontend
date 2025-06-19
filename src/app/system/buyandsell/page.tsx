// buyandsell/page.tsx - Complete Fixed Version
'use client';

import { useState, useEffect } from 'react';
import { clientsApi, productsApi, ordersApi } from '@/lib/api'; // Added ordersApi import
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
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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
  const [printing, setPrinting] = useState<{ [key: number]: boolean }>({});

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
          showNotification('success', `ទាញយកការបញ្ជាទិញចុងក្រោយ ${response.result.length} ចំនួនបានជោគជ័យ`);
        }
      } else {
        console.log('No orders found:', response);
        setLastOrders([]);
        showNotification('error', response.message || 'មិនអាចទាញយកការបញ្ជាទិញចុងក្រោយបានទេ');
      }
    } catch (error: any) {
      console.error('Error loading last orders:', error);
      
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

  // Print Order Function - Using API
  const handlePrintOrder = async (orderId: number) => {
    setPrinting(prev => ({ ...prev, [orderId]: true }));
    
    try {
      console.log(`🖨️ Starting print for order ID: ${orderId}`);
      const response = await ordersApi.printOrder(orderId);
      
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
        console.log('Print failed:', response);
        showNotification('error', response.message || 'មានបញ្ហាក្នុងការរៀបចំទិន្នន័យសម្រាប់បោះពុម្ព');
      }
    } catch (error: any) {
      console.error('Error printing order:', error);
      
      // Better error handling for print functionality
      if (error.message?.includes('Unexpected token') || error.message?.includes('JSON')) {
        showNotification('error', 'Print API មិនត្រឹមត្រូវ - សូមពិនិត្យ backend');
      } else if (error.response?.status === 404) {
        showNotification('error', `ការបញ្ជាទិញលេខ ${orderId} មិនត្រូវបានរកឃើញ`);
      } else if (error.response?.status === 401) {
        showNotification('error', 'សូមចូលប្រើប្រាស់ម្តងទៀត');
      } else {
        showNotification('error', 'មានបញ្ហាក្នុងការបោះពុម្ព');
      }
    } finally {
      setPrinting(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Generate Print HTML Function - Enhanced with better error handling
  const generatePrintHTML = (printData: any) => {
    try {
      // Validate print data structure
      if (!printData || !printData.header || !printData.customer || !printData.items || !printData.totals) {
        console.error('Invalid print data structure:', printData);
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
          <title>វិក្កយបត្រ #${printData.header.order_id || 'N/A'}</title>
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
              color: #2563eb;
              margin-bottom: 10px;
              font-size: 24px;
            }
            .order-info { 
              margin-bottom: 20px; 
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
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
              background-color: #2563eb; 
              font-weight: bold;
              color: white;
            }
            .items-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .items-table tr:hover {
              background-color: #e3f2fd;
            }
            .totals { 
              text-align: right; 
              margin-bottom: 20px; 
              background-color: #fff9e6;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #fbbf24;
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
            <h1>${printData.header.title || 'វិក្កយបត្រ'}</h1>
            <p><strong>${printData.header.order_id || 'N/A'}</strong></p>
            <p>កាលបរិច្ចេទបញ្ជាទិញ: ${printData.header.date || 'N/A'}</p>
            <p>បោះពុម្ពនៅ: ${currentDate}</p>
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
                <th style="width: 25%">ផលិតផល</th>
                <th style="width: 10%">ទម្ងន់</th>
                <th style="width: 10%">ចំនួន</th>
                <th style="width: 12%">តម្លៃលក់</th>
                <th style="width: 12%">ថ្លៃកម្រធ្វើ</th>
                <th style="width: 12%">តម្លៃទិញ</th>
                <th style="width: 14%">សរុប</th>
              </tr>
            </thead>
            <tbody>
              ${printData.items.map((item: any, index: number) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${item.prod_name || 'មិនបានបញ្ចូល'}</td>
                  <td class="text-center">${item.weight || '-'}</td>
                  <td class="text-center">${item.quantity || 0}</td>
                  <td class="text-right">$${(item.unit_price || 0).toFixed(2)}</td>
                  <td class="text-right">$${(item.labor_cost || 0).toFixed(2)}</td>
                  <td class="text-right">$${(item.buy_price || 0).toFixed(2)}</td>
                  <td class="text-right font-bold">$${(item.subtotal || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p><strong>សរុបរង: $${(printData.totals.subtotal || 0).toFixed(2)}</strong></p>
            <p><strong>ថ្លៃកម្រធ្វើសរុប: $${(printData.totals.total_labor || 0).toFixed(2)}</strong></p>
            <p class="grand-total">សរុបទាំងអស់: $${(printData.totals.grand_total || 0).toFixed(2)}</p>
            <p><strong>ប្រាក់កក់: $${(printData.totals.deposit || 0).toFixed(2)}</strong></p>
            <p style="color: ${(printData.totals.balance_due || 0) > 0 ? '#dc2626' : '#16a34a'}; font-weight: bold;">
              ប្រាក់នៅសល់: $${(printData.totals.balance_due || 0).toFixed(2)}
            </p>
          </div>

          <div class="footer">
            <p><strong>${printData.footer?.thank_you || 'អរគុណសម្រាប់ការទិញ!'}</strong></p>
            <p>${printData.footer?.note || 'សូមរក្សាវិក្កយបត្រនេះសម្រាប់ការយោង។'}</p>
          </div>
        </body>
        </html>
      `;
    } catch (error) {
      console.error('Error generating print HTML:', error);
      showNotification('error', 'មានបញ្ហាក្នុងការបង្កើតទំព័របោះពុម្ព');
      return '<html><body><h1>Error generating print content</h1></body></html>';
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
      <div className="flex-1 p-4 overflow-hidden" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        <div className="h-full flex flex-col gap-4">
          
          {/* Top Row - Client Form and Order Form */}
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
          <div className="flex-1 min-h-0">
            <Card 
              title="ការបញ្ជាទិញចុងក្រោយ"
              className="h-full flex flex-col"
              action={
                <Button
                  onClick={loadLastOrders}
                  loading={loadingLastOrders}
                  icon={<RefreshCw className="h-4 w-4" />}
                  size="sm"
                  variant="secondary"
                >
                  ទាញយកថ្មី
                </Button>
              }
            >
              <div className="flex-1 overflow-y-auto">
                {loadingLastOrders ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" style={{ color: colors.primary[500] }} />
                      <p style={{ color: colors.secondary[600] }}>កំពុងទាញយកទិន្នន័យ...</p>
                    </div>
                  </div>
                ) : lastOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-4" style={{ color: colors.secondary[400] }} />
                    <p style={{ color: colors.secondary[600] }}>មិនមានការបញ្ជាទិញណាមួយទេ</p>
                    <p className="text-xs mt-2" style={{ color: colors.secondary[500] }}>
                      ការបញ្ជាទិញថ្មីនឹងបង្ហាញនៅទីនេះ
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                    {lastOrders.map((order, index) => (
                      <div 
                        key={order.order_info.order_id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        style={{ 
                          borderColor: colors.secondary[200],
                          backgroundColor: index === 0 ? colors.success[25] : 'white'
                        }}
                      >
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{
                                backgroundColor: index === 0 ? colors.success[100] : colors.primary[100],
                                color: index === 0 ? colors.success[700] : colors.primary[700]
                              }}
                            >
                              #{order.order_info.order_id}
                              {index === 0 && ' (ថ្មីបំផុត)'}
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handlePrintOrder(order.order_info.order_id)}
                            loading={printing[order.order_info.order_id]}
                            icon={<Printer className="h-4 w-4" />}
                            size="sm"
                            variant="secondary"
                            disabled={printing[order.order_info.order_id]}
                          >
                            {printing[order.order_info.order_id] ? 'កំពុងបោះពុម្ព...' : 'បោះពុម្ព'}
                          </Button>
                        </div>

                        {/* Order Date */}
                        <div className="flex items-center text-sm mb-3" style={{ color: colors.secondary[600] }}>
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(order.order_info.order_date).toLocaleDateString('km-KH')}
                        </div>

                        {/* Customer Info */}
                        <div className="mb-4">
                          <div className="flex items-center mb-1">
                            <User className="h-4 w-4 mr-2" style={{ color: colors.secondary[500] }} />
                            <span className="text-sm font-medium" style={{ color: colors.secondary[700] }}>
                              {order.client_info.cus_name}
                            </span>
                          </div>
                          <div className="flex items-center mb-1">
                            <Phone className="h-4 w-4 mr-2" style={{ color: colors.secondary[500] }} />
                            <span className="text-sm" style={{ color: colors.secondary[600] }}>
                              {order.client_info.phone_number}
                            </span>
                          </div>
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: colors.secondary[500] }} />
                            <span className="text-sm" style={{ color: colors.secondary[600] }}>
                              {order.client_info.address || 'មិនបានបញ្ចូល'}
                            </span>
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-2 mb-4 p-3 rounded" style={{ backgroundColor: colors.secondary[50] }}>
                          <div className="flex justify-between">
                            <span className="text-sm" style={{ color: colors.secondary[600] }}>ផលិតផល:</span>
                            <span className="text-sm font-medium">{order.summary.total_products} ប្រភេទ</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm" style={{ color: colors.secondary[600] }}>សរុប:</span>
                            <span className="text-sm font-medium">${order.summary.total_amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm" style={{ color: colors.secondary[600] }}>ប្រាក់កក់:</span>
                            <span className="text-sm font-medium">${order.summary.deposit_paid.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2" style={{ borderColor: colors.secondary[200] }}>
                            <span className="text-sm font-medium" style={{ color: colors.secondary[700] }}>នៅសល់:</span>
                            <span 
                              className="text-sm font-bold"
                              style={{ 
                                color: order.summary.balance_due > 0 ? colors.error[600] : colors.success[600]
                              }}
                            >
                              ${order.summary.balance_due.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Products List */}
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2" style={{ color: colors.secondary[500] }} />
                            <span className="text-sm font-medium" style={{ color: colors.secondary[700] }}>
                              បញ្ជីផលិតផល
                            </span>
                          </div>
                          <div className="space-y-1">
                            {order.products.slice(0, 3).map((product, prodIndex) => (
                              <div 
                                key={prodIndex}
                                className="flex justify-between items-center py-1 px-2 rounded text-sm"
                                style={{ backgroundColor: colors.secondary[25] }}
                              >
                                <span className="truncate mr-2" title={product.prod_name}>
                                  {product.prod_name}
                                </span>
                                <div className="flex items-center space-x-2 text-xs flex-shrink-0" style={{ color: colors.secondary[600] }}>
                                  <span>x{product.order_amount}</span>
                                  <span className="font-medium">${product.subtotal.toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                            {order.products.length > 3 && (
                              <div className="text-xs text-center py-1" style={{ color: colors.secondary[500] }}>
                                ... និង {order.products.length - 3} ផលិតផលផ្សេងទៀត
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
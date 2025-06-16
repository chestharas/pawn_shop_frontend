'use client';

import { useState, useEffect } from 'react';
import { ordersApi } from '@/lib/api';
import { 
  Search, 
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  DollarSign,
  User,
  Phone,
  Calendar,
  ShoppingCart,
  MapPin,
  ArrowLeft,
  Package
} from 'lucide-react';

interface Client {
  cus_id: number;
  cus_name: string;
  phone_number: string;
  address: string;
}

interface Product {
  prod_name: string;
  prod_id: number;
  order_weight: string;
  order_amount: number;
  product_sell_price: number;
  product_labor_cost: number;
  product_buy_price: number;
}

interface Order {
  order_id: number;
  order_deposit: number;
  order_date: string;
  products: Product[];
}

interface ClientDetail {
  client_info: {
    cus_id: number;
    cus_name: string;
    address: string;
    phone_number: string;
  };
  orders: Order[];
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function OrderPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientDetail, setClientDetail] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [showClientDetail, setShowClientDetail] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getClientOrders();
      if (response.code === 200 && response.result) {
        setClients(response.result);
      } else {
        showNotification('error', 'មិនអាចទាញយកបញ្ជីអតិថិជនបានទេ');
      }
    } catch (error: any) {
      console.error('Error loading clients:', error);
      showNotification('error', 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យអតិថិជន');
    } finally {
      setLoading(false);
    }
  };

  const loadClientDetail = async (clientId: number) => {
    try {
      setDetailLoading(true);
      const response = await ordersApi.getClientOrderById(clientId.toString());
      if (response.code === 200 && response.result) {
        setClientDetail(response.result);
        setShowClientDetail(true);
      } else {
        showNotification('error', 'មិនអាចទាញយកព័ត៌មានលម្អិតអតិថិជនបានទេ');
      }
    } catch (error: any) {
      console.error('Error loading client detail:', error);
      showNotification('error', 'មានបញ្ហាក្នុងការទាញយកព័ត៌មានលម្អិតអតិថិជន');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewMore = (client: Client) => {
    loadClientDetail(client.cus_id);
  };

  const handleBackToClients = () => {
    setShowClientDetail(false);
    setClientDetail(null);
  };

  const filteredClients = clients.filter(client =>
    (client.cus_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (client.phone_number || '').includes(searchTerm) ||
    (client.cus_id?.toString() || '').includes(searchTerm) ||
    (client.address?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const calculateOrderTotal = (order: Order) => {
    return order.products.reduce((total, product) => {
      return total + (product.product_sell_price * product.order_amount);
    }, 0);
  };

  const calculateOrderProfit = (order: Order) => {
    return order.products.reduce((total, product) => {
      const profit = (product.product_sell_price - product.product_buy_price - product.product_labor_cost) * product.order_amount;
      return total + profit;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      {/* <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {showClientDetail ? 'ព័ត៌មានលម្អិតអតិថិជន' : 'គ្រប់គ្រងអតិថិជន'}
              </h1>
              <p className="text-gray-600 mt-1">
                {showClientDetail && clientDetail 
                  ? `ព័ត៌មានអតិថិជន ${clientDetail.client_info.cus_name}`
                  : 'បញ្ជីអតិថិជននិងកម្ម័ងរបស់ពួកគេ'
                }
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {!showClientDetail ? (
        // Clients List View
        <div className="bg-white rounded-lg shadow">
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ស្វែងរកអតិថិជនតាមឈ្មោះ, លេខទូរសព្ទ, ID, ឬអាសយដ្ឋាន..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Clients Content */}
          {/* <div className="p-6"> */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">កំពុងទាញយកទិន្នន័យ...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">មិនមានអតិថិជនទេ</p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 border border-gray-200 rounded-t-lg">
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                          <div className="text-sm font-semibold text-gray-700">ID</div>
                          <div className="text-sm font-semibold text-gray-700">ឈ្មោះ</div>
                          <div className="text-sm font-semibold text-gray-700">លេខទូរសព្ទ</div>
                          <div className="text-sm font-semibold text-gray-700">អាសយដ្ឋាន</div>
                        </div>
                        <div className="w-20 text-sm font-semibold text-gray-700 text-center ml-4">សកម្មភាព</div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200 border-l border-r border-b border-gray-200 rounded-b-lg">
                      {filteredClients.map((client, index) => (
                        <div 
                          key={client.cus_id} 
                          className={`${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-blue-50 transition-colors duration-200`}
                        >
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                              {/* ID */}
                              <div className="min-w-0">
                                <span className="text-sm font-mono text-gray-900">{client.cus_id}</span>
                              </div>

                              {/* Name */}
                              <div className="min-w-0">
                                <span className="text-sm font-medium text-gray-900 truncate block">{client.cus_name}</span>
                              </div>

                              {/* Phone Number */}
                              <div className="min-w-0">
                                <a href={`tel:${client.phone_number}`} className="text-sm text-gray-600 hover:text-blue-600 hover:underline truncate block">
                                  {client.phone_number}
                                </a>
                              </div>

                              {/* Address */}
                              <div className="min-w-0">
                                <span className="text-sm text-gray-600 truncate block" title={client.address}>
                                  {client.address}
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleViewMore(client)}
                              disabled={detailLoading}
                              className="w-20 ml-4 inline-flex items-center justify-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                            >
                              {detailLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Client Detail View
        <div className="space-y-6">
          {detailLoading ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">កំពុងទាញយកព័ត៌មានលម្អិត...</span>
              </div>
            </div>
          ) : clientDetail ? (
            <>
              {/* Client Info Card with Sticky Header */}
              <div className="bg-white rounded-lg shadow">
                <div className="sticky top-0 z-10 bg-white p-6 border-b border-gray-100 rounded-t-lg shadow-sm">
                  <div className="flex items-center gap-4">
                    {showClientDetail && (
                      <button
                        onClick={handleBackToClients}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0 self-center"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">ID អតិថិជន</p>
                            <p className="font-semibold text-gray-900">{clientDetail.client_info.cus_id}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">ឈ្មោះ</p>
                            <p className="font-semibold text-gray-900">{clientDetail.client_info.cus_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <Phone className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">លេខទូរសព្ទ</p>
                            <p className="font-medium text-gray-900">{clientDetail.client_info.phone_number}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mt-0.5">
                            <MapPin className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-0.5">អាសយដ្ឋាន</p>
                            <p className="font-medium text-gray-900 break-words leading-relaxed">{clientDetail.client_info.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders List */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  {clientDetail.orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">មិនមានកម្ម័ងទេ</p>
                      <p className="text-gray-400 text-sm mt-2">កម្ម័ងនឹងបង្ហាញនៅទីនេះ នៅពេលដែលមានការបញ្ជាទិញ</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {clientDetail.orders.map((order) => (
                        <div key={order.order_id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          {/* Enhanced Order Header */}
                          <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">កម្ម័ង #{order.order_id}</h4>
                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(order.order_date).toLocaleDateString('km-KH')}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-1">ប្រាក់កក់</p>
                              <p className="text-xl font-bold text-blue-600">${order.order_deposit}</p>
                            </div>
                          </div>

                          {/* Products Section */}
                          <div className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h5 className="text-lg font-semibold text-gray-900 flex items-center">
                                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                                  បញ្ជីទំនិញ
                                </h5>
                                <span className="text-sm text-gray-500">({order.products.length} ប្រភេទ)</span>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg overflow-hidden">
                                {/* Product List Header */}
                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                  <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
                                    <div className="col-span-2">ឈ្មោះទំនិញ</div>
                                    <div className="text-center">ទម្ងន់</div>
                                    <div className="text-center">បរិមាណ</div>
                                    <div className="text-center">តម្លៃ/ឯកតា</div>
                                    <div className="text-center">សរុប</div>
                                  </div>
                                </div>
                                
                                {/* Product List Items */}
                                <div className="divide-y divide-gray-200">
                                  {order.products.map((product, index) => (
                                    <div key={`${product.prod_id}-${index}`} className="px-4 py-3 hover:bg-gray-50">
                                      <div className="grid grid-cols-6 gap-4 items-center">
                                        <div className="col-span-2 flex items-center space-x-3">
                                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Package className="h-5 w-5 text-blue-600" />
                                          </div>
                                          <div>
                                            <p className="font-medium text-gray-900">{product.prod_name}</p>
                                            <p className="text-xs text-gray-500">ID: {product.prod_id}</p>
                                          </div>
                                        </div>
                                        <div className="text-center text-sm text-gray-600">
                                          {product.order_weight}
                                        </div>
                                        <div className="text-center">
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {product.order_amount}
                                          </span>
                                        </div>
                                        <div className="text-center font-medium text-gray-900">
                                          ${product.product_sell_price}
                                        </div>
                                        <div className="text-center font-semibold text-gray-900">
                                          ${product.product_sell_price * product.order_amount}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
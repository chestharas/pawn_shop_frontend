// components/ui/LastOrders.tsx
'use client';

import { useState } from 'react';
import { colors } from '@/lib/colors';
import { 
  Clock,
  User,
  Package,
  Printer,
  RefreshCw,
  Calendar,
  Phone,
  MapPin
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { printOrder } from '@/lib/printOrder'; // Import the print utility

// Order Interfaces
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

interface LastOrdersProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  onNotification: (type: 'success' | 'error', message: string) => void;
}

export default function LastOrders({ 
  orders, 
  loading, 
  onRefresh, 
  onNotification 
}: LastOrdersProps) {
  const [printing, setPrinting] = useState<{ [key: number]: boolean }>({});

  // Simplified print handler using the utility function
  const handlePrintOrder = async (orderId: number) => {
    setPrinting(prev => ({ ...prev, [orderId]: true }));
    
    try {
      await printOrder(orderId, onNotification);
    } catch (error) {
      // Error handling is already done in the print utility
      console.error('Print failed:', error);
    } finally {
      setPrinting(prev => ({ ...prev, [orderId]: false }));
    }
  };

  return (
    <Card 
      title="ការបញ្ជាទិញចុងក្រោយ"
      className="h-full flex flex-col"
      action={
        <Button
          onClick={onRefresh}
          loading={loading}
          icon={<RefreshCw className="h-4 w-4" />}
          size="sm"
          variant="secondary"
        >
          ទាញយកថ្មី
        </Button>
      }
    >
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" style={{ color: colors.primary[500] }} />
              <p style={{ color: colors.secondary[600] }}>កំពុងទាញយកទិន្នន័យ...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-4" style={{ color: colors.secondary[400] }} />
            <p style={{ color: colors.secondary[600] }}>មិនមានការបញ្ជាទិញណាមួយទេ</p>
            <p className="text-xs mt-2" style={{ color: colors.secondary[500] }}>
              ការបញ្ជាទិញថ្មីនឹងបង្ហាញនៅទីនេះ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {orders.map((order, index) => (
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
  );
}
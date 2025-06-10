// buyandsell/OrderForm.tsx
'use client';

import { useState } from 'react';
import { ordersApi } from '@/lib/api';
import { 
  Plus,
  Minus,
  ShoppingCart,
  Package,
  Phone
} from 'lucide-react';
import { colors } from '@/lib/colors';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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

interface OrderProductDetail {
  prod_id: number;
  prod_name: string;
  order_weight: string;
  order_amount: number;
  product_sell_price: number;
  product_labor_cost: number;
  product_buy_price: number;
}

interface OrderData {
  order_date: string;
  order_deposit: number;
  order_product_detail: OrderProductDetail[];
}

interface FormData {
  cus_name: string;
  address: string;
  phone_number: string;
}

interface OrderFormProps {
  products: Product[];
  onNotification: (type: 'success' | 'error', message: string) => void;
  onOrderCreated: () => void;
  formData: FormData;
  foundClient: Client | null;
}

export default function OrderForm({
  products,
  onNotification,
  onOrderCreated,
  formData,
  foundClient
}: OrderFormProps) {
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderData, setOrderData] = useState<OrderData>({
    order_date: new Date().toISOString().split('T')[0],
    order_deposit: 0,
    order_product_detail: []
  });

  const removeProductFromOrder = (index: number) => {
    setOrderData(prev => ({
      ...prev,
      order_product_detail: prev.order_product_detail?.filter((_, i) => i !== index) || []
    }));
  };

  const updateOrderProduct = (index: number, field: keyof OrderProductDetail, value: any) => {
    setOrderData(prev => ({
      ...prev,
      order_product_detail: prev.order_product_detail?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  const addProductToOrder = () => {
    setOrderData(prev => ({
      ...prev,
      order_product_detail: [
        ...(prev.order_product_detail || []),
        {
          prod_id: 0,
          prod_name: '',
          order_weight: '',
          order_amount: 0,
          product_sell_price: 0,
          product_labor_cost: 0,
          product_buy_price: 0
        }
      ]
    }));
  };

  const resetOrderForm = () => {
    setOrderData({
      order_date: new Date().toISOString().split('T')[0],
      order_deposit: 0,
      order_product_detail: []
    });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get phone number from either formData or foundClient
    const customerPhone = formData.phone_number || foundClient?.phone_number;
    const customerName = formData.cus_name || foundClient?.cus_name;
    const customerAddress = formData.address || foundClient?.address;
    const customerId = foundClient?.cus_id || 0;

    if (!customerPhone?.trim()) {
      onNotification('error', 'សូមបញ្ចូលលេខទូរសព្ទអតិថិជន');
      return;
    }

    if (!orderData.order_product_detail || orderData.order_product_detail.length === 0) {
      onNotification('error', 'សូមបន្ថែមផលិតផលយ៉ាងហោចណាស់មួយ');
      return;
    }

    setSubmittingOrder(true);

    try {
      const orderPayload = {
        order_id: 0,
        cus_id: customerId,
        cus_name: customerName || '',
        address: customerAddress || '',
        phone_number: customerPhone,
        order_date: orderData.order_date,
        order_deposit: orderData.order_deposit || 0,
        order_product_detail: orderData.order_product_detail
      };

      const response = await ordersApi.create(orderPayload);
      
      if (response.code === 200) {
        onNotification('success', 'ការបញ្ជាទិញត្រូវបានបង្កើតដោយជោគជ័យ');
        resetOrderForm();
        onOrderCreated();
      } else {
        onNotification('error', response.message || 'មានបញ្ហាក្នុងការបង្កើតការបញ្ជាទិញ');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMessage = error.response?.data?.message || 'មានបញ្ហាក្នុងការបង្កើតការបញ្ជាទិញ';
      onNotification('error', errorMessage);
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <Card title="បង្កើតការបញ្ជាទិញ" className="h-full flex flex-col">
      <form onSubmit={handleOrderSubmit} className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1 overflow-y-auto max-h-96">
          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                កាលបរិច្ចេទបញ្ជាទិញ
              </label>
              <input
                type="date"
                value={orderData.order_date}
                onChange={(e) => setOrderData({ ...orderData, order_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: colors.secondary[300] }}
                required
                disabled={!formData.phone_number.trim()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                ប្រាក់កក់
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={orderData.order_deposit}
                onChange={(e) => setOrderData({ ...orderData, order_deposit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: colors.secondary[300] }}
                placeholder="0.00"
                disabled={!formData.phone_number.trim()}
              />
            </div>
          </div>

          {/* Products Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold" style={{ color: colors.secondary[800] }}>
                បញ្ជីផលិតផល
              </h3>
              <Button
                type="button"
                onClick={addProductToOrder}
                icon={<Plus className="h-4 w-4" />}
                size="sm"
                disabled={!formData.phone_number.trim()}
              >
                បន្ថែមផលិតផល
              </Button>
            </div>

            {!formData.phone_number.trim() ? (
              <div 
                className="p-8 text-center border-2 border-dashed rounded-lg"
                style={{ borderColor: colors.secondary[200], backgroundColor: colors.secondary[25] }}
              >
                <Phone className="h-8 w-8 mx-auto mb-2" style={{ color: colors.secondary[400] }} />
                <p className="text-sm" style={{ color: colors.secondary[600] }}>
                  សូមបញ្ចូលលេខទូរសព្ទអតិថិជនក្នុងផ្នែកខាងឆ្វេងមុនសិន
                </p>
              </div>
            ) : orderData.order_product_detail && orderData.order_product_detail.length > 0 ? (
              <div className="space-y-3">
                {orderData.order_product_detail.map((product, index) => (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg"
                    style={{ borderColor: colors.secondary[200], backgroundColor: colors.secondary[25] }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium" style={{ color: colors.secondary[700] }}>
                        ផលិតផលទី {index + 1}
                      </h4>
                      <Button
                        type="button"
                        onClick={() => removeProductFromOrder(index)}
                        icon={<Minus className="h-4 w-4" />}
                        variant="secondary"
                        size="sm"
                      >
                        លុប
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.secondary[600] }}>
                          ផលិតផល
                        </label>
                        <select
                          value={product.prod_id}
                          onChange={(e) => {
                            const selectedProduct = products.find(p => p.id === parseInt(e.target.value));
                            updateOrderProduct(index, 'prod_id', parseInt(e.target.value));
                            updateOrderProduct(index, 'prod_name', selectedProduct?.name || '');
                          }}
                          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          style={{ borderColor: colors.secondary[300] }}
                        >
                          <option value={0}>ជ្រើសរើសផលិតផល</option>
                          {products.map(prod => (
                            <option key={prod.id} value={prod.id}>{prod.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.secondary[600] }}>
                          ទម្ងន់
                        </label>
                        <input
                          type="text"
                          value={product.order_weight}
                          onChange={(e) => updateOrderProduct(index, 'order_weight', e.target.value)}
                          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          style={{ borderColor: colors.secondary[300] }}
                          placeholder="ទម្ងន់"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.secondary[600] }}>
                          ចំនួន
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={product.order_amount}
                          onChange={(e) => updateOrderProduct(index, 'order_amount', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          style={{ borderColor: colors.secondary[300] }}
                          placeholder="ចំនួន"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.secondary[600] }}>
                          តម្លៃលក់
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.product_sell_price}
                          onChange={(e) => updateOrderProduct(index, 'product_sell_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          style={{ borderColor: colors.secondary[300] }}
                          placeholder="តម្លៃលក់"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.secondary[600] }}>
                          ថ្លៃកម្រធ្វើ
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.product_labor_cost}
                          onChange={(e) => updateOrderProduct(index, 'product_labor_cost', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          style={{ borderColor: colors.secondary[300] }}
                          placeholder="ថ្លៃកម្រធ្វើ"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.secondary[600] }}>
                          តម្លៃទិញ
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.product_buy_price}
                          onChange={(e) => updateOrderProduct(index, 'product_buy_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          style={{ borderColor: colors.secondary[300] }}
                          placeholder="តម្លៃទិញ"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                className="p-8 text-center border-2 border-dashed rounded-lg"
                style={{ borderColor: colors.secondary[200] }}
              >
                <Package className="h-8 w-8 mx-auto mb-2" style={{ color: colors.secondary[400] }} />
                <p className="text-sm" style={{ color: colors.secondary[600] }}>
                  មិនទាន់មានផលិតផលណាមួយនៅឡើយទេ
                </p>
                <p className="text-xs mt-1" style={{ color: colors.secondary[500] }}>
                  ចុចប៊ូតុង "បន្ថែមផលិតផល" ដើម្បីចាប់ផ្តើម
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 mt-auto border-t" style={{ borderTopColor: colors.secondary[200] }}>
          <Button
            type="submit"
            disabled={submittingOrder || !formData.phone_number.trim()}
            loading={submittingOrder}
            icon={<ShoppingCart className="h-4 w-4" />}
            className="px-6"
          >
            បង្កើតការបញ្ជាទិញ
          </Button>
        </div>
      </form>
    </Card>
  );
}
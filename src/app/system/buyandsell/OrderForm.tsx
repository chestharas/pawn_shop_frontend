// buyandsell/OrderForm.tsx - Updated with Custom Product Input
'use client';

import { useState, useEffect } from 'react';
import { ordersApi } from '@/lib/api';
import { 
  Plus,
  Minus,
  ShoppingCart,
  Package,
  Phone,
  RotateCcw,
  Edit3
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
  is_custom: boolean; // New field to track custom products
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
  const [nextOrderId, setNextOrderId] = useState<number | null>(null);
  const [loadingNextId, setLoadingNextId] = useState(false);
  const [orderData, setOrderData] = useState<OrderData>({
    order_date: new Date().toISOString().split('T')[0],
    order_deposit: 0,
    order_product_detail: []
  });

  // Fetch next order ID when component mounts or when an order is created
  const fetchNextOrderId = async () => {
    setLoadingNextId(true);
    try {
      const response = await ordersApi.getNextOrderId();
      
      console.log('Next Order ID API Response:', response);
      
      if (response.code === 200 && response.result) {
        const nextId = response.result.next_order_id;
        console.log('Next Order ID:', nextId);
        setNextOrderId(nextId);
      } else {
        console.log('Failed to get next order ID, starting with 1');
        setNextOrderId(1);
      }
    } catch (error) {
      console.error('Error fetching next order ID:', error);
      setNextOrderId(1);
    } finally {
      setLoadingNextId(false);
    }
  };

  useEffect(() => {
    fetchNextOrderId();
  }, []);

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
          product_buy_price: 0,
          is_custom: false
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
    fetchNextOrderId();
  };

  // Toggle dropdown visibility (rename for clarity)
  const toggleProductDropdown = (index: number) => {
    const product = orderData.order_product_detail[index];
    updateOrderProduct(index, 'is_custom', !product.is_custom);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerPhone = formData.phone_number?.trim() || foundClient?.phone_number?.trim();
    const customerName = formData.cus_name?.trim() || foundClient?.cus_name?.trim() || '';
    const customerAddress = formData.address?.trim() || foundClient?.address?.trim() || '';
    const customerId = foundClient?.cus_id || 0;

    if (!customerPhone) {
      onNotification('error', 'សូមបញ្ចូលលេខទូរសព្ទអតិថិជន');
      return;
    }

    if (!orderData.order_product_detail || orderData.order_product_detail.length === 0) {
      onNotification('error', 'សូមបន្ថែមផលិតផលយ៉ាងហោចណាស់មួយ');
      return;
    }

    // Validate that all products have names
    const invalidProducts = orderData.order_product_detail.filter(
      product => !product.prod_name.trim()
    );

    if (invalidProducts.length > 0) {
      onNotification('error', 'សូមបញ្ចូលឈ្មោះផលិតផលសម្រាប់គ្រប់ទំនិញ');
      return;
    }

    setSubmittingOrder(true);

    try {
      // Prepare order payload - remove is_custom field as backend doesn't need it
      const cleanOrderDetails = orderData.order_product_detail.map(product => ({
        prod_id: product.prod_id,
        prod_name: product.prod_name,
        order_weight: product.order_weight,
        order_amount: product.order_amount,
        product_sell_price: product.product_sell_price,
        product_labor_cost: product.product_labor_cost,
        product_buy_price: product.product_buy_price
      }));

      const orderPayload = {
        order_id: nextOrderId || 0,
        cus_id: customerId,
        cus_name: customerName,
        address: customerAddress,
        phone_number: customerPhone,
        order_date: orderData.order_date,
        order_deposit: orderData.order_deposit || 0,
        order_product_detail: cleanOrderDetails
      };

      console.log('📤 Sending order payload:', orderPayload);

      const response = await ordersApi.create(orderPayload);
      
      if (response.code === 200) {
        onNotification('success', 'ការបញ្ជាទិញត្រូវបានបង្កើតដោយជោគជ័យ');
        
        // Reset the order form after successful submission
        resetOrderForm();
        
        // Call parent component handler
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className='block text-sm font-medium mb-2'>លេខវិក្កយបត្រ: </label>
              <div 
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.secondary[100],
                  borderColor: colors.secondary[300],
                  color: colors.secondary[600]
                }}
              >
                {foundClient ? (
                  `រកឃើញ: ${foundClient.cus_id}`
                ) : loadingNextId ? (
                  'កំពុងផ្ទុក...'
                ) : (
                  `${nextOrderId || 'N/A'}`
                )}
              </div>
            </div>
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

          <div>
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
              <div className="space-y-4">
                {/* Table Header */}
                <div className="bg-gray-50 border border-gray-200 rounded-t-lg">
                  <div className="px-4 py-3">
                    <h3 className="text-lg font-semibold text-gray-900">បញ្ជីផលិតផល</h3>
                  </div>
                  
                  {/* Excel-style Header Row */}
                  <div className="border-t border-gray-200 bg-gray-100">
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm font-medium text-gray-700">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-2">ផលិតផល</div>
                      <div className="col-span-1 text-center">ទម្ងន់</div>
                      <div className="col-span-1 text-center">ចំនួន</div>
                      <div className="col-span-2 text-center">តម្លៃលក់</div>
                      <div className="col-span-2 text-center">ថ្លៃកម្រធ្វើ</div>
                      <div className="col-span-2 text-center">តម្លៃទិញ</div>
                      <div className="col-span-1 text-center">សកម្មភាព</div>
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="border border-gray-200 border-t-0 rounded-b-lg overflow-visible">
                  <div className="divide-y divide-gray-200">
                    {orderData.order_product_detail.map((product, index) => (
                      <div 
                        key={index}
                        className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-50 transition-colors relative ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                        }`}
                        style={{ zIndex: product.is_custom ? 100 : 1 }}
                      >
                        {/* Row Number */}
                        <div className="col-span-1 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {index + 1}
                          </span>
                        </div>

                        {/* Product Input with Dropdown */}
                        <div className="col-span-2">
                          <div className="relative">
                            {/* Text Input (Always Visible) */}
                            <input
                              type="text"
                              value={product.prod_name}
                              onChange={(e) => updateOrderProduct(index, 'prod_name', e.target.value)}
                              className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="បញ្ចូលឈ្មោះផលិតផល"
                            />
                            
                            {/* Dropdown Arrow Button */}
                            <div className="absolute inset-y-0 right-0 flex items-center">
                              <button
                                type="button"
                                onClick={() => toggleProductDropdown(index)}
                                className="h-full px-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                                title="ជ្រើសរើសពីបញ្ជីផលិតផលដែលមាន"
                              >
                                <svg 
                                  className={`h-4 w-4 transition-transform ${product.is_custom ? 'rotate-180' : ''}`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                            
                            {/* Dropdown List (Shown when is_custom is true) */}
                            {product.is_custom && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-48 overflow-y-auto">
                                <div className="py-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateOrderProduct(index, 'prod_name', '');
                                      updateOrderProduct(index, 'prod_id', 0);
                                      updateOrderProduct(index, 'is_custom', false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-100 border-b border-gray-100 font-medium transition-colors"
                                  >
                                    សម្អាតការជ្រើសរើស
                                  </button>
                                  {products.map(prod => (
                                    <button
                                      key={prod.id}
                                      type="button"
                                      onClick={() => {
                                        updateOrderProduct(index, 'prod_id', prod.id);
                                        updateOrderProduct(index, 'prod_name', prod.name);
                                        updateOrderProduct(index, 'is_custom', false);
                                      }}
                                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-b border-gray-50 last:border-b-0 transition-colors"
                                    >
                                      {prod.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Weight */}
                        <div className="col-span-1">
                          <input
                            type="text"
                            value={product.order_weight}
                            onChange={(e) => updateOrderProduct(index, 'order_weight', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                            placeholder="ទម្ងន់"
                          />
                        </div>

                        <div className="col-span-1">
                          <input
                            type="number"
                            min="1"
                            value={product.order_amount}
                            onChange={(e) => updateOrderProduct(index, 'order_amount', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                            placeholder="1"
                          />
                        </div>

                        {/* // Sell Price field (តម្លៃលក់) */}
                        <div className="col-span-2">
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={product.product_sell_price}
                              onChange={(e) => updateOrderProduct(index, 'product_sell_price', parseFloat(e.target.value) || 0)}
                              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="10.00"
                            />
                          </div>
                        </div>

                        {/* // Labor Cost field (ថ្លៃកម្រធ្វើ) */}
                        <div className="col-span-2">
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={product.product_labor_cost}
                              onChange={(e) => updateOrderProduct(index, 'product_labor_cost', parseFloat(e.target.value) || 0)}
                              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="5.00"
                            />
                          </div>
                        </div>

                        {/* // Buy Price field (តម្លៃទិញ) */}
                        <div className="col-span-2">
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={product.product_buy_price}
                              onChange={(e) => updateOrderProduct(index, 'product_buy_price', parseFloat(e.target.value) || 0)}
                              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="3.00"
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeProductFromOrder(index)}
                            className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                            title="លុបផលិតផល"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Product Button */}
                {/* <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={addProductToOrder}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    បន្ថែមផលិតផល
                  </button>
                </div> */}
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
        <div className="pt-4 mt-auto border-t" style={{ borderTopColor: colors.secondary[200] }}>
          {/* Summary Section */}
          {orderData.order_product_detail && orderData.order_product_detail.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-600">សរុបផលិតផល: </span>
                    <span className="text-lg font-bold text-black-600">
                      {orderData.order_product_detail.length} ប្រភេទ
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-600">សរុបតម្លៃ: </span>
                    <span className="text-lg font-bold text-black-600">
                      ${orderData.order_product_detail.reduce((total, product) => 
                        total + ((product.order_amount * product.product_sell_price) + product.product_labor_cost), 0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className='flex justify-end p-6 gap-4'>
                  <Button
                    type="button"
                    onClick={resetOrderForm}
                    icon={<RotateCcw className="h-4 w-4" />}
                    size="sm"
                    disabled={submittingOrder || !formData.phone_number.trim() || loadingNextId}
                    className="px-6"
                  >
                    សម្អាត
                  </Button>
                
                  <Button
                    type="submit"
                    disabled={submittingOrder || !formData.phone_number.trim() || loadingNextId}
                    loading={submittingOrder}
                    icon={<ShoppingCart className="h-4 w-4" />}
                    className="px-6"
                  >
                    បង្កើតការបញ្ជាទិញ
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Submit button when no products */}
          {(!orderData.order_product_detail || orderData.order_product_detail.length === 0) && (
            <div className="flex justify-end p-6 gap-4">
              <Button
                type="button"
                onClick={resetOrderForm}
                icon={<RotateCcw className="h-4 w-4" />}
                size="sm"
                disabled={submittingOrder || !formData.phone_number.trim() || loadingNextId}
                className="px-6"
              >
                សម្អាត
              </Button>

              <Button
                type="submit"
                disabled={submittingOrder || !formData.phone_number.trim() || loadingNextId}
                loading={submittingOrder}
                icon={<ShoppingCart className="h-4 w-4" />}
                className="px-6"
              >
                បង្កើតការបញ្ជាទិញ
              </Button>
            </div>
          )}
        </div>
      </form>
    </Card>
  );
}
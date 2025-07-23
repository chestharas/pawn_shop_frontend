// buyandsell/OrderForm.tsx - Fixed auto-scroll issue
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import ProductDropdown from '@/components/ui/ProductDropdown';

interface Client {
  cus_id?: number;
  cus_name: string;
  address: string;
  phone_number: string;
}

interface Product {
  prod_id?: number;
  prod_name: string;
  unit_price?: number;
  amount?: number;
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
  products?: Product[];
  onNotification: (type: 'success' | 'error', message: string) => void;
  onOrderCreated: () => void;
  formData: FormData;
  foundClient: Client | null;
  onRegisterResetFunction?: (resetFunction: () => void) => void;
}

export default function OrderForm({
  products = [],
  onNotification,
  onOrderCreated,
  formData,
  foundClient,
  onRegisterResetFunction
}: OrderFormProps) {
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [nextOrderId, setNextOrderId] = useState<number | null>(null);
  const [loadingNextId, setLoadingNextId] = useState(false);
  const [orderData, setOrderData] = useState<OrderData>({
    order_date: new Date().toISOString().split('T')[0],
    order_deposit: 0,
    order_product_detail: []
  });

  // Ref to control scroll position
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  // Format display value for number inputs (show empty string instead of 0)
  const formatDisplayValue = (value: number): string => {
    return value === 0 ? '' : value.toString();
  };

  // Parse input value to number with fallback to 0
  const parseInputValue = (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Parse integer input value with fallback to 0
  const parseIntegerValue = (value: string): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Fetch next order ID from API
  const fetchNextOrderId = async () => {
    setLoadingNextId(true);
    try {
      const response = await ordersApi.getNextOrderId();
      
      if (response.code === 200 && response.result) {
        setNextOrderId(response.result.next_order_id);
      } else {
        setNextOrderId(1);
      }
    } catch (error) {
      console.error('Error fetching next order ID:', error);
      setNextOrderId(1);
    } finally {
      setLoadingNextId(false);
    }
  };

  // Reset order form to initial state
  const resetOrderForm = useCallback(() => {
    setOrderData({
      order_date: new Date().toISOString().split('T')[0],
      order_deposit: 0,
      order_product_detail: []
    });
    fetchNextOrderId();
  }, []);

  // Register reset function with parent component
  useEffect(() => {
    if (onRegisterResetFunction) {
      onRegisterResetFunction(resetOrderForm);
    }
  }, [onRegisterResetFunction, resetOrderForm]);

  // Load next order ID on component mount
  useEffect(() => {
    fetchNextOrderId();
  }, []);

  // Add new product row to order - with scroll position preservation
  const addProductToOrder = () => {
    // Store current scroll position
    const currentScrollTop = scrollContainerRef.current?.scrollTop || 0;
    
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

    // Restore scroll position after state update
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = currentScrollTop;
      }
    }, 0);
  };

  // Remove product from order by index
  const removeProductFromOrder = (index: number) => {
    setOrderData(prev => ({
      ...prev,
      order_product_detail: prev.order_product_detail?.filter((_, i) => i !== index) || []
    }));
  };

  // Update specific field of a product in order
  const updateOrderProduct = (index: number, field: keyof OrderProductDetail, value: string | number) => {
    setOrderData(prev => ({
      ...prev,
      order_product_detail: prev.order_product_detail?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  // Handle product selection from dropdown
  const handleProductSelect = (index: number, productId: number, productName: string) => {
    updateOrderProduct(index, 'prod_id', productId);
    updateOrderProduct(index, 'prod_name', productName);
  };

  // Handle custom product name input
  const handleCustomProductChange = (index: number, value: string) => {
    updateOrderProduct(index, 'prod_name', value);
    // Reset product ID when manually typing custom name
    if (orderData.order_product_detail[index]?.prod_id !== 0) {
      updateOrderProduct(index, 'prod_id', 0);
    }
  };

  // Calculate total order amount
  const calculateOrderTotal = (): number => {
    return orderData.order_product_detail.reduce((total, product) => 
      total + ((product.order_amount * product.product_sell_price) + product.product_labor_cost), 0
    );
  };

  // Handle form submission
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerPhone = formData.phone_number?.trim() || foundClient?.phone_number?.trim();
    const customerName = formData.cus_name?.trim() || foundClient?.cus_name?.trim() || '';
    const customerAddress = formData.address?.trim() || foundClient?.address?.trim() || '';
    const customerId = foundClient?.cus_id || 0;

    // Validation
    if (!customerPhone) {
      onNotification('error', 'សូមបញ្ចូលលេខទូរសព្ទអតិថិជន');
      return;
    }

    if (!orderData.order_product_detail || orderData.order_product_detail.length === 0) {
      onNotification('error', 'សូមបន្ថែមផលិតផលយ៉ាងហោចណាស់មួយ');
      return;
    }

    // Validate all products have names
    const invalidProducts = orderData.order_product_detail.filter(
      product => !product.prod_name.trim()
    );

    if (invalidProducts.length > 0) {
      onNotification('error', 'សូមបញ្ចូលឈ្មោះផលិតផលសម្រាប់គ្រប់ទំនិញ');
      return;
    }

    setSubmittingOrder(true);

    try {
      // Prepare order payload
      const orderPayload = {
        order_id: nextOrderId || 0,
        cus_id: customerId,
        cus_name: customerName,
        address: customerAddress,
        phone_number: customerPhone,
        order_date: orderData.order_date,
        order_deposit: orderData.order_deposit || 0,
        order_product_detail: orderData.order_product_detail.map(product => ({
          prod_id: product.prod_id,
          prod_name: product.prod_name,
          order_weight: product.order_weight,
          order_amount: product.order_amount,
          product_sell_price: product.product_sell_price,
          product_labor_cost: product.product_labor_cost,
          product_buy_price: product.product_buy_price
        }))
      };

      const response = await ordersApi.create(orderPayload);
      
      if (response.code === 200) {
        onNotification('success', 'ការបញ្ជាទិញត្រូវបានបង្កើតដោយជោគជ័យ');
        resetOrderForm();
        onOrderCreated();
      } else {
        onNotification('error', response.message || 'មានបញ្ហាក្នុងការបង្កើតការបញ្ជាទិញ');
      }
    } catch (error: unknown) {
      console.error('Error creating order:', error);
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError.response?.data?.message || 'មានបញ្ហាក្នុងការបង្កើតការបញ្ជាទិញ';
      onNotification('error', errorMessage);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const isFormDisabled = !formData.phone_number.trim();
  const hasProducts = orderData.order_product_detail && orderData.order_product_detail.length > 0;
  
  return (
    <Card title="បង្កើតការបញ្ជាទិញ" className="h-full flex flex-col">
      <form onSubmit={handleOrderSubmit} className="flex-1 flex flex-col">
        <div 
          ref={scrollContainerRef}
          className="space-y-4 flex-1 overflow-y-auto max-h-96"
          style={{ 
            scrollBehavior: 'auto' // Prevent smooth scrolling
          }}
        >
          
          {/* Order Header Information */}
          <div className="grid grid-cols-3 gap-4">
            {/* Order ID */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                លេខវិក្កយបត្រ
              </label>
              <div 
                className="w-full px-3 py-2 border rounded-md text-left font-medium "
                style={{ 
                  backgroundColor: colors.secondary[100],
                  borderColor: colors.secondary[300],
                  color: colors.secondary[600]
                }}
              >
                {foundClient ? (
                  `រកឃើញ: ${foundClient.cus_id || 'N/A'}`
                ) : loadingNextId ? (
                  'កំពុងផ្ទុក...'
                ) : (
                  `${nextOrderId || 'N/A'}`
                )}
              </div>
            </div>

            {/* Order Date */}
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
                disabled={isFormDisabled}
              />
            </div>

            {/* Deposit Amount */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                ប្រាក់កក់
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formatDisplayValue(orderData.order_deposit)}
                onChange={(e) => setOrderData({ ...orderData, order_deposit: parseInputValue(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: colors.secondary[300] }}
                placeholder="0.00"
                disabled={isFormDisabled}
              />
            </div>
          </div>

          {/* Products Section Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: colors.secondary[800] }}>
              បញ្ជីផលិតផល
            </h3>
            <Button
              type="button"
              onClick={addProductToOrder}
              icon={<Plus className="h-4 w-4" />}
              size="sm"
              disabled={isFormDisabled}
            >
              បន្ថែមផលិតផល
            </Button>
          </div>

          {/* Products Content */}
          <div>
            {isFormDisabled ? (
              /* Phone number required message */
              <div 
                className="p-8 text-center border-2 border-dashed rounded-lg"
                style={{ borderColor: colors.secondary[200], backgroundColor: colors.secondary[50] }}
              >
                <Phone className="h-8 w-8 mx-auto mb-2" style={{ color: colors.secondary[400] }} />
                <p className="text-sm" style={{ color: colors.secondary[600] }}>
                  សូមបញ្ចូលលេខទូរសព្ទអតិថិជនក្នុងផ្នែកខាងឆ្វេងមុនសិន
                </p>
              </div>
            ) : hasProducts ? (
              /* Products Table */
              <div className="space-y-4">
                {/* Table Header - Fixed */}
                <div className="bg-gray-50 border border-gray-200 rounded-t-lg sticky top-0 z-10">
                  {/* Column Headers */}
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

                {/* Table Body - Scrollable */}
                <div className="border border-gray-200 border-t-0 rounded-b-lg">
                  <div className="divide-y divide-gray-200">
                    {orderData.order_product_detail.map((product, index) => (
                      <div 
                        key={index}
                        className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                        }`}
                      >
                        {/* Row Number */}
                        <div className="col-span-1 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {index + 1}
                          </span>
                        </div>

                        {/* Product Dropdown */}
                        <div className="col-span-2">
                          <ProductDropdown
                            products={safeProducts as any}
                            value={product.prod_name}
                            onProductSelect={(productId, productName) => 
                              handleProductSelect(index, productId, productName)
                            }
                            onCustomValueChange={(value) => 
                              handleCustomProductChange(index, value)
                            }
                            placeholder="បញ្ចូលឈ្មោះផលិតផល"
                          />
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

                        {/* Amount */}
                        <div className="col-span-1">
                          <input
                            type="number"
                            min="0"
                            value={formatDisplayValue(product.order_amount)}
                            onChange={(e) => updateOrderProduct(index, 'order_amount', parseIntegerValue(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                            placeholder="1"
                          />
                        </div>

                        {/* Sell Price */}
                        <div className="col-span-2">
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formatDisplayValue(product.product_sell_price)}
                              onChange={(e) => updateOrderProduct(index, 'product_sell_price', parseInputValue(e.target.value))}
                              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {/* Labor Cost */}
                        <div className="col-span-2">
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formatDisplayValue(product.product_labor_cost)}
                              onChange={(e) => updateOrderProduct(index, 'product_labor_cost', parseInputValue(e.target.value))}
                              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {/* Buy Price */}
                        <div className="col-span-2">
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formatDisplayValue(product.product_buy_price)}
                              onChange={(e) => updateOrderProduct(index, 'product_buy_price', parseInputValue(e.target.value))}
                              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {/* Remove Button */}
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
              </div>
            ) : (
              /* No products message */
              <div 
                className="p-8 text-center border-2 border-dashed rounded-lg"
                style={{ borderColor: colors.secondary[200] }}
              >
                <Package className="h-8 w-8 mx-auto mb-2" style={{ color: colors.secondary[400] }} />
                <p className="text-sm" style={{ color: colors.secondary[600] }}>
                  មិនទាន់មានផលិតផលណាមួយនៅឡើយទេ
                </p>
                <p className="text-xs mt-1" style={{ color: colors.secondary[500] }}>
                  ចុចប៊ូតុង &quot;បន្ថែមផលិតផល&quot; ដើម្បីចាប់ផ្តើម
                </p>
              </div>
            )}
          </div>
        </div>  

        {/* Footer Section */}
        <div className="pt-4 mt-auto border-t" style={{ borderTopColor: colors.secondary[200] }}>
          {hasProducts ? (
            /* Order Summary with Submit Button */
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                      ${calculateOrderTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submittingOrder || isFormDisabled || loadingNextId}
                  loading={submittingOrder}
                  icon={<ShoppingCart className="h-4 w-4" />}
                  className="px-6"
                >
                  បង្កើតការបញ្ជាទិញ
                </Button>
              </div>
            </div>
          ) : (
            /* Submit button when no products */
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submittingOrder || isFormDisabled || loadingNextId}
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
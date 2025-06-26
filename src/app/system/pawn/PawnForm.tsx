// pawn/PawnForm.tsx - Clean Rewrite with ProductDropdown Component
'use client';

import { useState, useEffect, useCallback } from 'react';
import { pawnsApi } from '@/lib/api';
import { 
  Plus,
  Minus,
  Package,
  Calendar,
  DollarSign,
  Clock,
  Phone
} from 'lucide-react';
import { colors } from '@/lib/colors';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import ProductDropdown from '@/components/ui/ProductDropdown';

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

interface PawnProductDetail {
  prod_id: number;
  prod_name: string;
  pawn_weight: string;
  pawn_amount: number;
  pawn_unit_price: number;
}

interface PawnData {
  pawn_date: string;
  pawn_expire_date: string;
  pawn_deposit: number;
  pawn_product_detail: PawnProductDetail[];
}

interface FormData {
  cus_name: string;
  address: string;
  phone_number: string;
}

interface PawnFormProps {
  products: Product[];
  onNotification: (type: 'success' | 'error', message: string) => void;
  onPawnCreated: () => void;
  formData: FormData;
  foundClient: Client | null;
  onRegisterResetFunction?: (resetFunction: () => void) => void;
}

export default function PawnForm({
  products,
  onNotification,
  onPawnCreated,
  formData,
  foundClient,
  onRegisterResetFunction
}: PawnFormProps) {
  const [submittingPawn, setSubmittingPawn] = useState(false);
  const [nextPawnId, setNextPawnId] = useState<number | null>(null);
  const [loadingNextId, setLoadingNextId] = useState(false);
  const [pawnData, setPawnData] = useState<PawnData>({
    pawn_date: new Date().toISOString().split('T')[0],
    pawn_expire_date: (() => {
      const expireDate = new Date();
      expireDate.setMonth(expireDate.getMonth() + 1); // Default 1 month expiry
      return expireDate.toISOString().split('T')[0];
    })(),
    pawn_deposit: 0,
    pawn_product_detail: []
  });

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

  // Fetch next pawn ID from API
  const fetchNextPawnId = async () => {
    setLoadingNextId(true);
    try {
      const response = await pawnsApi.getNextPawnId();
      
      if (response.code === 200 && response.result) {
        setNextPawnId(response.result.next_pawn_id);
      } else {
        setNextPawnId(1);
      }
    } catch (error) {
      console.error('Error fetching next pawn ID:', error);
      setNextPawnId(1);
    } finally {
      setLoadingNextId(false);
    }
  };

  // Reset pawn form to initial state
  const resetPawnForm = useCallback(() => {
    setPawnData({
      pawn_date: new Date().toISOString().split('T')[0],
      pawn_expire_date: (() => {
        const expireDate = new Date();
        expireDate.setMonth(expireDate.getMonth() + 1);
        return expireDate.toISOString().split('T')[0];
      })(),
      pawn_deposit: 0,
      pawn_product_detail: []
    });
    fetchNextPawnId();
  }, []);

  // Register reset function with parent component
  useEffect(() => {
    if (onRegisterResetFunction) {
      onRegisterResetFunction(resetPawnForm);
    }
  }, [onRegisterResetFunction, resetPawnForm]);

  // Load next pawn ID on component mount
  useEffect(() => {
    fetchNextPawnId();
  }, []);

  // Add new product row to pawn
  const addProductToPawn = () => {
    setPawnData(prev => ({
      ...prev,
      pawn_product_detail: [
        ...(prev.pawn_product_detail || []),
        {
          prod_id: 0,
          prod_name: '',
          pawn_weight: '',
          pawn_amount: 0,
          pawn_unit_price: 0
        }
      ]
    }));
  };

  // Remove product from pawn by index
  const removeProductFromPawn = (index: number) => {
    setPawnData(prev => ({
      ...prev,
      pawn_product_detail: prev.pawn_product_detail?.filter((_, i) => i !== index) || []
    }));
  };

  // Update specific field of a product in pawn
  const updatePawnProduct = (index: number, field: keyof PawnProductDetail, value: string | number) => {
    setPawnData(prev => ({
      ...prev,
      pawn_product_detail: prev.pawn_product_detail?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  // Handle product selection from dropdown
  const handleProductSelect = (index: number, productId: number, productName: string) => {
    updatePawnProduct(index, 'prod_id', productId);
    updatePawnProduct(index, 'prod_name', productName);
  };

  // Handle custom product name input
  const handleCustomProductChange = (index: number, value: string) => {
    updatePawnProduct(index, 'prod_name', value);
    // Reset product ID when manually typing custom name
    if (pawnData.pawn_product_detail[index]?.prod_id !== 0) {
      updatePawnProduct(index, 'prod_id', 0);
    }
  };

  // Calculate total pawn value
  const calculateTotalValue = (): number => {
    return pawnData.pawn_product_detail.reduce((total, product) => {
      return total + (product.pawn_amount * product.pawn_unit_price);
    }, 0);
  };

  // Handle form submission
  const handlePawnSubmit = async (e: React.FormEvent) => {
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

    if (!pawnData.pawn_product_detail || pawnData.pawn_product_detail.length === 0) {
      onNotification('error', 'សូមបន្ថែមផលិតផលយ៉ាងហោចណាស់មួយ');
      return;
    }

    // Validate that all products have names
    const invalidProducts = pawnData.pawn_product_detail.filter(
      product => !product.prod_name.trim()
    );

    if (invalidProducts.length > 0) {
      onNotification('error', 'សូមបញ្ចូលឈ្មោះផលិតផលសម្រាប់គ្រប់ទំនិញ');
      return;
    }

    // Validate expire date is after pawn date
    if (new Date(pawnData.pawn_expire_date) <= new Date(pawnData.pawn_date)) {
      onNotification('error', 'កាលបរិច្ចេទផុតកំណត់ត្រូវតែធំជាងកាលបរិច្ចេទបញ្ជាក់');
      return;
    }

    setSubmittingPawn(true);

    try {
      // Prepare pawn payload
      const pawnPayload = {
        pawn_id: nextPawnId || 0,
        cus_id: customerId,
        cus_name: customerName,
        address: customerAddress,
        phone_number: customerPhone,
        pawn_date: pawnData.pawn_date,
        pawn_expire_date: pawnData.pawn_expire_date,
        pawn_deposit: pawnData.pawn_deposit || 0,
        pawn_product_detail: pawnData.pawn_product_detail.map(product => ({
          prod_id: product.prod_id,
          prod_name: product.prod_name,
          pawn_weight: product.pawn_weight,
          pawn_amount: product.pawn_amount,
          pawn_unit_price: product.pawn_unit_price
        }))
      };

      const response = await pawnsApi.create(pawnPayload);
      
      if (response.code === 200) {
        onNotification('success', 'ការបញ្ជាក់ត្រូវបានបង្កើតដោយជោគជ័យ');
        resetPawnForm();
        onPawnCreated();
      } else {
        onNotification('error', response.message || 'មានបញ្ហាក្នុងការបង្កើតការបញ្ជាក់');
      }
    } catch (error: unknown) {
      console.error('Error creating pawn:', error);
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError.response?.data?.message || 'មានបញ្ហាក្នុងការបង្កើតការបញ្ជាក់';
      onNotification('error', errorMessage);
    } finally {
      setSubmittingPawn(false);
    }
  };

  const isFormDisabled = !formData.phone_number.trim();
  const hasProducts = pawnData.pawn_product_detail && pawnData.pawn_product_detail.length > 0;

  return (
    <Card title="បង្កើតការបញ្ជាក់" className="h-full flex flex-col">
      <form onSubmit={handlePawnSubmit} className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1 overflow-y-auto max-h-96">
          
          {/* Pawn Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Pawn ID */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                លេខវិក្កយបត្រ
              </label>
              <div 
                className="w-full px-3 py-2 border rounded-md text-left font-medium"
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
                  `${nextPawnId || 'N/A'}`
                )}
              </div>
            </div>

            {/* Pawn Date */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                <Calendar className="inline h-4 w-4 mr-1" />
                កាលបរិច្ចេទបញ្ជាក់
              </label>
              <input
                type="date"
                value={pawnData.pawn_date}
                onChange={(e) => setPawnData({ ...pawnData, pawn_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: colors.secondary[300] }}
                required
                disabled={isFormDisabled}
              />
            </div>

            {/* Expire Date */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                <Clock className="inline h-4 w-4 mr-1" />
                កាលបរិច្ចេទផុតកំណត់
              </label>
              <input
                type="date"
                value={pawnData.pawn_expire_date}
                onChange={(e) => setPawnData({ ...pawnData, pawn_expire_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: colors.secondary[300] }}
                required
                disabled={isFormDisabled}
              />
            </div>

            {/* Deposit Amount */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                <DollarSign className="inline h-4 w-4 mr-1" />
                ប្រាក់កក់
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formatDisplayValue(pawnData.pawn_deposit)}
                onChange={(e) => setPawnData({ ...pawnData, pawn_deposit: parseInputValue(e.target.value) })}
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
              onClick={addProductToPawn}
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
                style={{ borderColor: colors.secondary[200], backgroundColor: colors.secondary[25] }}
              >
                <Phone className="h-8 w-8 mx-auto mb-2" style={{ color: colors.secondary[400] }} />
                <p className="text-sm" style={{ color: colors.secondary[600] }}>
                  សូមបញ្ចូលលេខទូរសព្ទអតិថិជនក្នុងផ្នែកខាងឆ្វេងមុនសិន
                </p>
              </div>
            ) : hasProducts ? (
              /* Products Table */
              <div className="space-y-4">
                {/* Table Header */}
                <div className="bg-gray-50 border border-gray-200 rounded-t-lg">
                  <div className="px-4 py-3">
                    <h3 className="text-lg font-semibold text-gray-900">បញ្ជីផលិតផល</h3>
                  </div>
                  
                  {/* Column Headers */}
                  <div className="border-t border-gray-200 bg-gray-100">
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm font-medium text-gray-700">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-3">ផលិតផល</div>
                      <div className="col-span-2 text-center">ទម្ងន់</div>
                      <div className="col-span-2 text-center">ចំនួន</div>
                      <div className="col-span-3 text-center">តម្លៃក្នុងមួយឯកតា</div>
                      <div className="col-span-1 text-center">សកម្មភាព</div>
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {pawnData.pawn_product_detail.map((product, index) => (
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
                      <div className="col-span-3">
                        <ProductDropdown
                          products={products}
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
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={product.pawn_weight}
                          onChange={(e) => updatePawnProduct(index, 'pawn_weight', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                          placeholder="ទម្ងន់"
                        />
                      </div>

                      {/* Amount */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          value={formatDisplayValue(product.pawn_amount)}
                          onChange={(e) => updatePawnProduct(index, 'pawn_amount', parseIntegerValue(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                          placeholder="1"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="col-span-3">
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formatDisplayValue(product.pawn_unit_price)}
                            onChange={(e) => updatePawnProduct(index, 'pawn_unit_price', parseInputValue(e.target.value))}
                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeProductFromPawn(index)}
                          className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                          title="លុបផលិតផល"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <span className="text-sm font-medium text-gray-600">សរុបផលិតផល: </span>
                        <span className="text-lg font-bold text-gray-600">
                          {pawnData.pawn_product_detail.length} ប្រភេទ
                        </span>
                      </div>
                      
                      <div className="text-center">
                        <span className="text-sm font-medium text-gray-600">តម្លៃសរុប: </span>
                        <span className="text-lg font-bold text-gray-600">
                          ${calculateTotalValue().toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingPawn || isFormDisabled || loadingNextId}
                      loading={submittingPawn}
                      icon={<Package className="h-4 w-4" />}
                      className="px-6"
                    >
                      បង្កើតការបញ្ជាក់
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* No products message - Updated to match OrderForm */
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
          {!hasProducts && (
            /* Submit button when no products */
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submittingPawn || isFormDisabled || loadingNextId}
                loading={submittingPawn}
                icon={<Package className="h-4 w-4" />}
                className="px-6"
              >
                បង្កើតការបញ្ជាក់
              </Button>
            </div>
          )}

          {/* Add Product Button */}
          {/* <div className="mt-4">
            <button
              type="button"
              onClick={addProductToPawn}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              បន្ថែមផលិតផល
            </button>
          </div> */}
        </div>
      </form>
    </Card>
  );
}
// pawn/PawnForm.tsx
'use client';

import { useState } from 'react';
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
}

export default function PawnForm({
  products,
  onNotification,
  onPawnCreated,
  formData,
  foundClient
}: PawnFormProps) {
  const [submittingPawn, setSubmittingPawn] = useState(false);
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

  const removeProductFromPawn = (index: number) => {
    setPawnData(prev => ({
      ...prev,
      pawn_product_detail: prev.pawn_product_detail?.filter((_, i) => i !== index) || []
    }));
  };

  const updatePawnProduct = (index: number, field: keyof PawnProductDetail, value: any) => {
    setPawnData(prev => ({
      ...prev,
      pawn_product_detail: prev.pawn_product_detail?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

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

  const resetPawnForm = () => {
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
  };

  const calculateTotalValue = () => {
    return pawnData.pawn_product_detail.reduce((total, product) => {
      return total + (product.pawn_amount * product.pawn_unit_price);
    }, 0);
  };

  const handlePawnSubmit = async (e: React.FormEvent) => {
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

    if (!pawnData.pawn_product_detail || pawnData.pawn_product_detail.length === 0) {
      onNotification('error', 'សូមបន្ថែមផលិតផលយ៉ាងហោចណាស់មួយ');
      return;
    }

    // Validate that pawn_expire_date is after pawn_date
    if (new Date(pawnData.pawn_expire_date) <= new Date(pawnData.pawn_date)) {
      onNotification('error', 'កាលបរិច្ចេទផុតកំណត់ត្រូវតែធំជាងកាលបរិច្ចេទបញ្ជាក់');
      return;
    }

    setSubmittingPawn(true);

    try {
      const pawnPayload = {
        pawn_id: 0,
        cus_id: customerId,
        cus_name: customerName || '',
        address: customerAddress || '',
        phone_number: customerPhone,
        pawn_date: pawnData.pawn_date,
        pawn_expire_date: pawnData.pawn_expire_date,
        pawn_deposit: pawnData.pawn_deposit || 0,
        pawn_product_detail: pawnData.pawn_product_detail
      };

      const response = await pawnsApi.create(pawnPayload);
      
      if (response.code === 200) {
        onNotification('success', 'ការបញ្ជាក់ត្រូវបានបង្កើតដោយជោគជ័យ');
        resetPawnForm();
        onPawnCreated();
      } else {
        onNotification('error', response.message || 'មានបញ្ហាក្នុងការបង្កើតការបញ្ជាក់');
      }
    } catch (error: any) {
      console.error('Error creating pawn:', error);
      const errorMessage = error.response?.data?.message || 'មានបញ្ហាក្នុងការបង្កើតការបញ្ជាក់';
      onNotification('error', errorMessage);
    } finally {
      setSubmittingPawn(false);
    }
  };

  return (
    <Card title="បង្កើតការបញ្ជាក់" className="h-full flex flex-col">
      <form onSubmit={handlePawnSubmit} className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1 overflow-y-auto max-h-96">
          {/* Pawn Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                disabled={!formData.phone_number.trim()}
              />
            </div>
            
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
                disabled={!formData.phone_number.trim()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                <DollarSign className="inline h-4 w-4 mr-1" />
                ប្រាក់កក់
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={pawnData.pawn_deposit}
                onChange={(e) => setPawnData({ ...pawnData, pawn_deposit: parseFloat(e.target.value) || 0 })}
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
                onClick={addProductToPawn}
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
            ) : pawnData.pawn_product_detail && pawnData.pawn_product_detail.length > 0 ? (
              <div className="space-y-3">
                {pawnData.pawn_product_detail.map((product, index) => (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg"
                    style={{ borderColor: colors.secondary[200], backgroundColor: colors.secondary[25] }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium" style={{ color: colors.secondary[700] }}>
                        ផលិតផលទី {index + 1}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium" style={{ color: colors.primary[600] }}>
                          សរុប: ${(product.pawn_amount * product.pawn_unit_price).toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          onClick={() => removeProductFromPawn(index)}
                          icon={<Minus className="h-4 w-4" />}
                          variant="secondary"
                          size="sm"
                        >
                          លុប
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.secondary[600] }}>
                          ផលិតផល
                        </label>
                        <select
                          value={product.prod_id}
                          onChange={(e) => {
                            const selectedProduct = products.find(p => p.id === parseInt(e.target.value));
                            updatePawnProduct(index, 'prod_id', parseInt(e.target.value));
                            updatePawnProduct(index, 'prod_name', selectedProduct?.name || '');
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
                          ទម្ងន់/ការពិពណ៌នា
                        </label>
                        <input
                          type="text"
                          value={product.pawn_weight}
                          onChange={(e) => updatePawnProduct(index, 'pawn_weight', e.target.value)}
                          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          style={{ borderColor: colors.secondary[300] }}
                          placeholder="ទម្ងន់ ឬ ការពិពណ៌នា"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.secondary[600] }}>
                          ចំនួន
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={product.pawn_amount}
                          onChange={(e) => updatePawnProduct(index, 'pawn_amount', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          style={{ borderColor: colors.secondary[300] }}
                          placeholder="ចំនួន"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.secondary[600] }}>
                          តម្លៃក្នុងមួយឯកតា ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.pawn_unit_price}
                          onChange={(e) => updatePawnProduct(index, 'pawn_unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          style={{ borderColor: colors.secondary[300] }}
                          placeholder="តម្លៃក្នុងមួយឯកតា"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total Value Summary */}
                {calculateTotalValue() > 0 && (
                  <div 
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: colors.primary[50],
                      border: `1px solid ${colors.primary[200]}`
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold" style={{ color: colors.primary[800] }}>
                        តម្លៃសរុប:
                      </span>
                      <span className="text-lg font-bold" style={{ color: colors.primary[700] }}>
                        ${calculateTotalValue().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
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
            disabled={submittingPawn || !formData.phone_number.trim()}
            loading={submittingPawn}
            icon={<Package className="h-4 w-4" />}
            className="px-6"
          >
            បង្កើតការបញ្ជាក់
          </Button>
        </div>
      </form>
    </Card>
  );
}
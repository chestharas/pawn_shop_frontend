// pawn/ClientForm.tsx - Updated with Pawn Form Reset
'use client';

import { useState } from 'react';
import { clientsApi } from '@/lib/api';
import { 
  User,
  MapPin,
  Phone,
  Save,
  RotateCcw,
  Search
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

interface FormData {
  cus_name: string;
  address: string;
  phone_number: string;
}

interface ClientFormProps {
  clients: Client[];
  onClientCreated: () => void;
  onNotification: (type: 'success' | 'error', message: string) => void;
  onClientFound: (client: Client | null) => void;
  onFormDataChange: (formData: FormData) => void;
  formData: FormData;
  foundClient: Client | null;
  onResetBothForms?: () => void; // New prop to reset pawn form as well
}

export default function ClientForm({
  clients,
  onClientCreated,
  onNotification,
  onClientFound,
  onFormDataChange,
  formData,
  foundClient,
  onResetBothForms
}: ClientFormProps) {
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Function to calculate next ID from existing clients
  const getNextId = (): number => {
    if (clients.length === 0) return 1;
    const maxId = Math.max(...clients.map(client => client.cus_id));
    return maxId + 1;
  };

  const resetForm = () => {
    console.log('🔄 Resetting both forms');
    
    // Reset client form data
    onFormDataChange({ cus_name: '', address: '', phone_number: '' });
    onClientFound(null);
    
    // Reset pawn form as well if callback is provided
    if (onResetBothForms) {
      onResetBothForms();
    }
  };

  const handleSearchClient = async () => {
    if (!formData.phone_number.trim()) {
      onNotification('error', 'សូមបញ្ចូលលេខទូរសព្ទដើម្បីស្វែងរក');
      return;
    }

    setSearching(true);

    try {
      const response = await clientsApi.search(formData.phone_number.trim());
      
      if (response.code === 200 && response.result && response.result.length > 0) {
        const client = response.result[0];
        onClientFound(client);
        
        // Auto-fill the form with found client data
        onFormDataChange({
          cus_name: client.cus_name || '',
          address: client.address || '',
          phone_number: client.phone_number || formData.phone_number
        });
        
        onNotification('success', `រកឃើញអតិថិជន: ${client.cus_name}`);
      } else {
        onNotification('error', 'មិនរកឃើញអតិថិជនដែលមានលេខទូរសព្ទនេះទេ');
        onClientFound(null);
        // Keep the phone number but clear other fields
        onFormDataChange({
          cus_name: '',
          address: '',
          phone_number: formData.phone_number
        });
      }
    } catch (error: any) {
      console.error('Error searching client:', error);
      
      // Handle different error cases
      if (error.response?.status === 404) {
        onNotification('error', 'មិនរកឃើញអតិថិជនដែលមានលេខទូរសព្ទនេះទេ');
      } else if (error.response?.status === 400) {
        onNotification('error', 'លេខទូរសព្ទមិនត្រឹមត្រូវ');
      } else if (error.response?.status === 500) {
        onNotification('error', 'មានបញ្ហាពីម៉ាស៊ីនបម្រើ សូមព្យាយាមម្តងទៀត');
      } else {
        const errorMessage = error.response?.data?.message || 'មានបញ្ហាក្នុងការស្វែងរកអតិថិជន';
        onNotification('error', errorMessage);
      }
      
      onClientFound(null);
      // Keep the phone number but clear other fields when there's an error
      onFormDataChange({
        cus_name: '',
        address: '',
        phone_number: formData.phone_number
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cus_name.trim()) {
      onNotification('error', 'សូមបញ្ចូលឈ្មោះអតិថិជន');
      return;
    }

    if (!formData.phone_number.trim()) {
      onNotification('error', 'សូមបញ្ចូលលេខទូរសព្ទ');
      return;
    }

    setSubmitting(true);

    try {
      const clientData = {
        cus_name: formData.cus_name.trim(),
        address: formData.address.trim(),
        phone_number: formData.phone_number.trim()
      };

      const response = await clientsApi.create(clientData);
      
      if (response.code === 200) {
        onNotification('success', 'អតិថិជនត្រូវបានបង្កើតដោយជោគជ័យ');
        resetForm();
        onClientCreated();
      } else {
        onNotification('error', response.message || 'មានបញ្ហាក្នុងការរក្សាទុកអតិថិជន');
      }
    } catch (error: any) {
      console.error('Error saving client:', error);
      const errorMessage = error.response?.data?.message || 'មានបញ្ហាក្នុងការរក្សាទុកអតិថិជន';
      onNotification('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="បំពេញអតិថិជនថ្មី" className="h-full flex flex-col">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {/* Client ID */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.secondary[700] }}
            >
              លេខសំគាល់
            </label>
            <div 
              className="px-3 py-2 border rounded-md text-left text-sm font-medium"
              style={{ 
                backgroundColor: colors.secondary[100],
                borderColor: colors.secondary[300],
                color: colors.secondary[600]
              }}
            >
              {foundClient ? (
                `រកឃើញ: ${foundClient.cus_id}`
              ) : (
                `${getNextId()}`
              )}
            </div>
          </div>

          {/* Client Name */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.secondary[700] }}
            >
              ឈ្មោះអតិថិជន
            </label>
            <div className="relative">
              <User 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: colors.secondary[400] }}
              />
              <input
                type="text"
                value={formData.cus_name}
                onChange={(e) => onFormDataChange({ ...formData, cus_name: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                style={{ 
                  borderColor: colors.secondary[300],
                  backgroundColor: foundClient ? colors.success[50] : 'white'
                }}
                placeholder={foundClient ? foundClient.cus_name : "បញ្ចូលឈ្មោះអតិថិជន"}
                required
              />
            </div>
          </div>

          {/* Phone Number with Search Button */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.secondary[700] }}
            >
              លេខទូរសព្ទ
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Phone 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: colors.secondary[400] }}
                />
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => onFormDataChange({ ...formData, phone_number: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{ 
                    borderColor: colors.secondary[300],
                    backgroundColor: foundClient ? colors.success[50] : 'white'
                  }}
                  placeholder="បញ្ចូលលេខទូរសព្ទ"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.secondary[700] }}
            >
              អាសយដ្ឋាន
            </label>
            <div className="relative">
              <MapPin 
                className="absolute left-3 top-3 h-4 w-4"
                style={{ color: colors.secondary[400] }}
              />
              <textarea
                value={formData.address}
                onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                style={{ 
                  borderColor: colors.secondary[300],
                  backgroundColor: foundClient ? colors.success[50] : 'white'
                }}
                placeholder="បញ្ចូលអាសយដ្ឋាន"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons - Pinned to bottom */}
        <div className="flex space-x-3 pt-6 mt-auto">
          <Button
            type="button"
            onClick={handleSearchClient}
            loading={searching}
            disabled={searching || !formData.phone_number.trim()}
            icon={<Search className="h-4 w-4" />}
            className="flex-1"
          >
            ស្វែងរក
          </Button>

          <Button
            type="button"
            onClick={resetForm}
            variant="secondary"
            icon={<RotateCcw className="h-4 w-4" />}
          >
            លុប
          </Button>
        </div>
      </form>
    </Card>
  );
}
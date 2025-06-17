// buyandsell/ClientForm.tsx - Debug Version
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
}

export default function ClientForm({
  clients,
  onClientCreated,
  onNotification,
  onClientFound,
  onFormDataChange,
  formData,
  foundClient
}: ClientFormProps) {
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Debug: Log formData whenever it changes
  // console.log('🔍 Current formData:', formData);
  // console.log('Phone number value:', formData.phone_number);
  // console.log('Phone number type:', typeof formData.phone_number);
  // console.log('Phone number length:', formData.phone_number?.length);

  // Function to calculate next ID from existing clients
  const getNextId = (): number => {
    if (clients.length === 0) return 1;
    const maxId = Math.max(...clients.map(client => client.cus_id));
    return maxId + 1;
  };

  const resetForm = () => {
    console.log('🔄 Resetting form');
    onFormDataChange({ cus_name: '', address: '', phone_number: '' });
    onClientFound(null);
  };

  const handleSearchClient = async () => {
    console.log('🔍 Starting search with phone:', formData.phone_number);
    
    if (!formData.phone_number?.trim()) {
      onNotification('error', 'សូមបញ្ចូលលេខទូរសព្ទដើម្បីស្វែងរក');
      return;
    }

    setSearching(true);

    try {
      const response = await clientsApi.search(formData.phone_number.trim());
      console.log('🔍 Search response:', response);
      
      if (response.code === 200 && response.result && response.result.length > 0) {
        const client = response.result[0];
        console.log('Client found:', client);
        onClientFound(client);
        
        // Auto-fill the form with found client data
        const newFormData = {
          cus_name: client.cus_name || '',
          address: client.address || '',
          phone_number: client.phone_number || formData.phone_number
        };
        console.log('Setting form data to:', newFormData);
        onFormDataChange(newFormData);
        
        onNotification('success', `រកឃើញអតិថិជន: ${client.cus_name}`);
      } else {
        console.log('No client found');
        onNotification('error', 'មិនរកឃើញអតិថិជនដែលមានលេខទូរសព្ទនេះទេ');
        onClientFound(null);
        
        // Keep the phone number but clear other fields
        const newFormData = {
          cus_name: '',
          address: '',
          phone_number: formData.phone_number.trim()
        };
        console.log('Clearing form but keeping phone:', newFormData);
        onFormDataChange(newFormData);
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
      const newFormData = {
        cus_name: '',
        address: '',
        phone_number: formData.phone_number.trim()
      };
      console.log('Error: Clearing form but keeping phone:', newFormData);
      onFormDataChange(newFormData);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data before validation:', formData);
    
    // Validate required fields
    if (!formData.cus_name?.trim()) {
      console.log('Validation failed: Missing customer name');
      onNotification('error', 'សូមបញ្ចូលឈ្មោះអតិថិជន');
      return;
    }

    if (!formData.phone_number?.trim()) {
      console.log('Validation failed: Missing phone number');
      onNotification('error', 'សូមបញ្ចូលលេខទូរសព្ទ');
      return;
    }

    setSubmitting(true);

    try {
      // ENSURE all required fields are properly included and trimmed
      const clientData = {
        cus_name: formData.cus_name.trim(),
        address: formData.address?.trim() || '',
        phone_number: formData.phone_number.trim()
      };

      console.log('Sending client data to API:', clientData);
      console.log('JSON stringified:', JSON.stringify(clientData, null, 2));

      const response = await clientsApi.create(clientData);
      console.log('API response:', response);
      
      if (response.code === 200) {
        onNotification('success', 'អតិថិជនត្រូវបានបង្កើតដោយជោគជ័យ');
        resetForm();
        onClientCreated();
      } else {
        console.log('API returned error:', response);
        onNotification('error', response.message || 'មានបញ្ហាក្នុងការរក្សាទុកអតិថិជន');
      }
    } catch (error: any) {
      console.error('Error saving client:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      console.error('Client data that failed:', {
        original_formData: formData,
        processed_clientData: {
          cus_name: formData.cus_name,
          address: formData.address,
          phone_number: formData.phone_number
        }
      });
      
      const errorMessage = error.response?.data?.message || 'មានបញ្ហាក្នុងការរក្សាទុកអតិថិជន';
      onNotification('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle phone number input change
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneValue = e.target.value;
    console.log('Phone number changed to:', phoneValue);
    
    const newFormData = {
      ...formData, 
      phone_number: phoneValue 
    };
    console.log('Updating formData to:', newFormData);
    onFormDataChange(newFormData);
  };

  return (
    <Card title="បំពេញអតិថិជនថ្មី" className="h-full flex flex-col">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {/* Debug Panel */}
          {/* <div className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2">
            <div><strong>Debug Info:</strong></div>
            <div>cus_name: "{formData.cus_name}" (type: {typeof formData.cus_name})</div>
            <div>phone_number: "{formData.phone_number}" (type: {typeof formData.phone_number})</div>
            <div>address: "{formData.address}" (type: {typeof formData.address})</div>
            <div>foundClient: {foundClient ? `ID ${foundClient.cus_id}` : 'null'}</div>
          </div> */}

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
                value={formData.cus_name || ''}
                onChange={(e) => {
                  console.log('👤 Name changed to:', e.target.value);
                  onFormDataChange({ ...formData, cus_name: e.target.value });
                }}
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
                  value={formData.phone_number || ''}
                  onChange={handlePhoneNumberChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{ 
                    borderColor: colors.secondary[300],
                    backgroundColor: foundClient ? colors.success[50] : 'white'
                  }}
                  placeholder="បញ្ចូលលេខទូរសព្ទ"
                  required
                />
              </div>
              {/* <Button
                type="button"
                onClick={handleSearchClient}
                loading={searching}
                disabled={searching || !formData.phone_number?.trim()}
                icon={<Search className="h-4 w-4" />}
                variant="secondary"
                size="sm"
              >
                ស្វែងរក
              </Button> */}
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
                value={formData.address || ''}
                onChange={(e) => {
                  console.log('🏠 Address changed to:', e.target.value);
                  onFormDataChange({ ...formData, address: e.target.value });
                }}
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
            disabled={searching || !formData.phone_number?.trim()}
            icon={<Search className="h-4 w-4" />}
            className='flex-1'
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
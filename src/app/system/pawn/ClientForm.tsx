// pawn/ClientForm.tsx - Enhanced with Phone Validation and Keyboard Navigation
'use client';

import { useState, useRef } from 'react';
import { clientsApi } from '@/lib/api';
import { 
  User,
  MapPin,
  Phone,
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
  const [phoneError, setPhoneError] = useState<string>('');

  // Refs for keyboard navigation
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLTextAreaElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  // Function to calculate next ID from existing clients
  const getNextId = (): number => {
    if (clients.length === 0) return 1;
    const maxId = Math.max(...clients.map(client => client.cus_id));
    return maxId + 1;
  };

  // Simple Cambodian phone number validation based on digit count
  const validateCambodianPhone = (phone: string): { isValid: boolean; message: string } => {
    // Remove all non-numeric characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if empty
    if (!cleanPhone) {
      return { isValid: false, message: 'សូមបញ្ចូលលេខទូរសព្ទ' };
    }

    // Check length - Cambodian phones are typically 8-10 digits
    // Mobile: usually 9 digits
    // Landline: usually 8 digits  
    // Some variations: 7-10 digits to be flexible
    if (cleanPhone.length < 7 || cleanPhone.length > 10) {
      return { isValid: false, message: 'លេខទូរសព្ទត្រូវតែមាន ៧ ទៅ ១០ ខ្ទង់' };
    }

    return { isValid: true, message: '' };
  };

  // Format phone number for display (add spaces for readability)
  const formatPhoneNumber = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length >= 3) {
      if (cleanPhone.length <= 6) {
        return cleanPhone.replace(/(\d{3})(\d+)/, '$1 $2');
      } else if (cleanPhone.length <= 9) {
        return cleanPhone.replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3');
      } else {
        return cleanPhone.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1 $2 $3 $4');
      }
    }
    
    return cleanPhone;
  };

  const resetForm = () => {
    console.log('🔄 Resetting both forms');
    
    // Reset client form data
    onFormDataChange({ cus_name: '', address: '', phone_number: '' });
    onClientFound(null);
    setPhoneError('');
    
    // Reset pawn form as well if callback is provided
    if (onResetBothForms) {
      onResetBothForms();
    }

    // Focus on first input
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  };

  const handleSearchClient = async () => {
    if (!formData.phone_number?.trim()) {
      onNotification('error', 'សូមបញ្ចូលលេខទូរសព្ទដើម្បីស្វែងរក');
      return;
    }

    // Validate phone before searching
    const validation = validateCambodianPhone(formData.phone_number);
    if (!validation.isValid) {
      setPhoneError(validation.message);
      onNotification('error', validation.message);
      return;
    }

    setSearching(true);
    setPhoneError('');

    try {
      // Send only digits to API
      const cleanPhone = formData.phone_number.replace(/\D/g, '');
      const response = await clientsApi.search(cleanPhone);
      
      if (response.code === 200 && response.result && response.result.length > 0) {
        const client = response.result[0];
        onClientFound(client);
        
        // Auto-fill the form with found client data
        onFormDataChange({
          cus_name: client.cus_name || '',
          address: client.address || '',
          phone_number: formatPhoneNumber(client.phone_number) || formData.phone_number
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
    } catch (error: unknown) {
      console.error('Error searching client:', error);
      
      // Handle different error cases
      const apiError = error as { response?: { status?: number; data?: { message?: string } } };
      
      if (apiError.response?.status === 404) {
        onNotification('error', 'មិនរកឃើញអតិថិជនដែលមានលេខទូរសព្ទនេះទេ');
      } else if (apiError.response?.status === 400) {
        onNotification('error', 'លេខទូរសព្ទមិនត្រឹមត្រូវ');
      } else if (apiError.response?.status === 500) {
        onNotification('error', 'មានបញ្ហាពីម៉ាស៊ីនបម្រើ សូមព្យាយាមម្តងទៀត');
      } else {
        const errorMessage = apiError.response?.data?.message || 'មានបញ្ហាក្នុងការស្វែងរកអតិថិជន';
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
    
    // Validate required fields
    if (!formData.cus_name?.trim()) {
      onNotification('error', 'សូមបញ្ចូលឈ្មោះអតិថិជន');
      nameInputRef.current?.focus();
      return;
    }

    if (!formData.phone_number?.trim()) {
      onNotification('error', 'សូមបញ្ចូលលេខទូរសព្ទ');
      phoneInputRef.current?.focus();
      return;
    }

    // Validate phone number
    const phoneValidation = validateCambodianPhone(formData.phone_number);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.message);
      onNotification('error', phoneValidation.message);
      phoneInputRef.current?.focus();
      return;
    }

    setPhoneError('');

    try {
      // Send clean phone number (digits only) to API
      const clientData = {
        cus_name: formData.cus_name.trim(),
        address: formData.address?.trim() || '',
        phone_number: formData.phone_number.replace(/\D/g, '') // Send only digits
      };

      const response = await clientsApi.create(clientData);
      
      if (response.code === 200) {
        onNotification('success', 'អតិថិជនត្រូវបានបង្កើតដោយជោគជ័យ');
        resetForm();
        onClientCreated();
      } else {
        onNotification('error', response.message || 'មានបញ្ហាក្នុងការរក្សាទុកអតិថិជន');
      }
    } catch (error: unknown) {
      console.error('Error saving client:', error);
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError.response?.data?.message || 'មានបញ្ហាក្នុងការរក្សាទុកអតិថិជន';
      onNotification('error', errorMessage);
    }
  };

  // Handle phone number input change with validation
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow only numbers, spaces, and common phone separators, but remove them for storage
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 10 digits maximum
    if (digitsOnly.length > 10) {
      return;
    }

    // Format for display
    const formattedPhone = formatPhoneNumber(digitsOnly);
    
    const newFormData = {
      ...formData, 
      phone_number: formattedPhone 
    };
    
    onFormDataChange(newFormData);
    
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError('');
    }

    // Real-time validation feedback
    if (digitsOnly.length >= 7) {
      const validation = validateCambodianPhone(digitsOnly);
      if (!validation.isValid) {
        setPhoneError(validation.message);
      } else {
        setPhoneError('');
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      switch (currentField) {
        case 'name':
          phoneInputRef.current?.focus();
          break;
        case 'phone':
          // If phone is valid, move to address, otherwise stay
          const validation = validateCambodianPhone(formData.phone_number);
          if (validation.isValid) {
            addressInputRef.current?.focus();
          }
          break;
        case 'address':
          searchButtonRef.current?.focus();
          break;
        default:
          break;
      }
    }

    // Arrow key navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      switch (currentField) {
        case 'name':
          phoneInputRef.current?.focus();
          break;
        case 'phone':
          addressInputRef.current?.focus();
          break;
        case 'address':
          searchButtonRef.current?.focus();
          break;
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      switch (currentField) {
        case 'phone':
          nameInputRef.current?.focus();
          break;
        case 'address':
          phoneInputRef.current?.focus();
          break;
        case 'search':
          addressInputRef.current?.focus();
          break;
      }
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
                ref={nameInputRef}
                type="text"
                value={formData.cus_name || ''}
                onChange={(e) => onFormDataChange({ ...formData, cus_name: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 'name')}
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
            <div className="relative">
              <Phone 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: colors.secondary[400] }}
              />
              <input
                ref={phoneInputRef}
                type="tel"
                value={formData.phone_number || ''}
                onChange={handlePhoneNumberChange}
                onKeyDown={(e) => handleKeyDown(e, 'phone')}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  phoneError ? 'border-red-500 ring-1 ring-red-500' : ''
                }`}
                style={{ 
                  borderColor: phoneError ? '#ef4444' : colors.secondary[300],
                  backgroundColor: foundClient ? colors.success[50] : 'white'
                }}
                placeholder="បញ្ចូលលេខទូរសព្ទ"
                inputMode="numeric"
                required
              />
            </div>
            {phoneError && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                {phoneError}
              </p>
            )}
            {/* {formData.phone_number && !phoneError && formData.phone_number.replace(/\D/g, '').length >= 7 && (
              <p className="mt-1 text-xs text-green-600 flex items-center">
                <span className="mr-1">✅</span>
                លេខទូរសព្ទត្រឹមត្រូវ
              </p>
            )} */}
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
                ref={addressInputRef}
                value={formData.address || ''}
                onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 'address')}
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
            ref={searchButtonRef}
            type="button"
            onClick={handleSearchClient}
            loading={searching}
            disabled={searching || !formData.phone_number?.trim()}
            icon={<Search className="h-4 w-4" />}
            className="flex-1"
            onKeyDown={(e) => handleKeyDown(e, 'search')}
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

          {/* <Button
            type="submit"
            loading={submitting}
            disabled={submitting || !formData.cus_name?.trim() || !formData.phone_number?.trim() || !!phoneError}
            icon={<Save className="h-4 w-4" />}
            className="bg-green-600 hover:bg-green-700"
          >
            រក្សាទុក
          </Button> */}
        </div>
      </form>
    </Card>
  );
}
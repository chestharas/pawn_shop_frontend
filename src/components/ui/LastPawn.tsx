// components/ui/LastPawn.tsx
'use client';

import { useState } from 'react';
import { colors } from '@/lib/colors';
import { 
  Clock,
  User,
  Printer,
  RefreshCw,
  Calendar,
  Phone,
  MapPin,
  DollarSign,
  AlertCircle,
  Gem
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { printPawn } from '@/lib/printPawn'; // Import the pawn print utility

// Pawn Interfaces
interface PawnItem {
  item_name: string;
  item_id: number;
  item_weight: string;
  item_quantity: number;
  estimated_value: number;
  pawn_amount: number;
  item_condition: string;
  subtotal: number;
}

interface PawnInfo {
  pawn_id: number;
  pawn_date: string;
  loan_amount: number;
  interest_rate: number;
  loan_period_days: number;
  due_date: string;
  status: 'active' | 'redeemed' | 'defaulted' | 'extended';
  total_amount_due: number;
}

interface ClientInfo {
  cus_id: number;
  cus_name: string;
  address: string;
  phone_number: string;
}

interface PawnSummary {
  total_items: number;
  total_estimated_value: number;
  loan_amount: number;
  interest_amount: number;
  total_due: number;
  days_remaining: number;
}

interface Pawn {
  pawn_info: PawnInfo;
  client_info: ClientInfo;
  items: PawnItem[];
  summary: PawnSummary;
}

interface LastPawnProps {
  pawns: Pawn[];
  loading: boolean;
  onRefresh: () => void;
  onNotification: (type: 'success' | 'error', message: string) => void;
}

export default function LastPawn({ 
  pawns, 
  loading, 
  onRefresh, 
  onNotification 
}: LastPawnProps) {
  const [printing, setPrinting] = useState<{ [key: number]: boolean }>({});

  // Get status color and text - Updated for real API data
  const getStatusInfo = (status: string, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysRemaining = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Handle the actual statuses from your API
    switch (status) {
      case 'active':
        if (daysRemaining < 0) {
          return { color: colors.error[600], bg: colors.error[100], text: 'ហួសកំណត់', urgent: true };
        } else if (daysRemaining <= 7) {
          return { color: colors.warning[600], bg: colors.warning[100], text: 'ជិតកំណត់', urgent: true };
        }
        return { color: colors.success[600], bg: colors.success[100], text: 'សកម្ម', urgent: false };
      case 'overdue':
        return { color: colors.error[600], bg: colors.error[100], text: 'ហួសកំណត់', urgent: true };
      case 'warning':
        return { color: colors.warning[600], bg: colors.warning[100], text: 'ជិតកំណត់', urgent: true };
      case 'redeemed':
        return { color: colors.primary[600], bg: colors.primary[100], text: 'បានដោះ', urgent: false };
      case 'defaulted':
        return { color: colors.error[600], bg: colors.error[100], text: 'បានបាត់បង់', urgent: false };
      case 'extended':
        return { color: colors.warning[600], bg: colors.warning[100], text: 'បានពន្យារ', urgent: false };
      default:
        // Default to active status logic
        if (daysRemaining < 0) {
          return { color: colors.error[600], bg: colors.error[100], text: 'ហួសកំណត់', urgent: true };
        } else if (daysRemaining <= 7) {
          return { color: colors.warning[600], bg: colors.warning[100], text: 'ជិតកំណត់', urgent: true };
        }
        return { color: colors.success[600], bg: colors.success[100], text: 'សកម្ម', urgent: false };
    }
  };

  // Simplified print handler using the utility function
  const handlePrintPawn = async (pawnId: number) => {
    setPrinting(prev => ({ ...prev, [pawnId]: true }));
    
    try {
      await printPawn(pawnId, onNotification);
    } catch (error) {
      // Error handling is already done in the print utility
      console.error('Pawn print failed:', error);
    } finally {
      setPrinting(prev => ({ ...prev, [pawnId]: false }));
    }
  };

  // Function to calculate pawn remaining amount
  // សរុបត្រូវសង = តម្លៃសរុប - ប្រាក់កក់ (Total Value - Deposit)
  const calculatePawnRemaining = (pawn: Pawn): number => {
    const totalValue = pawn.summary.total_estimated_value || 0;
    const deposit = pawn.summary.loan_amount || 0; // This is actually the deposit (pawn_deposit)
    
    return Math.max(0, totalValue - deposit);
  };

  return (
    <Card 
      title="ការបញ្ចាំចុងក្រោយ"
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
        ) : pawns.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-4" style={{ color: colors.secondary[400] }} />
            <p style={{ color: colors.secondary[600] }}>មិនមានការបញ្ចាំណាមួយទេ</p>
            <p className="text-xs mt-2" style={{ color: colors.secondary[500] }}>
              ការបញ្ចាំថ្មីនឹងបង្ហាញនៅទីនេះ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {pawns.map((pawn, index) => {
              const statusInfo = getStatusInfo(pawn.pawn_info.status, pawn.pawn_info.due_date);
              const calculatedPawnRemaining = calculatePawnRemaining(pawn);
              
              return (
                <div 
                  key={pawn.pawn_info.pawn_id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  style={{ 
                    borderColor: statusInfo.urgent ? colors.error[300] : colors.secondary[200],
                    backgroundColor: index === 0 ? colors.success[25] : 'white',
                    borderWidth: statusInfo.urgent ? '2px' : '1px'
                  }}
                >
                  {/* Pawn Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: index === 0 ? colors.success[100] : colors.primary[100],
                          color: index === 0 ? colors.success[700] : colors.primary[700]
                        }}
                      >
                        #{pawn.pawn_info.pawn_id}
                        {index === 0 && ' (ថ្មីបំផុត)'}
                      </div>
                      
                      {/* Status Badge */}
                      <div 
                        className="px-2 py-1 rounded-full text-xs font-medium flex items-center"
                        style={{
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.color
                        }}
                      >
                        {statusInfo.urgent && <AlertCircle className="h-3 w-3 mr-1" />}
                        {statusInfo.text}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handlePrintPawn(pawn.pawn_info.pawn_id)}
                      loading={printing[pawn.pawn_info.pawn_id]}
                      icon={<Printer className="h-4 w-4" />}
                      size="sm"
                      variant="secondary"
                      disabled={printing[pawn.pawn_info.pawn_id]}
                    >
                      {printing[pawn.pawn_info.pawn_id] ? 'កំពុងបោះពុម្ព...' : 'បោះពុម្ព'}
                    </Button>
                  </div>

                  {/* Pawn Dates */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-sm" style={{ color: colors.secondary[600] }}>
                      <Calendar className="h-4 w-4 mr-1" />
                      បញ្ចាំនៅ: {new Date(pawn.pawn_info.pawn_date).toLocaleDateString('km-KH')}
                    </div>
                    <div className="flex items-center text-sm" style={{ 
                      color: statusInfo.urgent ? colors.error[600] : colors.secondary[600] 
                    }}>
                      <Clock className="h-4 w-4 mr-1" />
                      ផុតកំណត់: {new Date(pawn.pawn_info.due_date).toLocaleDateString('km-KH')}
                      {statusInfo.urgent && (
                        <span className="ml-1 font-medium">
                          ({pawn.summary.days_remaining < 0 ? 'ហួស' : 'នៅសល់'} {Math.abs(pawn.summary.days_remaining)} ថ្ងៃ)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4">
                    <div className="flex items-center mb-1">
                      <User className="h-4 w-4 mr-2" style={{ color: colors.secondary[500] }} />
                      <span className="text-sm font-medium" style={{ color: colors.secondary[700] }}>
                        {pawn.client_info.cus_name}
                      </span>
                    </div>
                    <div className="flex items-center mb-1">
                      <Phone className="h-4 w-4 mr-2" style={{ color: colors.secondary[500] }} />
                      <span className="text-sm" style={{ color: colors.secondary[600] }}>
                        {pawn.client_info.phone_number}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: colors.secondary[500] }} />
                      <span className="text-sm" style={{ color: colors.secondary[600] }}>
                        {pawn.client_info.address || 'មិនបានបញ្ចូល'}
                      </span>
                    </div>
                  </div>

                  {/* Loan Summary */}
                  <div className="space-y-2 mb-4 p-3 rounded" style={{ backgroundColor: colors.secondary[50] }}>
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: colors.secondary[600] }}>វត្ថុបញ្ចាំ:</span>
                      <span className="text-sm font-medium">{pawn.summary.total_items} ច្បាប់</span>
                    </div>
                    <div className="flex justify-between">
                      {/* This is fucture work fix in the page | Change form total_estimated_value to total_value */}
                      <span className="text-sm" style={{ color: colors.secondary[600] }}>តម្លៃសរុប:</span>
                      <span className="text-sm font-medium">${pawn.summary.total_estimated_value.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      {/* This is future work fix in the page | Change form loan_amount to pawn_deposit */}
                      <span className="text-sm" style={{ color: colors.secondary[600] }}>ប្រាក់កក់:</span>
                      <span className="text-sm font-medium">${pawn.summary.loan_amount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between border-t pt-2" style={{ borderColor: colors.secondary[200] }}>
                      {/* Using the calculation function */}
                      <span className="text-sm font-medium" style={{ color: colors.secondary[700] }}>សរុបត្រូវសង:</span>
                      <span 
                        className="text-sm font-bold flex items-center"
                        style={{ color: statusInfo.urgent ? colors.error[600] : colors.success[600] }}
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        {calculatedPawnRemaining.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Gem className="h-4 w-4 mr-2" style={{ color: colors.secondary[500] }} />
                      <span className="text-sm font-medium" style={{ color: colors.secondary[700] }}>
                        បញ្ជីវត្ថុបញ្ចាំ
                      </span>
                    </div>
                    <div className="space-y-1">
                      {pawn.items.slice(0, 3).map((item, itemIndex) => (
                        <div 
                          key={itemIndex}
                          className="flex justify-between items-center py-1 px-2 rounded text-sm"
                          style={{ backgroundColor: colors.secondary[25] }}
                        >
                          <span className="truncate mr-2" title={item.item_name}>
                            {item.item_name}
                          </span>
                          <div className="flex items-center space-x-2 text-xs flex-shrink-0" style={{ color: colors.secondary[600] }}>
                            <span>x{item.item_quantity}</span>
                            <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                      {pawn.items.length > 3 && (
                        <div className="text-xs text-center py-1" style={{ color: colors.secondary[500] }}>
                          ... និង {pawn.items.length - 3} វត្ថុផ្សេងទៀត
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}      
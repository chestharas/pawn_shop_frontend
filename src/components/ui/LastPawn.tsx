// components/ui/LastPawn.tsx
'use client';

import { useState } from 'react';
import { pawnsApi } from '@/lib/api';
import { colors } from '@/lib/colors';
import { 
  Clock,
  User,
  Package,
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

  // Print Pawn Function - Using API
  const handlePrintPawn = async (pawnId: number) => {
    setPrinting(prev => ({ ...prev, [pawnId]: true }));
    
    try {
      console.log(`🖨️ Starting print for pawn ID: ${pawnId}`);
      const response = await pawnsApi.printPawn(pawnId);
      
      if (response.code === 200 && response.result) {
        console.log('✅ Print data received:', response.result);
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const printData = response.result;
          
          // Generate HTML for printing
          const printHTML = generatePrintHTML(printData);
          
          printWindow.document.write(printHTML);
          printWindow.document.close();
          
          // Print after a short delay to ensure content is loaded
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
          
          onNotification('success', 'បានបើកទំព័របោះពុម្ពដោយជោគជ័យ');
        } else {
          onNotification('error', 'មិនអាចបើកទំព័របោះពុម្ពបានទេ - browser បានរារាំង popup');
        }
      } else {
        console.log('❌ Print failed:', response);
        onNotification('error', response.message || 'មានបញ្ហាក្នុងការរៀបចំទិន្នន័យសម្រាប់បោះពុម្ព');
      }
    } catch (error: any) {
      console.error('❌ Error printing pawn:', error);
      
      // Better error handling for print functionality
      if (error.message?.includes('Unexpected token') || error.message?.includes('JSON')) {
        onNotification('error', 'Print API មិនត្រឹមត្រូវ - សូមពិនិត្យ backend');
      } else if (error.response?.status === 404) {
        onNotification('error', `ការបញ្ចាំលេខ ${pawnId} មិនត្រូវបានរកឃើញ`);
      } else if (error.response?.status === 401) {
        onNotification('error', 'សូមចូលប្រើប្រាស់ម្តងទៀត');
      } else {
        onNotification('error', 'មានបញ្ហាក្នុងការបោះពុម្ព');
      }
    } finally {
      setPrinting(prev => ({ ...prev, [pawnId]: false }));
    }
  };

  // Generate Print HTML Function - Enhanced for Pawn
  const generatePrintHTML = (printData: any) => {
    try {
      // Validate print data structure
      if (!printData || !printData.header || !printData.customer || !printData.items || !printData.loan_details) {
        console.error('❌ Invalid pawn print data structure:', printData);
        throw new Error('Print data is missing required fields');
      }

      const currentDate = new Date().toLocaleDateString('km-KH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <!DOCTYPE html>
        <html lang="km">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>វិក្កយបត្របញ្ចាំ #${printData.header.pawn_id || 'N/A'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;700&display=swap');
            
            body { 
              font-family: 'Noto Sans Khmer', 'Khmer OS', Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #dc2626;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #dc2626;
              margin-bottom: 10px;
              font-size: 24px;
            }
            .pawn-info { 
              margin-bottom: 20px; 
              background-color: #fef2f2;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #dc2626;
            }
            .customer-info { 
              margin-bottom: 20px; 
              background-color: #f0f8ff;
              padding: 15px;
              border-radius: 5px;
            }
            .customer-info h3 {
              color: #dc2626;
              margin-bottom: 10px;
              font-size: 18px;
            }
            .loan-info {
              margin-bottom: 20px;
              background-color: #fff7ed;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #f59e0b;
            }
            .loan-info h3 {
              color: #f59e0b;
              margin-bottom: 10px;
              font-size: 18px;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .items-table th, .items-table td { 
              border: 1px solid #ddd; 
              padding: 12px 8px; 
              text-align: left; 
              font-size: 14px;
            }
            .items-table th { 
              background-color: #dc2626; 
              font-weight: bold;
              color: white;
            }
            .items-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .items-table tr:hover {
              background-color: #fef2f2;
            }
            .totals { 
              text-align: right; 
              margin-bottom: 20px; 
              background-color: #fff7ed;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #f59e0b;
            }
            .totals p {
              margin: 5px 0;
              font-size: 14px;
            }
            .totals .total-due {
              font-size: 18px;
              font-weight: bold;
              color: #dc2626;
              border-top: 2px solid #333;
              padding-top: 10px;
              margin-top: 10px;
            }
            .warning-box {
              background-color: #fef3cd;
              border: 2px solid #f59e0b;
              border-radius: 5px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
            }
            .warning-box h4 {
              color: #92400e;
              margin-bottom: 10px;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              font-style: italic; 
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .header { page-break-inside: avoid; }
              .customer-info { page-break-inside: avoid; }
              .totals { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏪 ${printData.header.title || 'វិក្កយបត្របញ្ចាំ'}</h1>
            <p><strong>លេខបញ្ចាំ: #${printData.header.pawn_id || 'N/A'}</strong></p>
            <p>កាលបរិច្ចេទបញ្ចាំ: ${printData.header.date || 'N/A'}</p>
            <p>បោះពុម្ពនៅ: ${currentDate}</p>
          </div>
          
          <div class="customer-info">
            <h3>📋 ព័ត៌មានអតិថិជន:</h3>
            <p><strong>ឈ្មោះ:</strong> ${printData.customer.name || 'មិនបានបញ្ចូល'}</p>
            <p><strong>លេខទូរសព្ទ:</strong> ${printData.customer.phone || 'មិនបានបញ្ចូល'}</p>
            <p><strong>អាសយដ្ឋាន:</strong> ${printData.customer.address || 'មិនបានបញ្ចូល'}</p>
          </div>

          <div class="loan-info">
            <h3>💰 ព័ត៌មានប្រាក់កម្ចី:</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <p><strong>ប្រាក់កម្ចី:</strong> $${(printData.loan_details.loan_amount || 0).toFixed(2)}</p>
                <p><strong>អត្រាការប្រាក់:</strong> ${printData.loan_details.interest_rate || 0}% ក្នុងមួយខែ</p>
                <p><strong>រយៈពេល:</strong> ${printData.loan_details.loan_period || 0} ថ្ងៃ</p>
              </div>
              <div>
                <p><strong>កាលបរិច្ចេទផុតកំណត់:</strong> ${printData.loan_details.due_date || 'N/A'}</p>
                <p><strong>ការប្រាក់:</strong> $${(printData.loan_details.interest_amount || 0).toFixed(2)}</p>
                <p><strong>ស្ថានភាព:</strong> ${printData.loan_details.status_text || 'សកម្ម'}</p>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 5%">#</th>
                <th style="width: 30%">វត្ថុបញ្ចាំ</th>
                <th style="width: 10%">ទម្ងន់</th>
                <th style="width: 8%">ចំនួន</th>
                <th style="width: 15%">ស្ថានភាព</th>
                <th style="width: 12%">តម្លៃប៉ាន់ស្មាន</th>
                <th style="width: 12%">ប្រាក់កម្ចី</th>
                <th style="width: 8%">សរុប</th>
              </tr>
            </thead>
            <tbody>
              ${printData.items.map((item: any, index: number) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${item.item_name || 'មិនបានបញ្ចូល'}</td>
                  <td class="text-center">${item.weight || '-'}</td>
                  <td class="text-center">${item.quantity || 0}</td>
                  <td class="text-center">${item.condition || 'ល្អ'}</td>
                  <td class="text-right">$${(item.estimated_value || 0).toFixed(2)}</td>
                  <td class="text-right">$${(item.pawn_amount || 0).toFixed(2)}</td>
                  <td class="text-right font-bold">$${(item.subtotal || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p><strong>តម្លៃវត្ថុសរុប: $${(printData.totals.total_estimated_value || 0).toFixed(2)}</strong></p>
            <p><strong>ប្រាក់កម្ចីសរុប: $${(printData.totals.loan_amount || 0).toFixed(2)}</strong></p>
            <p><strong>ការប្រាក់: $${(printData.totals.interest_amount || 0).toFixed(2)}</strong></p>
            <p class="total-due">សរុបត្រូវសង: $${(printData.totals.total_due || 0).toFixed(2)}</p>
          </div>

          <div class="warning-box">
            <h4>⚠️ សម្គាល់សំខាន់</h4>
            <p>• វត្ថុបញ្ចាំនឹងត្រូវបាត់បង់បើមិនមកដោះក្នុងកំណត់ពេល</p>
            <p>• ការប្រាក់គិតតាមថ្ងៃចាប់ពីថ្ងៃបញ្ចាំ</p>
            <p>• សូមរក្សាវិក្កយបត្រនេះសម្រាប់ការដោះវត្ថុ</p>
          </div>

          <div class="footer">
            <p><strong>${printData.footer?.thank_you || 'អរគុណសម្រាប់ការទុកចិត្ត!'}</strong></p>
            <p>${printData.footer?.note || 'សូមអានខ្លឹមសារលើវិក្កយបត្រដោយយកចិត្តទុកដាក់។'}</p>
          </div>
        </body>
        </html>
      `;
    } catch (error) {
      console.error('❌ Error generating pawn print HTML:', error);
      onNotification('error', 'មានបញ្ហាក្នុងការបង្កើតទំព័របោះពុម្ព');
      return '<html><body><h1>Error generating print content</h1></body></html>';
    }
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
                      <span className="text-sm" style={{ color: colors.secondary[600] }}>តម្លៃប៉ាន់ស្មាន:</span>
                      <span className="text-sm font-medium">${pawn.summary.total_estimated_value.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: colors.secondary[600] }}>ប្រាក់កម្ចី:</span>
                      <span className="text-sm font-medium">${pawn.summary.loan_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: colors.secondary[600] }}>ការប្រាក់:</span>
                      <span className="text-sm font-medium">${pawn.summary.interest_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2" style={{ borderColor: colors.secondary[200] }}>
                      <span className="text-sm font-medium" style={{ color: colors.secondary[700] }}>សរុបត្រូវសង:</span>
                      <span 
                        className="text-sm font-bold flex items-center"
                        style={{ color: statusInfo.urgent ? colors.error[600] : colors.success[600] }}
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        {pawn.summary.total_due.toFixed(2)}
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
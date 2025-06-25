// lib/printPawn.ts - Pawn print utility functions
import { pawnsApi } from '@/lib/api';

// Pawn Print Data Interfaces
interface PawnPrintItem {
  item_name: string;
  weight: string;
  quantity: number;
  condition: string;
  estimated_value: number;
  pawn_amount: number;
  subtotal: number;
}

interface PawnPrintData {
  header: {
    title: string;
    pawn_id: string;
    date: string;
  };
  customer: {
    name: string;
    phone: string;
    address: string;
    customer_id?: string;
  };
  loan_details: {
    loan_amount: number;
    interest_rate: number;
    loan_period: number;
    due_date: string;
    interest_amount: number;
    status_text: string;
  };
  items: PawnPrintItem[];
  totals: {
    total_estimated_value: number;
    loan_amount: number;
    interest_amount: number;
    total_due: number;
  };
  footer: {
    thank_you: string;
    note: string;
  };
}

// Backend pawn data interfaces
interface BackendPawnItem {
  item_name?: string;
  item_weight?: string;
  weight?: string;
  item_quantity?: number;
  quantity?: number;
  item_condition?: string;
  condition?: string;
  estimated_value?: number;
  pawn_amount?: number;
  subtotal?: number;
}

interface BackendPawnCustomer {
  customer_name?: string;
  cus_name?: string;
  phone_number?: string;
  address?: string;
  cus_id?: number;
}

interface BackendPawnData {
  pawn_id?: number;
  pawn_date?: string;
  loan_amount?: number;
  interest_rate?: number;
  loan_period_days?: number;
  due_date?: string;
  interest_amount?: number;
  status?: string;
  customer?: BackendPawnCustomer;
  items?: BackendPawnItem[];
}

// Pawn product interface for print generation
interface PawnProduct {
  prod_name?: string;
  pawn_weight?: string;
  pawn_amount?: number;
  pawn_unit_price?: number;
}

interface PawnPrintCustomer {
  cus_id?: number;
  customer_name?: string;
  phone_number?: string;
  address?: string;
}

interface PawnApiResult {
  customer?: PawnPrintCustomer;
  pawn_id?: number;
  pawn_date?: string;
  pawn_deposit?: number;
  products?: PawnProduct[];
}

interface PawnDataForPrint {
  cus_id: string | number;
  customer_name: string;
  phone_number: string;
  address: string;
  pawns: Array<{
    products: PawnProduct[];
  }>;
}

interface PawnDetailsForPrint {
  pawn_id: number;
  pawn_date: string;
  pawn_deposit: number;
}

// Transform backend data to pawn print format
export const transformPawnPrintData = (backendData: BackendPawnData): PawnPrintData => {
  try {
    // Calculate totals
    const totalEstimatedValue = backendData.items?.reduce((sum: number, item: BackendPawnItem) => {
      return sum + (item.estimated_value || 0);
    }, 0) || 0;

    const totalLoanAmount = backendData.items?.reduce((sum: number, item: BackendPawnItem) => {
      return sum + (item.pawn_amount || 0);
    }, 0) || 0;

    const interestAmount = backendData.interest_amount || 0;
    const totalDue = totalLoanAmount + interestAmount;

    // Get status text in Khmer
    const getStatusText = (status: string) => {
      switch (status) {
        case 'active': return 'សកម្ម';
        case 'overdue': return 'ហួសកំណត់';
        case 'warning': return 'ជិតកំណត់';
        case 'redeemed': return 'បានដោះ';
        case 'defaulted': return 'បានបាត់បង់';
        case 'extended': return 'បានពន្យារ';
        default: return 'សកម្ម';
      }
    };

    return {
      header: {
        title: 'វិក្កយបត្របញ្ចាំ',
        pawn_id: backendData.pawn_id?.toString() || 'N/A',
        date: backendData.pawn_date || new Date().toISOString().split('T')[0]
      },
      customer: {
        name: backendData.customer?.customer_name || backendData.customer?.cus_name || 'មិនបានបញ្ចូល',
        phone: backendData.customer?.phone_number || 'មិនបានបញ្ចូល',
        address: backendData.customer?.address || 'មិនបានបញ្ចូល',
        customer_id: backendData.customer?.cus_id?.toString() || 'មិនបានបញ្ចូល'
      },
      loan_details: {
        loan_amount: backendData.loan_amount || totalLoanAmount,
        interest_rate: backendData.interest_rate || 0,
        loan_period: backendData.loan_period_days || 0,
        due_date: backendData.due_date || 'មិនបានបញ្ចូល',
        interest_amount: interestAmount,
        status_text: getStatusText(backendData.status || 'active')
      },
      items: backendData.items?.map((item: BackendPawnItem) => ({
        item_name: item.item_name || 'មិនបានបញ្ចូល',
        weight: item.item_weight || item.weight || '-',
        quantity: item.item_quantity || item.quantity || 0,
        condition: item.item_condition || item.condition || 'ល្អ',
        estimated_value: item.estimated_value || 0,
        pawn_amount: item.pawn_amount || 0,
        subtotal: item.subtotal || item.pawn_amount || 0
      })) || [],
      totals: {
        total_estimated_value: totalEstimatedValue,
        loan_amount: totalLoanAmount,
        interest_amount: interestAmount,
        total_due: totalDue
      },
      footer: {
        thank_you: 'អរគុណសម្រាប់ការទុកចិត្ត!',
        note: 'សូមអានខ្លឹមសារលើវិក្កយបត្រដោយយកចិត្តទុកដាក់។'
      }
    };
  } catch (error) {
    console.error('❌ Error transforming pawn print data:', error);
    throw new Error('Failed to transform pawn print data');
  }
};

// Generate the HTML for printing pawn receipt using your exact format
export const generatePawnPrintHTML = (pawnData: PawnDataForPrint, pawnDetails: PawnDetailsForPrint): string => {
  try {
    // Calculate total with the actual API structure
    const calculateTotal = (): number => {
      if (!Array.isArray(pawnData.pawns) || !pawnData.pawns[0]?.products) return 0;
      
      return pawnData.pawns[0].products.reduce((total: number, product: PawnProduct) => {
        const amount = product?.pawn_amount || 0;
        const price = product?.pawn_unit_price || 0;
        return total + (amount * price);
      }, 0);
    };

    const total = calculateTotal();

    console.log('🖨️ Generating print HTML with data:', { pawnData, pawnDetails, total });

    return `
      <html>
        <head>
          <title>វិក្កយបត្រ</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body {
              font-family: 'Khmer OS Battambang', Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .logo-section {
            padding-left: 1px;
          }

          .logo {
            margin-top: 25px;
            max-height: 100px;
            width: auto;
          }
          .date-id-section {
            text-align: right;
            margin-right: 20px;
            display: flex;
            flex-direction: column;  /* Stack vertically */
            gap: 5px;  /* Space between date and ID */
          }

          .date-section {
            
            font-size: 14px;
          }

          .pawn-id-section {
            font-size: 14px;
            
          }
            .invoice-title {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin: 20px 0;
            }
            .customer-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              margin-bottom: 20px;
            }
            .customer-info div {
              padding: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: center;
            }
            .total-section {
              width: 30%;
              margin-left: auto;
              border-collapse: collapse;
            }
            .total-section tr { height: 30px; }
            .total-section td { 
              border: 1px solid black; 
              padding: 5px 10px; 
              font-size: 14px; 
            }
            .total-section td:first-child { 
              text-align: left; 
              width: 40%; 
            }
            .total-section td:last-child { 
              text-align: right; 
              width: 60%; 
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
              text-align: center;
            }
            .signatures div { width: 200px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header-section">
            <div class="logo-section">
              <img src="/logo.png"  alt="Company Logo" class="logo">
            </div>
            <div class="date-id-section">
              <div class="date-section">
                កាលបរិច្ឆេទ៖ ${pawnDetails.pawn_date}
              </div>
              <div class="pawn-id-section">
                លេខវិក្កយបត្រ៖ ${pawnDetails.pawn_id}
              </div>
            </div>
          </div>

          <div class="invoice-title">
            វិក្កយបត្រ<br>
            INVOICE
          </div>

          <div class="customer-info">
            <div>លេខអតិថិជន: ${pawnData.cus_id}</div>
            <div>ឈ្មោះអតិថិជន: ${pawnData.customer_name}</div>
            <div>លេខទូរស័ព្ទ: ${pawnData.phone_number}</div>
            <div>អាសយដ្ឋាន: ${pawnData.address}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ល.រ</th>
                <th>ឈ្មោះទំនិញ</th>
                <th>ទំងន់</th>
                <th>ចំនួន</th>
                <th>តំលៃ</th>
              </tr>
            </thead>
            <tbody>
              ${pawnData.pawns[0]?.products?.map((product: PawnProduct, index: number) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${product?.prod_name || 'មិនបានបញ្ចូល'}</td>
                  <td>${product?.pawn_weight || '-'}</td>
                  <td>${product?.pawn_amount || 0}</td>
                  <td>${product?.pawn_unit_price || 0}</td>
                </tr>
              `).join('') || '<tr><td colspan="5">មិនមានទិន្នន័យផលិតផល</td></tr>'}
            </tbody>
          </table>

          <table class="total-section">
            <tr>
              <td>សរុប</td>
              <td>${total.toFixed(2)}</td>
            </tr>
            <tr>
              <td>កក់មុន</td>
              <td>${pawnDetails.pawn_deposit}</td>
            </tr>
            <tr>
              <td>នៅខ្វះ</td>
              <td>${(total - pawnDetails.pawn_deposit).toFixed(2)}</td>
            </tr>
          </table>

          <div class="signatures">
            <div>ហត្ថលេខាអ្នកទិញ</div>
            <div>ហត្ថលេខាអ្នកលក់</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `;
  } catch (error) {
    console.error('❌ Error generating pawn print HTML:', error);
    throw new Error('Failed to generate pawn print HTML');
  }
};

// Main pawn print function that handles the entire print process
export const printPawn = async (
  pawnId: number,
  onNotification: (type: 'success' | 'error', message: string) => void
): Promise<void> => {
  try {
    console.log(`🖨️ Starting print for pawn ID: ${pawnId}`);
    // API call with query parameter: /api/pawn/print?pawn_id=8
    const response = await pawnsApi.printPawn(pawnId);
    
    if (response.code === 200 && response.result) {
      console.log('✅ Pawn print data received:', response.result);
      
      // The API returns data directly in result object
      const apiData = response.result as PawnApiResult;
      
      // Map the actual API structure to the print format
      const pawnData: PawnDataForPrint = {
        cus_id: apiData.customer?.cus_id || 'N/A',
        customer_name: apiData.customer?.customer_name || 'មិនបានបញ្ចូល',
        phone_number: apiData.customer?.phone_number || 'មិនបានបញ្ចូល',
        address: apiData.customer?.address || 'មិនបានបញ្ចូល',
        pawns: [{
          products: apiData.products || []
        }]
      };

      const pawnDetails: PawnDetailsForPrint = {
        pawn_id: apiData.pawn_id || pawnId,
        pawn_date: apiData.pawn_date ? new Date(apiData.pawn_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        pawn_deposit: apiData.pawn_deposit || 0
      };
      
      console.log('🔄 Transformed data for printing:', { pawnData, pawnDetails });
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // Generate HTML for printing using your exact format
        const printHTML = generatePawnPrintHTML(pawnData, pawnDetails);
        
        printWindow.document.write(printHTML);
        printWindow.document.close();
        
        onNotification('success', 'បានបើកទំព័របោះពុម្ពដោយជោគជ័យ');
      } else {
        onNotification('error', 'មិនអាចបើកទំព័របោះពុម្ពបានទេ - browser បានរារាំង popup');
      }
    } else {
      console.log('❌ Pawn print failed:', response);
      onNotification('error', response.message || 'មានបញ្ហាក្នុងការរៀបចំទិន្នន័យសម្រាប់បោះពុម្ព');
    }
  } catch (error: unknown) {
    console.error('❌ Error printing pawn:', error);
    
    // Better error handling for print functionality
    const errorMessage = error instanceof Error ? error.message : '';
    const errorResponse = error && typeof error === 'object' && 'response' in error ? error.response as { status?: number } : null;
    
    if (errorMessage?.includes('Unexpected token') || errorMessage?.includes('JSON')) {
      onNotification('error', 'Print API មិនត្រឹមត្រូវ - សូមពិនិត្យ backend');
    } else if (errorResponse?.status === 404) {
      onNotification('error', `ការបញ្ចាំលេខ ${pawnId} មិនត្រូវបានរកឃើញ`);
    } else if (errorResponse?.status === 401) {
      onNotification('error', 'សូមចូលប្រើប្រាស់ម្តងទៀត');
    } else {
      onNotification('error', 'មានបញ្ហាក្នុងការបោះពុម្ព');
    }
  }
};
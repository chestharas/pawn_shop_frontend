'use client';

import FontTest from '@/components/FontTest';
import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api';
import { 
  Edit2, 
  Trash2, 
  Package, 
  X,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Hash,
  Save,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { colors } from '@/lib/colors';

// Import UI Components
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { SearchInput } from '@/components/ui/SearchInput';
import { Card } from '@/components/ui/Card';
import { ActionButton } from '@/components/ui/ActionButton';

// Updated interface to match your API response
interface Product {
  id: number;
  name: string;  // Changed from prod_name to name
  price?: number | null;  // Changed from unit_price to price
  amount?: number | null;
}

interface FormData {
  prod_name: string;  // Keep as prod_name for API request
  unit_price: string; // Keep as unit_price for API request
  amount: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface DeleteModal {
  isOpen: boolean;
  product: Product | null;
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({ isOpen: false, product: null });
  const [formData, setFormData] = useState<FormData>({
    prod_name: '',
    unit_price: '',
    amount: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  // Function to calculate next ID from existing products
  const getNextId = (): number => {
    if (products.length === 0) return 1;
    const maxId = Math.max(...products.map(product => product.id));
    return maxId + 1;
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll();
      if (response.code === 200 && response.result) {
        setProducts(response.result);
      } else {
        showNotification('error', 'មិនអាចទាញយកបញ្ជីទំនិញបានទេ');
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      showNotification('error', 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យ');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ prod_name: '', unit_price: '', amount: '' });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      prod_name: product.name, // Map name to prod_name
      unit_price: product.price?.toString() || '', // Map price to unit_price
      amount: product.amount?.toString() || ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prod_name.trim()) {
      showNotification('error', 'សូមបញ្ចូលឈ្មោះទំនិញ');
      return;
    }

    setSubmitting(true);

    try {
      const productData = {
        prod_name: formData.prod_name.trim(),
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : undefined,
        amount: formData.amount ? parseInt(formData.amount) : undefined
      };

      let response;
      if (editingProduct) {
        // Update existing product
        response = await productsApi.update({
          prod_id: editingProduct.id,
          ...productData
        });
      } else {
        // Create new product
        response = await productsApi.create(productData);
      }

      if (response.code === 200) {
        showNotification('success', 
          editingProduct ? 'ទំនិញត្រូវបានកែប្រែដោយជោគជ័យ' : 'ទំនិញត្រូវបានបង្កើតដោយជោគជ័យ'
        );
        resetForm();
        loadProducts(); // Reload to get updated list and recalculate next ID
      } else {
        showNotification('error', response.message || 'មានបញ្ហាក្នុងការរក្សាទុកទំនិញ');
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      const errorMessage = error.response?.data?.message || 'មានបញ្ហាក្នុងការរក្សាទុកទំនិញ';
      showNotification('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (product: Product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, product: null });
  };

  const confirmDelete = async () => {
    if (!deleteModal.product) return;

    setDeleting(true);
    try {
      const response = await productsApi.delete(deleteModal.product.id);
      if (response.code === 200) {
        showNotification('success', 'ទំនិញត្រូវបានលុបដោយជោគជ័យ');
        loadProducts(); // Reload to recalculate next ID
        closeDeleteModal();
      } else {
        showNotification('error', 'មិនអាចលុបទំនិញបានទេ');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      showNotification('error', 'មានបញ្ហាក្នុងការលុបទំនិញ');
    } finally {
      setDeleting(false);
    }
  };

  // Fix the filter to handle undefined/null values and use correct field name
  const filteredProducts = products.filter(product => 
    product?.name?.toLowerCase()?.includes(searchTerm.toLowerCase() || '') || false
  );

  // Table columns configuration with correct field mapping
  const columns = [
    {
      key: 'id',
      label: 'លេខសំគាល់',
      width: '100px',
      align: 'center' as const,
      render: (value: any) => (
        <span style={{ color: colors.secondary[700], fontWeight: '500' }}>{value}</span>
      )
    },
    {
      key: 'name', // Changed from prod_name to name
      label: 'ឈ្មោះទំនិញ',
      width: '300px', // Give more space for longer product names
      render: (value: any) => (
        <span className="font-medium" style={{ color: colors.secondary[900] }}>
          {value || '-'}
        </span>
      )
    },
    {
      key: 'price', // Changed from unit_price to price
      label: 'តំលៃក្នុងមួយឯកតា',
      width: '140px',
      align: 'center' as const,
      render: (value: any) => (
        <span style={{ color: colors.secondary[700], fontWeight: '500' }}>
          {value ? `${value.toFixed(2)}` : '-'}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'ចំនួន',
      width: '80px',
      align: 'center' as const,
      render: (value: any) => (
        <span style={{ color: colors.secondary[700], fontWeight: '500' }}>
          {value || '-'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'ប្រតិបត្តិការ',
      width: '120px',
      align: 'center' as const,
      render: (value: any, row: Product) => (
        <div className="flex items-center justify-center space-x-2">
          <ActionButton
            onClick={() => handleEdit(row)}
            icon={<Edit2 className="h-4 w-4" />}
            variant="edit"
            title="កែប្រែ"
          />
          <ActionButton
            onClick={() => openDeleteModal(row)}
            icon={<Trash2 className="h-4 w-4" />}
            variant="delete"
            title="លុប"
          />
        </div>
      )
    }
  ];

  return (
    <div 
      className="h-full overflow-hidden flex flex-col" 
      style={{ backgroundColor: colors.secondary[50] }}
    >
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-opacity-20 backdrop-blur-sm"
            onClick={closeDeleteModal}
          />
          
          {/* Modal */}
          <div 
            className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: 'white' }}
          >
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.error[100] }}
              >
                <AlertTriangle 
                  className="h-6 w-6" 
                  style={{ color: colors.error[600] }}
                />
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: colors.secondary[900] }}
                >
                  បញ្ជាក់ការលុប
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: colors.secondary[600] }}
                >
                  សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p 
                className="text-sm"
                style={{ color: colors.secondary[700] }}
              >
                តើអ្នកពិតជាចង់លុបទំនិញ{' '}
                <span className="font-semibold font-khmer">
                  "{deleteModal.product?.name}"
                </span>{' '}
                មែនទេ?
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                onClick={closeDeleteModal}
                variant="secondary"
                className="flex-1"
                disabled={deleting}
              >
                បោះបង់
              </Button>
              <Button
                onClick={confirmDelete}
                className="flex-1"
                loading={deleting}
                disabled={deleting}
                style={{
                  backgroundColor: colors.error[600],
                  borderColor: colors.error[600]
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.error[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.error[600];
                }}
              >
                លុប
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div 
          className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2"
          style={{
            backgroundColor: notification.type === 'success' ? colors.success[50] : colors.error[50],
            color: notification.type === 'success' ? colors.success[800] : colors.error[800],
            border: `1px solid ${notification.type === 'success' ? colors.success[200] : colors.error[200]}`
          }}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Content - Fit within available space */}
      <div className="flex-1 p-4 overflow-hidden" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-4 max-w-full">
          
          {/* Left Panel - Form (1/3 width on xl screens) */}
          <div className="xl:col-span-1 flex flex-col">
            <Card title="បំពេញទំនិញថ្មី" className="h-full flex flex-col">
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  {/* Product ID */}
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
                      {editingProduct ? (
                        `កំពុងកែប្រែ: ${editingProduct.id}`
                      ) : (
                        `${getNextId()}`
                      )}
                    </div>
                  </div>

                  {/* Product Name */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.secondary[700] }}
                    >
                      ឈ្មោះទំនិញ
                    </label>
                    <input
                      type="text"
                      value={formData.prod_name}
                      onChange={(e) => setFormData({ ...formData, prod_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      style={{ 
                        borderColor: colors.secondary[300],
                      }}
                      placeholder="បញ្ចូលឈ្មោះទំនិញ"
                      required
                    />
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.secondary[700] }}
                    >
                      តំលៃក្នុងមួយឯកតា
                    </label>
                    <div className="relative">
                      <DollarSign 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                        style={{ color: colors.secondary[400] }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.unit_price}
                        onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        style={{ 
                          borderColor: colors.secondary[300],
                        }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.secondary[700] }}
                    >
                      ចំនួន
                    </label>
                    <div className="relative">
                      <Hash 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                        style={{ color: colors.secondary[400] }}
                      />
                      <input
                        type="number"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        style={{ 
                          borderColor: colors.secondary[300],
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Pinned to bottom */}
                <div className="flex space-x-3 pt-6 mt-auto">
                  <Button
                    type="submit"
                    disabled={submitting}
                    loading={submitting}
                    icon={<Save className="h-4 w-4" />}
                    className="flex-1"
                  >
                    {editingProduct ? 'កែប្រែ' : 'រក្សាទុក'}
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
          </div>

          {/* Right Panel - Products Table (2/3 width on xl screens) */}
          <div className="xl:col-span-2 flex flex-col">
            <Card title="បញ្ជីទំនិញ" padding={false} className="h-full flex flex-col">
              {/* Search Header */}
              <div className="p-4 border-b flex-shrink-0" style={{ borderBottomColor: colors.secondary[200] }}>
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="ស្វែងរកទំនិញ..."
                />
              </div>
              
              {/* Table Container - Takes remaining height */}
              <div className="flex-1 overflow-hidden">
                <Table
                  columns={columns}
                  data={filteredProducts}
                  loading={loading}
                  emptyMessage="មិនមានទំនិញក្នុងបញ្ជី"
                  emptyIcon={<Package className="h-8 w-8" />}
                  scrollThreshold={6}
                  className="h-full"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
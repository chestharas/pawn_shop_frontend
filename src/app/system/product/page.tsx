'use client';

import { useState, useEffect, useCallback } from 'react';
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
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
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
  name: string;
  price?: number | null;
  amount?: number | null;
}

interface FormData {
  prod_name: string;
  unit_price: string;
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

interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_count: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    limit: 10,
    has_next: false,
    has_prev: false
  });

  const [formData, setFormData] = useState<FormData>({
    prod_name: '',
    unit_price: '',
    amount: ''
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  // Function to calculate next ID from existing products
  const getNextId = (): number => {
    if (products.length === 0) return 1;
    const maxId = Math.max(...products.map(product => product.id));
    return maxId + 1;
  };

  const loadProducts = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await productsApi.getAll(page, limit); 
      
      if (response.code === 200 && response.result) {
        const { products: productList, pagination: paginationInfo } = response.result;
        
        if (Array.isArray(productList)) {
          setProducts(productList);
          setPagination(paginationInfo);
          setCurrentPage(paginationInfo.current_page);
        } else {
          setProducts([]);
          showNotification('error', 'មិនអាចទាញយកបញ្ជីទំនិញបានទេ');
        }
      } else {
        setProducts([]);
        showNotification('error', 'មិនអាចទាញយកបញ្ជីទំនិញបានទេ');
      }
    } catch (error: unknown) {
      console.error('Error loading products:', error);
      setProducts([]);
      showNotification('error', 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យ');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load products and determine last page on initial load
  const loadProductsWithLastPage = useCallback(async () => {
    if (isInitialLoad) {
      try {
        setLoading(true);
        // First, get the first page to know total pages
        const response = await productsApi.getAll(1, pageSize);
        
        if (response.code === 200 && response.result) {
          const { pagination: paginationInfo } = response.result;
          const lastPage = paginationInfo.total_pages;
          
          // Now load the last page
          if (lastPage > 1) {
            const lastPageResponse = await productsApi.getAll(lastPage, pageSize);
            if (lastPageResponse.code === 200 && lastPageResponse.result) {
              const { products: productList, pagination: lastPagePagination } = lastPageResponse.result;
              if (Array.isArray(productList)) {
                setProducts(productList);
                setPagination(lastPagePagination);
                setCurrentPage(lastPage);
              }
            }
          } else {
            // Only one page, use the data we already have
            const { products: productList } = response.result;
            if (Array.isArray(productList)) {
              setProducts(productList);
              setPagination(paginationInfo);
              setCurrentPage(1);
            }
          }
        }
        setIsInitialLoad(false);
      } catch (error: unknown) {
        console.error('Error loading products:', error);
        setProducts([]);
        showNotification('error', 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យ');
        setIsInitialLoad(false);
      } finally {
        setLoading(false);
      }
    } else {
      // For subsequent loads, use the regular function
      loadProducts(currentPage, pageSize);
    }
  }, [isInitialLoad, pageSize, currentPage, loadProducts]);

  useEffect(() => {
    if (isInitialLoad) {
      loadProductsWithLastPage();
    } else {
      loadProducts(currentPage, pageSize);
    }
  }, [loadProductsWithLastPage, loadProducts, currentPage, pageSize, isInitialLoad]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const resetForm = () => {
    setFormData({ prod_name: '', unit_price: '', amount: '' });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      prod_name: product.name,
      unit_price: product.price?.toString() || '',
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
        response = await productsApi.update({
          prod_id: editingProduct.id,
          ...productData
        });
      } else {
        response = await productsApi.create(productData);
      }

      if (response.code === 200) {
        showNotification('success', 
          editingProduct ? 'ទំនិញត្រូវបានកែប្រែដោយជោគជ័យ' : 'ទំនិញត្រូវបានបង្កើតដោយជោគជ័យ'
        );
        resetForm();
        // Stay on current page for edits, go to last page for new products
        const pageToLoad = editingProduct ? currentPage : pagination.total_pages || 1;
        setIsInitialLoad(false);
        loadProducts(pageToLoad, pageSize);
      } else {
        showNotification('error', response.message || 'មានបញ្ហាក្នុងការរក្សាទុកទំនិញ');
      }
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError.response?.data?.message || 'មានបញ្ហាក្នុងការរក្សាទុកទំនិញ';
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
        // Check if current page becomes empty after deletion
        const remainingItems = pagination.total_count - 1;
        const maxPage = Math.ceil(remainingItems / pageSize);
        const pageToLoad = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;
        setIsInitialLoad(false);
        loadProducts(pageToLoad, pageSize);
        closeDeleteModal();
      } else {
        showNotification('error', 'មិនអាចលុបទំនិញបានទេ');
      }
    } catch (error: unknown) {
      console.error('Error deleting product:', error);
      showNotification('error', 'មានបញ្ហាក្នុងការលុបទំនិញ');
    } finally {
      setDeleting(false);
    }
  };

  // Pagination functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.total_pages) {
      setCurrentPage(page);
      setIsInitialLoad(false);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(pagination.total_pages);
  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    setIsInitialLoad(false); // Ensure we don't go to last page again
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pagination.total_pages;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const current = currentPage;
    
    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first 3 pages
      pages.push(1);
      pages.push(2);
      pages.push(3);
      
      // Add ellipsis if there's a gap
      if (totalPages > 4) {
        pages.push('...');
      }
      
      // Always show last page if it's not already shown
      if (totalPages > 3) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Filter products (client-side filtering for current page)
  const filteredProducts = products.filter(product => 
    product?.name?.toLowerCase()?.includes(searchTerm.toLowerCase() || '') || false
  );

  // Calculate display range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, pagination.total_count);

  // Table columns configuration
  const columns = [
    {
      key: 'id',
      label: 'លេខសំគាល់',
      width: '100px',
      align: 'center' as const,
      render: (value: unknown) => (
        <span style={{ color: colors.secondary[700], fontWeight: '500' }}>{value as number}</span>
      )
    },
    {
      key: 'name',
      label: 'ឈ្មោះទំនិញ',
      width: '300px',
      render: (value: unknown) => (
        <span className="font-medium" style={{ color: colors.secondary[900] }}>
          {(value as string) || '-'}
        </span>
      )
    },
    {
      key: 'price',
      label: 'តំលៃក្នុងមួយឯកតា',
      width: '140px',
      align: 'center' as const,
      render: (value: unknown) => (
        <span style={{ color: colors.secondary[700], fontWeight: '500' }}>
          {value ? `${(value as number).toFixed(2)}` : '-'}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'ចំនួន',
      width: '80px',
      align: 'center' as const,
      render: (value: unknown) => (
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
      render: (_value: unknown, row: Record<string, unknown>) => {
        const product = row as unknown as Product;
        return (
          <div className="flex items-center justify-center space-x-2">
            <ActionButton
              onClick={() => handleEdit(product)}
              icon={<Edit2 className="h-4 w-4" />}
              variant="edit"
              title="កែប្រែ"
            />
            <ActionButton
              onClick={() => openDeleteModal(product)}
              icon={<Trash2 className="h-4 w-4" />}
              variant="delete"
              title="លុប"
            />
          </div>
        );
      }
    }
  ];

  return (
    <div 
      className="min-h-screen w-full" 
      style={{ backgroundColor: colors.secondary[50] }}
    >
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-opacity-20 backdrop-blur-sm"
            onClick={closeDeleteModal}
          />
          
          <div 
            className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: 'white' }}
          >
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

            <div className="mb-6">
              <p 
                className="text-sm"
                style={{ color: colors.secondary[700] }}
              >
                តើអ្នកពិតជាចង់លុបទំនិញ{' '}
                <span className="font-semibold font-khmer">
                  &quot;{deleteModal.product?.name}&quot;
                </span>{' '}
                មែនទេ?
              </p>
            </div>

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
                variant="danger"
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

      {/* Main Content */}
      <div className="w-full p-4">
        <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-4 max-w-full">
          
          {/* Left Panel - Form */}
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
                                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                        onFocus={(e) => {
                          e.target.style.borderColor = colors.primary[500];
                          e.target.style.boxShadow = `0 0 0 2px ${colors.primary[200]}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = colors.secondary[300];
                          e.target.style.boxShadow = 'none';
                        }}
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

                {/* Action Buttons */}
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

          {/* Right Panel - Products Table */}
          <div className="xl:col-span-2 flex flex-col">
            <Card title="បញ្ជីទំនិញ" padding={false} className="h-full flex flex-col">
              {/* Search and Page Size Controls */}
              <div className="p-4 border-b flex-shrink-0" style={{ borderBottomColor: colors.secondary[200] }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="ស្វែងរកទំនិញ..."
                    className="flex-1 sm:max-w-xs"
                  />
                  
                  {/* <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: colors.secondary[600] }}>
                      បង្ហាញ:
                    </span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: colors.secondary[300] }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div> */}
                </div>
              </div>
              
              {/* Table Container */}
              <div className="flex-1 overflow-hidden">
                <Table
                  columns={columns}
                  data={filteredProducts as Record<string, unknown>[]}
                  loading={loading}
                  emptyMessage="មិនមានទំនិញក្នុងបញ្ជី"
                  emptyIcon={<Package className="h-8 w-8" />}
                  scrollThreshold={6}
                  className="h-full"
                />
              </div>

              {/* Pagination Footer */}
              {pagination.total_count > 0 && (
                <div 
                  className="px-4 py-3 border-t flex-shrink-0"
                  style={{ borderTopColor: colors.secondary[200] }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Results Info */}
                    <div className="text-sm" style={{ color: colors.secondary[600] }}>
                      បង្ហាញ {startItem}-{endItem} នៃ {pagination.total_count} ទំនិញ
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-1">
                      {/* First Page */}
                      <button
                        onClick={goToFirstPage}
                        disabled={!pagination.has_prev}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="ទំព័រដំបូង"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </button>

                      {/* Previous Page */}
                      <button
                        onClick={goToPrevPage}
                        disabled={!pagination.has_prev}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="ទំព័រមុន"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1 mx-2">
                        {getPageNumbers().map((page, index) => (
                          <button
                            key={index}
                            onClick={() => typeof page === 'number' ? goToPage(page) : undefined}
                            disabled={page === '...'}
                            className={`px-3 py-1 text-sm rounded ${
                              page === currentPage
                                ? 'text-white'
                                : page === '...'
                                ? 'cursor-default'
                                : 'hover:bg-gray-100'
                            }`}
                            style={page === currentPage ? { 
                              backgroundColor: colors.primary[500],
                              borderColor: colors.primary[500]
                            } : {}}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      {/* Next Page */}
                      <button
                        onClick={goToNextPage}
                        disabled={!pagination.has_next}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="ទំព័របន្ទាប់"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      {/* Last Page */}
                      <button
                        onClick={goToLastPage}
                        disabled={!pagination.has_next}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="ទំព័រចុងក្រោយ"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
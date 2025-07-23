'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ordersApi } from '@/lib/api';
import { printOrder } from '@/lib/printOrder';
import { 
  Search, 
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  Phone,
  Calendar,
  ShoppingCart,
  MapPin,
  ArrowLeft,
  Package,
  Hash,
  UserCheck,
  RefreshCw,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface Client {
  cus_id: number;
  cus_name: string;
  phone_number: string;
  address: string;
}

interface Product {
  prod_name: string;
  prod_id: number;
  order_weight: string;
  order_amount: number;
  product_sell_price: number;
  product_labor_cost: number;
  product_buy_price: number;
}

interface Order {
  order_id: number;
  order_deposit: number;
  order_date: string;
  products: Product[];
}

interface ClientDetail {
  client_info: {
    cus_id: number;
    cus_name: string;
    address: string;
    phone_number: string;
  };
  orders: Order[];
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface SearchFilters {
  search_id: string;
  search_name: string;
  search_phone: string;
  search_address: string;
}

interface PaginationInfo {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  search_filters?: Record<string, unknown>;
}

export default function OrderPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientDetail, setClientDetail] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search_id: '',
    search_name: '',
    search_phone: '',
    search_address: ''
  });
  const [notification, setNotification] = useState<Notification | null>(null);
  const [showClientDetail, setShowClientDetail] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [printLoading, setPrintLoading] = useState<{ [key: number]: boolean }>({});
  const isMountedRef = useRef(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    if (isMountedRef.current) {
      setNotification({ type, message });
    }
  }, []);

  const loadClients = useCallback(async (page: number = 1, resetPagination: boolean = false) => {
    if (!isMountedRef.current) return;

    try {
      setLoading(true);
      
      if (resetPagination) {
        setCurrentPage(1);
        page = 1;
      }

      console.log('Loading clients with page:', page);
      
      // Call your updated API method with pagination and limit
      const response = await ordersApi.getClientOrders({ 
        page,
        limit: 10  // Add the limit parameter that your backend expects
      });
      
      console.log('Full API Response:', response);
      console.log('Pagination from response:', response.pagination);
      
      if (response.code === 200 && response.result && isMountedRef.current) {
        setClients(response.result);
        
        // Set pagination data from API response
        if (response.pagination) {
          setPagination(response.pagination);
          console.log('✅ Pagination successfully set:', response.pagination);
        } else {
          console.log('❌ No pagination in response, creating fallback');
          // Fallback pagination if API doesn't return it
          const fallbackPagination = {
            current_page: page,
            page_size: 10,
            total_items: response.result.length,
            total_pages: Math.ceil(response.result.length / 10),
            has_next: response.result.length >= 10,
            has_previous: page > 1
          };
          setPagination(fallbackPagination);
        }
        
        setCurrentPage(page);
      } else if (isMountedRef.current) {
        showNotification('error', 'មិនអាចទាញយកបញ្ជីអតិថិជនបានទេ');
      }
    } catch (error: unknown) {
      console.error('Error loading clients:', error);
      if (isMountedRef.current) {
        showNotification('error', 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យអតិថិជន');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [showNotification]);

  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isMountedRef.current) {
      loadClients(1, true);
    }
  }, [loadClients]);

  useEffect(() => {
    if (notification && isMountedRef.current) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setNotification(null);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Debounced search function with pagination
  const debouncedSearch = useCallback((filters: SearchFilters, page: number = 1) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      const hasActiveSearch = filters.search_id.trim() || 
                            filters.search_name.trim() || 
                            filters.search_phone.trim() ||
                            filters.search_address.trim();

      if (!hasActiveSearch) return;

      try {
        setSearchLoading(true);
        setIsSearchMode(true);
        
        // Build search parameters with validation
        const searchParams: { 
          page: number;
          search_id?: number; 
          search_name?: string; 
          search_phone?: string;
          search_address?: string;
        } = { page };
        
        if (filters.search_id.trim()) {
          const cusId = parseInt(filters.search_id.trim());
          if (!isNaN(cusId)) {
            searchParams.search_id = cusId;
          }
        }
        
        if (filters.search_name.trim()) {
          searchParams.search_name = filters.search_name.trim();
        }
        
        if (filters.search_phone.trim()) {
          searchParams.search_phone = filters.search_phone.trim();
        }

        if (filters.search_address.trim()) {
          searchParams.search_address = filters.search_address.trim();
        }

        console.log('Searching with params:', searchParams);

        // Use the same getClientOrders method for search
        const response = await ordersApi.getClientOrders(searchParams);
        
        if (!isMountedRef.current) return;

        console.log('Search response:', response);

        if (response.code === 200) {
          const results = Array.isArray(response.result) ? response.result : [];
          
          setClients(results);
          setPagination(response.pagination);
          setCurrentPage(page);
          
          if (results.length === 0 && page === 1) {
            showNotification('error', 'មិនរកឃើញអតិថិជនដែលត្រូវគ្នាទេ');
          }
        } else {
          setClients([]);
          setPagination(null);
          if (response.message) {
            showNotification('error', response.message);
          }
        }
      } catch (error: unknown) {
        console.error('Error searching clients:', error);
        if (isMountedRef.current) {
          setClients([]);
          setPagination(null);
          showNotification('error', 'មានបញ្ហាក្នុងការស្វែងរក');
        }
      } finally {
        if (isMountedRef.current) {
          setSearchLoading(false);
        }
      }
    }, 300); // 300ms debounce delay
  }, [showNotification]);

  const handleSearch = useCallback((filters: SearchFilters, page: number = 1) => {
    debouncedSearch(filters, page);
  }, [debouncedSearch]);

  const loadClientDetail = async (clientId: number) => {
    if (!isMountedRef.current) return;

    try {
      setDetailLoading(true);
      const response = await ordersApi.getClientOrderById(clientId.toString());
      if (response.code === 200 && response.result && isMountedRef.current) {
        setClientDetail(response.result);
        setShowClientDetail(true);
      } else if (isMountedRef.current) {
        showNotification('error', 'មិនអាចទាញយកព័ត៌មានលម្អិតអតិថិជនបានទេ');
      }
    } catch (error: unknown) {
      console.error('Error loading client detail:', error);
      if (isMountedRef.current) {
        showNotification('error', 'មានបញ្ហាក្នុងការទាញយកព័ត៌មានលម្អិតអតិថិជន');
      }
    } finally {
      if (isMountedRef.current) {
        setDetailLoading(false);
      }
    }
  };

  const handleViewMore = (client: Client) => {
    loadClientDetail(client.cus_id);
  };

  const handleBackToClients = () => {
    setShowClientDetail(false);
    setClientDetail(null);
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearSearchFilter = (field: keyof SearchFilters) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleSearchClick = () => {
    const hasActiveSearch = searchFilters.search_id.trim() || 
                           searchFilters.search_name.trim() || 
                           searchFilters.search_phone.trim() ||
                           searchFilters.search_address.trim();

    if (hasActiveSearch) {
      setCurrentPage(1);
      handleSearch(searchFilters, 1);
    } else {
      showNotification('error', 'សូមបញ្ចូលលក្ខខណ្ឌស្វែងរកយ៉ាងតិច ១');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const clearAllFilters = () => {
    setSearchFilters({
      search_id: '',
      search_name: '',
      search_phone: '',
      search_address: ''
    });
    setIsSearchMode(false);
    setCurrentPage(1);
    loadClients(1, true);
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.total_pages)) return;
    
    if (isSearchMode) {
      handleSearch(searchFilters, newPage);
    } else {
      loadClients(newPage);
    }
  };

  const handlePrintOrder = async (orderId: number) => {
    if (!isMountedRef.current) return;

    setPrintLoading(prev => ({ ...prev, [orderId]: true }));
    
    try {
      await printOrder(orderId, showNotification);
    } catch (error) {
      console.error('Print failed:', error);
      showNotification('error', 'មានបញ្ហាក្នុងការបោះពុម្ព');
    } finally {
      if (isMountedRef.current) {
        setPrintLoading(prev => ({ ...prev, [orderId]: false }));
      }
    }
  };
  
  const getActiveSearchCount = () => {
    return Object.values(searchFilters).filter(value => value.trim()).length;
  };

  // Clean, production-ready pagination component matching Products page
  const PaginationComponent = () => {
    // Only show if we have clients and pagination data
    if (!clients.length || !pagination) return null;

    // Don't show pagination if only one page
    // if (pagination.total_pages <= 1) return null;

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

    // Calculate display range
    const startItem = ((currentPage - 1) * pagination.page_size) + 1;
    const endItem = Math.min(currentPage * pagination.page_size, pagination.total_items);

    // Pagination functions
    const goToPage = (page: number) => {
      if (page >= 1 && page <= pagination.total_pages) {
        handlePageChange(page);
      }
    };

    const goToFirstPage = () => goToPage(1);
    const goToLastPage = () => goToPage(pagination.total_pages);
    const goToPrevPage = () => goToPage(currentPage - 1);
    const goToNextPage = () => goToPage(currentPage + 1);

    return (
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Results Info */}
          <div className="text-sm text-gray-600">
            បង្ហាញ {startItem}-{endItem} នៃ {pagination.total_items} ធាតុ
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={goToFirstPage}
              disabled={!pagination.has_previous || loading || searchLoading}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="ទំព័រដំបូង"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            {/* Previous Page */}
            <button
              onClick={goToPrevPage}
              disabled={!pagination.has_previous || loading || searchLoading}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  disabled={page === '...' || loading || searchLoading}
                  className={`min-w-[32px] h-8 px-3 py-1 text-sm rounded transition-colors ${
                    page === currentPage
                      ? 'bg-blue-500 text-white shadow-sm'
                      : page === '...'
                      ? 'cursor-default text-gray-400'
                      : 'hover:bg-gray-100 text-gray-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Page */}
            <button
              onClick={goToNextPage}
              disabled={!pagination.has_next || loading || searchLoading}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="ទំព័របន្ទាប់"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={goToLastPage}
              disabled={!pagination.has_next || loading || searchLoading}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="ទំព័រចុងក្រោយ"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Notification with safe DOM handling */}
      {notification && isMountedRef.current && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
          role="alert"
        >
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
          <button 
            onClick={() => isMountedRef.current && setNotification(null)}
            className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {!showClientDetail ? (
        // Clients List View
        <div className="bg-white rounded-lg shadow">
          {/* Enhanced Search Section with 4 Boxes */}
          <div className="p-6 border-b border-gray-200">
            <div className="space-y-4">
              {/* Search Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Search className="h-5 w-5 mr-2 text-blue-600" />
                  ស្វែងរកអតិថិជន
                </h3>
              </div>

              {/* Four Search Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Customer ID Search */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Hash className="h-4 w-4 inline mr-1" />
                    លេខ ID អតិថិជន
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="បញ្ចូល ID..."
                      value={searchFilters.search_id}
                      onChange={(e) => handleFilterChange('search_id', e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    {searchFilters.search_id && (
                      <button
                        onClick={() => clearSearchFilter('search_id')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Customer Name Search */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <UserCheck className="h-4 w-4 inline mr-1" />
                    ឈ្មោះអតិថិជន
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="បញ្ចូលឈ្មោះ..."
                      value={searchFilters.search_name}
                      onChange={(e) => handleFilterChange('search_name', e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    {searchFilters.search_name && (
                      <button
                        onClick={() => clearSearchFilter('search_name')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Phone Number Search */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Phone className="h-4 w-4 inline mr-1" />
                    លេខទូរសព្ទ
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="បញ្ចូលលេខទូរសព្ទ..."
                      value={searchFilters.search_phone}
                      onChange={(e) => handleFilterChange('search_phone', e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    {searchFilters.search_phone && (
                      <button
                        onClick={() => clearSearchFilter('search_phone')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Address Search */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    អាសយដ្ឋាន
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="បញ្ចូលអាសយដ្ឋាន..."
                      value={searchFilters.search_address}
                      onChange={(e) => handleFilterChange('search_address', e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    {searchFilters.search_address && (
                      <button
                        onClick={() => clearSearchFilter('search_address')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Search Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSearchClick}
                  disabled={searchLoading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {searchLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  ស្វែងរក
                </button>
                
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  ត្រឡប់
                </button>
              </div>

              {/* Search Status */}
              {isSearchMode && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {searchLoading ? (
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 text-blue-600" />
                    )}
                    <span className="text-sm text-blue-800">
                      {searchLoading ? 'កំពុងស្វែងរក...' : `ស្វែងរកដោយ ${getActiveSearchCount()} លក្ខខណ្ឌ`}
                    </span>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">
                    រកឃើញ {pagination?.total_items || clients.length} លទ្ធផល
                    {pagination && pagination.total_pages > 1 && (
                      <span className="ml-2">
                        (ទំព័រ {currentPage} នៃ {pagination.total_pages})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Clients Content */}
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">កំពុងទាញយកទិន្នន័យ...</span>
              </div>
            ) : (
              <div>
                {clients.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">
                      {isSearchMode ? 'មិនរកឃើញអតិថិជនទេ' : 'មិនមានអតិថិជនទេ'}
                    </p>
                    {isSearchMode && (
                      <div className="mt-4 space-y-2">
                        <p className="text-gray-400 text-sm">
                          សាកល្បងប្រើលក្ខខណ្ឌស្វែងរកផ្សេងទៀត
                        </p>
                        <button
                          onClick={clearAllFilters}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          សម្អាតការស្វែងរកនិងបង្ហាញអតិថិជនទាំងអស់
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between px-6 py-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                          <div className="text-sm font-semibold text-gray-700">ID</div>
                          <div className="text-sm font-semibold text-gray-700">ឈ្មោះ</div>
                          <div className="text-sm font-semibold text-gray-700">លេខទូរសព្ទ</div>
                          <div className="text-sm font-semibold text-gray-700">អាសយដ្ឋាន</div>
                        </div>
                        <div className="w-20 text-sm font-semibold text-gray-700 text-center ml-4">សកម្មភាព</div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200 border-l border-r border-gray-200">
                      {clients.map((client, index) => (
                        <div 
                          key={`client-${client.cus_id}-${index}`} 
                          className={`${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-blue-50 transition-colors duration-200`}
                        >
                          <div className="flex items-center justify-between px-6 py-3">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                              {/* ID */}
                              <div className="min-w-0">
                                <span className={`text-sm font-mono ${
                                  searchFilters.search_id && client.cus_id && client.cus_id.toString().includes(searchFilters.search_id)
                                    ? 'text-gray-900 px-1 rounded'
                                    : 'text-gray-900'
                                }`}>
                                  {client.cus_id && client.cus_id !== 'N/A' ? client.cus_id : '-'}
                                </span>
                              </div>

                              {/* Name */}
                              <div className="min-w-0">
                                <span className={`text-sm font-medium truncate block ${
                                  searchFilters.search_name && client.cus_name && client.cus_name.toLowerCase().includes(searchFilters.search_name.toLowerCase())
                                    ? 'text-gray-900 px-1 rounded'
                                    : 'text-gray-900'
                                }`}>
                                  {client.cus_name && client.cus_name !== 'N/A' ? client.cus_name : '-'}
                                </span>
                              </div>

                              {/* Phone Number */}
                              <div className="min-w-0">
                                {client.phone_number && client.phone_number !== 'N/A' ? (
                                  <a href={`tel:${client.phone_number}`} className={`text-sm truncate block ${
                                    searchFilters.search_phone && client.phone_number && client.phone_number.includes(searchFilters.search_phone)
                                      ? 'text-gray-900 px-1 rounded'
                                      : 'text-gray-600 hover:text-blue-600'
                                  }`}>
                                    {client.phone_number}
                                  </a>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </div>

                              {/* Address */}
                              <div className="min-w-0">
                                <span className={`text-sm truncate block ${
                                  searchFilters.search_address && client.address && client.address.toLowerCase().includes(searchFilters.search_address.toLowerCase())
                                    ? 'text-gray-900 px-1 rounded'
                                    : 'text-gray-600'
                                }`} title={client.address}>
                                  {client.address && client.address !== 'N/A' ? client.address : '-'}
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleViewMore(client)}
                              disabled={detailLoading || !client.cus_id || client.cus_id === 'N/A'}
                              className="w-20 ml-4 inline-flex items-center justify-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                            >
                              {detailLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Pagination Component */}
            <PaginationComponent />
          </div>
        </div>
      ) : (
        // Client Detail View with Print Button State
        <div className="space-y-6">
          {detailLoading ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">កំពុងទាញយកព័ត៌មានលម្អិត...</span>
              </div>
            </div>
          ) : clientDetail ? (
            <>
              {/* Client Info Card with Sticky Header */}
              <div className="bg-white rounded-lg shadow">
                <div className="sticky top-0 z-10 bg-white p-6 border-b border-gray-100 rounded-t-lg shadow-sm">
                  <div className="flex items-center gap-4">
                    {showClientDetail && (
                      <button
                        onClick={handleBackToClients}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0 self-center"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">ID អតិថិជន</p>
                            <p className="font-semibold text-gray-900">{clientDetail.client_info.cus_id}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">ឈ្មោះ</p>
                            <p className="font-semibold text-gray-900">{clientDetail.client_info.cus_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <Phone className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">លេខទូរសព្ទ</p>
                            <p className="font-medium text-gray-900">{clientDetail.client_info.phone_number}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mt-0.5">
                            <MapPin className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-0.5">អាសយដ្ឋាន</p>
                            <p className="font-medium text-gray-900 break-words leading-relaxed">{clientDetail.client_info.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders List with Print Button State */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                    ប្រវត្តិការកម្មង់
                  </h3>
                </div>

                <div className="divide-y divide-gray-100">
                  {clientDetail.orders.map((order) => (
                    <div key={order.order_id} className="p-6">
                      {/* Enhanced Order Header */}
                      <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">កម្ម័ង #{order.order_id}</h4>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(order.order_date).toLocaleDateString('km-KH')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">ប្រាក់កក់</p>
                            <p className="text-xl font-bold text-blue-600">${order.order_deposit}</p>
                          </div>

                          <button
                            onClick={() => handlePrintOrder(order.order_id)}
                            disabled={printLoading[order.order_id]}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                          >
                            {printLoading[order.order_id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Printer className="h-4 w-4" />
                            )}
                            <span className="ml-2">បោះពុម្ព</span>
                          </button>
                        </div>
                      </div>

                      {/* Products Section */}
                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-lg font-semibold text-gray-900 flex items-center">
                              <Package className="h-5 w-5 mr-2 text-blue-600" />
                              បញ្ជីទំនិញ
                            </h5>
                            <span className="text-sm text-gray-500">({order.products.length} ប្រភេទ)</span>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg overflow-hidden">
                            {/* Product List Header */}
                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                              <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
                                <div className="col-span-2">ឈ្មោះទំនិញ</div>
                                <div className="text-center">ទម្ងន់</div>
                                <div className="text-center">បរិមាណ</div>
                                <div className="text-center">តម្លៃ/ឯកតា</div>
                                <div className="text-center">សរុប</div>
                              </div>
                            </div>
                            
                            {/* Product List Items */}
                            <div className="divide-y divide-gray-200">
                              {order.products.map((product, index) => (
                                <div key={`${product.prod_id}-${index}`} className="px-4 py-3 hover:bg-gray-50">
                                  <div className="grid grid-cols-6 gap-4 items-center">
                                    <div className="col-span-2 flex items-center space-x-3">
                                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Package className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{product.prod_name}</p>
                                        <p className="text-xs text-gray-500">ID: {product.prod_id}</p>
                                      </div>
                                    </div>
                                    <div className="text-center text-sm text-gray-600">
                                      {product.order_weight}
                                    </div>
                                    <div className="text-center">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {product.order_amount}
                                      </span>
                                    </div>
                                    <div className="text-center font-medium text-gray-900">
                                      ${product.product_sell_price}
                                    </div>
                                    <div className="text-center font-semibold text-gray-900">
                                      ${product.product_sell_price * product.order_amount}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
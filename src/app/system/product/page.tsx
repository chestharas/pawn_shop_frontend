'use client';

import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  DollarSign,
  Hash
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price?: number;
  amount?: number;
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

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<Notification | null>(null);
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
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      prod_name: product.name,
      unit_price: product.price?.toString() || '',
      amount: product.amount?.toString() || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        loadProducts();
      } else {
        showNotification('error', response.message || 'មានបញ្ហាក្នុងការរក្សាទុកទំនិញ');
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      const errorMessage = error.response?.data?.detail || 'មានបញ្ហាក្នុងការរក្សាទុកទំនិញ';
      showNotification('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: number, productName: string) => {
    if (!confirm(`តើអ្នកពិតជាចង់លុបទំនិញ "${productName}" មែនទេ?`)) {
      return;
    }

    try {
      const response = await productsApi.delete(productId);
      if (response.code === 200) {
        showNotification('success', 'ទំនិញត្រូវបានលុបដោយជោគជ័យ');
        loadProducts();
      } else {
        showNotification('error', 'មិនអាចលុបទំនិញបានទេ');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      showNotification('error', 'មានបញ្ហាក្នុងការលុបទំនិញ');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
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

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">គ្រប់គ្រងទំនិញ</h1>
            <p className="text-gray-600 mt-1">បញ្ជីទំនិញនិងការគ្រប់គ្រង</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            ewhuiofhjkwouierhw
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="ស្វែងរកទំនិញ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ទំនិញសរុប</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => !submitting && resetForm()}
            ></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        {editingProduct ? 'កែប្រែទំនិញ' : 'បញ្ចូលទំនិញថ្មី'}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ឈ្មោះទំនិញ *
                          </label>
                          <input
                            type="text"
                            required
                            disabled={submitting}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            value={formData.prod_name}
                            onChange={(e) => setFormData({...formData, prod_name: e.target.value})}
                            placeholder="បញ្ចូលឈ្មោះទំនិញ"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <DollarSign className="inline h-4 w-4 mr-1" />
                            តម្លៃលក់
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            disabled={submitting}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            value={formData.unit_price}
                            onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                            placeholder="បញ្ចូលតម្លៃ"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Hash className="inline h-4 w-4 mr-1" />
                            បរិមាណ
                          </label>
                          <input
                            type="number"
                            min="0"
                            disabled={submitting}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            placeholder="sgrjiodsgfljnkdsfljsgfjlh"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        កំពុងរក្សាទុក...
                      </>
                    ) : (
                      'រក្សាទុក'
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={resetForm}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    បោះបង់
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            បញ្ជីទំនិញ {searchTerm && `(${filteredProducts.length} ក្នុងចំណោម ${products.length})`}
          </h3>
        </div>
        
        {loading ? (
          <div className="px-6 py-12 text-center">
            <Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">កំពុងទាញយកទិន្នន័យ...</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <li className="px-6 py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm ? 'រកមិនឃើញទំនិញ' : 'មិនមានទំនិញ'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'សូមព្យាយាមស្វែងរកដោយពាក្យគន្លឹះផ្សេង' : 'ចាប់ផ្តើមដោយការបង្កើតទំនិញថ្មី'}
                </p>
              </li>
            ) : (
              filteredProducts.map((product) => (
                <li key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          លេខសម្គាល់: #{product.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {product.price ? `${product.price.toFixed(2)}` : 'មិនបានកំណត់'}
                        </div>
                        <div className="text-sm text-gray-500">
                          បរិមាណ: {product.amount || 'មិនបានកំណត់'}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors duration-150"
                          title="កែប្រែ"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors duration-150"
                          title="លុប"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
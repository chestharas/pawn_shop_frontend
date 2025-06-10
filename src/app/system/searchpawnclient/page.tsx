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
            <h1 className="text-2xl font-bold text-gray-900">រុករកការបញ្ចាំ</h1>
            <p className="text-gray-600 mt-1">សួស្តីពិភពលោក</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Gwenchana
          </button>
        </div>
      </div>

      
      
    </div>
  );
}
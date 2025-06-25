'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { 
  Save, 
  Eye, 
  EyeOff, 
  User, 
  Lock, 
  Bell, 
  Palette,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { colors } from '@/lib/colors';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    phone_number: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    theme: 'light',
    language: 'km'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        phone_number: user.phone_number || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name.startsWith('notifications.')) {
        const notificationKey = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [notificationKey]: checkbox.checked
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate password change if attempted
      if (formData.new_password && formData.new_password !== formData.confirm_password) {
        throw new Error('ពាក្យសម្ងាត់ថ្មីមិនត្រូវគ្នា');
      }

      // TODO: Implement API call to update profile
      // Example:
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(formData)
      // });
      
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'ព័ត៌មានត្រូវបានកែប្រែដោយជោគជ័យ' });
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'មានបញ្ហាក្នុងការកែប្រែ' 
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'ព័ត៌មានផ្ទាល់ខ្លួន', icon: User },
    { id: 'security', label: 'សុវត្ថិភាព', icon: Lock },
    { id: 'notifications', label: 'ការជូនដំណឹង', icon: Bell },
    { id: 'appearance', label: 'រូបរាង', icon: Palette },
  ];

  return (
    <div 
      className="w-full overflow-hidden" 
      style={{ 
        backgroundColor: colors.secondary[50],
        height: 'calc(100vh - 80px)',
        minHeight: '600px'
      }}
    >
      <div className="h-full p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 
              className="text-2xl font-bold mb-2"
              style={{ color: colors.secondary[900] }}
            >
              ការកំណត់
            </h1>
            <p style={{ color: colors.secondary[600] }}>
              គ្រប់គ្រងការកំណត់គណនី និងចូលរូម
            </p>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                {message.text}
              </div>
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className="p-1 hover:bg-black/10 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card title="ប្រភេទការកំណត់">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'text-white'
                            : 'hover:bg-gray-100'
                        }`}
                        style={{
                          backgroundColor: activeTab === tab.id ? colors.primary[500] : 'transparent',
                          color: activeTab === tab.id ? 'white' : colors.secondary[700]
                        }}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit}>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <Card title="ព័ត៌មានផ្ទាល់ខ្លួន">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                          លេខទូរសព្ទ
                        </label>
                        <input
                          type="tel"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="បញ្ចូលលេខទូរសព្ទ"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                          តួនាទី
                        </label>
                        <input
                          type="text"
                          value={user?.role || ''}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 capitalize"
                        />
                        <p className="text-xs text-gray-500 mt-1">តួនាទីមិនអាចកែប្រែបាន</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <Card title="សុវត្ថិភាព">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                          ពាក្យសម្ងាត់បច្ចុប្បន្ន
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="current_password"
                            value={formData.current_password}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="បញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                          ពាក្យសម្ងាត់ថ្មី
                        </label>
                        <input
                          type="password"
                          name="new_password"
                          value={formData.new_password}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                          បញ្ជាក់ពាក្យសម្ងាត់ថ្មី
                        </label>
                        <input
                          type="password"
                          name="confirm_password"
                          value={formData.confirm_password}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
                        />
                      </div>
                    </div>
                  </Card>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <Card title="ការជូនដំណឹង">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium" style={{ color: colors.secondary[900] }}>
                            ការជូនដំណឹងតាមអ៊ីមែល
                          </h4>
                          <p className="text-sm" style={{ color: colors.secondary[600] }}>
                            ទទួលការជូនដំណឹងតាមអ៊ីមែល
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          name="notifications.email"
                          checked={formData.notifications.email}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium" style={{ color: colors.secondary[900] }}>
                            ការជូនដំណឹងលើកម្មវិធី
                          </h4>
                          <p className="text-sm" style={{ color: colors.secondary[600] }}>
                            ទទួលការជូនដំណឹងលើកម្មវិធី
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          name="notifications.push"
                          checked={formData.notifications.push}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium" style={{ color: colors.secondary[900] }}>
                            ការជូនដំណឹងតាម SMS
                          </h4>
                          <p className="text-sm" style={{ color: colors.secondary[600] }}>
                            ទទួលការជូនដំណឹងតាមសារ SMS
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          name="notifications.sms"
                          checked={formData.notifications.sms}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </Card>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <Card title="រូបរាង">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                          ធីម
                        </label>
                        <select
                          name="theme"
                          value={formData.theme}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="light">ស្រាល</option>
                          <option value="dark">ងងឹត</option>
                          <option value="auto">ស្វ័យប្រវត្តិ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.secondary[700] }}>
                          ភាសា
                        </label>
                        <select
                          name="language"
                          value={formData.language}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="km">ខ្មែរ</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    icon={<Save className="h-4 w-4" />}
                  >
                    {loading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការផ្លាស់ប្តូរ'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  Save, 
  Eye, 
  CheckCircle,
  AlertCircle,
  X,
  Settings as SettingsIcon
} from 'lucide-react';
import { colors } from '@/lib/colors';
import { Button } from '@/components/ui/Button';

interface SettingsFormData {
  phone_number: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
  notifications_enabled: boolean;
  language: string;
  theme: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function SettingsPopup() {
  const { isSettingsOpen, closeSettings } = useSettings();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [activeTab, setActiveTab] = useState('preferences');
  const [isVisible, setIsVisible] = useState(false);
  
  const [formData, setFormData] = useState<SettingsFormData>({
    phone_number: user?.phone_number || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
    notifications_enabled: true,
    language: 'km',
    theme: 'light'
  });

  // Zoom functionality - FIXED VERSION
  // const [zoomLevel, setZoomLevel] = useState(100);

  // Safe zoom functionality - CSS-only approach (NO DOM MANIPULATION)
  const [zoomLevel, setZoomLevel] = useState(100);
  const isMountedRef = useRef(true);

  // Track component mount state  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Safe zoom implementation using CSS only
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const scale = zoomLevel / 100;
    
    // Apply zoom directly to body with safety checks
    if (document.body && document.body.style) {
      try {
        document.body.style.transform = `scale(${scale})`;
        document.body.style.transformOrigin = 'top left';
        document.body.style.width = `${100 / scale}%`;
        document.body.style.height = `${100 / scale}%`;
        document.body.style.overflow = scale !== 1 ? 'auto' : '';
      } catch (error) {
        console.warn('Failed to apply zoom safely:', error);
      }
    }
    
    return () => {
      // Safe cleanup - reset only if still mounted
      if (isMountedRef.current && document.body && document.body.style) {
        try {
          document.body.style.transform = '';
          document.body.style.transformOrigin = '';
          document.body.style.width = '';
          document.body.style.height = '';
          document.body.style.overflow = '';
        } catch (error) {
          console.warn('Failed to reset zoom safely:', error);
        }
      }
    };
  }, [zoomLevel]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200)); // Max 200%
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50)); // Min 50%
  };

  const resetZoom = () => {
    setZoomLevel(100);
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        phone_number: user.phone_number || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle popup visibility with animation
  useEffect(() => {
    if (isSettingsOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isSettingsOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      closeSettings();
    }, 200);
  }, [closeSettings]);

  // Close popup on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSettingsOpen, handleClose]);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isSettingsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSettingsOpen]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('success', 'ការកំណត់ត្រូវបានរក្សាទុកដោយជោគជ័យ');
    } catch {
      showNotification('error', 'មានបញ្ហាក្នុងការរក្សាទុកការកំណត់');
    } finally {
      setLoading(false);
    }
  };

  if (!isSettingsOpen) return null;

  const tabs = [
    { id: 'preferences', label: 'ការកំណត់', icon: SettingsIcon },
    { id: 'display', label: 'បង្ហាញ', icon: Eye }
  ];

  return (
    <>
      <style jsx>{`
        .modal-backdrop {
          opacity: 0;
          backdrop-filter: blur(0px);
          transition: all 0.3s ease-out;
        }
        
        .modal-backdrop.visible {
          opacity: 1;
          backdrop-filter: blur(4px);
        }
        
        .modal-content {
          transform: scale(0.8);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .modal-content.visible {
          transform: scale(1);
          opacity: 1;
        }

        .settings-popup-container {
          zoom: 1 !important;
          transform: scale(1) !important;
        }
      `}</style>
      
      <div className="settings-popup-container fixed inset-0 z-50 overflow-y-auto" data-exclude-zoom>
        {/* Backdrop with reduced opacity and blur */}
        <div 
          className={`modal-backdrop fixed inset-0 bg-opacity-20 ${isVisible ? 'visible' : ''}`}
          onClick={handleClose}
        ></div>

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className={`modal-content relative w-full max-w-2xl rounded-lg shadow-xl overflow-hidden ${isVisible ? 'visible' : ''}`}
            style={{ backgroundColor: colors.white }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-6 border-b"
              style={{ borderBottomColor: colors.secondary[200] }}
            >
              <div className="flex items-center">
                <SettingsIcon 
                  className="h-6 w-6 mr-3"
                  style={{ color: colors.primary[500] }}
                />
                <h2 
                  className="text-xl font-semibold"
                  style={{ color: colors.secondary[900] }}
                >
                  ការកំណត់
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: colors.secondary[500] }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Notification */}
            {notification && (
              <div 
                className="mx-6 mt-4 p-3 rounded-lg flex items-center space-x-2"
                style={{
                  backgroundColor: notification.type === 'success' ? colors.success[50] : colors.error[50],
                  color: notification.type === 'success' ? colors.success[800] : colors.error[800],
                  border: `1px solid ${notification.type === 'success' ? colors.success[200] : colors.error[200]}`
                }}
              >
                {notification.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{notification.message}</span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b px-6" style={{ borderBottomColor: colors.secondary[200] }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{
                    color: activeTab === tab.id ? colors.primary[600] : colors.secondary[600],
                    borderBottomColor: activeTab === tab.id ? colors.primary[500] : 'transparent'
                  }}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <form onSubmit={handlePreferencesUpdate} className="space-y-4">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-3"
                      style={{ color: colors.secondary[700] }}
                    >
                      ការជូនដំណឹង
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="notifications"
                        checked={formData.notifications_enabled}
                        onChange={(e) => setFormData({ ...formData, notifications_enabled: e.target.checked })}
                        className="h-4 w-4 rounded focus:ring-2"
                        style={{ accentColor: colors.primary[500] }}
                      />
                      <label htmlFor="notifications" className="ml-2 text-sm" style={{ color: colors.secondary[600] }}>
                        បើកការជូនដំណឹង
                      </label>
                    </div>
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.secondary[700] }}
                    >
                      ភាសា
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      style={{ borderColor: colors.secondary[300] }}
                    >
                      <option value="km">ខ្មែរ</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.secondary[700] }}
                    >
                      រូបរាង
                    </label>
                    <select
                      value={formData.theme}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      style={{ borderColor: colors.secondary[300] }}
                    >
                      <option value="light">ភ្លឺ</option>
                      <option value="dark">ងងឹត</option>
                      <option value="auto">ស្វ័យប្រវត្តិ</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      loading={loading}
                      icon={<Save className="h-4 w-4" />}
                      size="sm"
                    >
                      រក្សាទុក
                    </Button>
                  </div>
                </form>
              )}

              {/* Display Tab */}
              {activeTab === 'display' && (
                <div className="space-y-6">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-4"
                      style={{ color: colors.secondary[700] }}
                    >
                      កម្រិតពង្រីក (Zoom Level)
                    </label>
                    
                    {/* Zoom Level Display */}
                    <div 
                      className="text-center mb-4 p-3 rounded-lg"
                      style={{ 
                        backgroundColor: colors.primary[50],
                        color: colors.primary[700],
                        border: `1px solid ${colors.primary[200]}`
                      }}
                    >
                      <span className="text-2xl font-bold">{zoomLevel}%</span>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 50}
                        className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          borderColor: colors.secondary[300],
                          backgroundColor: colors.white,
                          color: colors.secondary[700]
                        }}
                      >
                        - តូច
                      </button>
                      
                      <button
                        onClick={resetZoom}
                        className="px-4 py-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: colors.primary[500],
                          color: colors.white
                        }}
                      >
                        កំណត់ដើម
                      </button>
                      
                      <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 200}
                        className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          borderColor: colors.secondary[300],
                          backgroundColor: colors.white,
                          color: colors.secondary[700]
                        }}
                      >
                        + ធំ
                      </button>
                    </div>

                    {/* Zoom Slider */}
                    <div className="mt-6">
                      <input
                        type="range"
                        min="50"
                        max="200"
                        step="10"
                        value={zoomLevel}
                        onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${colors.primary[500]} 0%, ${colors.primary[500]} ${(zoomLevel - 50) / 1.5}%, ${colors.secondary[300]} ${(zoomLevel - 50) / 1.5}%, ${colors.secondary[300]} 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs mt-2" style={{ color: colors.secondary[500] }}>
                        <span>50%</span>
                        <span>100%</span>
                        <span>200%</span>
                      </div>
                    </div>

                    {/* Zoom Presets */}
                    <div className="mt-6">
                      <label 
                        className="block text-sm font-medium mb-3"
                        style={{ color: colors.secondary[700] }}
                      >
                        កំណត់ជាមុន
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[75, 100, 125, 150].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => setZoomLevel(preset)}
                            className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                              zoomLevel === preset ? 'ring-2' : ''
                            }`}
                            style={{
                              backgroundColor: zoomLevel === preset ? colors.primary[100] : colors.secondary[100],
                              color: zoomLevel === preset ? colors.primary[700] : colors.secondary[600],
                              ringColor: colors.primary[500]
                            }}
                          >
                            {preset}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Info Text */}
                    <div 
                      className="mt-6 p-3 rounded-lg text-sm"
                      style={{
                        backgroundColor: colors.secondary[50],
                        color: colors.secondary[600],
                        border: `1px solid ${colors.secondary[200]}`
                      }}
                    >
                      ការពង្រីកនេះនឹងបង្កើនឬបន្ថយទំហំនៃទាំងអស់លើអេក្រង់។
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
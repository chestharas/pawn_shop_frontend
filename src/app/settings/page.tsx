// Create this file: app/system/settings/page.tsx

import SettingsPage from '@/components/SettingsPage';

export default function Settings() {
  return <SettingsPage />;
}

// Alternatively, if you prefer to keep the component inline:
// app/system/settings/page.tsx

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
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
  Settings
} from 'lucide-react';
import { colors } from '@/lib/colors';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// ... (Copy the entire SettingsPage component content here)

export default function Settings() {
  // Component logic goes here
  return (
    <SettingsPage />
  );
}

// Optional: Create a profile page as well
// app/system/profile/page.tsx

'use client';

import { useAuth } from '@/lib/auth';
import { User, Mail, Phone, Calendar } from 'lucide-react';
import { colors } from '@/lib/colors';
import { Card } from '@/components/ui/Card';

export default function ProfilePage() {
  const { user } = useAuth();

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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 
              className="text-2xl font-bold mb-2"
              style={{ color: colors.secondary[900] }}
            >
              ព័ត៌មានផ្ទាល់ខ្លួន
            </h1>
            <p style={{ color: colors.secondary[600] }}>
              មើលព័ត៌មានគណនីរបស់អ្នក
            </p>
          </div>

          {/* Profile Card */}
          <Card title="ព័ត៌មានអ្នកប្រើប្រាស់">
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div className="ml-4">
                  <h3 
                    className="text-lg font-medium"
                    style={{ color: colors.secondary[900] }}
                  >
                    {user?.phone_number}
                  </h3>
                  <p 
                    className="text-sm capitalize"
                    style={{ color: colors.secondary[600] }}
                  >
                    {user?.role}
                  </p>
                </div>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 rounded-lg" style={{ backgroundColor: colors.secondary[50] }}>
                  <Phone className="h-5 w-5 mr-3" style={{ color: colors.primary[500] }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.secondary[700] }}>
                      លេខទូរសព្ទ
                    </p>
                    <p className="text-sm" style={{ color: colors.secondary[900] }}>
                      {user?.phone_number || 'មិនបានកំណត់'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 rounded-lg" style={{ backgroundColor: colors.secondary[50] }}>
                  <User className="h-5 w-5 mr-3" style={{ color: colors.primary[500] }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.secondary[700] }}>
                      តួនាទី
                    </p>
                    <p className="text-sm capitalize" style={{ color: colors.secondary[900] }}>
                      {user?.role || 'មិនបានកំណត់'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 rounded-lg" style={{ backgroundColor: colors.secondary[50] }}>
                  <Calendar className="h-5 w-5 mr-3" style={{ color: colors.primary[500] }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.secondary[700] }}>
                      ថ្ងៃបង្កើតគណនី
                    </p>
                    <p className="text-sm" style={{ color: colors.secondary[900] }}>
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('km-KH') : 'មិនបានកំណត់'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 rounded-lg" style={{ backgroundColor: colors.secondary[50] }}>
                  <Mail className="h-5 w-5 mr-3" style={{ color: colors.primary[500] }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.secondary[700] }}>
                      ស្ថានភាព
                    </p>
                    <p className="text-sm" style={{ color: colors.success[600] }}>
                      សកម្ម
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => window.location.href = '/system/settings'}
                  variant="secondary"
                  icon={<Settings className="h-4 w-4" />}
                >
                  កែប្រែព័ត៌មាន
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
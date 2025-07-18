import React, { useEffect, useState } from 'react';
import { Save, Loader2, Globe } from 'lucide-react'; // Removed unused icons
import { SeoSettings } from '../../types/types';
import { useSeoSettings, useSaveSeoSettings } from '../../services/seoService';
// Removed unused DB config imports
// import { useDbConfig, useSaveDbConfig } from '../../services/dbConfigService'; 
// Removed unused Firebase auth import (unless needed elsewhere)
// import { auth, getCurrentUser } from '../../firebase/auth'; 
// Removed unused modal import if only used for DB verification
// import VerificationResultModal from '../../components/VerificationResultModal'; 

// Removed DatabaseConfig interface and defaultDbConfig if not used elsewhere

type ActiveTab = 'seo'; // Only 'seo' tab remains

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('seo'); // Default to 'seo'
  const { data: seoSettings, isLoading } = useSeoSettings();
  const { mutate: saveSeoSettings, isPending: isSaving } = useSaveSeoSettings();
  const [localSettings, setLocalSettings] = React.useState<SeoSettings>({
    title: '',
    description: '',
    keywords: [],
  });

  // Removed state related to DB config and password reset
  // const [localDbConfig, setLocalDbConfig] = useState<DatabaseConfig>(defaultDbConfig);
  // const [isTestingConnection, setIsTestingConnection] = useState(false);
  // const [isMigrating, setIsMigrating] = useState(false);
  // const [dbErrors, setDbErrors] = useState<Record<string, string>>({});
  // const [isResultModalOpen, setIsResultModalOpen] = useState(false); 
  // const [resultModalMessage, setResultModalMessage] = useState(''); 
  // const [resultModalTitle, setResultModalTitle] = useState(''); 
  // const [newPassword, setNewPassword] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState('');
  // const [passwordError, setPasswordError] = useState<string | null>(null);
  // const [isSavingPassword, setIsSavingPassword] = useState(false);
  // const { user: loggedInUser } = useAuthStore(); // Keep if needed for other parts, remove if not

  useEffect(() => {
    if (seoSettings) {
      setLocalSettings(seoSettings);
    }
  }, [seoSettings]);

  // Removed useEffect for DB config

  const handleSeoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSeoSettings(localSettings);
  };

  const handleKeywordsChange = (value: string) => {
    setLocalSettings({
      ...localSettings,
      keywords: value.split(',').map(keyword => keyword.trim())
    });
  };

  // Removed DB config validation, test connection, migration, and save handlers
  // Removed password reset handler

  // Simplified loading state
  const isPageLoading = isLoading; 

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          {/* Only SEO Tab Button */}
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeTab === 'seo'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Global SEO Settings
            </div>
          </button>
          {/* Removed Database and Password Reset Tab Buttons */}
        </div>
      </div>

      {/* Conditional rendering for loading state */}
      {isPageLoading ? ( 
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
        </div>
      ) : (
        <> 
          {/* Render SEO content only if activeTab is 'seo' (which it always is now) */}
          {activeTab === 'seo' && (
            <form onSubmit={handleSeoSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={localSettings.title}
                  onChange={(e) => setLocalSettings({ ...localSettings, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recommended length: 50-60 characters
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={localSettings.description}
                  onChange={(e) => setLocalSettings({ ...localSettings, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recommended length: 150-160 characters
                </p>
              </div>

              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Keywords
                </label>
                <textarea
                  id="keywords"
                  rows={3}
                  value={localSettings.keywords.join(', ')}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Separate keywords with commas
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          )}
          {/* Removed conditional rendering blocks for 'database' and 'password' tabs */}
        </>
      )}

      {/* Removed Modal rendering if it was only for DB verification */}
      {/* {isResultModalOpen && (
        <VerificationResultModal
          title={resultModalTitle}
          message={resultModalMessage}
          onClose={() => setIsResultModalOpen(false)}
        />
      )} */}
    </div> 
  );
}
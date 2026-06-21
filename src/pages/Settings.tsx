import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Save, 
  Bell, 
  Moon, 
  Sun, 
  User,
  Database,
  Shield,
  Languages,
  Palette,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface SettingsData {
  notifications: boolean;
  autoSave: boolean;
  language: string;
  theme: string;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  emailNotifications: boolean;
  dataSync: boolean;
}

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  
  // State management
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState(i18n.language);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [dataSync, setDataSync] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load saved settings on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize') as 'small' | 'medium' | 'large';
    if (savedFontSize) {
      setFontSize(savedFontSize);
      applyFontSize(savedFontSize);
    }
    
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    if (savedHighContrast) {
      setHighContrast(savedHighContrast);
      applyHighContrast(savedHighContrast);
    }
    
    const savedEmailNotifications = localStorage.getItem('emailNotifications') === 'true';
    if (savedEmailNotifications) setEmailNotifications(savedEmailNotifications);
    
    const savedDataSync = localStorage.getItem('dataSync') !== 'false';
    setDataSync(savedDataSync);
  }, []);

  // Apply font size to body
  const applyFontSize = (size: 'small' | 'medium' | 'large') => {
    const root = document.documentElement;
    if (size === 'small') {
      root.style.fontSize = '14px';
    } else if (size === 'medium') {
      root.style.fontSize = '16px';
    } else {
      root.style.fontSize = '18px';
    }
  };

  // Apply high contrast mode
  const applyHighContrast = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  // Handle language change
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    if (lang === 'ps' || lang === 'dr') {
      document.body.dir = 'rtl';
      document.body.style.fontFamily = "'Noto Nastaliq Urdu', 'Inter', system-ui, sans-serif";
    } else {
      document.body.dir = 'ltr';
      document.body.style.fontFamily = "'Inter', system-ui, sans-serif";
    }
    localStorage.setItem('language', lang);
  };

  // Handle font size change
  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    applyFontSize(size);
    localStorage.setItem('fontSize', size);
  };

  // Handle high contrast change
  const handleHighContrastChange = (enabled: boolean) => {
    setHighContrast(enabled);
    applyHighContrast(enabled);
    localStorage.setItem('highContrast', String(enabled));
  };

  // Show toast notification
  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Save all settings
  const handleSave = () => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('autoSave', JSON.stringify(autoSave));
    localStorage.setItem('emailNotifications', JSON.stringify(emailNotifications));
    localStorage.setItem('dataSync', JSON.stringify(dataSync));
    localStorage.setItem('highContrast', String(highContrast));
    localStorage.setItem('fontSize', fontSize);
    
    showToast('✅ ' + t('save_success'));
  };

  // Reset all settings to default
  const handleReset = () => {
    setNotifications(true);
    setAutoSave(true);
    setLanguage('en');
    setFontSize('medium');
    setHighContrast(false);
    setEmailNotifications(false);
    setDataSync(true);
    
    i18n.changeLanguage('en');
    document.body.dir = 'ltr';
    document.body.style.fontFamily = "'Inter', system-ui, sans-serif";
    applyFontSize('medium');
    applyHighContrast(false);
    
    localStorage.removeItem('notifications');
    localStorage.removeItem('autoSave');
    localStorage.removeItem('emailNotifications');
    localStorage.removeItem('dataSync');
    localStorage.removeItem('highContrast');
    localStorage.removeItem('fontSize');
    localStorage.removeItem('language');
    
    setShowResetConfirm(false);
    showToast('🔄 ' + t('reset_success'));
  };

  // Export settings
  const exportSettings = () => {
    const settingsData: SettingsData = {
      notifications,
      autoSave,
      language,
      theme: theme,
      fontSize,
      highContrast,
      emailNotifications,
      dataSync
    };
    
    const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax_settings_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('📥 ' + t('export_success'));
  };

  // Import settings
  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string) as SettingsData;
        
        setNotifications(settings.notifications);
        setAutoSave(settings.autoSave);
        setLanguage(settings.language);
        setFontSize(settings.fontSize);
        setHighContrast(settings.highContrast);
        setEmailNotifications(settings.emailNotifications);
        setDataSync(settings.dataSync);
        
        i18n.changeLanguage(settings.language);
        applyFontSize(settings.fontSize);
        applyHighContrast(settings.highContrast);
        
        if (settings.language === 'ps' || settings.language === 'dr') {
          document.body.dir = 'rtl';
        } else {
          document.body.dir = 'ltr';
        }
        
        if (settings.theme === 'dark' && theme === 'light') {
          toggleTheme();
        } else if (settings.theme === 'light' && theme === 'dark') {
          toggleTheme();
        }
        
        showToast('📤 ' + t('import_success'));
      } catch (error) {
        showToast('❌ Error reading file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Clear all data
  const clearAllData = () => {
    if (confirm('⛔ ' + t('confirm_clear_all'))) {
      localStorage.clear();
      showToast('🗑️ ' + t('delete_success'));
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('settings_subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* User Information Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('user_info')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('name')}
              </label>
              <input
                id="user-name"
                type="text"
                className="input"
                defaultValue="Admin User"
                placeholder="Enter your name"
                aria-label="User name"
              />
            </div>
            <div>
              <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                id="user-email"
                type="email"
                className="input"
                defaultValue="admin@tax.com"
                placeholder="example@email.com"
                aria-label="User email"
              />
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Palette className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('appearance')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('font_size')}
              </label>
              <div className="flex gap-3">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      fontSize === size
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    aria-label={`Font size ${size}`}
                  >
                    {size === 'small' ? t('small') : size === 'medium' ? t('medium') : t('large')}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('theme')}
              </label>
              <div className="flex gap-4">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  {theme === 'light' ? t('dark_theme') : t('light_theme')}
                </button>
              </div>
            </div>
            
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700 dark:text-gray-300">{t('high_contrast')}</span>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => handleHighContrastChange(e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  aria-label="Enable high contrast mode"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Language Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Languages className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('language_region')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('language')}
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="input"
                aria-label="Language selection"
              >
                <option value="en">English</option>
                <option value="ps">پښتو</option>
                <option value="dr">دری</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('notifications')}</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 dark:text-gray-300">{t('browser_notifications')}</span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                aria-label="Enable browser notifications"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 dark:text-gray-300">{t('auto_save')}</span>
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                aria-label="Enable auto save"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 dark:text-gray-300">{t('email_notifications')}</span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                aria-label="Enable email notifications"
              />
            </label>
          </div>
        </div>

        {/* Security Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('security')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('current_password')}
              </label>
              <input
                id="current-password"
                type="password"
                className="input"
                placeholder="Enter current password"
                aria-label="Current password"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('new_password')}
              </label>
              <input
                id="new-password"
                type="password"
                className="input"
                placeholder="Enter new password"
                aria-label="New password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('confirm_password')}
              </label>
              <input
                id="confirm-password"
                type="password"
                className="input"
                placeholder="Confirm new password"
                aria-label="Confirm password"
              />
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 dark:text-gray-300">{t('data_sync')}</span>
              <input
                type="checkbox"
                checked={dataSync}
                onChange={(e) => setDataSync(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                aria-label="Enable cloud sync"
              />
            </label>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Database className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('data_management')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={exportSettings}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              aria-label="Export settings"
            >
              <Download className="w-4 h-4" />
              {t('export_settings')}
            </button>
            <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
              <Upload className="w-4 h-4" />
              {t('import_settings')}
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
                aria-label="Import settings"
              />
            </label>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all"
              aria-label="Reset settings"
            >
              <RefreshCw className="w-4 h-4" />
              {t('reset_settings')}
            </button>
            <button
              onClick={clearAllData}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              aria-label="Clear all data"
            >
              <Trash2 className="w-4 h-4" />
              {t('clear_all_data')}
            </button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('reset_settings')}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('confirm_delete')}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700"
                >
                  {t('confirm')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleSave} 
            className="btn btn-primary flex items-center gap-2 px-6 py-3"
            aria-label="Save all settings"
          >
            <Save className="w-4 h-4" />
            {t('save_settings')}
          </button>
        </div>
      </div>

      {/* High Contrast Styles */}
      <style>{`
        .high-contrast {
          --bg-color: #000000;
          --text-color: #ffffff;
          --border-color: #ffff00;
        }
        
        .high-contrast body {
          background-color: #000000 !important;
          color: #ffffff !important;
        }
        
        .high-contrast .card,
        .high-contrast .input,
        .high-contrast button {
          background-color: #000000 !important;
          color: #ffffff !important;
          border-color: #ffff00 !important;
        }
        
        .high-contrast .btn-primary {
          background-color: #ffff00 !important;
          color: #000000 !important;
        }
      `}</style>
    </div>
  );
};

export default Settings;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  Calculator, 
  History, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut,
  Sun,
  Moon,
  Languages
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const changeLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ps' : i18n.language === 'ps' ? 'dr' : 'en';
    i18n.changeLanguage(newLang);
    // د متن لار بدلول
    if (newLang === 'ps' || newLang === 'dr') {
      document.body.dir = 'rtl';
    } else {
      document.body.dir = 'ltr';
    }
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/calculator', icon: Calculator, label: t('calculator') },
    { path: '/history', icon: History, label: t('history') },
    { path: '/documents', icon: FileText, label: t('documents') },
    { path: '/reports', icon: BarChart3, label: t('reports') },
    { path: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          {t('app_name')}
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
       <button
  onClick={toggleTheme}
  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
  aria-label={theme === 'light' ? t('switch_to_dark') : t('switch_to_light')}
>
  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
  <span>{theme === 'light' ? t('dark_mode') : t('light_mode')}</span>
</button>

        <button
          onClick={changeLanguage}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Languages className="w-5 h-5" />
          <span>{i18n.language === 'en' ? 'پښتو' : i18n.language === 'ps' ? 'دری' : 'English'}</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
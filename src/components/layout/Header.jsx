import { Bell, LogOut, Menu, Settings, User, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Logo + Titre */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>

          <div className="hidden sm:block">
            <h1 className="text-xl lg:text-2xl font-semibold bg-gray-900 bg-clip-text text-transparent">
              Salut, {user.prenom} {user.nom}
            </h1>
            <p className="text-xs lg:text-sm text-gray-800">
             ravis de vous revoir
            </p>
          </div>
        </div>

        {/* Notifications + Profil */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-terre-400 ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500">Aucune nouvelle notification</p>
                </div>
              </div>
            )}
          </div>

          {/* Profil avec Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-fleuve-500 rounded-full flex items-center justify-center focus:outline-none"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Mon profil
                </button>
                
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Paramètres
                </button>
                
                <hr className="my-1" />
                
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-terre-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

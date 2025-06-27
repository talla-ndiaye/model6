import { LogOut, Menu, Settings, User, X } from 'lucide-react'; // Removed Bell icon
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // const [showNotifications, setShowNotifications] = useState(false); // Removed notification state
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  const handleGoToSettings = () => {
    setShowProfileMenu(false);
    navigate('/admin/parametres');
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-40 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Mobile Menu Toggle & Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <div className="flex items-center">
            
            <div className=""> 
              <p className="text-lg font-semibold text-gray-900 leading-tight">
                Salut, <span className="text-indigo-600">{user?.prenom || 'Utilisateur'}</span>
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Ravi de vous revoir !
              </p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Notifications - REMOVED */}
          {/*
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors duration-200 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Afficher les notifications"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fade-in-down transform origin-top-right">
                <div className="px-5 py-3 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-500 text-center py-4">Aucune nouvelle notification pour le moment.</p>
                </div>
              </div>
            )}
          </div>
          */}

          {/* User Profile with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white text-lg font-bold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow duration-200 hover:shadow-lg"
              aria-label="Ouvrir le menu utilisateur"
            >
              {user?.prenom?.charAt(0) || ''}{user?.nom?.charAt(0) || ''}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fade-in-down transform origin-top-right">
                <div className="px-5 py-3 border-b border-gray-200">
                  <p className="text-sm font-bold text-gray-900">{user?.prenom} {user?.nom}</p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{user?.role}</p>
                </div>
                
                <button className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3 transition-colors duration-200">
                  <User className="h-4 w-4" />
                  Mon profil
                </button>
                
                {/* Conditionally render settings for admin role */}
                {user?.role === 'admin' && (
                  <button 
                    onClick={handleGoToSettings}
                    className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3 transition-colors duration-200"
                  >
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </button>
                )}
                
                <hr className="my-2 border-gray-200" />
                
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors duration-200"
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
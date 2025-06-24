import { Bell, LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const Header = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-terre-100 text-terre-800',
      enseignant: 'bg-fleuve-100 text-fleuve-800',
      parent: 'bg-acacia-100 text-acacia-800',
      eleve: 'bg-soleil-100 text-soleil-800',
      comptable: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Logo et titre */}
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
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-soleil-500 to-fleuve-500 bg-clip-text text-transparent">
              EcoleManager
            </h1>
            <p className="text-xs lg:text-sm text-gray-600">
              Gestion scolaire moderne
            </p>
          </div>
        </div>

        {/* Actions utilisateur */}
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

          {/* Profil utilisateur */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-gray-900">
                {user?.prenom} {user?.nom}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(user?.role)}`}>
                {user?.role}
              </span>
            </div>
            
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-soleil-400 to-fleuve-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              icon={LogOut}
              className="hidden sm:inline-flex"
            >
              <span className="hidden lg:inline">Déconnexion</span>
            </Button>
            
            {/* Bouton déconnexion mobile */}
            <button
              onClick={handleLogout}
              className="sm:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
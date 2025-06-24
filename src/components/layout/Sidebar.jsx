import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  FileText,
  CreditCard,
  Upload,
  UserCheck,
  Clock,
  FileBarChart,
  Receipt,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin/tableau-de-bord', color: 'text-soleil-500' },
          { icon: Users, label: 'Gestion utilisateurs', path: '/admin/gestion-utilisateurs', color: 'text-fleuve-500' },
          { icon: GraduationCap, label: 'Élèves', path: '/admin/eleves', color: 'text-acacia-500' },
          { icon: UserCheck, label: 'Enseignants', path: '/admin/enseignants', color: 'text-terre-500' },
          { icon: BookOpen, label: 'Classes', path: '/admin/classes', color: 'text-soleil-500' },
          { icon: FileText, label: 'Matières', path: '/admin/matieres', color: 'text-fleuve-500' },
          { icon: Calendar, label: 'Emplois du temps', path: '/admin/emplois-du-temps', color: 'text-acacia-500' },
          { icon: FileBarChart, label: 'Notes & Bulletins', path: '/admin/notes-bulletins', color: 'text-terre-500' },
          { icon: CreditCard, label: 'Paiements', path: '/admin/paiements', color: 'text-soleil-500' },
          { icon: Upload, label: 'Import élèves', path: '/admin/import-eleves', color: 'text-fleuve-500' }
        ];
      
      case 'enseignant':
        return [
          { icon: LayoutDashboard, label: 'Tableau de bord', path: '/enseignant/tableau-de-bord', color: 'text-soleil-500' },
          { icon: BookOpen, label: 'Mes classes', path: '/enseignant/mes-classes', color: 'text-fleuve-500' },
          { icon: Calendar, label: 'Emploi du temps', path: '/enseignant/emploi-du-temps', color: 'text-acacia-500' },
          { icon: FileBarChart, label: 'Gestion notes', path: '/enseignant/gestion-notes', color: 'text-terre-500' }
        ];
      
      case 'eleve':
        return [
          { icon: Calendar, label: 'Emploi du temps', path: '/eleve/emploi-du-temps', color: 'text-soleil-500' },
          { icon: FileBarChart, label: 'Mes notes', path: '/eleve/notes', color: 'text-fleuve-500' }
        ];
      
      case 'parent':
        return [
          { icon: GraduationCap, label: 'Mes enfants', path: '/parent/mes-enfants', color: 'text-acacia-500' }
        ];
      
      case 'comptable':
        return [
          { icon: Receipt, label: 'Reçus', path: '/comptable/recus', color: 'text-terre-500' }
        ];
      
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const getRoleGradient = (role) => {
    const gradients = {
      admin: 'from-terre-500 to-terre-600',
      enseignant: 'from-fleuve-500 to-fleuve-600',
      parent: 'from-acacia-500 to-acacia-600',
      eleve: 'from-soleil-500 to-soleil-600',
      comptable: 'from-gray-500 to-gray-600'
    };
    return gradients[role] || 'from-gray-500 to-gray-600';
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 sm:w-72 lg:w-64 xl:w-72
        bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header sidebar */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${getRoleGradient(user?.role)} rounded-xl flex items-center justify-center shadow-lg`}>
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">EcoleManager</h2>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 sm:px-6 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-gradient-to-r from-soleil-50 to-fleuve-50 text-fleuve-700 shadow-sm border border-fleuve-100' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-fleuve-600' : `${item.color} group-hover:text-gray-700`
                      }`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 sm:p-6 border-t border-gray-200">
          <div className="bg-gradient-to-r from-soleil-50 to-fleuve-50 rounded-xl p-4 border border-soleil-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-soleil-400 to-fleuve-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
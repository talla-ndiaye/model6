import {
  BadgeCent,
  BookOpen,
  Calendar,
  CreditCard,
  FileBarChart,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Receipt,
  ReceiptIcon,
  UserCheck,
  Users,
  X
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const getMenu = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin/tableau-de-bord' },
          { icon: GraduationCap, label: 'Élèves', path: '/admin/eleves' },
          { icon: UserCheck, label: 'Enseignants', path: '/admin/enseignants' },
          { icon: BookOpen, label: 'Classes', path: '/admin/classes' },
          { icon: FileText, label: 'Matières', path: '/admin/matieres' },
          { icon: Calendar, label: 'Emplois du temps', path: '/admin/emplois-du-temps' },
          { icon: Users, label: 'Absences-Retards-Renvois', path: '/admin/presences' },
          { icon: FileBarChart, label: 'Notes & Bulletins', path: '/admin/notes-bulletins' },
          { icon: CreditCard, label: 'Paiements', path: '/admin/paiements' },
          { icon: BadgeCent , label: 'Depenses', path: '/admin/depenses' },
          { icon: Users, label: 'Gestion utilisateurs', path: '/admin/gestion-utilisateurs' },
        ];

      case 'enseignant':
        return [
          { icon: LayoutDashboard, label: 'Tableau de bord', path: '/enseignant/tableau-de-bord' },
          { icon: BookOpen, label: 'Mes classes', path: '/enseignant/mes-classes' },
          { icon: Calendar, label: 'Emploi du temps', path: '/enseignant/emploi-du-temps' },
          { icon: FileBarChart, label: 'Gestion notes', path: '/enseignant/gestion-notes' },
          { icon: Users, label: 'Gestions Présences', path: '/enseignant/presences' },
        ];

      case 'eleve':
        return [
          { icon: Calendar, label: 'Emploi du temps', path: '/eleve/emploi-du-temps' },
          { icon: FileBarChart, label: 'Mes notes', path: '/eleve/notes' },
          { icon: Users, label: 'Absences-Retards-Renvois', path: '/eleve/presences' },
          { icon: ReceiptIcon, label: 'Historiques de Paiements', path: '/eleve/paiements' },
        ];

      case 'parent':
        return [
          { icon: GraduationCap, label: 'Mes enfants', path: '/parent/mes-enfants' },
          { icon: UserCheck, label: 'Absences-Retards-Renvois', path: '/parent/presences' },
          { icon: ReceiptIcon, label: 'Historiques de Paiements', path: '/parent/paiements' },
        ];

      case 'comptable':
        return [
          { icon: LayoutDashboard, label: 'Tableau de bord', path: '/comptable/tableau-de-bord' },
          { icon: Receipt, label: 'Paiements', path: '/comptable/paiements' },
          { icon: ReceiptIcon, label: 'statistiques', path: '/comptable/statistiques' },
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenu();


  return (
    <>
      {/* le boutton de pour fermer le menu de navigation dans les écrans mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* barre de navigation*/}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 sm:w-72 lg:w-64 xl:w-72
        bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* logo + nom-ecole + role */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg`}>
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">CCHT</h2>
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

        {/* liste du Menu */}
        <nav className="flex-1 px-4 sm:px-6 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm border-r-2 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-700'
                      }`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/*  deconnexion*/}
        <div className="p-4 sm:p-6 border-t border-blue-100">
          
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-fleuve-600 rounded-lg hover:bg-red-700 transition-colors shadow-md"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
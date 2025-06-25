import {
  Bell,
  BookOpen,
  Calendar,
  CreditCard,
  GraduationCap,
  TrendingUp,
  Users
} from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import Card from '../../components/ui/Card';
import {
  classes,
  eleves,
  enseignants,
  evenements,
  paiements
} from '../../data/donneesTemporaires';

const TableauDeBord = () => {
  const stats = [
    {
      title: 'Total Élèves',
      value: eleves.length,
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-600', // Muted blue
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Enseignants',
      value: enseignants.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600', // Muted blue
      change: '+3%',
      changeType: 'positive'
    },
    {
      title: 'Classes',
      value: classes.length,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600', // Muted blue
      change: '0%',
      changeType: 'neutral'
    },
    {
      title: 'Revenus ce mois',
      value: `${paiements.reduce((sum, p) => sum + p.montant, 0)} Fcfa`,
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600', // Muted blue
      change: '+8%',
      changeType: 'positive'
    }
  ];

  const getChangeColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-emerald-500'; // Softer green
      case 'negative':
        return 'text-rose-500'; // Softer red
      default:
        return 'text-gray-600';
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-600 mt-1">Vue d'ensemble de l'établissement</p>
      </div>

      {/* Statistiques - mobile slider */}
      <div className="block lg:hidden">
        <Slider {...sliderSettings}>
          {stats.map((stat, index) => (
            <div key={index} className="px-2 py-1">
              <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-1">{stat.title}</p>
                    <div className="flex items-baseline space-x-1">
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</p>
                      <span className={`text-xs sm:text-sm font-medium flex items-center ${getChangeColor(stat.changeType)}`}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} shadow-md`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </Slider>
      </div>

      {/* Statistiques - desktop grid */}
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                  <span className={`text-xs sm:text-sm font-medium flex items-center ${getChangeColor(stat.changeType)}`}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Événements récents et Répartition par classe */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 ">
        {/* Événements */}
        <Card className="xl:col-span-2 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-amber-500" />
              Événements à venir
            </h2>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {evenements.map((event) => (
              <div key={event.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-all duration-200 border border-gray-100 shadow-sm"> {/* Flat background, border, and simpler hover */}
                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0"></div> {/* Solid color dot */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">{event.titre}</h3>
                  <p className="text-xs text-gray-600 mb-1">{event.description}</p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(event.date).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      {event.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Répartition par classe */}
        <Card className="p-4 sm:p-5">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
            Répartition par Niveaue
          </h2>

          <div className="space-y-3">
            {classes.map((classe) => (
              <div key={classe.id} className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-50 transition-all duration-200 border border-gray-100 shadow-sm"> {/* Flat background, border, and simpler hover */}
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 bg-blue-400 rounded-md flex items-center justify-center"> {/* Solid blue background */}
                    <span className="text-white text-sm font-bold">
                      {classe.nom.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{classe.nom}</h3>
                    <p className="text-xs text-gray-600">Salle {classe.salle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{classe.nombreEleves}</p>
                  <p className="text-xs text-gray-500">élèves</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Graphiques à venir */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <Card className="p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Évolution des inscriptions</h3>
          <div className="h-40 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-lg flex items-center justify-center shadow-inner">
            <p className="text-gray-500 text-sm">Graphique à venir</p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Répartition des paiements</h3>
          <div className="h-40 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-lg flex items-center justify-center shadow-inner">
            <p className="text-gray-500 text-sm">Graphique à venir</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TableauDeBord;
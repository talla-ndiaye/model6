import React from 'react';
import { Users, GraduationCap, BookOpen, CreditCard, TrendingUp, Calendar, Bell } from 'lucide-react';
import Card from '../../components/ui/Card';
import { eleves, enseignants, classes, paiements, evenements } from '../../data/donneesTemporaires';

const TableauDeBord = () => {
  const stats = [
    {
      title: 'Total Élèves',
      value: eleves.length,
      icon: GraduationCap,
      color: 'from-soleil-400 to-soleil-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Enseignants',
      value: enseignants.length,
      icon: Users,
      color: 'from-fleuve-400 to-fleuve-500',
      change: '+3%',
      changeType: 'positive'
    },
    {
      title: 'Classes',
      value: classes.length,
      icon: BookOpen,
      color: 'from-acacia-400 to-acacia-500',
      change: '0%',
      changeType: 'neutral'
    },
    {
      title: 'Revenus ce mois',
      value: `${paiements.reduce((sum, p) => sum + p.montant, 0)}€`,
      icon: CreditCard,
      color: 'from-terre-400 to-terre-500',
      change: '+8%',
      changeType: 'positive'
    }
  ];

  const getChangeColor = (type) => {
    switch (type) {
      case 'positive': return 'text-acacia-600';
      case 'negative': return 'text-terre-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de l'établissement</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 sm:p-6 hover:scale-105 transition-transform duration-200 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
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
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Événements récents */}
        <Card className="xl:col-span-2 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-soleil-500" />
              Événements à venir
            </h2>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {evenements.map((event, index) => (
              <div key={event.id} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-soleil-50 hover:to-fleuve-50 transition-all duration-200">
                <div className="w-3 h-3 bg-gradient-to-br from-soleil-400 to-fleuve-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{event.titre}</h3>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(event.date).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="px-2 py-1 bg-soleil-100 text-soleil-700 rounded-full">
                      {event.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Répartition par classe */}
        <Card className="p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-fleuve-500" />
            Répartition par classe
          </h2>
          
          <div className="space-y-4">
            {classes.map((classe, index) => (
              <div key={classe.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-fleuve-50 hover:to-acacia-50 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-fleuve-400 to-acacia-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {classe.nom.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{classe.nom}</h3>
                    <p className="text-sm text-gray-600">Salle {classe.salle}</p>
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

      {/* Graphiques et métriques supplémentaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <Card className="p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des inscriptions</h3>
          <div className="h-48 bg-gradient-to-br from-soleil-50 to-fleuve-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Graphique à venir</p>
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des paiements</h3>
          <div className="h-48 bg-gradient-to-br from-acacia-50 to-terre-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Graphique à venir</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TableauDeBord;
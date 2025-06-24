import React from 'react';
import { BookOpen, Users, Calendar, FileText } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { classes, eleves, emploisDuTemps, matieres } from '../../data/donneesTemporaires';

const TableauDeBordEnseignant = () => {
  const { user } = useAuth();

  // Récupérer les classes de l'enseignant
  const mesClasses = classes.filter(classe => 
    classe.enseignantPrincipal === user.id
  );

  // Récupérer les élèves de ces classes
  const mesEleves = eleves.filter(eleve => 
    mesClasses.some(classe => classe.id === eleve.classeId)
  );

  // Récupérer l'emploi du temps d'aujourd'hui
  const aujourdhui = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  const coursAujourdhui = emploisDuTemps.filter(cours => 
    cours.jour === aujourdhui && cours.enseignantId === user.id
  );

  const stats = [
    {
      title: 'Mes Classes',
      value: mesClasses.length,
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Mes Élèves',
      value: mesEleves.length,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Cours aujourd\'hui',
      value: coursAujourdhui.length,
      icon: Calendar,
      color: 'bg-orange-500'
    },
    {
      title: 'Matières',
      value: user.matieres?.length || 0,
      icon: FileText,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour {user.prenom} !
        </h1>
        <p className="text-gray-600">Voici un aperçu de votre activité</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes classes */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes classes</h2>
          <div className="space-y-3">
            {mesClasses.map((classe) => (
              <div key={classe.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{classe.nom}</h3>
                  <p className="text-sm text-gray-600">{classe.nombreEleves} élèves</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Salle {classe.salle}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Cours du jour */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cours d'aujourd'hui</h2>
          <div className="space-y-3">
            {coursAujourdhui.length > 0 ? (
              coursAujourdhui.map((cours) => {
                const matiere = matieres.find(m => m.id === cours.matiereId);
                const classe = classes.find(c => c.id === cours.classeId);
                return (
                  <div key={cours.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: matiere?.couleur || '#gray' }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{matiere?.nom}</h3>
                      <p className="text-sm text-gray-600">{classe?.nom} - Salle {cours.salle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{cours.heure}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun cours prévu aujourd'hui</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TableauDeBordEnseignant;
import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { emploisDuTemps, matieres, classes } from '../../data/donneesTemporaires';

const EmploiDuTempsEnseignant = () => {
  const { user } = useAuth();

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const heures = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  const mesCoursParJourHeure = (jour, heure) => {
    const cours = emploisDuTemps.find(
      e => e.jour === jour && e.heure === heure && e.enseignantId === user.id
    );
    
    if (!cours) return null;

    const matiere = matieres.find(m => m.id === cours.matiereId);
    const classe = classes.find(c => c.id === cours.classeId);

    return {
      matiere: matiere?.nom || 'Matière inconnue',
      code: matiere?.code || 'XX',
      couleur: matiere?.couleur || '#gray',
      classe: classe?.nom || 'Classe inconnue',
      salle: cours.salle
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon emploi du temps</h1>
        <p className="text-gray-600">Votre planning de cours de la semaine</p>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Semaine en cours
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-24 p-3 text-left font-medium text-gray-700 border border-gray-200">
                  Horaires
                </th>
                {jours.map(jour => (
                  <th key={jour} className="p-3 text-center font-medium text-gray-700 border border-gray-200">
                    {jour}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heures.map(heure => (
                <tr key={heure}>
                  <td className="p-3 text-sm font-medium text-gray-600 border border-gray-200 bg-gray-50">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {heure}
                    </div>
                  </td>
                  {jours.map(jour => {
                    const cours = mesCoursParJourHeure(jour, heure);
                    return (
                      <td key={`${jour}-${heure}`} className="p-2 border border-gray-200 h-24">
                        {cours ? (
                          <div 
                            className="h-full rounded-lg p-2 text-white text-xs cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: cours.couleur }}
                          >
                            <div className="font-bold">{cours.code}</div>
                            <div className="truncate">{cours.matiere}</div>
                            <div className="flex items-center mt-1 opacity-90">
                              <span className="truncate">{cours.classe}</span>
                            </div>
                            <div className="flex items-center opacity-90">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{cours.salle}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                            Libre
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Résumé de la semaine */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total heures/semaine</h3>
          <p className="text-3xl font-bold text-blue-600">
            {emploisDuTemps.filter(c => c.enseignantId === user.id).length}h
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Classes enseignées</h3>
          <p className="text-3xl font-bold text-green-600">
            {new Set(emploisDuTemps.filter(c => c.enseignantId === user.id).map(c => c.classeId)).size}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Salles utilisées</h3>
          <p className="text-3xl font-bold text-orange-600">
            {new Set(emploisDuTemps.filter(c => c.enseignantId === user.id).map(c => c.salle)).size}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default EmploiDuTempsEnseignant;
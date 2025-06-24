import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { classes, emploisDuTemps, matieres, enseignants } from '../../data/donneesTemporaires';

const EmploisDuTemps = () => {
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const heures = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  const getEmploiForClass = (classeId) => {
    return emploisDuTemps.filter(e => e.classeId === parseInt(classeId));
  };

  const getCoursPourJourHeure = (jour, heure) => {
    const cours = getEmploiForClass(selectedClass).find(
      e => e.jour === jour && e.heure === heure
    );
    
    if (!cours) return null;

    const matiere = matieres.find(m => m.id === cours.matiereId);
    const enseignant = enseignants.find(e => e.id === cours.enseignantId);

    return {
      matiere: matiere?.nom || 'Matière inconnue',
      code: matiere?.code || 'XX',
      couleur: matiere?.couleur || '#gray',
      enseignant: enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Enseignant inconnu',
      salle: cours.salle
    };
  };

  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === parseInt(classeId));
    return classe ? classe.nom : '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emplois du temps</h1>
          <p className="text-gray-600">Visualiser et gérer les emplois du temps par classe</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classes.map(classe => (
              <option key={classe.id} value={classe.id}>
                {classe.nom}
              </option>
            ))}
          </select>
          
          <Button>
            Modifier l'emploi du temps
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Emploi du temps - {getClassName(selectedClass)}
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
                    const cours = getCoursPourJourHeure(jour, heure);
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
                              <User className="w-3 h-3 mr-1" />
                              <span className="truncate">{cours.enseignant}</span>
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

      {/* Légende des matières */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Légende des matières</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {matieres.map(matiere => (
            <div key={matiere.id} className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: matiere.couleur }}
              />
              <span className="text-sm text-gray-700">{matiere.nom}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default EmploisDuTemps;
import React from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { emploisDuTemps, matieres, enseignants, eleves, classes } from '../../data/donneesTemporaires';

const EmploiDuTempsEleve = () => {
  const { user } = useAuth();

  // Récupérer l'élève et sa classe
  const eleve = eleves.find(e => e.email === user.email);
  const maClasse = classes.find(c => c.id === eleve?.classeId);

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const heures = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  const getCoursForSlot = (jour, heure) => {
    if (!eleve) return null;
    
    const cours = emploisDuTemps.find(
      e => e.jour === jour && e.heure === heure && e.classeId === eleve.classeId
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

  if (!eleve) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profil non trouvé</h3>
          <p className="text-gray-600">
            Impossible de récupérer vos informations d'élève.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon emploi du temps</h1>
        <p className="text-gray-600">Classe {maClasse?.nom} - Votre planning de la semaine</p>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Semaine en cours - {maClasse?.nom}
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
                    const cours = getCoursForSlot(jour, heure);
                    return (
                      <td key={`${jour}-${heure}`} className="p-2 border border-gray-200 h-24">
                        {cours ? (
                          <div 
                            className="h-full rounded-lg p-2 text-white text-xs"
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

      {/* Informations de la classe */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ma classe</h3>
          <p className="text-2xl font-bold text-blue-600">{maClasse?.nom}</p>
          <p className="text-sm text-gray-600">{maClasse?.nombreEleves} élèves</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Salle principale</h3>
          <p className="text-2xl font-bold text-green-600">{maClasse?.salle}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Heures/semaine</h3>
          <p className="text-2xl font-bold text-orange-600">
            {emploisDuTemps.filter(c => c.classeId === eleve.classeId).length}h
          </p>
        </Card>
      </div>

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

export default EmploiDuTempsEleve;
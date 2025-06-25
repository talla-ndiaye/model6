import { Calendar, Clock, GraduationCap, MapPin, User } from 'lucide-react'; // Added BookOpen, GraduationCap for consistent icon use
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { classes, eleves, emploisDuTemps, enseignants, matieres } from '../../data/donneesTemporaires'; // Ensure all imports are correct

const EmploiDuTempsEleve = () => {
  const { user } = useAuth();

  // Récupérer l'élève et sa classe
  // Ensure we find the student by user.id if available, otherwise by email as a fallback
  const eleve = eleves.find(e => e.id === user?.id || e.email === user?.email);
  const maClasse = eleve ? classes.find(c => c.id === eleve.classeId) : null;

  // Harmonized jours and heures with other timetable pages
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const heures = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
  ];

  const getCoursForSlot = (jour, heure) => {
    if (!eleve || !maClasse) return null; // No course if no student or class info

    const cours = emploisDuTemps.find(
      e => e.jour === jour && e.heure === heure && e.classeId === maClasse.id
    );

    if (!cours) return null;

    const matiere = matieres.find(m => m.id === cours.matiereId);
    const enseignant = enseignants.find(e => e.id === cours.enseignantId);

    return {
      matiereNom: matiere?.nom || 'Matière inconnue',
      matiereCode: matiere?.code || 'XX',
      matiereCouleur: matiere?.couleur || '#60A5FA', // Default blue color
      enseignantNomComplet: enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Enseignant inconnu',
      salle: cours.salle || 'N/A' // Ensure salle defaults if missing
    };
  };

  // If student profile is not found, display a clear message
  if (!eleve) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center bg-gray-50 border border-gray-200 shadow-sm">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Profil élève non trouvé</h3>
          <p className="text-gray-600">
            Impossible de récupérer vos informations d'emploi du temps. Veuillez vérifier que votre profil élève est correctement lié à votre compte.
          </p>
        </Card>
      </div>
    );
  }

  // Calculate stats for the student's class
  const totalHours = emploisDuTemps.filter(c => c.classeId === eleve.classeId).length;
  // Note: For a student, the relevant stats are usually total hours, maybe unique teachers/subjects, not necessarily class count or rooms.
  // I'll keep the existing stats for consistency with the teacher's page but adapt their meaning slightly.
  const uniqueSubjects = new Set(emploisDuTemps.filter(c => c.classeId === eleve.classeId).map(c => c.matiereId)).size;
  const uniqueTeachers = new Set(emploisDuTemps.filter(c => c.classeId === eleve.classeId).map(c => c.enseignantId)).size;


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon emploi du temps</h1>
        <p className="text-gray-600">Classe {maClasse?.nom} - Votre planning de la semaine</p>
      </div>

      {/* Timetable Card */}
      <Card className="p-0 overflow-x-auto"> {/* Removed p-6, added p-0, overflow-x-auto for table */}
        <div className="p-6 mb-4"> {/* Added padding back to a div wrapping content if needed */}
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" /> {/* Consistent blue icon */}
            Semaine en cours - {maClasse?.nom}
          </h2>
        </div>

        <table className="min-w-full divide-y divide-gray-200"> {/* Consistent table styling */}
          <thead className="bg-gray-50"> {/* Consistent table header styling */}
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 border-b border-gray-200">
                Horaires
              </th>
              {jours.map(jour => (
                <th key={jour} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  {jour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200"> {/* Consistent table body styling */}
            {heures.map(heure => (
              <tr key={heure}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 border-r border-gray-200"> {/* Consistent time column styling */}
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" /> {/* Consistent blue icon */}
                    {heure}
                  </div>
                </td>
                {jours.map(jour => {
                  const cours = getCoursForSlot(jour, heure);
                  return (
                    <td key={`${jour}-${heure}`} className="px-2 py-3 border border-gray-200 h-28 align-top"> {/* Consistent cell styling */}
                      {cours ? (
                        <div
                          className="h-full rounded-lg p-2 text-xs flex flex-col justify-between items-center text-center"
                          style={{ backgroundColor: 'rgb(220 238 255)', borderColor: 'rgb(180 210 255)', color: 'rgb(37 99 235)' }} // Consistent blue theme for course blocks
                        >
                          <div className="font-bold text-sm leading-tight mb-1">{cours.matiereNom}</div>
                          <div className="text-xs opacity-90 mb-1">{cours.matiereCode}</div>
                          <div className="flex items-center text-xs opacity-90 mb-0.5">
                            <GraduationCap className="w-3 h-3 mr-1 text-blue-600" /> {/* Consistent blue icon for teacher */}
                            <span className="truncate">{cours.enseignantNomComplet}</span>
                          </div>
                          <div className="flex items-center text-xs opacity-90">
                            <MapPin className="w-3 h-3 mr-1 text-blue-600" /> {/* Consistent blue icon for room */}
                            <span>{cours.salle}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-xs"> {/* Consistent empty cell styling */}
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
      </Card>

  

      
    </div>
  );
};

export default EmploiDuTempsEleve;
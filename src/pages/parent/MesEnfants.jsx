import { BookOpen, Calendar, Clock, FileText, GraduationCap, MapPin, User } from 'lucide-react'; // Added more icons for consistency
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { classes, eleves, emploisDuTemps, enseignants, matieres, notes } from '../../data/donneesTemporaires';

const MesEnfants = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Helper component for uniform detail rows in modals (reused from other components)
  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      {Icon && <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />}
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );

  // Récupérer les enfants du parent
  const mesEnfants = eleves.filter(eleve =>
    eleve.parentIds?.includes(user.id)
  );

  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const getMatiereName = (matiereId) => {
    const matiere = matieres.find(m => m.id === matiereId);
    return matiere ? matiere.nom : 'Matière inconnue';
  };

  const getEnseignantName = (enseignantId) => {
    const enseignant = enseignants.find(e => e.id === enseignantId);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Enseignant inconnu';
  };

  const getChildSchedule = (classeId) => {
    return emploisDuTemps.filter(cours => cours.classeId === classeId);
  };

  const getChildNotes = (eleveId) => {
    return notes.filter(note => note.eleveId === eleveId);
  };

  const calculateMoyenne = (eleveId, matiereId) => {
    const notesEleve = notes.filter(n => n.eleveId === eleveId && n.matiereId === matiereId);
    if (notesEleve.length === 0) return null;

    const totalPoints = notesEleve.reduce((sum, note) => sum + (note.note * note.coefficient), 0);
    const totalCoeff = notesEleve.reduce((sum, note) => sum + note.coefficient, 0);

    return (totalPoints / totalCoeff).toFixed(2);
  };

  const calculateMoyenneGeneraleEleve = (eleveId) => {
    const eleveNotes = notes.filter(n => String(n.eleveId) === String(eleveId));
    if (eleveNotes.length === 0) return null;

    let totalPoints = 0;
    let totalCoeff = 0;

    eleveNotes.forEach(note => {
      const matiere = matieres.find(m => m.id === note.matiereId);
      const coeff = matiere ? matiere.coefficient : note.coefficient; // Prefer matiere's coefficient if available, else use note's
      totalPoints += (note.note * coeff);
      totalCoeff += coeff;
    });

    if (totalCoeff === 0) return null; // Avoid division by zero

    return (totalPoints / totalCoeff).toFixed(2);
  };

  const showSchedule = (child) => {
    setSelectedChild(child);
    setShowScheduleModal(true);
  };

  const showNotes = (child) => {
    setSelectedChild(child);
    setShowNotesModal(true);
  };

  // Harmonized jours and heures with EmploisDuTempsPage
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const heures = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
  ];

  const getCoursForSlot = (classeId, jour, heure) => {
    const cours = emploisDuTemps.find(
      e => e.jour === jour && e.heure === heure && e.classeId === classeId
    );

    if (!cours) return null;

    const matiere = matieres.find(m => m.id === cours.matiereId);
    const enseignant = enseignants.find(e => e.id === cours.enseignantId);

    return {
      matiereNom: matiere?.nom || 'Matière inconnue',
      matiereCode: matiere?.code || 'XX',
      matiereCouleur: matiere?.couleur || '#60A5FA', // Use a default blue color
      enseignantNomComplet: enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Enseignant inconnu',
      salle: cours.salle || 'N/A'
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes enfants</h1>
        <p className="text-gray-600">Suivez la scolarité de vos enfants</p>
      </div>

      {/* Children Cards Grid */}
      {mesEnfants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mesEnfants.map((enfant) => {
            const moyenneGenerale = calculateMoyenneGeneraleEleve(enfant.id);

            return (
              <Card key={enfant.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  {/* Child Name, Class, and Avatar */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                      {enfant.prenom.charAt(0)}{enfant.nom.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {enfant.prenom} {enfant.nom}
                      </h3>
                      <p className="text-sm text-gray-600">{getClassName(enfant.classeId)}</p>
                    </div>
                  </div>

                  {/* General Average */}
                  {moyenneGenerale && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Moyenne Générale</p>
                      <p className={`text-xl font-bold ${
                        parseFloat(moyenneGenerale) >= 10 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {moyenneGenerale}/20
                      </p>
                    </div>
                  )}
                </div>

                {/* Child Contact & Birth Info */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    <span>Né(e) le: {new Date(enfant.dateNaissance).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    <span>Email: {enfant.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    <span>Tél: {enfant.telephone}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showSchedule(enfant)}
                    icon={Calendar}
                    className="flex-1"
                  >
                    Emploi du temps
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showNotes(enfant)}
                    icon={FileText}
                    className="flex-1"
                  >
                    Notes
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        // Empty State Message
        <Card className="p-12 text-center bg-gray-50 border border-gray-200 shadow-sm">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enfant trouvé</h3>
          <p className="text-gray-600">
            Aucun élève n'est associé à votre compte parent.
            Contactez l'administration pour plus d'informations.
          </p>
        </Card>
      )}

      {/* Modal Emploi du temps - Enhanced */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title={`Emploi du temps - ${selectedChild?.prenom} ${selectedChild?.nom}`}
        size="xl"
      >
        {selectedChild && (
          <div className="space-y-6"> {/* Increased main spacing */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-inner"> {/* Blue themed info box */}
              <p className="text-sm text-blue-800 font-semibold">Classe: <span className="text-blue-600">{getClassName(selectedChild.classeId)}</span></p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200"> {/* Consistent table styling */}
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 border-b border-gray-200">
                      Heures
                    </th>
                    {jours.map(jour => (
                      <th key={jour} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        {jour}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {heures.map(heure => (
                    <tr key={heure}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 border-r border-gray-200">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-blue-600" /> {/* Consistent blue icon */}
                          {heure}
                        </div>
                      </td>
                      {jours.map(jour => {
                        const cours = getCoursForSlot(selectedChild.classeId, jour, heure);
                        return (
                          <td key={`${jour}-${heure}`} className="px-2 py-3 border border-gray-200 h-28 align-top">
                            {cours ? (
                              <div
                                className="h-full rounded-lg p-2 text-xs cursor-pointer hover:opacity-90 transition-opacity flex flex-col justify-between items-center text-center" // Centered text
                                style={{ backgroundColor: 'rgb(220 238 255)', borderColor: 'rgb(180 210 255)', color: 'rgb(37 99 235)' }} // Consistent blue theme
                              >
                                <div className="font-bold text-sm leading-tight mb-1">{cours.matiereNom}</div>
                                <div className="text-xs opacity-90 mb-1">{cours.matiereCode}</div>
                                <div className="flex items-center text-xs opacity-90 mb-0.5">
                                  <GraduationCap className="w-3 h-3 mr-1 text-blue-600" /> {/* Consistent blue icon */}
                                  <span className="truncate">{cours.enseignantNomComplet}</span>
                                </div>
                                <div className="flex items-center text-xs opacity-90">
                                  <MapPin className="w-3 h-3 mr-1 text-blue-600" /> {/* Consistent blue icon */}
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
          </div>
        )}
      </Modal>

      {/* Modal Notes - Enhanced */}
      <Modal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title={`Notes - ${selectedChild?.prenom} ${selectedChild?.nom}`}
        size="lg"
      >
        {selectedChild && (
          <div className="space-y-6"> {/* Increased main spacing */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-inner"> {/* Blue themed info box */}
              <p className="text-sm text-blue-800 font-semibold">Classe: <span className="text-blue-600">{getClassName(selectedChild.classeId)}</span></p>
              <p className="text-sm text-blue-800 font-semibold mt-1">Moyenne Générale: <span className={`text-blue-600 ${
                parseFloat(calculateMoyenneGeneraleEleve(selectedChild.id)) >= 10 ? 'text-green-600' : 'text-red-600'
              }`}>{calculateMoyenneGeneraleEleve(selectedChild.id)}/20</span></p>
            </div>

            <div className="space-y-4">
              {matieres.map(matiere => {
                const notesMatiere = getChildNotes(selectedChild.id).filter(n => n.matiereId === matiere.id);
                const moyenne = calculateMoyenne(selectedChild.id, matiere.id);

                return (
                  <Card key={matiere.id} className="p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-3 border-b pb-2">
                      <div className="flex items-center space-x-3">
                        {/* Using consistent blue BookOpen icon here */}
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900 text-lg">{matiere.nom}</h4> {/* Larger subject name */}
                      </div>
                      {moyenne ? (
                        <span className={`text-xl font-bold ${ // Larger average
                          parseFloat(moyenne) >= 10 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {moyenne}/20
                        </span>
                      ) : (
                        <span className="text-gray-400 text-md">Pas de note</span>
                      )}
                    </div>

                    {notesMatiere.length > 0 ? (
                      <div className="space-y-2">
                        {notesMatiere.map(note => (
                          <div key={note.id} className="flex justify-between items-center text-sm py-1">
                            <div>
                              <span className="text-gray-700 font-medium">{note.type}</span>
                              <span className="text-gray-500 ml-2">
                                ({new Date(note.date).toLocaleDateString('fr-FR')})
                              </span>
                            </div>
                            <span className={`font-semibold ${
                              note.note >= 10 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {note.note}/20
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm py-2">Aucune note enregistrée pour cette matière.</p>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MesEnfants;
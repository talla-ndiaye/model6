import React, { useState } from 'react';
import { User, Calendar, FileText, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { eleves, classes, emploisDuTemps, matieres, enseignants, notes } from '../../data/donneesTemporaires';

const MesEnfants = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Récupérer les enfants du parent
  const mesEnfants = eleves.filter(eleve => 
    eleve.parentIds?.includes(user.id)
  );

  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
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

  const showSchedule = (child) => {
    setSelectedChild(child);
    setShowScheduleModal(true);
  };

  const showNotes = (child) => {
    setSelectedChild(child);
    setShowNotesModal(true);
  };

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const heures = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  const getCoursForSlot = (classeId, jour, heure) => {
    const cours = emploisDuTemps.find(
      e => e.jour === jour && e.heure === heure && e.classeId === classeId
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes enfants</h1>
        <p className="text-gray-600">Suivez la scolarité de vos enfants</p>
      </div>

      {mesEnfants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mesEnfants.map((enfant) => {
            const childNotes = getChildNotes(enfant.id);
            const moyenneGenerale = childNotes.length > 0 
              ? (childNotes.reduce((sum, note) => sum + note.note, 0) / childNotes.length).toFixed(2)
              : null;

            return (
              <Card key={enfant.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {enfant.prenom} {enfant.nom}
                      </h3>
                      <p className="text-sm text-gray-600">{getClassName(enfant.classeId)}</p>
                    </div>
                  </div>
                  
                  {moyenneGenerale && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Moyenne</p>
                      <p className={`text-lg font-semibold ${
                        parseFloat(moyenneGenerale) >= 10 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {moyenneGenerale}/20
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date de naissance:</span>
                    <span className="text-gray-900">
                      {new Date(enfant.dateNaissance).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900">{enfant.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Téléphone:</span>
                    <span className="text-gray-900">{enfant.telephone}</span>
                  </div>
                </div>

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
        <Card className="p-12 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enfant trouvé</h3>
          <p className="text-gray-600">
            Aucun élève n'est associé à votre compte parent. 
            Contactez l'administration pour plus d'informations.
          </p>
        </Card>
      )}

      {/* Modal Emploi du temps */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title={`Emploi du temps - ${selectedChild?.prenom} ${selectedChild?.nom}`}
        size="xl"
      >
        {selectedChild && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Classe: <span className="font-medium">{getClassName(selectedChild.classeId)}</span></p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="w-20 p-2 text-left font-medium text-gray-700 border border-gray-200">
                      Horaires
                    </th>
                    {jours.map(jour => (
                      <th key={jour} className="p-2 text-center font-medium text-gray-700 border border-gray-200">
                        {jour}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heures.map(heure => (
                    <tr key={heure}>
                      <td className="p-2 text-xs font-medium text-gray-600 border border-gray-200 bg-gray-50">
                        {heure}
                      </td>
                      {jours.map(jour => {
                        const cours = getCoursForSlot(selectedChild.classeId, jour, heure);
                        return (
                          <td key={`${jour}-${heure}`} className="p-1 border border-gray-200 h-16">
                            {cours ? (
                              <div 
                                className="h-full rounded p-1 text-white text-xs"
                                style={{ backgroundColor: cours.couleur }}
                              >
                                <div className="font-bold">{cours.code}</div>
                                <div className="truncate">{cours.salle}</div>
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

      {/* Modal Notes */}
      <Modal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title={`Notes - ${selectedChild?.prenom} ${selectedChild?.nom}`}
        size="lg"
      >
        {selectedChild && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Classe: <span className="font-medium">{getClassName(selectedChild.classeId)}</span></p>
            </div>

            <div className="space-y-4">
              {matieres.map(matiere => {
                const notesMatiere = getChildNotes(selectedChild.id).filter(n => n.matiereId === matiere.id);
                const moyenne = calculateMoyenne(selectedChild.id, matiere.id);
                
                return (
                  <div key={matiere.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: matiere.couleur }}
                        />
                        <h4 className="font-medium text-gray-900">{matiere.nom}</h4>
                      </div>
                      {moyenne ? (
                        <span className={`font-semibold ${
                          parseFloat(moyenne) >= 10 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {moyenne}/20
                        </span>
                      ) : (
                        <span className="text-gray-400">Pas de note</span>
                      )}
                    </div>

                    {notesMatiere.length > 0 ? (
                      <div className="space-y-2">
                        {notesMatiere.map(note => (
                          <div key={note.id} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="text-gray-600">{note.type}</span>
                              <span className="text-gray-400 ml-2">
                                ({new Date(note.date).toLocaleDateString('fr-FR')})
                              </span>
                            </div>
                            <span className={`font-medium ${
                              note.note >= 10 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {note.note}/20
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Aucune note</p>
                    )}
                  </div>
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
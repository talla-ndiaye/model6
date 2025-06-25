import { AlertCircle, Calendar, CheckCircle, Clock, Users, UserX, XCircle } from 'lucide-react'; // Added Edit icon
import { useEffect, useMemo, useState } from 'react'; // Added useEffect and useMemo
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { classes, eleves, presences as initialPresences } from '../../data/donneesTemporaires'; // Ensure presences are mutable

const GestionPresences = () => {
  const { user } = useAuth(); // Assuming user has 'id' and 'classes' (array of class IDs they are assigned to teach)
  const [presences, setPresences] = useState(initialPresences);
  const [selectedClass, setSelectedClass] = useState('');
  // Default date to today
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentForComment, setSelectedStudentForComment] = useState(null); // Renamed to avoid conflict

  // Get classes assigned to the logged-in teacher
  // Assuming 'user.classes' is an array of class IDs, or they are a principal teacher
  const mesClasses = useMemo(() => classes.filter(classe =>
    classe.enseignantPrincipal === user.id || (user.classes && user.classes.includes(classe.id))
  ), [user]);

  // Get students relevant to the selected class
  const elevesClasse = useMemo(() => {
    return selectedClass
      ? eleves.filter(eleve => String(eleve.classeId) === String(selectedClass))
      : []; // Only show students if a class is selected
  }, [selectedClass]);

  // --- Effect to default students to 'present' and manage presence records ---
  useEffect(() => {
    if (!selectedClass) {
      // If no class is selected, clear stats or show guidance
      // No automatic presence marking needed without a selected class
      return;
    }

    // Identify students in the selected class who DO NOT have a record for the selected date
    const studentsWithoutRecord = elevesClasse.filter(eleve =>
      !presences.some(p =>
        String(p.eleveId) === String(eleve.id) &&
        p.date === selectedDate &&
        String(p.classeId) === String(selectedClass)
      )
    );

    // Create new 'present' records for these students
    const newPresentRecords = studentsWithoutRecord.map(eleve => ({
      id: Math.random().toString(36).substr(2, 9), // Simple unique ID for new records
      eleveId: eleve.id,
      date: selectedDate,
      statut: 'present', // Default to present
      heureDebut: '08:00', // Default times
      heureFin: '17:00',
      enseignantId: user.id, // Teacher marking presence
      classeId: parseInt(selectedClass),
      justifie: false,
      motifJustification: '',
      commentaire: '',
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString()
    }));

    // Add these new records to the state
    if (newPresentRecords.length > 0) {
      setPresences(prevPresences => [...prevPresences, ...newPresentRecords]);
    }
  }, [selectedClass, selectedDate, elevesClasse, presences, user]); // Depend on relevant state

  // Filter existing presences for the selected date and class
  const presencesDuJourFiltered = useMemo(() => {
    return presences.filter(p =>
      p.date === selectedDate &&
      String(p.classeId) === String(selectedClass)
    );
  }, [presences, selectedDate, selectedClass]);

  // Prepare data for the table, linking each student to their presence record
  const tableData = useMemo(() => {
    if (!selectedClass) return []; // No table data if no class is selected

    return elevesClasse.map(eleve => {
      const presenceRecord = presencesDuJourFiltered.find(p => String(p.eleveId) === String(eleve.id));
      // Always return a record for each student in the class, even if it's a 'virtual' one
      return {
        // Use an actual ID if present, otherwise a temp ID for consistency
        id: presenceRecord?.id || `temp-${eleve.id}-${selectedDate}`,
        eleveId: eleve.id,
        classeId: eleve.classeId,
        date: selectedDate,
        statut: presenceRecord?.statut || 'present', // Default to 'present' if no record
        heureDebut: presenceRecord?.heureDebut || '08:00',
        heureFin: presenceRecord?.heureFin || '17:00',
        enseignantId: presenceRecord?.enseignantId || user.id,
        justifie: presenceRecord?.justifie || false,
        motifJustification: presenceRecord?.motifJustification || '',
        commentaire: presenceRecord?.commentaire || ''
      };
    });
  }, [selectedClass, elevesClasse, presencesDuJourFiltered, selectedDate, user]);


  // --- Helper Functions ---
  const getEleveName = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'present': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'retard': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'renvoye': return <UserX className="w-5 h-5 text-purple-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />; // Should not happen with default logic
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'present': return 'Présent';
      case 'absent': return 'Absent';
      case 'retard': return 'En retard';
      case 'renvoye': return 'Renvoyé';
      default: return 'Inconnu'; // Fallback
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'retard': return 'bg-orange-100 text-orange-800';
      case 'renvoye': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // --- Handlers for Status Change & Comment Modal ---
  const handleStatusChange = (eleveId, newStatus) => {
    const now = new Date().toISOString();
    const eleveInContext = elevesClasse.find(e => String(e.id) === String(eleveId));

    if (!eleveInContext) {
      console.error("Student not found in current class context.");
      return;
    }

    setPresences(prevPresences => {
      const existingPresenceIndex = prevPresences.findIndex(p =>
        String(p.eleveId) === String(eleveId) &&
        p.date === selectedDate &&
        String(p.classeId) === String(selectedClass)
      );

      if (existingPresenceIndex > -1) {
        // Update existing presence record
        return prevPresences.map((p, index) =>
          index === existingPresenceIndex
            ? { ...p, statut: newStatus, dateModification: now, justifie: newStatus === 'present' ? false : p.justifie } // Reset justification if present
            : p
        );
      } else {
        // Create a new presence record
        const newPresence = {
          id: Math.max(...presences.map(p => p.id)).toString() + 'n', // Simple unique ID for new records
          eleveId: eleveId,
          date: selectedDate,
          statut: newStatus,
          heureDebut: '08:00',
          heureFin: '17:00',
          enseignantId: user.id,
          classeId: parseInt(selectedClass),
          justifie: newStatus === 'present' ? false : false, // Default to not justified for absent/retard/renvoye
          motifJustification: '',
          commentaire: '',
          dateCreation: now,
          dateModification: now
        };
        return [...prevPresences, newPresence];
      }
    });
    console.log(`Présence mise à jour: Élève ${eleveId}, Statut: ${newStatus}`);
  };

  const openCommentModal = (eleve) => {
    setSelectedStudentForComment(eleve);
    setShowModal(true);
  };

  const saveComment = (commentaire) => {
    const presenceToUpdate = presences.find(p =>
      String(p.eleveId) === String(selectedStudentForComment.id) &&
      p.date === selectedDate &&
      String(p.classeId) === String(selectedClass)
    );

    if (presenceToUpdate) {
      setPresences(prevPresences => prevPresences.map(p =>
        String(p.id) === String(presenceToUpdate.id)
          ? { ...p, commentaire, dateModification: new Date().toISOString() }
          : p
      ));
      console.log(`Commentaire mis à jour pour ${selectedStudentForComment.prenom} ${selectedStudentForComment.nom}`);
    } else {
      // This case should ideally not happen if a record is generated by default.
      console.warn("No existing presence record to save comment for. Comment not saved.");
    }
    setShowModal(false);
    setSelectedStudentForComment(null);
  };

  // Stats calculation
  const stats = useMemo(() => {
    // These stats reflect only the students currently in tableData (i.e., in selectedClass)
    const total = tableData.length;
    const presents = tableData.filter(p => p.statut === 'present').length;
    const absents = tableData.filter(p => p.statut === 'absent').length;
    const retards = tableData.filter(p => p.statut === 'retard').length;
    const renvoyes = tableData.filter(p => p.statut === 'renvoye').length;

    // Justification stats need to look at actual records, not virtual ones
    const actualPresencesForJustification = presencesDuJourFiltered.filter(p => p.statut !== 'present');
    const justifies = actualPresencesForJustification.filter(p => p.justifie).length;
    const nonJustifies = actualPresencesForJustification.filter(p => !p.justifie).length;
    const nonDefinis = total - (presents + absents + retards + renvoyes); // Students explicitly not marked by any status

    return { total, presents, absents, retards, renvoyes, justifies, nonJustifies, nonDefinis };
  }, [tableData, presencesDuJourFiltered]);


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des présences</h1>
        <p className="text-gray-600">Marquer les présences de vos élèves</p>
      </div>

      {/* Filters Card */}
      <Card className="p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="select-class" className="block text-sm font-medium text-gray-700 mb-1">
              Classe
            </label>
            <select
              id="select-class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Sélectionner une classe</option>
              {mesClasses.map(classe => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="select-date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              id="select-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>
        </div>
      </Card>

      {/* Conditional Content based on selectedClass */}
      {selectedClass ? (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="p-4 text-center bg-blue-50 border-blue-100 shadow-sm">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              <p className="text-sm text-blue-600">Total Élèves</p>
            </Card>

            <Card className="p-4 text-center bg-green-50 border-green-100 shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-800">{stats.presents}</p>
              <p className="text-sm text-green-600">Présents</p>
            </Card>

            <Card className="p-4 text-center bg-red-50 border-red-100 shadow-sm">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-800">{stats.absents}</p>
              <p className="text-sm text-red-600">Absents</p>
            </Card>

            <Card className="p-4 text-center bg-orange-50 border-orange-100 shadow-sm">
              <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-800">{stats.retards}</p>
              <p className="text-sm text-orange-600">Retards</p>
            </Card>

            <Card className="p-4 text-center bg-purple-50 border-purple-100 shadow-sm">
              <UserX className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-800">{stats.renvoyes}</p>
              <p className="text-sm text-purple-600">Renvoyés</p>
            </Card>

            <Card className="p-4 text-center bg-gray-50 border-gray-100 shadow-sm">
              <AlertCircle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-800">{stats.nonDefinis}</p> {/* Display non-defined clearly */}
              <p className="text-sm text-gray-600">Non marqués</p>
            </Card>
          </div>

          {/* List of Students with Presence Status */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Présences - {getClassName(parseInt(selectedClass))} - {new Date(selectedDate).toLocaleDateString('fr-FR')}
              </h2>

              <div className="space-y-4">
                {tableData.length > 0 ? (
                  tableData.map(presence => {
                    const eleve = eleves.find(e => e.id === presence.eleveId);
                    const statut = presence?.statut; // Use the status from the prepared presence object

                    return (
                      <div key={presence.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {eleve?.prenom.charAt(0)}{eleve?.nom.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {eleve?.prenom} {eleve?.nom}
                            </h3>
                            <p className="text-sm text-gray-600">{eleve?.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {/* Statut actuel */}
                          <div className="flex items-center space-x-2 min-w-[100px] justify-end">
                            {getStatusIcon(statut)}
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(statut)}`}>
                              {getStatusLabel(statut)}
                            </span>
                          </div>

                          {/* Boutons d'action */}
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleStatusChange(eleve.id, 'present')}
                              className={`p-2 rounded-lg transition-colors ${
                                statut === 'present'
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                              }`}
                              title="Marquer Présent"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleStatusChange(eleve.id, 'absent')}
                              className={`p-2 rounded-lg transition-colors ${
                                statut === 'absent'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                              }`}
                              title="Marquer Absent"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleStatusChange(eleve.id, 'retard')}
                              className={`p-2 rounded-lg transition-colors ${
                                statut === 'retard'
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'
                              }`}
                              title="Marquer En retard"
                            >
                              <Clock className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleStatusChange(eleve.id, 'renvoye')}
                              className={`p-2 rounded-lg transition-colors ${
                                statut === 'renvoye'
                                  ? 'bg-purple-100 text-purple-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                              }`}
                              title="Marquer Renvoyé"
                            >
                              <UserX className="w-4 h-4" />
                            </button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openCommentModal(eleve)}
                            >
                              Commentaire
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun élève dans cette classe ou pour cette date.</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-12 text-center shadow-sm">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sélectionnez une classe</h3>
          <p className="text-gray-600">
            Pour marquer les présences, veuillez sélectionner une de vos classes
            dans le menu déroulant ci-dessus.
          </p>
        </Card>
      )}

      {/* Modal commentaire */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Commentaire - ${selectedStudentForComment?.prenom} ${selectedStudentForComment?.nom}`}
        size="md"
      >
        {selectedStudentForComment && (
          <CommentForm
            student={selectedStudentForComment}
            presence={presences.find(p => String(p.eleveId) === String(selectedStudentForComment.id) && p.date === selectedDate && String(p.classeId) === String(selectedClass))}
            onSave={saveComment}
            onCancel={() => setShowModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

// Composant pour le formulaire de commentaire
const CommentForm = ({ student, presence, onSave, onCancel }) => {
  const [commentaire, setCommentaire] = useState(presence?.commentaire || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(commentaire);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Commentaire sur la présence
        </label>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          rows={4}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ajouter un commentaire..."
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          Enregistrer
        </Button>
      </div>
    </form>
  );
};

export default GestionPresences;
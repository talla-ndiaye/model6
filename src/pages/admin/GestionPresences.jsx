import { AlertCircle, Calendar, CheckCircle, Clock, Edit, Users, UserX, XCircle } from 'lucide-react'; // Added Calendar, Plus, Search for consistency
import { useMemo, useState } from 'react'; // Added useMemo for performance
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table'; // Ensure Table is imported

import { classes, eleves, enseignants, presences as initialPresences } from '../../data/donneesTemporaires'; // Import enseignants

const GestionPresencesAdmin = () => {
  const [presences, setPresences] = useState(initialPresences);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPresence, setSelectedPresence] = useState(null); // Full presence object when managing
  const [formData, setFormData] = useState({
    justifie: false,
    motifJustification: '',
    commentaire: ''
  });

  // --- Helper Functions ---

  const getEleveName = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const getEnseignantName = (enseignantId) => {
    const enseignant = enseignants.find(e => e.id === enseignantId);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Enseignant inconnu';
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'retard':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'renvoye':
        return <UserX className="w-5 h-5 text-purple-600" />;
      default: // For 'Non marqué' or undefined
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'present':
        return 'Présent';
      case 'absent':
        return 'Absent';
      case 'retard':
        return 'En retard';
      case 'renvoye':
        return 'Renvoyé';
      default:
        return 'Non marqué'; // New status for students without a record
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'retard':
        return 'bg-orange-100 text-orange-800';
      case 'renvoye':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // --- Data Filtering & Aggregation ---

  // Get students relevant to the selected class
  const elevesClasse = useMemo(() => {
    return selectedClass
      ? eleves.filter(eleve => String(eleve.classeId) === String(selectedClass))
      : eleves; // If no class selected, consider all students (could be large)
  }, [selectedClass]);

  // Get presences for the selected date and class
  const presencesDuJourFiltered = useMemo(() => {
    return presences.filter(p =>
      p.date === selectedDate &&
      (selectedClass === '' || String(p.classeId) === String(selectedClass))
    );
  }, [presences, selectedDate, selectedClass]);


  // Prepare data for the table, including students without a recorded presence for the day
  const tableData = useMemo(() => {
    const data = elevesClasse.map(eleve => {
      const presenceRecord = presencesDuJourFiltered.find(p => String(p.eleveId) === String(eleve.id));
      return presenceRecord || { // Return existing record or a placeholder
        id: `temp-${eleve.id}-${selectedDate}`, // Unique ID for temp records
        eleveId: eleve.id,
        classeId: eleve.classeId,
        date: selectedDate,
        statut: 'non_marque', // Custom status for 'not marked'
        justifie: false,
        motifJustification: null,
        commentaire: null
      };
    });
    return data;
  }, [elevesClasse, presencesDuJourFiltered, selectedDate]);


  // Stats calculation
  const stats = useMemo(() => {
    const totalStudentsInContext = elevesClasse.length; // Total students in view
    const presents = presencesDuJourFiltered.filter(p => p.statut === 'present').length;
    const absents = presencesDuJourFiltered.filter(p => p.statut === 'absent').length;
    const retards = presencesDuJourFiltered.filter(p => p.statut === 'retard').length;
    const renvoyes = presencesDuJourFiltered.filter(p => p.statut === 'renvoye').length;
    const justifies = presencesDuJourFiltered.filter(p => p.justifie).length;
    const nonJustifies = presencesDuJourFiltered.filter(p => !p.justifie && (p.statut === 'absent' || p.statut === 'retard' || p.statut === 'renvoye')).length;

    // The 'total' stat should reflect the total number of students whose presence could be marked.
    // If a class is selected, it's the students in that class. If no class, it's all students in 'eleves'.
    const totalMarkable = selectedClass ? elevesClasse.length : eleves.length;


    return {
      total: totalMarkable,
      presents,
      absents,
      retards,
      renvoyes,
      justifies,
      nonJustifies
    };
  }, [elevesClasse, presencesDuJourFiltered, selectedClass]);


  // --- Modal & Form Logic ---

  const openJustificationModal = (presence) => {
    // Only open for actual presence records or if it's a 'non_marque' record for adding
    if (presence.statut !== 'non_marque' && presence.id.toString().startsWith('temp-')) {
        // If it's a temporary 'non_marque' record, don't open modal for justification directly
        // You might want a different modal to MARK initial presence for the day
        alert("Cette entrée n'est pas encore une présence enregistrée. Vous devez d'abord marquer la présence de l'élève.");
        return;
    }
    
    setSelectedPresence(presence);
    setFormData({
      justifie: presence.justifie || false,
      motifJustification: presence.motifJustification || '',
      commentaire: presence.commentaire || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedPresence = {
      ...selectedPresence,
      justifie: formData.justifie,
      motifJustification: formData.motifJustification,
      commentaire: formData.commentaire,
      dateModification: new Date().toISOString()
    };

    // Update in local state (for simulation)
    setPresences(prevPresences => {
      const existingIndex = prevPresences.findIndex(p => String(p.id) === String(selectedPresence.id));
      if (existingIndex > -1) {
        // If it's an existing record, update it
        return prevPresences.map((p, index) =>
          index === existingIndex ? updatedPresence : p
        );
      } else {
        // If it's a newly marked presence (from 'non_marque' to 'absent/retard' and then justified)
        // This scenario is more complex without a full 'mark presence' modal
        // For now, this modal is strictly for JUSTIFYING existing records.
        console.warn("Attempted to justify a non-existent presence record. This modal is for existing entries only.");
        return prevPresences;
      }
    });

    console.log('Justification mise à jour:', updatedPresence);

    setShowModal(false);
    setSelectedPresence(null);
  };

  const resetForm = () => {
    setFormData({
      justifie: false,
      motifJustification: '',
      commentaire: ''
    });
    setSelectedPresence(null);
    setShowModal(false);
  };

  // --- Table Columns Definition ---
  const columns = [
    {
      header: 'Élève',
      accessor: 'eleveId',
      render: (presence) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {getEleveName(presence.eleveId).split(' ').map(n => n.charAt(0)).join('')}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{getEleveName(presence.eleveId)}</h3>
            <p className="text-sm text-gray-600">{getClassName(presence.classeId)}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Statut',
      accessor: 'statut',
      render: (presence) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(presence.statut)}
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(presence.statut)}`}>
            {getStatusLabel(presence.statut)}
          </span>
        </div>
      )
    },
    {
      header: 'Heure (Début-Fin)',
      accessor: 'heureDebut',
      render: (presence) => presence.statut === 'present' || presence.statut === 'retard' ? `${presence.heureDebut || 'N/A'} - ${presence.heureFin || 'N/A'}` : 'N/A'
    },
    {
        header: 'Enseignant',
        accessor: 'enseignantId',
        render: (presence) => presence.enseignantId ? getEnseignantName(presence.enseignantId) : 'N/A'
    },
    {
      header: 'Justification',
      accessor: 'justifie',
      render: (presence) => (
        <div className="flex items-center space-x-2">
          {presence.statut === 'present' ? (
            <span className="text-gray-500 text-sm">N/A</span>
          ) : presence.justifie ? (
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Justifié</span>
          ) : (
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Non justifié</span>
          )}
        </div>
      )
    },
    {
        header: 'Motif',
        accessor: 'motifJustification',
        render: (presence) => (
            <p className="text-sm text-gray-700 max-w-xs truncate" title={presence.motifJustification || 'Aucun motif'}>
                {presence.motifJustification || 'Aucun'}
            </p>
        )
    },
    {
      header: 'Commentaire',
      accessor: 'commentaire',
      render: (presence) => (
        <p className="text-sm text-gray-700 max-w-xs truncate" title={presence.commentaire || 'Aucun commentaire'}>
            {presence.commentaire || 'Aucun'}
        </p>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (presence) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openJustificationModal(presence)}
          icon={Edit}
          disabled={presence.statut === 'present' || presence.statut === 'non_marque'} // Cannot justify 'present' or 'non_marque' yet
        >
          Gérer
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des présences</h1>
        <p className="text-gray-600">Administrer les présences et justifications des élèves</p>
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
              <option value="">Toutes les classes</option>
              {classes.map(classe => (
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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

        <Card className="p-4 text-center bg-teal-50 border-teal-100 shadow-sm"> {/* Changed to Teal */}
          <CheckCircle className="w-6 h-6 text-teal-600 mx-auto mb-2" /> {/* Changed to Teal */}
          <p className="text-2xl font-bold text-teal-800">{stats.justifies}</p> {/* Changed to Teal */}
          <p className="text-sm text-teal-600">Justifiés</p> {/* Changed to Teal */}
        </Card>

        <Card className="p-4 text-center bg-rose-50 border-rose-100 shadow-sm"> {/* Changed to Rose */}
          <AlertCircle className="w-6 h-6 text-rose-600 mx-auto mb-2" /> {/* Changed to Rose */}
          <p className="text-2xl font-bold text-rose-800">{stats.nonJustifies}</p> {/* Changed to Rose */}
          <p className="text-sm text-rose-600">Non justifiés</p> {/* Changed to Rose */}
        </Card>
      </div>

      {/* Presence List (Table) */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Présences du {new Date(selectedDate).toLocaleDateString('fr-FR')} {selectedClass && `pour ${getClassName(parseInt(selectedClass))}`}
        </h2>

        {selectedClass === '' && elevesClasse.length > 0 && (
            <div className="text-center py-4 bg-blue-50 border border-blue-100 rounded-lg mb-6">
                <p className="text-blue-700 text-sm font-medium">
                    Sélectionnez une classe pour une vue plus détaillée des présences.
                </p>
            </div>
        )}

        {elevesClasse.length > 0 ? (
          <Table
            columns={columns}
            data={tableData}
            // Optional: Add a message if no records match filters
            noDataMessage="Aucun élève trouvé pour la classe ou la date sélectionnée."
          />
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Sélectionnez une classe pour afficher les présences.</p>
          </div>
        )}
      </Card>

      {/* Modal de gestion des justifications */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={`Gérer la présence de ${selectedPresence ? getEleveName(selectedPresence.eleveId) : ''}`}
        size="md"
      >
        {selectedPresence && (
          <form onSubmit={handleSubmit} className="space-y-6 p-2"> {/* Added some padding */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-inner"> {/* Blue background */}
              <h3 className="font-semibold text-blue-800 mb-3">Informations sur la présence</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Statut actuel:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedPresence.statut)}
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedPresence.statut)}`}>
                      {getStatusLabel(selectedPresence.statut)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Classe:</span>
                  <p className="font-medium text-gray-900">{getClassName(selectedPresence.classeId)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <p className="font-medium text-gray-900">{new Date(selectedPresence.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Enseignant ayant marqué:</span> {/* Corrected label */}
                  {/* Corrected logic to get teacher name from presence record */}
                  <p className="font-medium text-gray-900">{selectedPresence.enseignantId ? getEnseignantName(selectedPresence.enseignantId) : 'Non défini'}</p>
                </div>
              </div>
            </div>

            {selectedPresence.statut !== 'present' && selectedPresence.statut !== 'non_marque' && (
                <div className="space-y-4">
                    <div className="flex items-center mt-4">
                        <input
                            type="checkbox"
                            id="justifie"
                            checked={formData.justifie}
                            onChange={(e) => setFormData({...formData, justifie: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="justifie" className="ml-2 block text-sm font-medium text-gray-900">
                            Absence/Retard justifié(e)
                        </label>
                    </div>

                    <InputField
                        label="Motif de justification"
                        value={formData.motifJustification}
                        onChange={(e) => setFormData({...formData, motifJustification: e.target.value})}
                        placeholder="Rendez-vous médical, problème de transport..."
                        type="textarea" // Changed to textarea for better input
                        rows="2"
                        disabled={!formData.justifie} // Disable if not justified
                    />

                    <InputField
                        label="Commentaire administratif"
                        value={formData.commentaire}
                        onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
                        placeholder="Commentaire interne..."
                        type="textarea" // Changed to textarea for better input
                        rows="3"
                    />
                </div>
            )}
            {selectedPresence.statut === 'non_marque' && (
                <div className="text-center py-4 text-gray-600">
                    Cette présence n'a pas encore été marquée. Vous ne pouvez la justifier qu'après avoir enregistré un statut (Absent, Retard, Renvoyé).
                </div>
            )}
            {selectedPresence.statut === 'present' && (
                <div className="text-center py-4 text-gray-600">
                    Un élève présent n'a pas besoin de justification.
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button type="submit" disabled={selectedPresence.statut === 'present' || selectedPresence.statut === 'non_marque'}>
                Enregistrer
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default GestionPresencesAdmin;
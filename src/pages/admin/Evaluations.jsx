import { CalendarDays, Clock, GraduationCap, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
// Removed Table component as it's no longer the main display for evaluations

import { classes, enseignants, evaluations as initialEvaluations, matieres } from '../../data/donneesTemporaires';

const GestionEvaluations = () => {
  const [evaluations, setEvaluations] = useState(initialEvaluations);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState(null);
  const [selectedEvaluationDetails, setSelectedEvaluationDetails] = useState(null);

  // Form state for adding/editing evaluation
  const [formData, setFormData] = useState({
    id: null,
    matiereId: '',
    classeId: '',
    niveau: '', // Derived from classeId
    date: '',
    heureDebut: '',
    heureFin: '',
    dureeHeures: '', // New: Duration in hours (2, 3, 4)
    type: '',
    description: '',
    enseignantId: ''
  });

  // Filters for the main timetable display
  const [selectedNiveau, setSelectedNiveau] = useState(''); // Main filter for the timetable
  const [filterMatiere, setFilterMatiere] = useState(''); // Additional filter within a level
  const [filterType, setFilterType] = useState('');       // Additional filter within a level
  const [searchTerm, setSearchTerm] = useState('');       // Search within descriptions

  // --- Timetable structure data ---
  const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const plagesHoraires = [ // Each slot is 1 hour
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
  ];
  // Calculate how many 1-hour slots an evaluation takes
  const getNumberOfSlots = (dureeHeures) => dureeHeures; 
  // Map from heureDebut to its index in plagesHoraires
  const getHeureDebutIndex = (heureDebut) => plagesHoraires.findIndex(slot => slot.startsWith(heureDebut));


  // --- Helper Functions ---
  const getNextId = () => evaluations.length > 0 ? Math.max(...evaluations.map(e => e.id)) + 1 : 1;
  const getClassName = (id) => classes.find(c => c.id === id)?.nom || 'N/A';
  const getMatiereName = (id) => matieres.find(m => m.id === id)?.nom || 'N/A';
  const getEnseignantName = (id) => enseignants.find(e => e.id === id)?.prenom + ' ' + enseignants.find(e => e.id === id)?.nom || 'N/A';

  // --- Filter Options for Dropdowns ---
  const uniqueNiveaux = useMemo(() => {
    // Get unique levels from all evaluations (or classes, depends on source of truth for levels)
    const niveaux = new Set(classes.map(c => c.niveau)); 
    return ['', 'Sélectionner un niveau', ...Array.from(niveaux).sort()];
  }, [classes]);

  const uniqueMatieres = useMemo(() => {
    const matieresInEvaluations = new Set(initialEvaluations.map(e => e.matiereId));
    const availableMatieres = matieres.filter(m => matieresInEvaluations.has(m.id));
    return ['', 'Toutes les matières', ...availableMatieres.map(m => m.nom).sort()];
  }, [initialEvaluations, matieres]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(initialEvaluations.map(e => e.type));
    return ['', 'Tous les types', ...Array.from(types).sort()];
  }, [initialEvaluations]);


  // --- Data Filtering for Timetable Display ---
  const filteredEvaluationsForTimetable = useMemo(() => {
    if (!selectedNiveau || selectedNiveau === 'Sélectionner un niveau') {
      return []; // No evaluations to show if no level is selected
    }

    let currentEvaluations = evaluations.filter(e => e.niveau === selectedNiveau);

    if (filterMatiere && filterMatiere !== 'Toutes les matières') {
        const matiereId = matieres.find(m => m.nom === filterMatiere)?.id;
        currentEvaluations = currentEvaluations.filter(e => e.matiereId === matiereId);
    }
    if (filterType && filterType !== 'Tous les types') {
        currentEvaluations = currentEvaluations.filter(e => e.type === filterType);
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentEvaluations = currentEvaluations.filter(e =>
        e.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        getMatiereName(e.matiereId).toLowerCase().includes(lowerCaseSearchTerm) ||
        e.type.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    return currentEvaluations;
  }, [evaluations, selectedNiveau, filterMatiere, filterType, searchTerm, matieres]);

  // Track occupied slots to correctly render rowSpan cells
  const occupiedSlots = useMemo(() => {
    const slots = new Set(); // Stores "jourIndex-heureIndex" for occupied cells
    filteredEvaluationsForTimetable.forEach(evalItem => {
      const evalDayName = new Date(evalItem.date).toLocaleDateString('fr-FR', { weekday: 'long' });
      const jourIndex = joursSemaine.indexOf(evalDayName);
      if (jourIndex !== -1) {
        const startIndex = getHeureDebutIndex(evalItem.heureDebut);
        const numSlots = getNumberOfSlots(evalItem.dureeHeures);
        for (let i = 0; i < numSlots; i++) {
          slots.add(`${jourIndex}-${startIndex + i}`);
        }
      }
    });
    return slots;
  }, [filteredEvaluationsForTimetable, joursSemaine, getHeureDebutIndex, getNumberOfSlots]);


  // --- Modals and Form Logic ---
  const openAddModal = () => {
    setEditingEvaluation(null);
    setFormData({
      id: null,
      matiereId: '',
      classeId: '',
      niveau: selectedNiveau || '', // Pre-fill level if already selected
      date: new Date().toISOString().split('T')[0],
      heureDebut: '08:00',
      heureFin: '09:00',
      dureeHeures: '1', // Default to 1 hour for initial planning, will calculate heureFin
      type: '',
      description: '',
      enseignantId: ''
    });
    setShowAddEditModal(true);
  };

  const openEditModal = (evaluation) => {
    setEditingEvaluation(evaluation);
    setFormData({
      id: evaluation.id,
      matiereId: evaluation.matiereId.toString(),
      classeId: evaluation.classeId.toString(),
      niveau: evaluation.niveau,
      date: evaluation.date,
      heureDebut: evaluation.heureDebut,
      heureFin: evaluation.heureFin, // Preserve existing heureFin for edit
      dureeHeures: evaluation.dureeHeures.toString(), // Convert to string for select input
      type: evaluation.type,
      description: evaluation.description,
      enseignantId: evaluation.enseignantId.toString()
    });
    setShowAddEditModal(true);
  };

  const openDetailsModal = (evaluation) => {
    setSelectedEvaluationDetails(evaluation);
    setShowDetailsModal(true);
  };

  const closeAddEditModal = () => {
    setShowAddEditModal(false);
    setEditingEvaluation(null);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEvaluationDetails(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === 'classeId') {
      const selectedClassObj = classes.find(c => String(c.id) === value);
      newFormData.niveau = selectedClassObj ? selectedClassObj.niveau : '';
    }
    
    // Automatically calculate heureFin based on heureDebut and dureeHeures
    if (name === 'heureDebut' || name === 'dureeHeures') {
        const debut = newFormData.heureDebut;
        const duree = parseInt(newFormData.dureeHeures);
        if (debut && !isNaN(duree) && duree > 0) {
            const [h, m] = debut.split(':').map(Number);
            const endDate = new Date();
            endDate.setHours(h + duree, m, 0, 0); // Add duration to start time
            newFormData.heureFin = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
        }
    }
    setFormData(newFormData);
  };

  const handleAddEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.matiereId || !formData.classeId || !formData.date || !formData.heureDebut || !formData.heureFin || !formData.dureeHeures || !formData.type || !formData.enseignantId) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }

    const evaluationData = {
      ...formData,
      matiereId: parseInt(formData.matiereId),
      classeId: parseInt(formData.classeId),
      enseignantId: parseInt(formData.enseignantId),
      dureeHeures: parseInt(formData.dureeHeures),
      niveau: classes.find(c => c.id === parseInt(formData.classeId))?.niveau || '' // Ensure niveau is correctly set
    };

    if (editingEvaluation) {
      setEvaluations(evals => evals.map(e =>
        e.id === editingEvaluation.id ? { ...evaluationData, id: e.id } : e
      ));
      console.log("Évaluation modifiée:", { ...evaluationData, id: editingEvaluation.id });
    } else {
      const newEvaluation = {
        ...evaluationData,
        id: getNextId(),
      };
      setEvaluations(evals => [...evals, newEvaluation]);
      console.log("Nouvelle évaluation ajoutée:", newEvaluation);
    }
    closeAddEditModal();
  };

  const handleDeleteEvaluation = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette évaluation ?")) {
      setEvaluations(evals => evals.filter(e => e.id !== id));
      console.log("Évaluation supprimée:", id);
    }
  };


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Planification des Évaluations</h1>
        <p className="text-gray-600">Visualisez et gérez le planning des compositions et devoirs par niveau.</p>
      </div>

      {/* Main Level Selector */}
      <Card className="p-6 shadow-sm">
        <label htmlFor="select-niveau" className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner un Niveau pour afficher le planning : <span className="text-red-500">*</span>
        </label>
        <select
          id="select-niveau"
          value={selectedNiveau}
          onChange={(e) => setSelectedNiveau(e.target.value)}
          className="block w-full md:w-1/2 lg:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
        >
          {uniqueNiveaux.map(niveau => (
            <option key={niveau} value={niveau}>{niveau}</option>
          ))}
        </select>
        {!selectedNiveau && <p className="text-red-500 text-xs mt-2">Veuillez sélectionner un niveau pour voir l'emploi du temps des évaluations.</p>}
      </Card>

      {/* Conditional Display of Timetable and Filters */}
      {selectedNiveau && selectedNiveau !== 'Sélectionner un niveau' && (
        <>
          {/* Filters and Add Button */}
          <Card className="p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Filtres et Actions</h2>
              <Button onClick={openAddModal} icon={Plus}>
                Planifier une Évaluation
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <InputField
                  placeholder="Rechercher par matière, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filter by Matiere */}
              <select
                value={filterMatiere}
                onChange={(e) => setFilterMatiere(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              >
                {uniqueMatieres.map(matiereName => (
                  <option key={matiereName} value={matiereName}>{matiereName}</option>
                ))}
              </select>

              {/* Filter by Type */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              >
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </Card>

          {/* Evaluations Timetable */}
          <Card className="p-0 overflow-x-auto shadow-sm">
            <div className="p-6 mb-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                Emploi du temps des Évaluations - Niveau {selectedNiveau}
              </h2>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-28">Horaires</th>
                  {joursSemaine.map((jour, index) => (
                    <th key={index} className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      {jour}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plagesHoraires.map((heure, heureIndex) => {
                  return (
                    <tr key={heureIndex}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 border-r border-gray-200">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-500" />
                          {heure}
                        </div>
                      </td>
                      {joursSemaine.map((jour, jourIndex) => {
                        // Check if this slot is already "occupied" by a multi-hour evaluation starting earlier
                        const isOccupied = occupiedSlots.has(`${jourIndex}-${heureIndex}`);
                        if (isOccupied) return null; // Don't render if it's part of a merged cell

                        const evaluationsInSlot = filteredEvaluationsForTimetable.filter(evalItem => {
                          const evalDayName = new Date(evalItem.date).toLocaleDateString('fr-FR', { weekday: 'long' });
                          return evalDayName === jour && getHeureDebutIndex(evalItem.heureDebut) === heureIndex;
                        });

                        const firstEval = evaluationsInSlot[0]; // Take the first evaluation if multiple start at same time

                        return (
                          <td
                            key={`${jour}-${heureIndex}`}
                            rowSpan={firstEval ? getNumberOfSlots(firstEval.dureeHeures) : 1} // Merge cells based on duration
                            className={`p-1 border border-gray-200 h-28 align-top ${firstEval ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors' : ''}`}
                            onClick={firstEval ? () => openDetailsModal(firstEval) : undefined}
                          >
                            {firstEval ? (
                              <div
                                className="h-full rounded-lg p-1.5 text-xs flex flex-col justify-between items-center text-center text-blue-800 font-medium leading-tight"
                                title={`${firstEval.type} - ${getMatiereName(firstEval.matiereId)} (${getClassName(firstEval.classeId)}) par ${getEnseignantName(firstEval.enseignantId)}`}
                              >
                                <p className="font-semibold text-blue-900">{getMatiereName(firstEval.matiereId)}</p>
                                <p className="text-xs text-blue-700">{firstEval.type}</p>
                                <p className="text-xs text-blue-700">{getClassName(firstEval.classeId)}</p>
                                <p className="text-xs flex items-center gap-1 text-blue-600"><GraduationCap className='w-3 h-3'/> {getEnseignantName(firstEval.enseignantId)}</p>
                                <p className="text-xs flex items-center gap-1 text-blue-600"><Clock className='w-3 h-3'/> {firstEval.heureDebut} - {firstEval.heureFin}</p>
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
                  );
                })}
              </tbody>
            </table>
            {filteredEvaluationsForTimetable.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    Aucune évaluation trouvée pour le niveau sélectionné avec les filtres actuels.
                </div>
            )}
          </Card>
        </>
      )} {/* End Conditional Display */}


      {/* Add/Edit Evaluation Modal */}
      <Modal
        isOpen={showAddEditModal}
        onClose={closeAddEditModal}
        title={editingEvaluation ? "Modifier l'évaluation" : "Planifier une nouvelle évaluation"}
        size="md"
      >
        <form onSubmit={handleAddEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleFormChange}
              required
            />
            <InputField
              label="Heure de début"
              name="heureDebut"
              type="time"
              value={formData.heureDebut}
              onChange={handleFormChange}
              required
            />
            <InputField
              label="Durée (heures)"
              name="dureeHeures"
              type="select"
              value={formData.dureeHeures}
              onChange={handleFormChange}
              options={[
                { value: '', label: 'Sélectionner durée' },
                { value: '1', label: '1 heure' }, // Added 1 hour option
                { value: '2', label: '2 heures' },
                { value: '3', label: '3 heures' },
                { value: '4', label: '4 heures' },
              ]}
              required
            />
            <InputField
              label="Heure de fin (automatique)"
              name="heureFin"
              type="time"
              value={formData.heureFin}
              disabled // This field is now auto-calculated
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <InputField
            label="Type d'évaluation"
            name="type"
            value={formData.type}
            onChange={handleFormChange}
            placeholder="Ex: Composition, Devoir Surveillé"
            required
          />
          <InputField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="Détails sur l'évaluation"
            type="textarea"
            rows="2"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="matiereId" className="block text-sm font-medium text-gray-700 mb-1">Matière <span className="text-red-500">*</span></label>
              <select
                id="matiereId"
                name="matiereId"
                value={formData.matiereId}
                onChange={handleFormChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                required
              >
                <option value="">Sélectionner une matière</option>
                {matieres.map(matiere => (
                  <option key={matiere.id} value={matiere.id}>{matiere.nom}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label htmlFor="classeId" className="block text-sm font-medium text-gray-700 mb-1">Classe <span className="text-red-500">*</span></label>
              <select
                id="classeId"
                name="classeId"
                value={formData.classeId}
                onChange={handleFormChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                required
              >
                <option value="">Sélectionner une classe</option>
                {classes.map(classe => (
                  <option key={classe.id} value={classe.id}>{classe.nom}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label htmlFor="enseignantId" className="block text-sm font-medium text-gray-700 mb-1">Enseignant <span className="text-red-500">*</span></label>
              <select
                id="enseignantId"
                name="enseignantId"
                value={formData.enseignantId}
                onChange={handleFormChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                required
              >
                <option value="">Sélectionner un enseignant</option>
                {enseignants.map(enseignant => (
                  <option key={enseignant.id} value={enseignant.id}>{enseignant.prenom} {enseignant.nom}</option>
                ))}
              </select>
            </div>
             {/* Read-only Niveau field, derived from classeId */}
             <InputField
              label="Niveau (Automatique)"
              name="niveau"
              value={formData.niveau}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={closeAddEditModal}>
              Annuler
            </Button>
            <Button type="submit">
              {editingEvaluation ? 'Modifier' : 'Planifier'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details Evaluation Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        title="Détails de l'évaluation"
        size="md"
      >
        {selectedEvaluationDetails && (
          <div className="space-y-4 p-2 text-gray-700">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-bold text-lg text-blue-800 mb-2">{selectedEvaluationDetails.type} - {getMatiereName(selectedEvaluationDetails.matiereId)}</h3>
                <p><span className="font-medium">Date:</span> {new Date(selectedEvaluationDetails.date).toLocaleDateString('fr-FR')}</p>
                <p><span className="font-medium">Heure:</span> {selectedEvaluationDetails.heureDebut} - {selectedEvaluationDetails.heureFin} ({selectedEvaluationDetails.dureeHeures}h)</p>
            </div>
            <p><span className="font-medium">Classe:</span> {getClassName(selectedEvaluationDetails.classeId)} ({selectedEvaluationDetails.niveau})</p>
            <p><span className="font-medium">Enseignant:</span> {getEnseignantName(selectedEvaluationDetails.enseignantId)}</p>
            {selectedEvaluationDetails.description && (
                <p><span className="font-medium">Description:</span> {selectedEvaluationDetails.description}</p>
            )}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={closeDetailsModal}>Fermer</Button>
              <Button variant="info" onClick={() => { closeDetailsModal(); openEditModal(selectedEvaluationDetails); }}>Modifier</Button>
              <Button variant="danger" onClick={() => { closeDetailsModal(); handleDeleteEvaluation(selectedEvaluationDetails.id); }}>Supprimer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GestionEvaluations;
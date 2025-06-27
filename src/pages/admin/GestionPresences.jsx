import { AlertCircle, Calendar, CheckCircle, Clock, Edit, Users, UserX, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react'; // Import React for Slider, useState, useMemo
import Slider from 'react-slick'; // Import Slider
import 'slick-carousel/slick/slick-theme.css'; // Import slick themes
import 'slick-carousel/slick/slick.css'; // Import slick styles
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

import { presences as allPresencesData, classes, eleves, enseignants } from '../../data/donneesTemporaires';

const GestionPresencesAdmin = () => {
  const [presences, setPresences] = useState(allPresencesData); // All raw presence data
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(''); // Filter for 'absent', 'retard', 'renvoye'

  // State for the main justification modal (for a single presence record)
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [selectedPresenceToJustify, setSelectedPresenceToJustify] = useState(null);

  // State for the new student-specific details modal
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState(null); // The full student object

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
      case 'present': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':  return <XCircle className="w-5 h-5 text-red-600" />;
      case 'retard':  return <Clock className="w-5 h-5 text-orange-600" />;
      case 'renvoye': return <UserX className="w-5 h-5 text-purple-600" />;
      case 'non_marque': return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'present':    return 'Présent';
      case 'absent':     return 'Absent';
      case 'retard':     return 'En retard';
      case 'renvoye':    return 'Renvoyé';
      case 'non_marque': return 'Non marqué';
      default:           return 'Inconnu';
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'present':    return 'bg-green-100 text-green-800';
      case 'absent':     return 'bg-red-100 text-red-800';
      case 'retard':     return 'bg-orange-100 text-orange-800';
      case 'renvoye':    return 'bg-purple-100 text-purple-800';
      case 'non_marque': return 'bg-gray-100 text-gray-800';
      default:           return 'bg-gray-100 text-gray-800';
    }
  };

  // --- Core Data Filtering Logic (excluding 'present' statuses) ---
  const problematicPresences = useMemo(() => {
    return presences.filter(p => p.statut !== 'present'); // Exclude 'present' records
  }, [presences]);

  // --- Aggregated Table Data (by student, counting problematic presences) ---
  const aggregatedTableData = useMemo(() => {
    const studentDataMap = new Map(); // Map to store aggregated counts for each student

    // Apply main filters to problematicPresences
    let currentFiltered = problematicPresences;

    if (selectedClass !== '') {
      currentFiltered = currentFiltered.filter(p => String(p.classeId) === String(selectedClass));
    }
    if (selectedDate !== '') {
      currentFiltered = currentFiltered.filter(p => p.date === selectedDate);
    }
    if (selectedStatus !== '') { // Filter for specific problematic status
      currentFiltered = currentFiltered.filter(p => p.statut === selectedStatus);
    }

    // Aggregate counts for each student
    currentFiltered.forEach(p => {
      if (!studentDataMap.has(p.eleveId)) {
        studentDataMap.set(p.eleveId, {
          eleveId: p.eleveId,
          classeId: p.classeId, // Store one classId for display
          absences: 0,
          retards: 0,
          renvoyes: 0,
          justifies: 0,
          totalProblematic: 0,
          problematicRecords: [] // Store records for details modal
        });
      }
      const studentStats = studentDataMap.get(p.eleveId);
      studentStats.totalProblematic++;
      studentStats.problematicRecords.push(p);

      if (p.statut === 'absent') studentStats.absences++;
      if (p.statut === 'retard') studentStats.retards++;
      if (p.statut === 'renvoye') studentStats.renvoyes++;
      if (p.justifie) studentStats.justifies++;
    });

    // Convert map to array and sort by total problematic count descending
    return Array.from(studentDataMap.values()).sort((a, b) => b.totalProblematic - a.totalProblematic);
  }, [problematicPresences, selectedClass, selectedDate, selectedStatus]);


  // --- Statistics Cards Data (reflecting only problematic presences) ---
  const stats = useMemo(() => {
    const allProblematic = problematicPresences; // All non-present records
    const filteredProblematic = aggregatedTableData.flatMap(data => data.problematicRecords); // All problematic records matching current filters

    const totalProblematicEntries = filteredProblematic.length;
    const totalAbsents = filteredProblematic.filter(p => p.statut === 'absent').length;
    const totalRetards = filteredProblematic.filter(p => p.statut === 'retard').length;
    const totalRenvoyes = filteredProblematic.filter(p => p.statut === 'renvoye').length;
    const totalJustified = filteredProblematic.filter(p => p.justifie).length;
    const totalNonJustified = totalProblematicEntries - totalJustified;

    // Total unique students affected by problematic presences in current view
    const uniqueStudentsAffected = new Set(filteredProblematic.map(p => p.eleveId)).size;
    // Total students across all classes (if no class filter), or in selected class
    const totalStudentsInContext = selectedClass ? eleves.filter(e => String(e.classeId) === String(selectedClass)).length : eleves.length;


    return {
      totalProblematicEntries,
      totalAbsents,
      totalRetards,
      totalRenvoyes,
      totalJustified,
      totalNonJustified,
      uniqueStudentsAffected,
      totalStudentsInContext
    };
  }, [problematicPresences, aggregatedTableData, selectedClass]);


  // --- Stat Cards Data for Slider ---
  const statItems = useMemo(() => [
    {
      icon: Users, value: stats.uniqueStudentsAffected, label: 'Élèves concernés',
      color: 'text-blue-800', bg: 'bg-blue-50', borderColor: 'border-blue-100'
    },
    {
      icon: XCircle, value: stats.totalAbsents, label: 'Absences (Total)',
      color: 'text-red-800', bg: 'bg-red-50', borderColor: 'border-red-100'
    },
    {
      icon: Clock, value: stats.totalRetards, label: 'Retards (Total)',
      color: 'text-orange-800', bg: 'bg-orange-50', borderColor: 'border-orange-100'
    },
    {
      icon: UserX, value: stats.totalRenvoyes, label: 'Renvoyés (Total)',
      color: 'text-purple-800', bg: 'bg-purple-50', borderColor: 'border-purple-100'
    },
    {
      icon: CheckCircle, value: stats.totalJustified, label: 'Justifiés',
      color: 'text-teal-800', bg: 'bg-teal-50', borderColor: 'border-teal-100'
    },
    {
      icon: AlertCircle, value: stats.totalNonJustified, label: 'Non justifiés',
      color: 'text-rose-800', bg: 'bg-rose-50', borderColor: 'border-rose-100'
    },
    {
      icon: Users, value: stats.totalStudentsInContext, label: 'Total Élèves (Classe)',
      color: 'text-indigo-800', bg: 'bg-indigo-50', borderColor: 'border-indigo-100'
    },
  ], [stats]);

  // --- Slider Settings for Stat Cards ---
  const sliderSettings = {
    dots: true,
    infinite: true, // Don't loop if few items
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 4, // Show 4 cards by default
    slidesToScroll: 1,
    arrows: false, // Hidden for cleaner look, dots handle navigation
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } }, // lg
      { breakpoint: 1024, settings: { slidesToShow: 2 } }, // md
      { breakpoint: 768, settings: { slidesToShow: 1 } }, // sm
    ]
  };


  // --- Modals Logic ---
  const openJustificationModal = (presence) => {
    if (presence.statut === 'present' || presence.statut === 'non_marque') {
      alert("Ce statut ne nécessite pas de justification ou n'est pas un enregistrement à gérer.");
      return;
    }
    setSelectedPresenceToJustify(presence);
    setFormData({
      justifie: presence.justifie || false,
      motifJustification: presence.motifJustification || '',
      commentaire: presence.commentaire || ''
    });
    setShowJustificationModal(true);
  };

  const handleSubmitJustification = (e) => {
    e.preventDefault();

    const updatedPresence = {
      ...selectedPresenceToJustify,
      justifie: formData.justifie,
      motifJustification: formData.motifJustification,
      commentaire: formData.commentaire,
      dateModification: new Date().toISOString()
    };

    setPresences(prevPresences => {
      const existingIndex = prevPresences.findIndex(p => String(p.id) === String(selectedPresenceToJustify.id));
      if (existingIndex > -1) {
        return prevPresences.map((p, index) =>
          index === existingIndex ? updatedPresence : p
        );
      }
      return prevPresences;
    });

    console.log('Justification mise à jour:', updatedPresence);
    setShowJustificationModal(false);
    setSelectedPresenceToJustify(null);
    // Important: Update records in the student details modal if it's open
    if (selectedStudentForDetails) {
        setSelectedStudentForDetails(prev => ({
            ...prev,
            problematicRecords: prev.problematicRecords.map(rec => rec.id === updatedPresence.id ? updatedPresence : rec)
        }));
    }
  };

  const resetJustificationForm = () => {
    setFormData({
      justifie: false,
      motifJustification: '',
      commentaire: ''
    });
    setSelectedPresenceToJustify(null);
    setShowJustificationModal(false);
  };

  const openStudentDetailsModal = (studentAggregatedData) => {
    setSelectedStudentForDetails(studentAggregatedData);
    setShowStudentDetailsModal(true);
  };

  const closeStudentDetailsModal = () => {
    setShowStudentDetailsModal(false);
    setSelectedStudentForDetails(null);
  };


  // --- Table Columns Definition for Aggregated View ---
  const aggregatedColumns = [
    {
      header: 'Élève',
      accessor: 'eleveId',
      render: (data) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {getEleveName(data.eleveId).split(' ').map(n => n.charAt(0)).join('')}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{getEleveName(data.eleveId)}</h3>
            <p className="text-sm text-gray-600">{getClassName(data.classeId)}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Absences',
      accessor: 'absences',
      render: (data) => <span className="font-medium text-red-700">{data.absences}</span>
    },
    {
      header: 'Retards',
      accessor: 'retards',
      render: (data) => <span className="font-medium text-orange-700">{data.retards}</span>
    },
    {
      header: 'Renvoyés',
      accessor: 'renvoyes',
      render: (data) => <span className="font-medium text-purple-700">{data.renvoyes}</span>
    },
    {
      header: 'Total Incidents', // Renamed for clarity
      accessor: 'totalProblematic',
      render: (data) => <span className="text-lg font-bold text-gray-900">{data.totalProblematic}</span>
    },
    {
      header: 'Justifiées',
      accessor: 'justifies',
      render: (data) => <span className="font-medium text-teal-700">{data.justifies}</span>
    },
    {
      header: 'Non justifiées',
      accessor: 'nonJustifies',
      render: (data) => <span className="font-medium text-rose-700">{data.totalProblematic - data.justifies}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (data) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openStudentDetailsModal(data)}
          icon={Edit}
        >
          Voir détails
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Absences & Retards</h1>
        <p className="text-gray-600">Suivi et administration des incidents d'assiduité des élèves</p>
      </div>

      {/* Filters Card */}
      <Card className="p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Date (Optionnel)
            </label>
            <input
              id="select-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>

          {/* Status Filter for problematic types */}
          <div>
            <label htmlFor="select-status" className="block text-sm font-medium text-gray-700 mb-1">
              Statut spécifique
            </label>
            <select
              id="select-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Tous les incidents</option>
              <option value="absent">Absent</option>
              <option value="retard">En retard</option>
              <option value="renvoye">Renvoyé</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Statistics Cards (for problematic presences) - NOW IN SLIDER */}
      <div className="relative -mx-3 mb-8"> {/* Added negative margin and mb for spacing */}
        <Slider {...sliderSettings}>
          {statItems.map((stat, idx) => (
            <div key={idx} className="px-3"> {/* Inner padding for slide spacing */}
              <Card className={`p-4 text-center shadow-sm ${stat.borderColor} ${stat.bg}`}>
                <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: stat.color.replace('text-', '').replace('-800', '-100')}}> {/* Dynamic background for icon container */}
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm">{stat.label}</p>
              </Card>
            </div>
          ))}
        </Slider>
      </div>


      {/* Aggregated Presence List (Table) */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Synthèse des Incidents d'Assiduité
        </h2>

        {aggregatedTableData.length > 0 ? (
          <Table
            columns={aggregatedColumns}
            data={aggregatedTableData}
            noDataMessage="Aucun incident d'assiduité trouvé pour les filtres sélectionnés."
          />
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun incident d'assiduité à afficher. Essayez de changer les filtres.</p>
          </div>
        )}
      </Card>

      {/* Modal de Détails/Historique de l'élève spécifique */}
      <Modal
        isOpen={showStudentDetailsModal}
        onClose={closeStudentDetailsModal}
        title={`Historique des incidents pour ${selectedStudentForDetails ? getEleveName(selectedStudentForDetails.eleveId) : ''}`}
        size="md"
      >
        {selectedStudentForDetails && selectedStudentForDetails.problematicRecords.length > 0 ? (
          <div className="space-y-4">
            {selectedStudentForDetails.problematicRecords.sort((a,b) => new Date(b.date) - new Date(a.date)).map(presence => (
              <div key={presence.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(presence.statut)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {getStatusLabel(presence.statut)} le {new Date(presence.date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-600">
                      {presence.heureDebut} - {presence.heureFin} {presence.heureArrivee && `(Arrivée: ${presence.heureArrivee})`}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openJustificationModal(presence)}
                  icon={Edit}
                >
                  Gérer
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 p-4">Aucun incident enregistré pour cet élève avec les filtres actuels.</p>
        )}
      </Modal>

      {/* Modal de gestion des justifications (existing modal, reused) */}
      <Modal
        isOpen={showJustificationModal}
        onClose={resetJustificationForm}
        title={`Gérer la présence de ${selectedPresenceToJustify ? getEleveName(selectedPresenceToJustify.eleveId) : ''}`}
        size="md"
      >
        {selectedPresenceToJustify && (
          <form onSubmit={handleSubmitJustification} className="space-y-6 p-2">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-inner">
              <h3 className="font-semibold text-blue-800 mb-3">Informations sur la présence</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Statut actuel:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedPresenceToJustify.statut)}
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedPresenceToJustify.statut)}`}>
                      {getStatusLabel(selectedPresenceToJustify.statut)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Classe:</span>
                  <p className="font-medium text-gray-900">{getClassName(selectedPresenceToJustify.classeId)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <p className="font-medium text-gray-900">{new Date(selectedPresenceToJustify.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Enseignant ayant marqué:</span>
                  <p className="font-medium text-gray-900">{selectedPresenceToJustify.enseignantId ? getEnseignantName(selectedPresenceToJustify.enseignantId) : 'Non défini'}</p>
                </div>
              </div>
            </div>

            {/* Justification form fields, only for problematic statuses */}
            {selectedPresenceToJustify.statut !== 'present' && selectedPresenceToJustify.statut !== 'non_marque' && (
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
                  type="textarea"
                  rows="2"
                  disabled={!formData.justifie}
                />

                <InputField
                  label="Commentaire administratif"
                  value={formData.commentaire}
                  onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
                  placeholder="Commentaire interne..."
                  type="textarea"
                  rows="3"
                />
              </div>
            )}
            {/* Messages for non-manageable statuses */}
            {selectedPresenceToJustify.statut === 'non_marque' && (
              <div className="text-center py-4 text-gray-600">
                Cette entrée n'est pas une présence enregistrée. Vous devez d'abord marquer la présence de l'élève.
              </div>
            )}
            {selectedPresenceToJustify.statut === 'present' && (
              <div className="text-center py-4 text-gray-600">
                Un élève présent n'a pas besoin de justification.
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={resetJustificationForm}>
                Annuler
              </Button>
              <Button type="submit" disabled={selectedPresenceToJustify.statut === 'present' || selectedPresenceToJustify.statut === 'non_marque'}>
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
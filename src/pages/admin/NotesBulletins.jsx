import { Award, BarChart3, BookOpen, Calendar, Edit, Eye, FileText, Layers, Plus, Printer, Search, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { classes, eleves, enseignants, matieres, notes, presences } from '../../data/donneesTemporaires';

// Helper component for detail rows in modals
const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
    {Icon && <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />}
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);


const NotesBulletins = () => {
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedClasseId, setSelectedClasseId] = useState('');

  // States for Note Management
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteDetailModal, setShowNoteDetailModal] = useState(false);
  const [noteFormData, setNoteFormData] = useState({
    eleveId: '',
    matiereId: '',
    note: '',
    coefficient: '',
    date: '',
    type: '',
    commentaire: ''
  });

  // States for Bulletin Management
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [selectedBulletinEleve, setSelectedBulletinEleve] = useState(null);

  // Filter states for Notes tab
  const [noteSearchTerm, setNoteSearchTerm] = useState('');
  const [noteFilterMatiere, setNoteFilterMatiere] = useState('');
  const [noteFilterType, setNoteFilterType] = useState('');

  const tabs = [
    { id: 'notes', label: 'Gestion des notes', icon: FileText },
    { id: 'bulletins', label: 'Bulletins', icon: Award },
    { id: 'statistiques', label: 'Statistiques', icon: BarChart3 }
  ];

  // --- Helper Functions (adapted for selectedClasseId) ---

  const getEleveName = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getMatiereName = (matiereId) => {
    const matiere = matieres.find(m => m.id === matiereId);
    return matiere ? matiere.nom : 'Matière inconnue';
  };

  const getClassName = (eleveOrClasseId) => {
    let classe = null;
    if (typeof eleveOrClasseId === 'number') { // It's an eleveId
      const eleve = eleves.find(e => e.id === eleveOrClasseId);
      if (!eleve) return 'Classe inconnue';
      classe = classes.find(c => c.id === eleve.classeId);
    } else { // It's a classeId
      classe = classes.find(c => c.id === eleveOrClasseId);
    }
    return classe ? classe.nom : 'Classe inconnue';
  };

  const getEnseignantName = (enseignantId) => {
    const enseignant = enseignants.find(e => e.id === enseignantId);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Enseignant inconnu';
  };

  // Filter notes by selected class, then by search/filters
  const filteredNotesByClass = notes.filter(note => {
    const eleveInClass = eleves.find(e => e.id === note.eleveId && String(e.classeId) === String(selectedClasseId));
    return eleveInClass;
  });

  const filteredNotes = filteredNotesByClass.filter(note => {
    const eleveName = getEleveName(note.eleveId).toLowerCase();
    const matiereName = getMatiereName(note.matiereId).toLowerCase();

    const matchesSearch = noteSearchTerm === '' || eleveName.includes(noteSearchTerm.toLowerCase());
    const matchesMatiere = noteFilterMatiere === '' || String(note.matiereId) === noteFilterMatiere;
    const matchesType = noteFilterType === '' || note.type.toLowerCase() === noteFilterType.toLowerCase();

    return matchesSearch && matchesMatiere && matchesType;
  });


  const calculateMoyenne = (eleveId, matiereId) => {
    const notesEleve = notes.filter(n => String(n.eleveId) === String(eleveId) && String(n.matiereId) === String(matiereId));
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
      const coeff = matiere ? matiere.coefficient : note.coefficient;
      totalPoints += (note.note * coeff);
      totalCoeff += coeff;
    });

    if (totalCoeff === 0) return null;

    return (totalPoints / totalCoeff).toFixed(2);
  };

  const getClasseMoyenneMatiere = (classeId, matiereId) => {
    const elevesInClass = eleves.filter(e => String(e.classeId) === String(classeId));
    const notesForMatiereInClass = notes.filter(n =>
      String(n.matiereId) === String(matiereId) &&
      elevesInClass.some(e => String(e.id) === String(n.eleveId))
    );

    if (notesForMatiereInClass.length === 0) return null;

    const totalNotesSum = notesForMatiereInClass.reduce((sum, note) => sum + note.note, 0);
    return (totalNotesSum / notesForMatiereInClass.length).toFixed(2);
  };

  const getPresenceCounts = (eleveId, classeId) => {
    const elevePresences = presences.filter(p =>
      String(p.eleveId) === String(eleveId) &&
      String(p.classeId) === String(classeId)
    );

    const absences = elevePresences.filter(p => p.statut === 'absent').length;
    const retards = elevePresences.filter(p => p.statut === 'retard').length;

    return { absences, retards };
  };


  // --- Note Modal Logic ---
  const openNoteModal = (type, note = null) => {
    setTypeModal(type);
    setEditingNote(note);
    if (note) {
      setNoteFormData({
        eleveId: String(note.eleveId),
        matiereId: String(note.matiereId),
        note: String(note.note),
        coefficient: String(note.coefficient),
        date: note.date,
        type: note.type,
        commentaire: note.commentaire || ''
      });
    } else {
      setNoteFormData({
        eleveId: '',
        matiereId: '',
        note: '',
        coefficient: '',
        date: '',
        type: '',
        commentaire: ''
      });
    }
    setShowNoteModal(true);
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setEditingNote(null);
    setSelectedNote(null);
    setShowNoteDetailModal(false);
    setNoteFormData({
      eleveId: '', matiereId: '', note: '', coefficient: '', date: '', type: '', commentaire: ''
    });
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    const newNoteData = {
      ...noteFormData,
      eleveId: parseInt(noteFormData.eleveId),
      matiereId: parseInt(noteFormData.matiereId),
      note: parseFloat(noteFormData.note),
      coefficient: parseInt(noteFormData.coefficient)
    };

    if (editingNote) {
      console.log('Updating note:', { ...newNoteData, id: editingNote.id });
    } else {
      const newId = Math.max(...notes.map(n => n.id)) + 1;
      console.log('Adding new note:', { ...newNoteData, id: newId });
    }
    closeNoteModal();
  };

  const handleNoteDelete = (noteId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
      console.log("Deleting note with ID:", noteId);
      closeNoteModal();
    }
  };

  const handleViewNoteDetails = (note) => {
    setSelectedNote(note);
    setShowNoteDetailModal(true);
  };


  // --- Bulletin Modal Logic ---
  const openBulletinModal = (eleve) => {
    setSelectedBulletinEleve(eleve);
    setShowBulletinModal(true);
  };

  const closeBulletinModal = () => {
    setShowBulletinModal(false);
    setSelectedBulletinEleve(null);
  };

  // --- Print Bulletin Logic ---
  const handlePrintBulletin = () => {
    const printContent = document.getElementById('bulletin-print-area');
    if (printContent) {
        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write('<html><head><title>Bulletin Scolaire</title>');
        // Link to your main CSS file or embed necessary styles for consistent look
        // IMPORTANT: Replace with the actual path to your Tailwind CSS file if needed for print styles
        printWindow.document.write('<link rel="stylesheet" href="/path/to/your/tailwind.css">'); 
        printWindow.document.write('<style>');
        printWindow.document.write(`
          /* Basic print styles */
          body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
          #bulletin-print-area { width: 100%; margin: auto; padding: 20px; box-sizing: border-box; }
          /* Ensure colors and backgrounds print */
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            /* Hide elements not part of the bulletin on print (e.g., action buttons) */
            .no-print { display: none !important; }
            /* Force page breaks if needed for multi-page bulletins */
            .page-break-after { page-break-after: always; }

            /* Specific styling for bulletin elements for print */
            .text-3xl { font-size: 2rem !important; }
            .text-2xl { font-size: 1.5rem !important; }
            .text-xl { font-size: 1.25rem !important; }
            .text-lg { font-size: 1.125rem !important; }
            .text-md { font-size: 1rem !important; }
            .text-sm { font-size: 0.875rem !important; }
            .text-xs { font-size: 0.75rem !important; }
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .text-blue-800 { color: #1e40af !important; }
            .text-gray-900 { color: #111827 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .text-gray-500 { color: #6b7280 !important; }
            .text-gray-700 { color: #374151 !important; }
            .bg-blue-50 { background-color: #eff6ff !important; }
            .border-blue-100 { border-color: #dbeafe !important; }
            .text-blue-700 { color: #1d4ed8 !important; }
            .bg-yellow-50 { background-color: #fffbeb !important; }
            .border-yellow-100 { border-color: #fef3c7 !important; }
            .text-yellow-800 { color: #92400e !important; }
            .text-red-600 { color: #dc2626 !important; }
            .text-green-600 { color: #16a34a !important; }
            .text-orange-600 { color: #ea580c !important; }
            table, th, td { border-color: #e5e7eb !important; } /* Ensure table borders print */
          }
        `);
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<div style="max-width: 800px; margin: auto;">'); // Centralize content on print
        printWindow.document.write(printContent.outerHTML); // Write only the bulletin content
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.focus(); // Focus on the new window
        printWindow.print(); // Open print dialog
        // No need to close printWindow immediately, browser handles it after print dialog
    } else {
        alert("Contenu du bulletin introuvable pour l'impression.");
    }
  };


  // Filter students based on selected class
  const studentsInSelectedClass = eleves.filter(eleve => String(eleve.classeId) === String(selectedClasseId));

  // --- Render Functions ---

  const renderNotes = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Gestion des notes</h2>
        <Button onClick={() => openNoteModal('ajouter')} icon={Plus}>
          Ajouter une note
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <InputField
              placeholder="Rechercher par nom d'élève..."
              value={noteSearchTerm}
              onChange={(e) => setNoteSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={noteFilterMatiere}
              onChange={(e) => setNoteFilterMatiere(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Toutes les matières</option>
              {matieres.map(matiere => (
                <option key={matiere.id} value={matiere.id.toString()}>
                  {matiere.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={noteFilterType}
              onChange={(e) => setNoteFilterType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Tous les types</option>
              {/* Assuming note types are static for now */}
              {Array.from(new Set(notes.map(n => n.type))).map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table
          columns={[
            ...notesColumns,
            {
              header: 'Actions',
              accessor: 'actions',
              render: (note) => (
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" icon={Eye} onClick={() => handleViewNoteDetails(note)}>Détails</Button>
                  <Button size="sm" variant="outline" icon={Edit} onClick={() => openNoteModal('modifier', note)}>Modifier</Button>
                  <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleNoteDelete(note.id)}>Supprimer</Button>
                </div>
              )
            }
          ]}
          data={filteredNotes}
        />
      </Card>
    </div>
  );

  const notesColumns = [
    {
      header: 'Élève',
      accessor: 'eleveId',
      render: (note) => getEleveName(note.eleveId)
    },
    {
      header: 'Matière',
      accessor: 'matiereId',
      render: (note) => getMatiereName(note.matiereId)
    },
    {
      header: 'Note',
      accessor: 'note',
      render: (note) => `${note.note}/20`
    },
    { header: 'Coefficient', accessor: 'coefficient' },
    { header: 'Type', accessor: 'type' },
    {
      header: 'Date',
      accessor: 'date',
      render: (note) => new Date(note.date).toLocaleDateString('fr-FR')
    },
    { header: 'Commentaire', accessor: 'commentaire' }
  ];

  const renderBulletins = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bulletins scolaires</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {studentsInSelectedClass.length > 0 ? (
          studentsInSelectedClass.map(eleve => (
            <Card key={eleve.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {eleve.prenom} {eleve.nom}
                  </h3>
                  <p className="text-sm text-gray-600">{getClassName(eleve.id)}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openBulletinModal(eleve)}>
                  Voir bulletin
                </Button>
              </div>

              <div className="space-y-3">
                {matieres.map(matiere => {
                  const moyenne = calculateMoyenne(eleve.id, matiere.id);
                  return (
                    <div key={matiere.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-700">{matiere.nom}</span>
                      <span className={`text-sm font-medium ${
                        moyenne ? (
                          parseFloat(moyenne) >= 10 ? 'text-green-600' : 'text-red-600'
                        ) : 'text-gray-400'
                      }`}>
                        {moyenne ? `${moyenne}/20` : 'Pas de note'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            Aucun élève dans cette classe ou classe non sélectionnée.
          </div>
        )}
      </div>
    </div>
  );

  const renderStatistiques = () => {
    const notesForSelectedClass = notes.filter(note => {
      const eleve = eleves.find(e => e.id === note.eleveId);
      return eleve && String(eleve.classeId) === String(selectedClasseId);
    });

    const moyennesParMatiere = matieres.map(matiere => {
      const notesMatiere = notesForSelectedClass.filter(n => String(n.matiereId) === String(matiere.id));
      if (notesMatiere.length === 0) return { matiere: matiere.nom, moyenne: 0 };

      const moyenne = notesMatiere.reduce((sum, note) => sum + note.note, 0) / notesMatiere.length;
      return { matiere: matiere.nom, moyenne: moyenne.toFixed(2) };
    });

    const totalNotesCount = notesForSelectedClass.length;
    const generalAverage = totalNotesCount > 0
      ? (notesForSelectedClass.reduce((sum, note) => sum + note.note, 0) / totalNotesCount).toFixed(2)
      : '0.00';
    const evaluatedStudentsCount = new Set(notesForSelectedClass.map(n => n.eleveId)).size;


    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Statistiques de la classe {getClassName(selectedClasseId)}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Total de notes</h3>
            <p className="text-3xl font-bold text-blue-600">{totalNotesCount}</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Moyenne générale de la classe</h3>
            <p className="text-3xl font-bold text-green-600">
              {generalAverage}/20
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Élèves évalués</h3>
            <p className="text-3xl font-bold text-orange-600">
              {evaluatedStudentsCount} / {studentsInSelectedClass.length}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Moyennes par matière</h3>
          <div className="space-y-3">
            {moyennesParMatiere.length > 0 ? (
              moyennesParMatiere.map((stat, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">{stat.matiere}</span>
                  <span className={`font-semibold ${
                    parseFloat(stat.moyenne) >= 10 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.moyenne}/20
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Aucune donnée de note pour cette classe.</p>
            )}
          </div>
        </Card>
      </div>
    );
  };


  // --- Bulletin Modal Content Component ---
  const BulletinModalContent = ({ eleve }) => {
    const eleveClasse = classes.find(c => String(c.id) === String(eleve.classeId));
    const moyenneGenerale = calculateMoyenneGeneraleEleve(eleve.id);
    const { absences, retards } = getPresenceCounts(eleve.id, eleve.classeId);

    return (
      <div id="bulletin-print-area" className="p-6 space-y-6 bg-white shadow-xl rounded-lg">
        {/* Header du Bulletin */}
        <div className="text-center pb-4 border-b border-gray-200 mb-4">
          <h2 className="text-3xl font-extrabold text-blue-800 mb-2">Bulletin Scolaire</h2>
          <p className="text-xl font-bold text-gray-900">{eleve.prenom} {eleve.nom}</p>
          <p className="text-md text-gray-600">Classe : {eleveClasse?.nom || 'N/A'}</p>
          <p className="text-sm text-gray-500">Année Scolaire : 2024-2025</p>
        </div>

        {/* Informations générales de l'élève */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
          <p><span className="font-semibold text-gray-700">Date de naissance :</span> {new Date(eleve.dateNaissance).toLocaleDateString('fr-FR')}</p>
          <p><span className="font-semibold text-gray-700">Email :</span> {eleve.email}</p>
          <p><span className="font-semibold text-gray-700">Téléphone :</span> {eleve.telephone}</p>
          <p><span className="font-semibold text-gray-700">Adresse :</span> {eleve.adresse}</p>
        </div>

        {/* Moyennes par Matière */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center border-b pb-2 mb-3">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            Résultats par matière
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase">Matière</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase">Professeur</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-blue-700 uppercase">Moy. Élève</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-blue-700 uppercase">Moy. Classe</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase">Appréciation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matieres.map(matiere => {
                  const moyenneEleve = calculateMoyenne(eleve.id, matiere.id);
                  const moyenneClasse = getClasseMoyenneMatiere(eleve.classeId, matiere.id);
                  const enseignantMatiere = enseignants.find(e => e.matieres.includes(matiere.id));

                  return (
                    <tr key={matiere.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{matiere.nom}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{enseignantMatiere ? `${enseignantMatiere.prenom} ${enseignantMatiere.nom}` : 'N/A'}</td>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm text-center font-bold ${
                        moyenneEleve ? (parseFloat(moyenneEleve) >= 10 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'
                      }`}>
                        {moyenneEleve ? `${moyenneEleve}/20` : '-'}
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm text-center ${
                        moyenneClasse ? (parseFloat(moyenneClasse) >= 10 ? 'text-green-500' : 'text-red-500') : 'text-gray-400'
                      }`}>
                        {moyenneClasse ? `${moyenneClasse}/20` : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {moyenneEleve ? (parseFloat(moyenneEleve) >= 15 ? 'Excellent travail. Très impliqué.' : parseFloat(moyenneEleve) >= 12 ? 'Bon niveau général, encourageant.' : parseFloat(moyeveleEleve) >= 10 ? 'Niveau satisfaisant, quelques points à renforcer.' : 'Des efforts significatifs sont attendus.') : 'Pas assez de notes pour évaluer.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Synthèse Générale */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center border-b pb-2 mb-3">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Synthèse Générale
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4 bg-blue-50 border border-blue-100 shadow-sm">
              <h4 className="text-md font-semibold text-blue-800 mb-2">Moyenne Générale</h4>
              <p className="text-2xl font-bold text-blue-700">
                {moyenneGenerale ? `${moyenneGenerale}/20` : 'N/A'}
              </p>
            </Card>
            <Card className="p-4 bg-yellow-50 border border-yellow-100 shadow-sm">
              <h4 className="text-md font-semibold text-yellow-800 mb-2">Assiduité</h4>
              <p className="text-lg text-gray-700">Absences : <span className="font-bold text-red-600">{absences}</span></p>
              <p className="text-lg text-gray-700">Retards : <span className="font-bold text-orange-600">{retards}</span></p>
            </Card>
          </div>
        </div>

        {/* Appréciation Générale & Décision du Conseil */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center border-b pb-2 mb-3">
            <Award className="w-5 h-5 mr-2 text-blue-600" />
            Appréciations & Décision du Conseil
          </h3>
          <Card className="p-4 border border-gray-200 shadow-sm">
            <h4 className="text-md font-semibold text-gray-700 mb-2">Appréciation Générale du Directeur :</h4> {/* Changed to Directeur */}
            <p className="text-sm text-gray-800 italic leading-relaxed">
              {moyenneGenerale ? (
                parseFloat(moyenneGenerale) >= 15 ? "Excellent trimestre, élève très engagé et performant dans toutes les matières. Continuez ainsi !" :
                parseFloat(moyenneGenerale) >= 12 ? "Bon trimestre. Élève sérieux et motivé. Quelques efforts supplémentaires pourraient consolider ses acquis." :
                parseFloat(moyenneGenerale) >= 10 ? "Trimestre satisfaisant. Élève attentif mais doit fournir plus de travail personnel pour surmonter certaines difficultés." :
                "Trimestre difficile. Nécessite une remise en question et un travail plus rigoureux pour atteindre les objectifs."
              ) : "Aucune appréciation disponible pour le moment, pas assez de données."}
            </p>
          </Card>
          <Card className="p-4 border border-gray-200 shadow-sm">
            <h4 className="text-md font-semibold text-gray-700 mb-2">Décision du Conseil de Classe :</h4>
            <p className="text-sm text-gray-800 font-medium">
              {moyenneGenerale ? (parseFloat(moyenneGenerale) >= 10 ? 'Passage en classe supérieure.' : 'Redoublement.') : 'Décision en attente des évaluations complètes.'}
            </p>
          </Card>
        </div>

        {/* Signature du Directeur - Simplified */}
        <div className="flex justify-center pt-6 border-t border-gray-200 text-sm"> {/* Centered single signature */}
          <div className="flex flex-col items-center w-1/2 md:w-1/3"> {/* Adjusted width for centering */}
            <p className="font-semibold text-gray-800 mb-2">Le Directeur</p>
            <div className="h-16 border-b border-gray-400 w-3/4 mb-1"></div>
            <p className="text-xs text-gray-500 mt-1">Signature</p>
          </div>
        </div>

        {/* Boutons d'action du bulletin */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6 no-print">
          <Button variant="outline" onClick={closeBulletinModal}>
            Fermer
          </Button>
          <Button variant="primary" icon={Printer} onClick={handlePrintBulletin}>
            Imprimer en PDF
          </Button>
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notes & Bulletins</h1>
        <p className="text-gray-600">Gestion des évaluations et bulletins scolaires</p>
      </div>

      {/* Class Selection Card */}
      <Card className="p-6 shadow-sm no-print">
        <div className="flex items-center space-x-4">
          <Calendar className="h-6 w-6 text-blue-600" />
          <label htmlFor="select-classe" className="text-gray-700 font-medium sr-only">Sélectionner une classe</label>
          <select
            id="select-classe"
            value={selectedClasseId}
            onChange={(e) => setSelectedClasseId(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 max-w-xs"
          >
            <option value="">Sélectionner une classe</option>
            {classes.map(classe => (
              <option key={classe.id} value={classe.id}>{classe.nom}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Conditional rendering based on selectedClasseId */}
      {selectedClasseId ? (
        <>
          <div className="border-b border-gray-200 no-print">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="no-print-container">
            {activeTab === 'notes' && renderNotes()}
            {activeTab === 'bulletins' && renderBulletins()}
            {activeTab === 'statistiques' && renderStatistiques()}
          </div>
        </>
      ) : (
        <Card className="text-center py-12 shadow-sm no-print">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">Sélectionnez une classe pour gérer les notes et bulletins.</p>
          <p className="text-gray-400 text-sm mt-2">Utilisez le menu déroulant ci-dessus pour choisir une classe spécifique.</p>
        </Card>
      )}

      {/* Note Add/Edit Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={closeNoteModal}
        title={editingNote ? 'Modifier la note' : 'Ajouter une note'}
        size="md"
      >
        <form onSubmit={handleNoteSubmit} className="space-y-4">
          <InputField
            label="Élève"
            type="select"
            value={noteFormData.eleveId}
            onChange={(e) => setNoteFormData({...noteFormData, eleveId: e.target.value})}
            options={[{ value: '', label: 'Sélectionner un élève' }, ...studentsInSelectedClass.map(e => ({ value: e.id, label: `${e.prenom} ${e.nom}` }))]}
            required
            disabled={editingNote !== null}
            className="text-gray-700"
          />
          <InputField
            label="Matière"
            type="select"
            value={noteFormData.matiereId}
            onChange={(e) => setNoteFormData({...noteFormData, matiereId: e.target.value})}
            options={[{ value: '', label: 'Sélectionner une matière' }, ...matieres.map(m => ({ value: m.id, label: m.nom }))]}
            required
            disabled={editingNote !== null}
            className="text-gray-700"
          />
          <InputField
            label="Note (sur 20)"
            type="number"
            value={noteFormData.note}
            onChange={(e) => setNoteFormData({...noteFormData, note: e.target.value})}
            min="0"
            max="20"
            step="0.5"
            required
          />
          <InputField
            label="Coefficient"
            type="number"
            value={noteFormData.coefficient}
            onChange={(e) => setNoteFormData({...noteFormData, coefficient: e.target.value})}
            min="1"
            max="10"
            required
          />
          <InputField
            label="Type de note"
            type="select"
            value={noteFormData.type}
            onChange={(e) => setNoteFormData({...noteFormData, type: e.target.value})}
            options={[{ value: '', label: 'Sélectionner un type' }, { value: 'Devoir', label: 'Devoir' }, { value: 'Contrôle', label: 'Contrôle' }, { value: 'Examen', label: 'Examen' }]}
            required
            className="text-gray-700"
          />
          <InputField
            label="Date"
            type="date"
            value={noteFormData.date}
            onChange={(e) => setNoteFormData({...noteFormData, date: e.target.value})}
            required
          />
          <InputField
            label="Commentaire"
            type="textarea"
            value={noteFormData.commentaire}
            onChange={(e) => setNoteFormData({...noteFormData, commentaire: e.target.value})}
            rows="3"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={closeNoteModal}>
              Annuler
            </Button>
            <Button type="submit">
              {editingNote ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Note Details Modal */}
      <Modal
        isOpen={showNoteDetailModal}
        onClose={closeNoteModal}
        title="Détails de la note"
        size="sm"
      >
        {selectedNote && (
          <div className="space-y-4">
            <DetailRow label="Élève" value={getEleveName(selectedNote.eleveId)} icon={User} />
            <DetailRow label="Matière" value={getMatiereName(selectedNote.matiereId)} icon={BookOpen} />
            <DetailRow label="Note" value={`${selectedNote.note}/20`} icon={Award} />
            <DetailRow label="Coefficient" value={selectedNote.coefficient} icon={Layers} />
            <DetailRow label="Type" value={selectedNote.type} icon={FileText} />
            <DetailRow label="Date" value={new Date(selectedNote.date).toLocaleDateString('fr-FR')} icon={Calendar} />
            <DetailRow label="Commentaire" value={selectedNote.commentaire || 'Aucun'} />
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={closeNoteModal}>Fermer</Button>
              <Button variant="secondary" icon={Edit} onClick={() => openNoteModal('modifier', selectedNote)}>Modifier</Button>
              <Button variant="danger" icon={Trash2} onClick={() => handleNoteDelete(selectedNote.id)}>Supprimer</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulletin Modal */}
      <Modal
        isOpen={showBulletinModal}
        onClose={closeBulletinModal}
        title={`Bulletin de ${selectedBulletinEleve?.prenom} ${selectedBulletinEleve?.nom}`}
        size="lg"
      >
        {selectedBulletinEleve && (
          <BulletinModalContent eleve={selectedBulletinEleve} />
        )}
      </Modal>

    </div>
  );
};

export default NotesBulletins;
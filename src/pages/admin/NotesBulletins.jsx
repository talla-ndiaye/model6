import { Award, BookOpen, Calendar, Edit, Eye, FileText, Layers, Plus, Search, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { classes, eleves, matieres, notes } from '../../data/donneesTemporaires'; // Removed enseignants and presences imports as they are not used in this simplified version

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

  // Filter states for Notes tab
  const [noteSearchTerm, setNoteSearchTerm] = useState('');
  const [noteFilterMatiere, setNoteFilterMatiere] = useState('');
  const [noteFilterType, setNoteFilterType] = useState('');

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

  // Filter notes by selected class, then by search/filters
  const filteredNotesByClass = notes.filter(note => {
    const eleveInClass = eleves.find(e => e.id === note.eleveId && String(e.classeId) === String(selectedClasseId));
    return eleveInClass;
  });

  const filteredNotes = filteredNotesByClass.filter(note => {
    const eleveName = getEleveName(note.eleveId).toLowerCase();
    const matiereName = getMatiereName(note.matiereId).toLowerCase(); // Unused but kept in case of future use

    const matchesSearch = noteSearchTerm === '' || eleveName.includes(noteSearchTerm.toLowerCase());
    const matchesMatiere = noteFilterMatiere === '' || String(note.matiereId) === noteFilterMatiere;
    const matchesType = noteFilterType === '' || note.type.toLowerCase() === noteFilterType.toLowerCase();

    return matchesSearch && matchesMatiere && matchesType;
  });

  // --- Note Modal Logic ---
  const openNoteModal = (type, note = null) => {
    // setTypeModal(type); // typeModal state removed
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
      // In a real app, you'd update your notes state here
    } else {
      const newId = Math.max(...notes.map(n => n.id)) + 1; //
      console.log('Adding new note:', { ...newNoteData, id: newId });
      // In a real app, you'd add the new note to your notes state here
    }
    closeNoteModal();
  };

  const handleNoteDelete = (noteId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
      console.log("Deleting note with ID:", noteId);
      // In a real app, you'd filter out the deleted note from your notes state
      closeNoteModal();
    }
  };

  const handleViewNoteDetails = (note) => {
    setSelectedNote(note);
    setShowNoteDetailModal(true);
  };

  // Filter students based on selected class
  const studentsInSelectedClass = eleves.filter(eleve => String(eleve.classeId) === String(selectedClasseId)); //

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
          noDataMessage={
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              Aucune note trouvée pour cette sélection.
              <p className="text-gray-400 text-sm mt-2">Essayez d'ajuster vos filtres ou d'ajouter une nouvelle note.</p>
            </div>
          }
        />
      </Card>
    </div>
  );

  const notesColumns = [
    {
      header: 'Élève',
      accessor: 'eleveId',
      render: (note) => getEleveName(note.eleveId) //
    },
    {
      header: 'Matière',
      accessor: 'matiereId',
      render: (note) => getMatiereName(note.matiereId) //
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
          {/* Tabs removed, only Notes tab content is rendered directly */}
          <div className="no-print-container">
            {renderNotes()}
          </div>
        </>
      ) : (
        <Card className="text-center py-12 shadow-sm no-print">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">Sélectionnez une classe pour gérer les notes.</p>
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
            onChange={(e) => setNoteFormData({ ...noteFormData, eleveId: e.target.value })}
            options={[{ value: '', label: 'Sélectionner un élève' }, ...studentsInSelectedClass.map(e => ({ value: e.id, label: `${e.prenom} ${e.nom}` }))]}
            required
            disabled={editingNote !== null}
            className="text-gray-700"
          />
          <InputField
            label="Matière"
            type="select"
            value={noteFormData.matiereId}
            onChange={(e) => setNoteFormData({ ...noteFormData, matiereId: e.target.value })}
            options={[{ value: '', label: 'Sélectionner une matière' }, ...matieres.map(m => ({ value: m.id, label: m.nom }))]}
            required
            disabled={editingNote !== null}
            className="text-gray-700"
          />
          <InputField
            label="Note (sur 20)"
            type="number"
            value={noteFormData.note}
            onChange={(e) => setNoteFormData({ ...noteFormData, note: e.target.value })}
            min="0"
            max="20"
            step="0.5"
            required
          />
          <InputField
            label="Coefficient"
            type="number"
            value={noteFormData.coefficient}
            onChange={(e) => setNoteFormData({ ...noteFormData, coefficient: e.target.value })}
            min="1"
            max="10"
            required
          />
          <InputField
            label="Type de note"
            type="select"
            value={noteFormData.type}
            onChange={(e) => setNoteFormData({ ...noteFormData, type: e.target.value })}
            options={[{ value: '', label: 'Sélectionner un type' }, { value: 'Devoir', label: 'Devoir' }, { value: 'Contrôle', label: 'Contrôle' }, { value: 'Examen', label: 'Examen' }]}
            required
            className="text-gray-700"
          />
          <InputField
            label="Date"
            type="date"
            value={noteFormData.date}
            onChange={(e) => setNoteFormData({ ...noteFormData, date: e.target.value })}
            required
          />
          <InputField
            label="Commentaire"
            type="textarea"
            value={noteFormData.commentaire}
            onChange={(e) => setNoteFormData({ ...noteFormData, commentaire: e.target.value })}
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
    </div>
  );
};

export default NotesBulletins;
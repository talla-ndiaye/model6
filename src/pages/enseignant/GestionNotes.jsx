import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';
import { classes, eleves, matieres, notes } from '../../data/donneesTemporaires';

const GestionNotes = () => {
  const { user } = useAuth();
  const [studentNotes, setStudentNotes] = useState(notes);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [formData, setFormData] = useState({
    eleveId: '',
    matiereId: '',
    note: '',
    coefficient: '1',
    type: 'Contrôle',
    commentaire: ''
  });

  // Get classes where the logged-in user is the principal teacher
  const mesClasses = classes.filter(classe =>
    classe.enseignantPrincipal === user.id
  );

  // Get subjects taught by the logged-in user
  const mesMatieres = matieres.filter(matiere =>
    user.matieres?.includes(matiere.id)
  );

  // Filter notes based on the teacher's assigned classes and subjects,
  // then apply selected class/matiere filters from the UI.
  const filteredNotes = studentNotes.filter(note => {
    const eleve = eleves.find(e => e.id === note.eleveId);

    // If student not found or note's matiere not taught by user, exclude
    if (!eleve || !user.matieres?.includes(note.matiereId)) {
      return false;
    }

    // Check if the student's class is one of the teacher's classes
    const isInMyClass = mesClasses.some(classe => classe.id === eleve.classeId);
    if (!isInMyClass) {
      return false;
    }

    // Apply UI filters (selectedClass, selectedMatiere)
    const matchesSelectedClass = selectedClass === '' || eleve.classeId.toString() === selectedClass;
    const matchesSelectedMatiere = selectedMatiere === '' || note.matiereId.toString() === selectedMatiere;

    return matchesSelectedClass && matchesSelectedMatiere;
  });

  const getEleveName = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getMatiereName = (matiereId) => {
    const matiere = matieres.find(m => m.id === matiereId);
    return matiere ? matiere.nom : 'Matière inconnue';
  };

  const getClassName = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    if (!eleve) return 'Classe inconnue';
    const classe = classes.find(c => c.id === eleve.classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const noteData = {
      ...formData,
      eleveId: parseInt(formData.eleveId),
      matiereId: parseInt(formData.matiereId),
      note: parseFloat(formData.note),
      coefficient: parseInt(formData.coefficient),
      date: new Date().toISOString().split('T')[0]
    };

    if (editingNote) {
      console.log('Modification note:', { ...noteData, id: editingNote.id });
      setStudentNotes(studentNotes.map(note =>
        note.id === editingNote.id ? { ...noteData, id: note.id } : note
      ));
    } else {
      const newNote = {
        ...noteData,
        id: Math.max(...studentNotes.map(n => n.id)) + 1
      };
      console.log('Ajout note:', newNote);
      setStudentNotes([...studentNotes, newNote]);
    }

    resetForm();
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      eleveId: note.eleveId.toString(),
      matiereId: note.matiereId.toString(),
      note: note.note.toString(),
      coefficient: note.coefficient.toString(),
      type: note.type,
      commentaire: note.commentaire
    });
    setShowModal(true);
  };

  const handleDelete = (note) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      console.log('Suppression note:', note);
      setStudentNotes(studentNotes.filter(n => n.id !== note.id));
    }
  };

  const resetForm = () => {
    setFormData({
      eleveId: '',
      matiereId: '',
      note: '',
      coefficient: '1',
      type: 'Contrôle',
      commentaire: ''
    });
    setEditingNote(null);
    setShowModal(false);
  };

  const columns = [
    {
      header: 'Élève',
      accessor: 'eleveId',
      render: (note) => getEleveName(note.eleveId)
    },
    {
      header: 'Classe',
      accessor: 'eleveId',
      render: (note) => getClassName(note.eleveId)
    },
    {
      header: 'Matière',
      accessor: 'matiereId',
      render: (note) => getMatiereName(note.matiereId)
    },
    {
      header: 'Note',
      accessor: 'note',
      render: (note) => (
        <span className={`font-medium ${
          note.note >= 10 ? 'text-green-600' : 'text-red-600'
        }`}>
          {note.note}/20
        </span>
      )
    },
    { header: 'Coefficient', accessor: 'coefficient' },
    { header: 'Type', accessor: 'type' },
    {
      header: 'Date',
      accessor: 'date',
      render: (note) => new Date(note.date).toLocaleDateString('fr-FR')
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (note) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(note)}
            icon={Edit}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(note)}
            icon={Trash2}
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des notes</h1>
          <p className="text-gray-600">Saisir et gérer les notes de vos élèves</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={Plus}>
          Nouvelle note
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="sm:w-48">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les classes</option>
              {mesClasses.map(classe => (
                <option key={classe.id} value={classe.id.toString()}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les matières</option>
              {mesMatieres.map(matiere => (
                <option key={matiere.id} value={matiere.id.toString()}>
                  {matiere.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table columns={columns} data={filteredNotes} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingNote ? 'Modifier la note' : 'Nouvelle note'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Élève <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.eleveId}
              onChange={(e) => setFormData({...formData, eleveId: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionner un élève</option>
              {/* Filter students to only show those in classes assigned to the teacher */}
              {eleves.filter(eleve =>
                mesClasses.some(classe => classe.id === eleve.classeId)
              ).map(eleve => (
                <option key={eleve.id} value={eleve.id}>
                  {eleve.prenom} {eleve.nom} - {getClassName(eleve.id)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matière <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.matiereId}
              onChange={(e) => setFormData({...formData, matiereId: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionner une matière</option>
              {/* Only show subjects taught by the teacher */}
              {mesMatieres.map(matiere => (
                <option key={matiere.id} value={matiere.id}>
                  {matiere.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Note (/20)"
              type="number"
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              min="0"
              max="20"
              step="0.5"
              required
            />
            <InputField
              label="Coefficient"
              type="number"
              value={formData.coefficient}
              onChange={(e) => setFormData({...formData, coefficient: e.target.value})}
              min="1"
              max="5"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'évaluation
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Contrôle">Contrôle</option>
              <option value="Devoir">Devoir</option>
              <option value="Interrogation">Interrogation</option>
              <option value="Examen">Examen</option>
              <option value="Participation">Participation</option>
            </select>
          </div>

          <InputField
            label="Commentaire"
            value={formData.commentaire}
            onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
            placeholder="Commentaire optionnel..."
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={resetForm}>
              Annuler
            </Button>
            <Button type="submit">
              {editingNote ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GestionNotes;
import { BookOpen, Edit, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';
import { classes, eleves, enseignants, matieres, notes } from '../../data/donneesTemporaires';

const GestionNotes = () => {
  const { user } = useAuth();
  const [notesEleves, setNotesEleves] = useState(notes);
  const [afficherModal, setAfficherModal] = useState(false);
  const [noteEnEdition, setNoteEnEdition] = useState(null);
  const [classeSelectionnee, setClasseSelectionnee] = useState('');
  const [matiereSelectionnee, setMatiereSelectionnee] = useState(''); 

  const [donneesFormulaire, setDonneesFormulaire] = useState({
    eleveId: '',
    matiereId: '',
    note: '',
    coefficient: '1',
    type: 'Contrôle',
    commentaire: ''
  });

  const enseignantConnecte = useMemo(() => {
    return user?.role === 'enseignant'
      ? enseignants.find(e => e.id === user.id)
      : null;
  }, [user, enseignants]);

  const mesClasses = useMemo(() => {
    return enseignantConnecte ? classes.filter(classe => enseignantConnecte.classes?.includes(classe.id)) : [];
  }, [enseignantConnecte, classes]);

  const mesMatieres = useMemo(() => {
    return enseignantConnecte ? matieres.filter(matiere => enseignantConnecte.matieres?.includes(matiere.id)) : [];
  }, [enseignantConnecte, matieres]);

  const notesFiltrees = useMemo(() => {
    let notesVisibles = notesEleves;

    if (!enseignantConnecte || !user?.id) {
      return [];
    }

    notesVisibles = notesVisibles.filter(note => {
      const eleve = eleves.find(e => e.id === note.eleveId);
      if (!eleve) return false;

      const matiereEstEnseignee = mesMatieres.some(m => m.id === note.matiereId);
      if (!matiereEstEnseignee) return false;

      const classeEstLaMienne = mesClasses.some(c => c.id === eleve.classeId);
      if (!classeEstLaMienne) return false;

      if (note.enseignantId !== user.id) {
        return false;
      }

      return true;
    });

    if (classeSelectionnee) {
      notesVisibles = notesVisibles.filter(note => {
        const eleve = eleves.find(e => e.id === note.eleveId);
        return eleve?.classeId.toString() === classeSelectionnee;
      });
    }

    // NOUVEAU : Appliquer le filtre par matière si sélectionnée
    if (matiereSelectionnee) {
      notesVisibles = notesVisibles.filter(note => note.matiereId.toString() === matiereSelectionnee);
    }

    return notesVisibles;
  }, [notesEleves, enseignantConnecte, mesClasses, mesMatieres, classeSelectionnee, matiereSelectionnee, eleves, user?.id]); // Ajout de matiereSelectionnee dans les dépendances

  const getNomEleve = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getNomMatiere = (matiereId) => {
    const matiere = matieres.find(m => m.id === matiereId);
    return matiere ? matiere.nom : 'Matière inconnue';
  };

  const getNomClasse = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    if (!eleve) return 'Classe inconnue';
    const classe = classes.find(c => c.id === eleve.classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const gererSoumission = (e) => {
    e.preventDefault();

    const donneesNote = {
      ...donneesFormulaire,
      eleveId: parseInt(donneesFormulaire.eleveId),
      matiereId: parseInt(donneesFormulaire.matiereId),
      note: parseFloat(donneesFormulaire.note),
      coefficient: parseInt(donneesFormulaire.coefficient),
      date: new Date().toISOString().split('T')[0],
      enseignantId: user.id
    };

    if (noteEnEdition) {
      console.log('Modification note:', { ...donneesNote, id: noteEnEdition.id });
      setNotesEleves(notesEleves.map(note =>
        note.id === noteEnEdition.id ? { ...donneesNote, id: note.id } : note
      ));
    } else {
      const nouvelleNote = {
        ...donneesNote,
        id: Math.max(...notesEleves.map(n => n.id), 0) + 1
      };
      console.log('Ajout note:', nouvelleNote);
      setNotesEleves([...notesEleves, nouvelleNote]);
    }

    reinitialiserFormulaire();
  };

  const gererEdition = (note) => {
    setNoteEnEdition(note);
    setDonneesFormulaire({
      eleveId: note.eleveId.toString(),
      matiereId: note.matiereId.toString(),
      note: note.note.toString(),
      coefficient: note.coefficient.toString(),
      type: note.type,
      commentaire: note.commentaire
    });
    setAfficherModal(true);
  };

  const gererSuppression = (note) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      console.log('Suppression note:', note);
      setNotesEleves(notesEleves.filter(n => n.id !== note.id));
    }
  };

  const reinitialiserFormulaire = () => {
    setDonneesFormulaire({
      eleveId: '',
      matiereId: '',
      note: '',
      coefficient: '1',
      type: 'Contrôle',
      commentaire: ''
    });
    setNoteEnEdition(null);
    setAfficherModal(false);
  };

  const colonnes = [
    {
      header: 'Élève',
      accessor: 'eleveId',
      render: (note) => getNomEleve(note.eleveId)
    },
    {
      header: 'Classe',
      accessor: 'eleveId',
      render: (note) => getNomClasse(note.eleveId)
    },
    {
      header: 'Matière',
      accessor: 'matiereId',
      render: (note) => getNomMatiere(note.matiereId)
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
            onClick={() => gererEdition(note)}
            icon={Edit}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => gererSuppression(note)}
            icon={Trash2}
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  const elevesDeLaClasseSelectionnee = useMemo(() => {
    if (!classeSelectionnee) return [];
    return eleves.filter(eleve =>
      eleve.classeId.toString() === classeSelectionnee &&
      mesClasses.some(classe => classe.id === eleve.classeId)
    );
  }, [classeSelectionnee, eleves, mesClasses]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des notes</h1>
          <p className="text-gray-600">Saisir et gérer les notes de vos élèves</p>
        </div>
        <Button onClick={() => setAfficherModal(true)} icon={Plus} disabled={!classeSelectionnee}>
          Nouvelle note
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="sm:w-48">
            <label htmlFor="select-classe" className="sr-only">Sélectionner une classe</label>
            <select
              id="select-classe"
              value={classeSelectionnee}
              onChange={(e) => setClasseSelectionnee(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner une classe</option>
              {mesClasses.map(classe => (
                <option key={classe.id} value={classe.id.toString()}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </div>
          {/* NOUVEAU : Filtre par matière */}
          <div className="sm:w-48">
            <label htmlFor="select-matiere" className="sr-only">Sélectionner une matière</label>
            <select
              id="select-matiere"
              value={matiereSelectionnee}
              onChange={(e) => setMatiereSelectionnee(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!classeSelectionnee} // Désactiver si aucune classe n'est sélectionnée
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

        {classeSelectionnee ? ( // La table s'affiche si une classe est sélectionnée (la matière est facultative)
          <Table columns={colonnes} data={notesFiltrees} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold">Sélectionnez une classe pour gérer les notes.</p>
            <p className="text-sm mt-2">Utilisez le menu déroulant ci-dessus pour commencer.</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={afficherModal}
        onClose={reinitialiserFormulaire}
        title={noteEnEdition ? 'Modifier la note' : 'Nouvelle note'}
        size="md"
      >
        <form onSubmit={gererSoumission} className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Élève <span className="text-red-500">*</span>
            </label>
            <select
              value={donneesFormulaire.eleveId}
              onChange={(e) => setDonneesFormulaire({...donneesFormulaire, eleveId: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!!noteEnEdition}
            >
              <option value="">Sélectionner un élève</option>
              {elevesDeLaClasseSelectionnee.map(eleve => (
                <option key={eleve.id} value={eleve.id}>
                  {eleve.prenom} {eleve.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matière <span className="text-red-500">*</span>
            </label>
            <select
              value={donneesFormulaire.matiereId}
              onChange={(e) => setDonneesFormulaire({...donneesFormulaire, matiereId: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!!noteEnEdition}
            >
              <option value="">Sélectionner une matière</option>
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
              value={donneesFormulaire.note}
              onChange={(e) => setDonneesFormulaire({...donneesFormulaire, note: e.target.value})}
              min="0"
              max="20"
              step="0.5"
              required
            />
            <InputField
              label="Coefficient"
              type="number"
              value={donneesFormulaire.coefficient}
              onChange={(e) => setDonneesFormulaire({...donneesFormulaire, coefficient: e.target.value})}
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
              value={donneesFormulaire.type}
              onChange={(e) => setDonneesFormulaire({...donneesFormulaire, type: e.target.value})}
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
            value={donneesFormulaire.commentaire}
            onChange={(e) => setDonneesFormulaire({...donneesFormulaire, commentaire: e.target.value})}
            placeholder="Commentaire optionnel..."
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={reinitialiserFormulaire}>
              Annuler
            </Button>
            <Button type="submit">
              {noteEnEdition ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GestionNotes;
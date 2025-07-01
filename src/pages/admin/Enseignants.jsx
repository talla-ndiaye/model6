import {
  BookOpen,
  Download,
  Edit,
  Eye,
  Mail,
  Phone,
  Plus,
  Save,
  School,
  Search,
  Trash2,
  Users
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

import { NavLink } from 'react-router-dom';
import { classes, enseignants as initialEnseignants, matieres } from '../../data/donneesTemporaires';

const LigneDetail = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
    {Icon && <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />}
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const Enseignants = () => {
  const [enseignants, setEnseignants] = useState(initialEnseignants);

  const [texteRecherche, setTexteRecherche] = useState('');
  const [filtreMatiere, setFiltreMatiere] = useState('');
  const [filtreClasse, setFiltreClasse] = useState('');

  const [enseignantSelectionne, setEnseignantSelectionne] = useState(null);
  const [modalOuverte, setModalOuverte] = useState(false);
  const [typeModal, setTypeModal] = useState('');

  const getNomClassesParIds = (classeIds) => {
    if (!classeIds || classeIds.length === 0) return 'Aucune';
    return classeIds.map(id => classes.find(c => c.id === id)?.nom).filter(Boolean).join(', ');
  };

  const gererChangementFiltre = (setter, value) => {
    setter(value);
  };

  const enseignantsFiltres = useMemo(() => {
    let EnseignantsTemporaire = enseignants.filter(enseignant => {
      const nomComplet = `${enseignant.prenom || ''} ${enseignant.nom || ''}`.toLowerCase();
      const correspondRecherche = nomComplet.includes(texteRecherche.toLowerCase()) ||
        enseignant.email?.toLowerCase().includes(texteRecherche.toLowerCase()) ||
        enseignant.telephone?.toLowerCase().includes(texteRecherche.toLowerCase());

      const correspondMatiere = !filtreMatiere || enseignant.matieres.some(matiereId =>
        matieres.find(m => m.id === matiereId)?.nom === filtreMatiere
      );

      const correspondClasse = !filtreClasse ||
        (enseignant.classes && enseignant.classes.some(classId =>
          classes.find(c => c.id === classId)?.nom === filtreClasse
        ));

      return correspondRecherche && correspondMatiere && correspondClasse;
    });

    return EnseignantsTemporaire;
  }, [enseignants, texteRecherche, filtreMatiere, filtreClasse]);

  const ouvrirModal = (type, enseignant = null) => {
    setTypeModal(type);
    setEnseignantSelectionne(enseignant);
    setModalOuverte(true);
  };

  const fermerModal = () => {
    setModalOuverte(false);
    setEnseignantSelectionne(null);
    setTypeModal('');
  };

  const FormulaireEnseignant = () => {
    const [formData, setFormData] = useState(enseignantSelectionne ? {
      prenom: enseignantSelectionne.prenom,
      nom: enseignantSelectionne.nom,
      email: enseignantSelectionne.email,
      telephone: enseignantSelectionne.telephone,
      matieres: enseignantSelectionne.matieres.map(String),
      classes: enseignantSelectionne.classes.map(String),
      statut: enseignantSelectionne.statut || 'actif'
    } : {
      prenom: '',
      nom: '',
      email: '',
      telephone: '',
      matieres: [],
      classes: [],
      statut: 'actif'
    });

    const gererSoumission = (e) => {
      e.preventDefault();
      const dataToSubmit = {
        ...formData,
        matieres: formData.matieres.map(Number),
        classes: formData.classes.map(Number)
      };

      if (enseignantSelectionne) {
        setEnseignants(enseignants.map(t =>
          t.id === enseignantSelectionne.id ? { ...t, ...dataToSubmit } : t
        ));
        console.log('Modification enseignant:', { ...dataToSubmit, id: enseignantSelectionne.id });
      } else {
        const newId = Math.max(...enseignants.map(t => t.id)) + 1;
        setEnseignants(prev => [...prev, { ...dataToSubmit, id: newId }]);
        console.log('Ajout enseignant:', { ...dataToSubmit, id: newId });
      }
      fermerModal();
    };

    return (
      <form onSubmit={gererSoumission} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Prénom *" type="text" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} required />
          <InputField label="Nom *" type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
          <InputField label="Email *" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <InputField label="Téléphone *" type="tel" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} placeholder="77 123 45 67" required />

          <div className="form-group">
            <label htmlFor="matiere-select" className="form-label block text-sm font-medium text-gray-700 mb-1">Matière principale *</label>
            <select
              id="matiere-select"
              value={formData.matieres[0] || ''}
              onChange={(e) => setFormData({ ...formData, matieres: [parseInt(e.target.value)] })}
              className="input-field block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              required
            >
              <option value="">Sélectionner une matière</option>
              {matieres.map(matiere => (
                <option key={matiere.id} value={matiere.id}>{matiere.nom}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="classes-select" className="form-label block text-sm font-medium text-gray-700 mb-1">Classes enseignées</label>
            <select
              id="classes-select"
              multiple
              value={formData.classes.map(String)}
              onChange={(e) => setFormData({ ...formData, classes: Array.from(e.target.selectedOptions, option => parseInt(option.value)) })}
              className="input-field block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 h-32"
            >
              {classes.map(classe => (
                <option key={classe.id} value={classe.id}>{classe.nom}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl/Cmd pour sélectionner plusieurs classes</p>
          </div>

          <div className="form-group">
            <label htmlFor="statut-select" className="form-label block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              id="statut-select"
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              className="input-field block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 capitalize"
            >
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
          <Button variant="outline" onClick={fermerModal}>Annuler</Button>
          <Button type="submit" icon={Save}>
            {typeModal === 'ajouter' ? 'Ajouter' : 'Modifier'}
          </Button>
        </div>
      </form>
    );
  };

  const colonnes = [
    {
      header: 'Enseignant',
      accessor: 'nomComplet',
      render: (enseignant) => (
        <NavLink to={`./profil/${enseignant.id}`}>
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {enseignant.prenom} {enseignant.nom}
              </div>
            </div>
          </div>
        </NavLink>
      ),
    },
    {
      header: 'Matière(s)',
      accessor: 'matieres',
      render: (enseignant) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
          {enseignant.matieres.map(id => matieres.find(m => m.id === id)?.nom).filter(Boolean).join(', ')}
        </span>
      ),
    },
    {
      header: 'Contact',
      accessor: 'contact',
      render: (enseignant) => (
        <>
          <div className="text-sm text-gray-900 flex items-center mb-1">
            <Phone className="h-4 w-4 mr-2 text-gray-600" />
            {enseignant.telephone}
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <Mail className="h-4 w-4 mr-2 text-gray-600" />
            {enseignant.email}
          </div>
        </>
      ),
    },
    {
      header: 'Classes',
      accessor: 'classes',
      render: (enseignant) => getNomClassesParIds(enseignant.classes),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (enseignant) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => ouvrirModal('voir', enseignant)}
            icon={Eye}
          >
            Détails
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => ouvrirModal('modifier', enseignant)}
            icon={Edit}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => console.log('Supprimer enseignant:', enseignant.id)}
            icon={Trash2}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Enseignants</h1>
          <p className="text-gray-600">Gérez le personnel enseignant de l'établissement</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" icon={Download}>
            Exporter
          </Button>
          <Button onClick={() => ouvrirModal('ajouter')} icon={Plus}>
            Nouvel Enseignant
          </Button>
        </div>
      </div>

      <Card className="p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher un enseignant (nom, prénom, email)..."
              value={texteRecherche}
              onChange={(e) => gererChangementFiltre(setTexteRecherche, e.target.value)}
              className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>
          <select
            value={filtreMatiere}
            onChange={(e) => gererChangementFiltre(setFiltreMatiere, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            <option value="">Toutes les matières</option>
            {matieres.map(matiere => (
              <option key={matiere.id} value={matiere.nom}>{matiere.nom}</option>
            ))}
          </select>
          <select
            value={filtreClasse}
            onChange={(e) => gererChangementFiltre(setFiltreClasse, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            <option value="">Toutes les classes</option>
            {classes.map(classe => (
              <option key={classe.id} value={classe.nom}>{classe.nom}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="p-0">
        <Table
          columns={colonnes}
          data={enseignantsFiltres}
          noDataMessage={
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              Aucun enseignant trouvé pour cette sélection.
              <p className="text-gray-400 text-sm mt-2">Essayez d'ajuster vos filtres ou d'ajouter un nouvel enseignant.</p>
            </div>
          }
        />
      </Card>

      <Modal
        isOpen={modalOuverte}
        onClose={fermerModal}
        title={
          typeModal === 'ajouter' ? 'Ajouter un enseignant' :
            typeModal === 'modifier' ? 'Modifier l\'enseignant' :
              'Détails de l\'enseignant'
        }
        size="md"
      >
        {typeModal === 'voir' ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-inner">
              <img
                src={enseignantSelectionne?.photo || 'https://images.pexels.com/photos/2726047/pexels-photo-2726047.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'}
                alt={`${enseignantSelectionne?.prenom} ${enseignantSelectionne?.nom}`}
                className="h-24 w-24 rounded-full object-cover border-2 border-blue-200 shadow-md"
              />
              <div className="text-center sm:text-left">
                <h4 className="text-2xl font-bold text-gray-900">
                  {enseignantSelectionne?.prenom} {enseignantSelectionne?.nom}
                </h4>
                <p className="text-gray-600 text-lg">{matieres.find(m => m.id === enseignantSelectionne?.matieres[0])?.nom || 'Non spécifiée'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LigneDetail icon={Phone} label="Téléphone" value={enseignantSelectionne?.telephone} />
              <LigneDetail icon={Mail} label="Email" value={enseignantSelectionne?.email} />
              <LigneDetail icon={School} label="Classes enseignées" value={getNomClassesParIds(enseignantSelectionne?.classes)} />
              <LigneDetail icon={BookOpen} label="Matières enseignées" value={enseignantSelectionne?.matieres.map(id => matieres.find(m => m.id === id)?.nom).filter(Boolean).join(', ') || 'Aucune'} />
            </div>
            <div className="flex justify-end space-x-3 mt-6 border-t pt-4 border-gray-200">
              <Button onClick={() => ouvrirModal('modifier', enseignantSelectionne)} variant="secondary" icon={Edit}>
                Modifier
              </Button>
              <Button onClick={() => console.log('Supprimer enseignant:', enseignantSelectionne?.id)} variant="danger" icon={Trash2}>
                Supprimer
              </Button>
            </div>
          </div>
        ) : (
          <FormulaireEnseignant />
        )}
      </Modal>
    </div>
  );
};

export default Enseignants;
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Download,
  Edit,
  Eye,
  Filter, // Icon for mobile filter button
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
import Button from '../../components/ui/Button'; // Ensure Button is imported
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

import { classes, enseignants as initialEnseignants, matieres } from '../../data/donneesTemporaires';


// Helper component for detail rows in modals (reused from other components)
const DetailRow = ({ icon: Icon, label, value }) => (
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

  const [rechercheTexte, setRechercheTexte] = useState('');
  const [filtreMatiere, setFiltreMatiere] = useState('');
  const [filtreClasse, setFiltreClasse] = useState('');
  const [ordreTri, setOrdreTri] = useState('nom_asc');
  const [filtreModalOuvert, setFiltreModalOuvert] = useState(false);

  const [enseignantSelectionne, setEnseignantSelectionne] = useState(null);
  const [modalOuverte, setModalOuverte] = useState(false);
  const [typeModal, setTypeModal] = useState('');

  // Helper function to get class names from IDs
  const getClasseNamesByIds = (classeIds) => {
    if (!classeIds || classeIds.length === 0) return 'Aucune';
    return classeIds.map(id => classes.find(c => c.id === id)?.nom).filter(Boolean).join(', ');
  };

  // Function to handle filter changes and reset pagination
  const handleFilterChange = (setter, value) => {
    setCurrentPage(1);
    setter(value);
  };

  // Memoized filtered and sorted teachers
  const enseignantsFiltresEtTries = useMemo(() => {
    let tempEnseignants = enseignants.filter(enseignant => {
      const nomComplet = `${enseignant.prenom || ''} ${enseignant.nom || ''}`.toLowerCase();
      const correspondRecherche = nomComplet.includes(rechercheTexte.toLowerCase()) ||
                                  enseignant.email?.toLowerCase().includes(rechercheTexte.toLowerCase());

      const correspondMatiere = !filtreMatiere || enseignant.matieres.some(matiereId => 
        matieres.find(m => m.id === matiereId)?.nom === filtreMatiere
      );

      const correspondClasse = !filtreClasse ||
        (enseignant.classes && enseignant.classes.some(classId =>
          classes.find(c => c.id === classId)?.nom === filtreClasse
        ));

      return correspondRecherche && correspondMatiere && correspondClasse;
    });

    tempEnseignants.sort((a, b) => {
      const nomA = a.nom.toLowerCase();
      const prenomA = a.prenom.toLowerCase();
      const nomB = b.nom.toLowerCase();
      const prenomB = b.prenom.toLowerCase();

      if (ordreTri === 'nom_asc') {
        return nomA.localeCompare(nomB);
      } else if (ordreTri === 'nom_desc') {
        return nomB.localeCompare(nomA);
      } else if (ordreTri === 'prenom_asc') {
        return prenomA.localeCompare(prenomB);
      } else if (ordreTri === 'prenom_desc') {
        return prenomB.localeCompare(prenomA);
      }
      return 0;
    });

    return tempEnseignants;
  }, [enseignants, rechercheTexte, filtreMatiere, filtreClasse, ordreTri, classes, matieres]);

  // Pagination states and logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(enseignantsFiltresEtTries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEnseignants = enseignantsFiltresEtTries.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // Modal handlers
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

  // Form for Add/Edit Teacher
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
          <InputField label="Prénom *" type="text" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} required />
          <InputField label="Nom *" type="text" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} required />
          <InputField label="Email *" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <InputField label="Téléphone *" type="tel" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} placeholder="77 123 45 67" required />
          
          <div className="form-group">
            <label htmlFor="matiere-select" className="form-label block text-sm font-medium text-gray-700 mb-1">Matière principale *</label>
            <select
              id="matiere-select"
              value={formData.matieres[0] || ''}
              onChange={(e) => setFormData({...formData, matieres: [parseInt(e.target.value)]})}
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
              onChange={(e) => setFormData({...formData, classes: Array.from(e.target.selectedOptions, option => parseInt(option.value))})}
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
              onChange={(e) => setFormData({...formData, statut: e.target.value})}
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

  // Columns for the Table component
  const columns = [
    {
      header: 'Enseignant',
      accessor: 'nomComplet',
      render: (enseignant) => (
        <div className="flex items-center">
          <img
            src={enseignant.photo || 'https://images.pexels.com/photos/2726047/pexels-photo-2726047.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'}
            alt={`${enseignant.prenom} ${enseignant.nom}`}
            className="h-10 w-10 rounded-full object-cover shadow-sm mr-4"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {enseignant.prenom} {enseignant.nom}
            </div>
            <div className="text-xs text-gray-500">Enseignant</div>
          </div>
        </div>
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
      render: (enseignant) => getClasseNamesByIds(enseignant.classes),
    },
    // Statut column is removed as requested
    // {
    //   header: 'Statut',
    //   accessor: 'statut',
    //   render: (enseignant) => (
    //     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
    //         enseignant.statut === 'actif'
    //           ? 'bg-green-100 text-green-800 border-green-200'
    //           : 'bg-red-100 text-red-800 border-red-200'
    //       }`}>
    //       {enseignant.statut === 'actif' ? 'Actif' : 'Inactif'}
    //     </span>
    //   ),
    // },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (enseignant) => (
        <div className="flex items-center justify-end space-x-2">
          {/* Reverted to original Button components with text */}
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
            onClick={() => console.log('Supprimer enseignant:', enseignant.id)} // Placeholder for delete action
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

      {/* Filters and search (Desktop version) */}
      <Card className="p-6 shadow-sm hidden md:block">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher un enseignant (nom, prénom, email)..."
              value={rechercheTexte}
              onChange={(e) => handleFilterChange(setRechercheTexte, e.target.value)}
              className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>
          <select
            value={filtreMatiere}
            onChange={(e) => handleFilterChange(setFiltreMatiere, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            <option value="">Toutes les matières</option>
            {matieres.map(matiere => (
              <option key={matiere.id} value={matiere.nom}>{matiere.nom}</option>
            ))}
          </select>
          <select
            value={filtreClasse}
            onChange={(e) => handleFilterChange(setFiltreClasse, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            <option value="">Toutes les classes</option>
            {classes.map(classe => (
              <option key={classe.id} value={classe.nom}>{classe.nom}</option>
            ))}
          </select>
          <select
            value={ordreTri}
            onChange={(e) => handleFilterChange(setOrdreTri, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            <option value="nom_asc">Nom (A-Z)</option>
            <option value="nom_desc">Nom (Z-A)</option>
            <option value="prenom_asc">Prénom (A-Z)</option>
            <option value="prenom_desc">Prénom (Z-A)</option>
          </select>
        </div>
      </Card>

      {/* Filter button for small screens */}
      <div className="block md:hidden text-center mt-4">
        <Button onClick={() => setFiltreModalOuvert(true)} variant="secondary" icon={Filter}>
          Filtrer les enseignants
        </Button>
      </div>

      {/* Teachers Table */}
      <Card className="p-0">
        <Table columns={columns} data={currentEnseignants}
          noDataMessage={
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              Aucun enseignant trouvé pour cette sélection.
              <p className="text-gray-400 text-sm mt-2">Essayez d'ajuster vos filtres ou d'ajouter un nouvel enseignant.</p>
            </div>
          }
        />
      </Card>


      {/* Pagination */}
      {enseignantsFiltresEtTries.length > itemsPerPage && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <Button onClick={goToPreviousPage} disabled={currentPage === 1} variant="secondary" icon={ArrowLeft}>
            Précédent
          </Button>
          <span className="text-gray-700 font-medium">
            Page {currentPage} sur {totalPages}
          </span>
          <Button onClick={goToNextPage} disabled={currentPage === totalPages} variant="secondary" icon={ArrowRight}>
            Suivant
          </Button>
        </div>
      )}

      {/* Modal for Add/Edit/View Teacher */}
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
              <DetailRow icon={Phone} label="Téléphone" value={enseignantSelectionne?.telephone} />
              <DetailRow icon={Mail} label="Email" value={enseignantSelectionne?.email} />
              <DetailRow icon={School} label="Classes enseignées" value={getClasseNamesByIds(enseignantSelectionne?.classes)} />
              <DetailRow icon={BookOpen} label="Matières enseignées" value={enseignantSelectionne?.matieres.map(id => matieres.find(m => m.id === id)?.nom).filter(Boolean).join(', ') || 'Aucune'} />
              {/* Removed Statut row in Detail Modal as well */}
              {/* <DetailRow icon={FileText} label="Statut" value={enseignantSelectionne?.statut === 'actif' ? 'Actif' : 'Inactif'} /> */}
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

      {/* Mobile Filter Modal */}
      <Modal
        isOpen={filtreModalOuvert}
        onClose={() => setFiltreModalOuvert(false)}
        title="Options de Filtrage"
        size="sm"
      >
        <div className="space-y-4">
          <InputField
            label="Rechercher"
            type="text"
            placeholder="Nom, prénom, email..."
            value={rechercheTexte}
            onChange={(e) => handleFilterChange(setRechercheTexte, e.target.value)}
            icon={Search}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">Matière principale</label>
          <select
            value={filtreMatiere}
            onChange={(e) => handleFilterChange(setFiltreMatiere, e.target.value)}
            className="input-field block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            <option value="">Toutes les matières</option>
            {matieres.map(matiere => (
              <option key={matiere.id} value={matiere.nom}>{matiere.nom}</option>
            ))}
          </select>
          <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
          <select
            value={filtreClasse}
            onChange={(e) => handleFilterChange(setFiltreClasse, e.target.value)}
            className="input-field block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            <option value="">Toutes les classes</option>
            {classes.map(classe => (
              <option key={classe.id} value={classe.nom}>{classe.nom}</option>
            ))}
          </select>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
          <select
            value={ordreTri}
            onChange={(e) => handleFilterChange(setOrdreTri, e.target.value)}
            className="input-field block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            <option value="nom_asc">Nom (A-Z)</option>
            <option value="nom_desc">Nom (Z-A)</option>
            <option value="prenom_asc">Prénom (A-Z)</option>
            <option value="prenom_desc">Prénom (Z-A)</option>
          </select>
          <div className="flex justify-end mt-6">
            <Button onClick={() => setFiltreModalOuvert(false)}>
              Appliquer les filtres
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Enseignants;
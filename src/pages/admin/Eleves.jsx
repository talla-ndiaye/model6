import { BadgeCheck, BookOpen, CalendarDays, Edit, Eye, Home, Mail, Phone, Plus, Search, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { classes, eleves, utilisateurs, } from '../../data/donneesTemporaires';

const Eleves = () => {
  const [etudiants, setEtudiants] = useState(eleves);
  const [afficherModal, setAfficherModal] = useState(false);
  const [afficherModalDetail, setAfficherModalDetail] = useState(false);
  const [etudiantEnEdition, setEtudiantEnEdition] = useState(null);
  const [etudiantSelectionne, setEtudiantSelectionne] = useState(null);
  const [texteRecherche, setTexteRecherche] = useState('');
  const [filtreClasse, setFiltreClasse] = useState('');
  const [filtreSexe, setFiltreSexe] = useState('');

  const navigate = useNavigate();

  const [donneesFormulaire, setDonneesFormulaire] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    classeId: '',
    telephone: '',
    email: '',
    adresse: '',
    sexe: '',
    parentIds: []
  });

  const getInfoParent = (parentId) => {
    return utilisateurs.find(user => user.id === parentId && user.role === 'parent');
  };

  const getContactParents = (parentIds) => {
    if (!parentIds || parentIds.length === 0) return 'Non renseigné';
    return parentIds.map(parentId => {
      const parent = getInfoParent(parentId);
      if (parent) {
        return (
          <div key={parentId} className="mb-1 last:mb-0">
            <p className="text-sm font-medium text-gray-900">{parent.prenom} {parent.nom}</p>
            <p className="text-xs text-gray-600 flex items-center"><Phone className="w-3 h-3 mr-1" />{parent.telephone || 'N/A'}</p>
            <p className="text-xs text-gray-600 flex items-center"><Mail className="w-3 h-3 mr-1" />{parent.email || 'N/A'}</p>
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };

  const etudiantsFiltres = etudiants.filter(etudiant => {
    const correspondRecherche = etudiant.nom.toLowerCase().includes(texteRecherche.toLowerCase()) ||
      etudiant.prenom.toLowerCase().includes(texteRecherche.toLowerCase()) ||
      etudiant.telephone.toLowerCase().includes(texteRecherche.toLowerCase()) ||
      etudiant.matricule.toLowerCase().includes(texteRecherche.toLowerCase());
    const correspondClasse = filtreClasse === '' || etudiant.classeId.toString() === filtreClasse;
    const correspondSexe = filtreSexe === '' || etudiant.sexe === filtreSexe;

    return correspondRecherche && correspondClasse && correspondSexe;
  }).sort((a, b) => {
    const nomA = `${a.prenom} ${a.nom}`.toLowerCase();
    const nomB = `${b.prenom} ${b.nom}`.toLowerCase();
    return nomA.localeCompare(nomB);
  });

  const getNomClasse = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Non assigné';
  };

  const gererSoumission = (e) => {
    e.preventDefault();

    const donneesEtudiant = {
      ...donneesFormulaire,
      classeId: parseInt(donneesFormulaire.classeId),
      parentIds: donneesFormulaire.parentIds.map(Number)
    };

    if (etudiantEnEdition) {
      console.log('Modification élève:', { ...donneesEtudiant, id: etudiantEnEdition.id });
      setEtudiants(etudiants.map(etudiant =>
        etudiant.id === etudiantEnEdition.id ? { ...donneesEtudiant, id: etudiant.id } : etudiant
      ));
    } else {
      const nouvelEtudiant = {
        ...donneesEtudiant,
        id: Math.max(...etudiants.map(s => s.id)) + 1,
      };
      console.log('Ajout élève:', nouvelEtudiant);
      setEtudiants([...etudiants, nouvelEtudiant]);
    }

    reinitialiserFormulaire();
  };

  const gererEdition = (etudiant) => {
    setEtudiantEnEdition(etudiant);
    setDonneesFormulaire({
      nom: etudiant.nom,
      prenom: etudiant.prenom,
      dateNaissance: etudiant.dateNaissance,
      classeId: etudiant.classeId.toString(),
      telephone: etudiant.telephone,
      email: etudiant.email,
      adresse: etudiant.adresse,
      sexe: etudiant.sexe || '',
      parentIds: etudiant.parentIds?.map(String) || []
    });
    setAfficherModalDetail(false);
    setAfficherModal(true);
  };

  const gererDetail = (etudiant) => {
    setEtudiantSelectionne(etudiant);
    setAfficherModalDetail(true);
  };

  const gererSuppression = (etudiant) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${etudiant.prenom} ${etudiant.nom} ?`)) {
      console.log('Suppression élève:', etudiant);
      setEtudiants(etudiants.filter(s => s.id !== etudiant.id));
      setAfficherModalDetail(false);
    }
  };

  const gererVoirProfil = (etudiantId) => {
    setAfficherModalDetail(false);
    navigate(`profil/${etudiantId}`);
  };

  const reinitialiserFormulaire = () => {
    setDonneesFormulaire({
      nom: '',
      prenom: '',
      dateNaissance: '',
      classeId: '',
      telephone: '',
      email: '',
      adresse: '',
      sexe: '',
      parentIds: []
    });
    setEtudiantEnEdition(null);
    setAfficherModal(false);
  };

  const colonnes = [
    {
      header: 'Nom complet',
      accessor: 'nom',
      render: (etudiant) => (<NavLink to={`./profil/${etudiant.id}`}> {etudiant.prenom} {etudiant.nom}</NavLink>)
    },
    {
      header: 'Date de naissance',
      accessor: 'dateNaissance',
      render: (etudiant) => new Date(etudiant.dateNaissance).toLocaleDateString('fr-FR')
    },
    {
      header: 'Classe',
      accessor: 'classeId',
      render: (etudiant) => getNomClasse(etudiant.classeId)
    },
    {
      header: 'Parent(s) Contact',
      accessor: 'parentIds',
      render: (etudiant) => getContactParents(etudiant.parentIds)
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (etudiant) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => gererDetail(etudiant)}
            icon={Eye}
          >
            Détails
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => gererEdition(etudiant)}
            icon={Edit}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => gererSuppression(etudiant)}
            icon={Trash2}
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  const LigneDetail = ({ icon: Icon, label, value }) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      {Icon && <Icon className="w-5 h-5 text-blue-500 flex-shrink-0" />}
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );

  const optionsParents = utilisateurs.filter(u => u.role === 'parent').map(p => ({
    value: p.id,
    label: `${p.prenom} ${p.nom} (ID: ${p.id})`
  }));

  return (
    <div className="space-y-6">
      <div className="block lg:flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des élèves</h1>
          <p className="text-gray-600">Gérer les informations des élèves</p>
        </div>
        <div className='row'>
          <Button onClick={() => setAfficherModal(true)} icon={Plus} className='w-full'>
            Nouvel élève
          </Button>
        </div>

      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <InputField
              placeholder="Rechercher par nom ou prénom..."
              value={texteRecherche}
              onChange={(e) => setTexteRecherche(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filtreClasse}
              onChange={(e) => setFiltreClasse(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Toutes les classes</option>
              {classes.map(classe => (
                <option key={classe.id} value={classe.id.toString()}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={filtreSexe}
              onChange={(e) => setFiltreSexe(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Tous les sexes</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
        </div>

        <Table
          columns={colonnes}
          data={etudiantsFiltres}
        />
      </Card>

      <Modal
        isOpen={afficherModal}
        onClose={reinitialiserFormulaire}
        title={etudiantEnEdition ? 'Modifier l\'élève' : 'Nouvel élève'}
        size="md"
      >
        <form onSubmit={gererSoumission} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Prénom"
              value={donneesFormulaire.prenom}
              onChange={(e) => setDonneesFormulaire({...donneesFormulaire, prenom: e.target.value})}
              required
            />
            <InputField
              label="Nom"
              value={donneesFormulaire.nom}
              onChange={(e) => setDonneesFormulaire({...donneesFormulaire, nom: e.target.value})}
              required
            />
          </div>

          <InputField
            label="Date de naissance"
            type="date"
            value={donneesFormulaire.dateNaissance}
            onChange={(e) => setDonneesFormulaire({...donneesFormulaire, dateNaissance: e.target.value})}
            required
          />

          <InputField
            label="Sexe"
            type="select"
            value={donneesFormulaire.sexe}
            onChange={(e) => setDonneesFormulaire({...donneesFormulaire, sexe: e.target.value})}
            options={[
              { value: '', label: 'Sélectionner le sexe' },
              { value: 'M', label: 'Masculin' },
              { value: 'F', label: 'Féminin' }
            ]}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classe <span className="text-red-500">*</span>
            </label>
            <select
              value={donneesFormulaire.classeId}
              onChange={(e) => setDonneesFormulaire({...donneesFormulaire, classeId: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              required
            >
              <option value="">Sélectionner une classe</option>
              {classes.map(classe => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </div>

          <InputField
            label="Email"
            type="email"
            value={donneesFormulaire.email}
            onChange={(e) => setDonneesFormulaire({...donneesFormulaire, email: e.target.value})}
            required
          />

          <InputField
            label="Téléphone"
            value={donneesFormulaire.telephone}
            onChange={(e) => setDonneesFormulaire({...donneesFormulaire, telephone: e.target.value})}
          />

          <InputField
            label="Adresse"
            value={donneesFormulaire.adresse}
            onChange={(e) => setDonneesFormulaire({...donneesFormulaire, adresse: e.target.value})}
            required
          />

          <InputField
            label="Parent(s) associé(s)"
            type="select"
            multiple
            value={donneesFormulaire.parentIds}
            onChange={(e) => setDonneesFormulaire({...donneesFormulaire, parentIds: Array.from(e.target.selectedOptions, option => option.value)})}
            options={optionsParents}
            placeholder="Sélectionner un ou plusieurs parents"
            className="h-32"
          />
          <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl/Cmd pour sélectionner plusieurs parents</p>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={reinitialiserFormulaire}>
              Annuler
            </Button>
            <Button type="submit">
              {etudiantEnEdition ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de détails */}
      <Modal
        isOpen={afficherModalDetail}
        onClose={() => setAfficherModalDetail(false)}
        title="Détails de l'élève"
        size="md"
      >
        {etudiantSelectionne && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                {etudiantSelectionne.prenom.charAt(0)}{etudiantSelectionne.nom.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {etudiantSelectionne.prenom} {etudiantSelectionne.nom}
                </h3>
                <p className="text-sm text-gray-500">{getNomClasse(etudiantSelectionne.classeId)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Informations Personnelles</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LigneDetail
                  icon={CalendarDays}
                  label="Date de naissance"
                  value={new Date(etudiantSelectionne.dateNaissance).toLocaleDateString('fr-FR')}
                />
                <LigneDetail
                  icon={BookOpen}
                  label="Classe"
                  value={getNomClasse(etudiantSelectionne.classeId)}
                />
                <LigneDetail
                  icon={etudiantSelectionne.sexe === 'M' ? User : User}
                  label="Sexe"
                  value={etudiantSelectionne.sexe === 'M' ? 'Masculin' : etudiantSelectionne.sexe === 'F' ? 'Féminin' : 'Non spécifié'}
                />
                <LigneDetail
                  icon={BadgeCheck}
                  label="Matricule"
                  value={(etudiantSelectionne.matricule)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Coordonnées Élève</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LigneDetail
                  icon={Mail}
                  label="Email"
                  value={etudiantSelectionne.email}
                />
                <LigneDetail
                  icon={Phone}
                  label="Téléphone"
                  value={etudiantSelectionne.telephone}
                />
                <LigneDetail
                  icon={Home}
                  label="Adresse"
                  value={etudiantSelectionne.adresse}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setAfficherModalDetail(false)}>
                Fermer
              </Button>
              <Button variant="secondary" onClick={() => gererEdition(etudiantSelectionne)} icon={Edit}>
                Modifier
              </Button>
              <Button variant="danger" onClick={() => gererSuppression(etudiantSelectionne)} icon={Trash2}>
                Supprimer
              </Button>

              <Button
                variant="primary"
                onClick={() => gererVoirProfil(etudiantSelectionne.id)}
                icon={Eye}
              >
                Voir profil complet
              </Button>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
};

export default Eleves;
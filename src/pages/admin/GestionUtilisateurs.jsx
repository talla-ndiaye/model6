import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { utilisateurs } from '../../data/donneesTemporaires';

const GestionUtilisateurs = () => {
  const [utilisateursData, setUtilisateursData] = useState(utilisateurs);
  const [afficherModal, setAfficherModal] = useState(false);
  const [utilisateurEnEdition, setUtilisateurEnEdition] = useState(null);
  const [texteRecherche, setTexteRecherche] = useState('');
  const [filtreRole, setFiltreRole] = useState('');
  const [donneesFormulaire, setDonneesFormulaire] = useState({
    nom: '',
    prenom: '',
    email: '',
    role: 'eleve',
    telephone: '',
    motDePasse: ''
  });

  const roles = ['admin', 'enseignant', 'parent', 'eleve', 'comptable'];

  const utilisateursFiltres = utilisateursData.filter(utilisateur => {
    const correspondRecherche = utilisateur.nom.toLowerCase().includes(texteRecherche.toLowerCase()) ||
      utilisateur.prenom.toLowerCase().includes(texteRecherche.toLowerCase()) ||
      utilisateur.email.toLowerCase().includes(texteRecherche.toLowerCase());
    const correspondRole = filtreRole === '' || utilisateur.role === filtreRole;
    return correspondRecherche && correspondRole;
  });

  const gererSoumission = (e) => {
    e.preventDefault();

    if (utilisateurEnEdition) {
      console.log('Modification utilisateur:', { ...donneesFormulaire, id: utilisateurEnEdition.id });
      setUtilisateursData(utilisateursData.map(utilisateur =>
        utilisateur.id === utilisateurEnEdition.id ? { ...donneesFormulaire, id: utilisateur.id } : utilisateur
      ));
    } else {
      const nouvelUtilisateur = {
        ...donneesFormulaire,
        id: Math.max(...utilisateursData.map(u => u.id)) + 1
      };
      console.log('Ajout utilisateur:', nouvelUtilisateur);
      setUtilisateursData([...utilisateursData, nouvelUtilisateur]);
    }

    reinitialiserFormulaire();
  };

  const gererEdition = (utilisateur) => {
    setUtilisateurEnEdition(utilisateur);
    setDonneesFormulaire({
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      role: utilisateur.role,
      telephone: utilisateur.telephone,
      motDePasse: ''
    });
    setAfficherModal(true);
  };

  const gererSuppression = (utilisateur) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${utilisateur.prenom} ${utilisateur.nom} ?`)) {
      console.log('Suppression utilisateur:', utilisateur);
      setUtilisateursData(utilisateursData.filter(u => u.id !== utilisateur.id));
    }
  };

  const reinitialiserFormulaire = () => {
    setDonneesFormulaire({
      nom: '',
      prenom: '',
      email: '',
      role: 'eleve',
      telephone: '',
      motDePasse: ''
    });
    setUtilisateurEnEdition(null);
    setAfficherModal(false);
  };

  const colonnes = [
    {
      header: 'Nom complet',
      accessor: 'nom',
      render: (utilisateur) => `${utilisateur.prenom} ${utilisateur.nom}`
    },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Rôle',
      accessor: 'role',
      render: (utilisateur) => (
        <span className={`px-2 py-1 text-xs rounded-full capitalize ${
          utilisateur.role === 'admin' ? 'bg-red-100 text-red-800' :
          utilisateur.role === 'enseignant' ? 'bg-blue-100 text-blue-800' :
          utilisateur.role === 'parent' ? 'bg-green-100 text-green-800' :
          utilisateur.role === 'eleve' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {utilisateur.role}
        </span>
      )
    },
    { header: 'Téléphone', accessor: 'telephone' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (utilisateur) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => gererEdition(utilisateur)}
            icon={Edit}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => gererSuppression(utilisateur)}
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600">Gérer tous les comptes utilisateurs</p>
        </div>
        <Button onClick={() => setAfficherModal(true)} icon={Plus}>
          Nouvel utilisateur
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <InputField
              placeholder="Rechercher par nom, prénom ou email..."
              value={texteRecherche}
              onChange={(e) => setTexteRecherche(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filtreRole}
              onChange={(e) => setFiltreRole(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les rôles</option>
              {roles.map(role => (
                <option key={role} value={role} className="capitalize">
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table
          columns={colonnes}
          data={utilisateursFiltres}
        />
      </Card>

      <Modal
        isOpen={afficherModal}
        onClose={reinitialiserFormulaire}
        title={utilisateurEnEdition ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle <span className="text-red-500">*</span>
            </label>
            <select
              value={donneesFormulaire.role}
              onChange={(e) => setDonneesFormulaire({...donneesFormulaire, role: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {roles.map(role => (
                <option key={role} value={role} className="capitalize">
                  {role}
                </option>
              ))}
            </select>
          </div>

          <InputField
            label={utilisateurEnEdition ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
            type="password"
            value={donneesFormulaire.motDePasse}
            onChange={(e) => setDonneesFormulaire({...donneesFormulaire, motDePasse: e.target.value})}
            required={!utilisateurEnEdition}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={reinitialiserFormulaire}>
              Annuler
            </Button>
            <Button type="submit">
              {utilisateurEnEdition ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GestionUtilisateurs;
import { Edit, Eye, Plus, Search, Trash2, Upload, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { classes, enseignants } from '../../data/donneesTemporaires';

const Classes = () => {
  const [sallesDeClasse, setSallesDeClasse] = useState(classes);
  const [afficherModal, setAfficherModal] = useState(false);
  const [classeEnEdition, setClasseEnEdition] = useState(null);
  const [texteRecherche, setTexteRecherche] = useState('');
  const [filtreNiveau, setFiltreNiveau] = useState('');

  const navigate = useNavigate();

  const [donneesFormulaire, setDonneesFormulaire] = useState({
    nom: '',
    niveau: '',
    enseignantPrincipal: '',
    nombreEleves: '',
    salle: ''
  });

  const niveaux = ['6e', '5e', '4e', '3e', '2nd', '1er', 'Tle'];

  const sallesDeClasseFiltrees = sallesDeClasse.filter(salleDeClasse => {
    const correspondRecherche = salleDeClasse.nom.toLowerCase().includes(texteRecherche.toLowerCase()) ||
      salleDeClasse.salle.toLowerCase().includes(texteRecherche.toLowerCase());
    const correspondNiveau = filtreNiveau === '' || salleDeClasse.niveau === filtreNiveau;
    return correspondRecherche && correspondNiveau;
  });

  const getNomEnseignant = (enseignantId) => {
    const enseignant = enseignants.find(e => e.id === enseignantId);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Non assigné';
  };

  const gererSoumission = (e) => {
    e.preventDefault();

    const donneesClasse = {
      ...donneesFormulaire,
      enseignantPrincipal: parseInt(donneesFormulaire.enseignantPrincipal),
      nombreEleves: classeEnEdition ? parseInt(donneesFormulaire.nombreEleves) : 0,
    };

    if (classeEnEdition) {
      console.log('Modification classe:', { ...donneesClasse, id: classeEnEdition.id });
      setSallesDeClasse(sallesDeClasse.map(salleDeClasse =>
        salleDeClasse.id === classeEnEdition.id ? { ...donneesClasse, id: salleDeClasse.id } : salleDeClasse
      ));
    } else {
      const nouvelleClasse = {
        ...donneesClasse,
        id: Math.max(...sallesDeClasse.map(c => c.id)) + 1
      };
      console.log('Ajout classe:', nouvelleClasse);
      setSallesDeClasse([...sallesDeClasse, nouvelleClasse]);
    }

    reinitialiserFormulaire();
  };

  const gererEdition = (salleDeClasse) => {
    setClasseEnEdition(salleDeClasse);
    setDonneesFormulaire({
      nom: salleDeClasse.nom,
      niveau: salleDeClasse.niveau,
      enseignantPrincipal: salleDeClasse.enseignantPrincipal.toString(),
      nombreEleves: salleDeClasse.nombreEleves.toString(),
      salle: salleDeClasse.salle
    });
    setAfficherModal(true);
  };

  const gererImportationEleves = () => {
    if (classeEnEdition) {
      navigate(`/admin/import-eleves/classe/${classeEnEdition.id}`);
    }
    setAfficherModal(false);
  };

  const reinitialiserFormulaire = () => {
    setDonneesFormulaire({
      nom: '',
      niveau: '',
      enseignantPrincipal: '',
      nombreEleves: '',
      salle: ''
    });
    setClasseEnEdition(null);
    setAfficherModal(false);
  };

  const colonnes = [
    { header: 'Nom', accessor: 'nom' },
    { header: 'Niveau', accessor: 'niveau' },
    {
      header: 'Enseignant principal',
      accessor: 'enseignantPrincipal',
      render: (salleDeClasse) => getNomEnseignant(salleDeClasse.enseignantPrincipal)
    },
    {
      header: 'Effectif',
      accessor: 'nombreEleves',
      render: (salleDeClasse) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1 text-gray-500" />
          {salleDeClasse.nombreEleves}
        </div>
      )
    },
    { header: 'Salle', accessor: 'salle' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (salleDeClasse) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`./details/${salleDeClasse.id}`)}
            icon={Eye}
          >
            Détails
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => gererEdition(salleDeClasse)}
            icon={Edit}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="danger"

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des classes</h1>
          <p className="text-gray-600">Organiser les classes et leurs enseignants</p>
        </div>
        <Button onClick={() => setAfficherModal(true)} icon={Plus}>
          Nouvelle classe
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <InputField
              placeholder="Rechercher par nom de classe ou salle..."
              value={texteRecherche}
              onChange={(e) => setTexteRecherche(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filtreNiveau}
              onChange={(e) => setFiltreNiveau(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Tous les niveaux</option>
              {niveaux.map(niveau => (
                <option key={niveau} value={niveau}>
                  {niveau}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table columns={colonnes} data={sallesDeClasseFiltrees} />
      </Card>

      <Modal
        isOpen={afficherModal}
        onClose={reinitialiserFormulaire}
        title={classeEnEdition ? 'Modifier la classe' : 'Nouvelle classe'}
        size="md"
      >
        <form onSubmit={gererSoumission} className="space-y-4">
          <InputField
            label="Nom de la classe"
            value={donneesFormulaire.nom}
            onChange={(e) => setDonneesFormulaire({ ...donneesFormulaire, nom: e.target.value })}
            placeholder="ex: Terminale S1"
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau <span className="text-red-500">*</span>
            </label>
            <select
              value={donneesFormulaire.niveau}
              onChange={(e) => setDonneesFormulaire({ ...donneesFormulaire, niveau: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              required
            >
              <option value="">Sélectionner un niveau</option>
              {niveaux.map(niveau => (
                <option key={niveau} value={niveau}>
                  {niveau}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enseignant principal
            </label>
            <select
              value={donneesFormulaire.enseignantPrincipal}
              onChange={(e) => setDonneesFormulaire({ ...donneesFormulaire, enseignantPrincipal: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Aucun enseignant assigné</option>
              {enseignants.map(enseignant => (
                <option key={enseignant.id} value={enseignant.id}>
                  {enseignant.prenom} {enseignant.nom}
                </option>
              ))}
            </select>
          </div>

          <InputField
            label="Nombre d'élèves (sera mis à jour automatiquement)"
            type="number"
            value={donneesFormulaire.nombreEleves}
            onChange={(e) => setDonneesFormulaire({ ...donneesFormulaire, nombreEleves: e.target.value })}
            min="0"
            max="100"
            disabled={!classeEnEdition}
            className={!classeEnEdition ? 'bg-gray-100 cursor-not-allowed' : ''}
          />

          <InputField
            label="Salle"
            value={donneesFormulaire.salle}
            onChange={(e) => setDonneesFormulaire({ ...donneesFormulaire, salle: e.target.value })}
            placeholder="ex: A101"
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={reinitialiserFormulaire}>
              Annuler
            </Button>
            <Button type="submit">
              {classeEnEdition ? 'Modifier' : 'Créer'}
            </Button>
            {classeEnEdition && (
              <Button
                variant="secondary"
                onClick={gererImportationEleves}
                icon={Upload}
              >
                Importer élèves
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Classes;
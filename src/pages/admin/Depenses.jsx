import {
  Calendar,
  DollarSign,
  Edit2,
  Eye,
  PlusCircle,
  Search,
  Tag,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

import { depenses as initialDepenses } from '../../data/donneesTemporaires';

const GestionDepenses = () => {
  const [depenses, setDepenses] = useState(initialDepenses);
  const [estModalAjoutOuvert, setEstModalAjoutOuvert] = useState(false);
  const [estModalDetailsOuvert, setEstModalDetailsOuvert] = useState(false);
  const [depenseSelectionnee, setDepenseSelectionnee] = useState(null);

  const [formulaireDepense, setFormulaireDepense] = useState({
    id: null,
    description: '',
    montant: '',
    date: '',
    categorie: ''
  });

  const [filtreCategorie, setFiltreCategorie] = useState('');
  const [filtrePeriode, setFiltrePeriode] = useState('');
  const [texteRecherche, setTexteRecherche] = useState('');

  const getProchainId = () => {
    return depenses.length > 0 ? Math.max(...depenses.map(d => d.id)) + 1 : 1;
  };

  const estDateDansPeriode = (dateDepenseString, periode) => {
    const dateDepense = new Date(dateDepenseString);
    const maintenant = new Date();
    maintenant.setHours(0, 0, 0, 0);

    switch (periode) {
      case 'today':
        return dateDepense.toDateString() === maintenant.toDateString();
      case 'this_week':
        const debutSemaine = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() - maintenant.getDay());
        const finSemaine = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() - maintenant.getDay() + 6);
        return dateDepense >= debutSemaine && dateDepense <= finSemaine;
      case 'this_month':
        return dateDepense.getMonth() === maintenant.getMonth() && dateDepense.getFullYear() === maintenant.getFullYear();
      case 'this_year':
        return dateDepense.getFullYear() === maintenant.getFullYear();
      default:
        return true;
    }
  };

  const depensesFiltrees = useMemo(() => {
    let depensesActuelles = depenses;

    if (filtreCategorie !== '') {
      depensesActuelles = depensesActuelles.filter(d => d.categorie === filtreCategorie);
    }
    if (filtrePeriode !== '') {
      depensesActuelles = depensesActuelles.filter(d => estDateDansPeriode(d.date, filtrePeriode));
    }
    if (texteRecherche) {
      const texteRechercheMin = texteRecherche.toLowerCase();
      depensesActuelles = depensesActuelles.filter(d =>
        d.description.toLowerCase().includes(texteRechercheMin) ||
        d.categorie.toLowerCase().includes(texteRechercheMin)
      );
    }
    return depensesActuelles.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [depenses, filtreCategorie, filtrePeriode, texteRecherche]);

  const donneesEvolutionDepenses = useMemo(() => {
    const maintenant = new Date();
    const anneeActuelle = maintenant.getFullYear();
    const moisActuel = maintenant.getMonth();

    const donnees = [];
    for (let i = 11; i >= 0; i--) {
      let m = moisActuel - i;
      let y = anneeActuelle;
      if (m < 0) { m += 12; y -= 1; }
      donnees.push({
        name: new Date(y, m, 1).toLocaleString('fr-FR', { month: 'short', year: '2-digit' }),
        Montant: 0
      });
    }

    depenses.forEach(d => {
      const dateDepense = new Date(d.date);
      const libelleMois = dateDepense.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
      const index = donnees.findIndex(item => item.name === libelleMois);
      if (index !== -1) {
        donnees[index].Montant += d.montant;
      }
    });
    return donnees;
  }, [depenses]);

  const statistiques = useMemo(() => {
    const now = new Date(); // Define now here
    const totalMoisActuel = depenses.filter(d => {
      const dDate = new Date(d.date);
      return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear();
    }).reduce((somme, d) => somme + d.montant, 0);

    const totalAnnee = depenses.filter(d => {
        const dDate = new Date(d.date);
        return dDate.getFullYear() === now.getFullYear();
    }).reduce((somme, d) => somme + d.montant, 0);

    return { totalMoisActuel, totalAnnee };
  }, [depenses]);

  const ouvrirModalAjout = () => {
    setFormulaireDepense({
      id: null,
      description: '',
      montant: '',
      date: new Date().toISOString().split('T')[0],
      categorie: ''
    });
    setEstModalAjoutOuvert(true);
  };

  const ouvrirModalModification = (depense) => {
    setDepenseSelectionnee(depense);
    setFormulaireDepense({
      id: depense.id,
      description: depense.description,
      montant: depense.montant,
      date: depense.date,
      categorie: depense.categorie
    });
    setEstModalAjoutOuvert(true);
  };

  const ouvrirModalDetails = (depense) => {
    setDepenseSelectionnee(depense);
    setEstModalDetailsOuvert(true);
  };

  const fermerModalAjout = () => {
    setEstModalAjoutOuvert(false);
    setDepenseSelectionnee(null);
  };

  const fermerModalDetails = () => {
    setEstModalDetailsOuvert(false);
    setDepenseSelectionnee(null);
  };

  const gererChangementFormulaire = (e) => {
    const { name, value } = e.target;
    setFormulaireDepense(prev => ({ ...prev, [name]: value }));
  };

  const gererSoumissionAjout = (e) => {
    e.preventDefault();
    if (!formulaireDepense.description || !formulaireDepense.montant || !formulaireDepense.date || !formulaireDepense.categorie) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    if (depenseSelectionnee) {
      setDepenses(prevDepenses => prevDepenses.map(d =>
        d.id === formulaireDepense.id ? { ...formulaireDepense, montant: parseFloat(formulaireDepense.montant) } : d
      ));
      console.log("Dépense modifiée:", { ...formulaireDepense, montant: parseFloat(formulaireDepense.montant) });
    } else {
      const nouvelleDepense = {
        ...formulaireDepense,
        id: getProchainId(),
        montant: parseFloat(formulaireDepense.montant)
      };
      setDepenses(prevDepenses => [...prevDepenses, nouvelleDepense]);
      console.log("Nouvelle dépense ajoutée:", nouvelleDepense);
    }
    fermerModalAjout();
  };

  const gererSuppressionDepense = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      setDepenses(prevDepenses => prevDepenses.filter(d => d.id !== id));
      console.log("Dépense supprimée:", id);
    }
  };

  const colonnes = [
    { header: 'Description', accessor: 'description' },
    {
      header: 'Montant',
      accessor: 'montant',
      render: (depense) => `${depense.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}`
    },
    { header: 'Catégorie', accessor: 'categorie' },
    {
      header: 'Date',
      accessor: 'date',
      render: (depense) => new Date(depense.date).toLocaleDateString('fr-FR')
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (depense) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" icon={Eye} onClick={() => ouvrirModalDetails(depense)} className="p-2">
          </Button>
          <Button size="sm" variant="info" icon={Edit2} onClick={() => ouvrirModalModification(depense)} className="p-2">
          </Button>
          <Button size="sm" variant="danger" icon={Trash2} onClick={() => gererSuppressionDepense(depense.id)} className="p-2">
          </Button>
        </div>
      )
    }
  ];

  const categoriesUniques = useMemo(() => {
    const categories = new Set(initialDepenses.map(d => d.categorie));
    return ['Toutes les catégories', ...Array.from(categories).sort()];
  }, [initialDepenses]);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Dépenses</h1>
        <p className="text-gray-600 text-lg">Suivi détaillé de toutes les dépenses de l'établissement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total dépenses ce mois</p>
              <p className="text-2xl font-semibold text-gray-900">{statistiques.totalMoisActuel.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total dépenses cette année</p>
              <p className="text-2xl font-semibold text-gray-900">{statistiques.totalAnnee.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Évolution Mensuelle des Dépenses</h2>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={donneesEvolutionDepenses}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value) => `${(value / 1000).toLocaleString('fr-FR')}K FCFA`} />
              <Tooltip formatter={(value) => `${value.toLocaleString('fr-FR')} FCFA`} />
              <Legend />
              <Line type="monotone" dataKey="Montant" stroke="#01579B" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 shadow-lg">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Historique des Dépenses</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dépense..."
                value={texteRecherche}
                onChange={(e) => setTexteRecherche(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="relative flex items-center">
              <Calendar className="absolute left-3 w-4 h-4 text-gray-400" />
              <select
                value={filtrePeriode}
                onChange={(e) => setFiltrePeriode(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
              >
                <option value="">Toute période</option>
                <option value="today">Aujourd'hui</option>
                <option value="this_week">Cette semaine</option>
                <option value="this_month">Ce mois</option>
                <option value="this_year">Cette année</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="relative flex items-center">
              <Tag className="absolute left-3 w-4 h-4 text-gray-400" />
              <select
                value={filtreCategorie}
                onChange={(e) => setFiltreCategorie(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
              >
                {categoriesUniques.map(cat => (
                  <option key={cat} value={cat === 'Toutes les catégories' ? '' : cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <Button onClick={ouvrirModalAjout} icon={PlusCircle} className="px-4 py-2">
              Ajouter Dépense
            </Button>
          </div>
        </div>
        <Table columns={colonnes} data={depensesFiltrees} />
      </Card>

      <Modal
        isOpen={estModalAjoutOuvert}
        onClose={fermerModalAjout}
        title={depenseSelectionnee ? "Modifier la dépense" : "Ajouter une nouvelle dépense"}
        size="sm"
      >
        <form onSubmit={gererSoumissionAjout} className="space-y-4 p-2">
          <InputField
            label="Description"
            name="description"
            value={formulaireDepense.description}
            onChange={gererChangementFormulaire}
            placeholder="Ex: Salaires du mois de juin"
            required
          />
          <InputField
            label="Montant (FCFA)"
            name="montant"
            type="number"
            value={formulaireDepense.montant}
            onChange={gererChangementFormulaire}
            placeholder="Ex: 1500000"
            required
          />
          <InputField
            label="Date"
            name="date"
            type="date"
            value={formulaireDepense.date}
            onChange={gererChangementFormulaire}
            required
          />
          <div className="relative">
            <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              id="categorie"
              name="categorie"
              value={formulaireDepense.categorie}
              onChange={gererChangementFormulaire}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {initialDepenses.map(d => d.categorie).filter((value, index, self) => self.indexOf(value) === index).sort().map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={fermerModalAjout}>
              Annuler
            </Button>
            <Button type="submit">
              {depenseSelectionnee ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={estModalDetailsOuvert}
        onClose={fermerModalDetails}
        title="Détails de la dépense"
        size="sm"
      >
        {depenseSelectionnee && (
          <div className="space-y-3 text-gray-700 p-2">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <h3 className="font-bold text-lg text-blue-800 mb-1">{depenseSelectionnee.description}</h3>
              <p className="text-2xl font-bold text-gray-900">{depenseSelectionnee.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
            </div>
            <p><span className="font-medium">Catégorie:</span> {depenseSelectionnee.categorie}</p>
            <p><span className="font-medium">Date:</span> {new Date(depenseSelectionnee.date).toLocaleDateString('fr-FR')}</p>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={fermerModalDetails}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GestionDepenses;
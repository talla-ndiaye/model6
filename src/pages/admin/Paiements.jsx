import { AlertCircle, Calendar, CheckCircle, Clock, CreditCard, Eye, Filter, Search, TrendingUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

import { classes, eleves, paiements } from '../../data/donneesTemporaires';

const Paiements = () => {
  const [paiementsData, setPaiementsData] = useState(paiements); 
  const [filtreStatut, setFiltreStatut] = useState('');
  const [filtrePeriode, setFiltrePeriode] = useState('');
  const [filtreClasse, setFiltreClasse] = useState('');
  const [texteRecherche, setTexteRecherche] = useState('');

  const [estModalDetailsOuvert, setEstModalDetailsOuvert] = useState(false);
  const [detailsPaiementSelectionne, setDetailsPaiementSelectionne] = useState(null);

  const getNomEleve = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getNomClasse = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const ouvrirModalDetails = (paiement) => {
    setDetailsPaiementSelectionne(paiement);
    setEstModalDetailsOuvert(true);
  };

  const fermerModalDetails = () => {
    setEstModalDetailsOuvert(false);
    setDetailsPaiementSelectionne(null);
  };

  // filtrage par date
  const estDateDansPeriode = (datePaiementString, periode) => {
    const datePaiement = new Date(datePaiementString);
    const maintenant = new Date();
    // Réinitialiser l'heure pour une comparaison précise des dates (aujourd'hui, cette_semaine)
    maintenant.setHours(0,0,0,0); 

    switch (periode) {
      case 'today':
        return datePaiement.toDateString() === maintenant.toDateString();
      case 'this_week':
        const debutSemaine = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() - maintenant.getDay());
        const finSemaine = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() - maintenant.getDay() + 6); 
        return datePaiement >= debutSemaine && datePaiement <= finSemaine;
      case 'this_month':
        return datePaiement.getMonth() === maintenant.getMonth() && datePaiement.getFullYear() === maintenant.getFullYear();
      case 'this_year':
        return datePaiement.getFullYear() === maintenant.getFullYear();
      default:
        return true; // Pas de filtre de période
    }
  };

  // --- Filtrage des données et mémorisation ---
  const paiementsFiltres = useMemo(() => {
    let paiementsActuels = paiementsData;

    // Filtrer par statut
    if (filtreStatut !== '') {
      paiementsActuels = paiementsActuels.filter(paiement => paiement.statut === filtreStatut);
    }
    // Filtrer par période
    if (filtrePeriode !== '') {
      paiementsActuels = paiementsActuels.filter(paiement => estDateDansPeriode(paiement.date, filtrePeriode));
    }
    // Filtrer par classe
    if (filtreClasse !== '') {
      paiementsActuels = paiementsActuels.filter(paiement => {
        const eleve = eleves.find(e => e.id === paiement.eleveId);
        return eleve && String(eleve.classeId) === String(filtreClasse);
      });
    }
    // Rechercher par nom d'élève
    if (texteRecherche) {
      const texteRechercheMin = texteRecherche.toLowerCase();
      paiementsActuels = paiementsActuels.filter(paiement =>
        getNomEleve(paiement.eleveId).toLowerCase().includes(texteRechercheMin)
      );
    }
    return paiementsActuels;
  }, [paiementsData, filtreStatut, filtrePeriode, filtreClasse, texteRecherche]);

  // --- Calcul des statistiques ---
  const statistiques = useMemo(() => {
    const total = paiementsData.reduce((somme, p) => somme + p.montant, 0);
    const paye = paiementsData.filter(p => p.statut === 'Payé').reduce((somme, p) => somme + p.montant, 0);
    const enAttente = paiementsData.filter(p => p.statut === 'En attente').reduce((somme, p) => somme + p.montant, 0);
    const enRetard = paiementsData.filter(p => p.statut === 'En retard').reduce((somme, p) => somme + p.montant, 0);
    const tauxCollecte = total > 0 ? ((paye / total) * 100).toFixed(1) : 0;

    return { total, paye, enAttente, enRetard, tauxCollecte };
  }, [paiementsData]);

  //  colonnes du tableau ---
  const colonnes = [
    {
      header: 'Élève',
      accessor: 'eleveId',
      render: (paiement) => getNomEleve(paiement.eleveId)
    },
    {
      header: 'Classe',
      accessor: 'classeId',
      render: (paiement) => {
        const eleve = eleves.find(e => e.id === paiement.eleveId);
        return eleve ? getNomClasse(eleve.classeId) : 'N/A';
      }
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (paiement) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          paiement.type === 'Frais de scolarité' ? 'bg-blue-100 text-blue-800' : 
          paiement.type === 'Cotisation APEL' ? 'bg-green-100 text-green-800' : 
          paiement.type === 'Activité sportive' ? 'bg-purple-100 text-purple-800' : 
          paiement.type === 'Contribution voyage scolaire' ? 'bg-indigo-100 text-indigo-800' : 
          paiement.type === 'Achats fournitures' ? 'bg-pink-100 text-pink-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {paiement.type}
        </span>
      )
    },
    {
      header: 'Montant',
      accessor: 'montant',
      render: (paiement) => `${paiement.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}`
    },
    {
      header: 'Statut',
      accessor: 'statut',
      render: (paiement) => (
        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
          paiement.statut === 'Payé' ? 'bg-green-100 text-green-800' :
          paiement.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
          paiement.statut === 'En retard' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {paiement.statut === 'Payé' && <CheckCircle className="w-3 h-3" />}
          {paiement.statut === 'En attente' && <AlertCircle className="w-3 h-3" />}
          {paiement.statut === 'En retard' && <Clock className="w-3 h-3" />}
          {paiement.statut}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (paiement) => new Date(paiement.date).toLocaleDateString('fr-FR')
    },
    { header: 'Méthode', accessor: 'methode' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (paiement) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => ouvrirModalDetails(paiement)}
            className="px-3 py-1 text-xs"
            icon={Eye}
          >
            Détails
          </Button>
        </div>
      )
    }
  ];

  //classes uniques ayant des paiements associés
  const classesUniques = useMemo(() => {
    const idsClassesAvecPaiements = new Set(paiements.map(p => eleves.find(e => e.id === p.eleveId)?.classeId).filter(Boolean));
    const classesAvecPaiements = classes.filter(c => idsClassesAvecPaiements.has(c.id));
    return ['Toutes les classes', ...classesAvecPaiements.map(c => c.nom)];
  }, [paiements, eleves, classes]);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Paiements</h1>
        <p className="text-gray-600 text-lg">Suivi complet des paiements et de la situation financière des élèves.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Montant total attendu</p>
              <p className="text-2xl font-semibold text-gray-900">{statistiques.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total encaissé</p>
              <p className="text-2xl font-semibold text-gray-900">{statistiques.paye.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Montant en attente</p>
              <p className="text-2xl font-semibold text-gray-900">{statistiques.enAttente.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Montant en retard</p>
              <p className="text-2xl font-semibold text-gray-900">{statistiques.enRetard.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
              <p className="text-sm text-gray-600 mt-1">Taux de collecte: <span className="font-semibold text-blue-600">{statistiques.tauxCollecte}%</span></p>
            </div>
          </div>
        </Card>
      </div>

      {/* Paiements */}
      <Card className="p-6 shadow-lg">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">Détails des Paiements</h2>
          <div className="flex flex-wrap items-center gap-4">
            {/* Rechercher par nom ou prénom, ou matricule ou téléphone */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher élève..."
                value={texteRecherche}
                onChange={(e) => setTexteRecherche(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Filtre par Période */}
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

            {/* Filtre par statut */}
            <div className="relative flex items-center">
              <Filter className="absolute left-3 w-4 h-4 text-gray-400" />
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
              >
                <option value="">Tous les statuts</option>
                <option value="Payé">Payé</option>
                <option value="En attente">En attente</option>
                <option value="En retard">En retard</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            {/* Filtre par Classe */}
            <div className="relative flex items-center">
              <Users className="absolute left-3 w-4 h-4 text-gray-400" />
              <select
                value={filtreClasse}
                onChange={(e) => setFiltreClasse(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
              >
                {classesUniques.map(nomClasse => (
                  <option key={nomClasse} value={nomClasse === 'Toutes les classes' ? '' : classes.find(c => c.nom === nomClasse)?.id || ''}>
                    {nomClasse}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        <Table columns={colonnes} data={paiementsFiltres} />
      </Card>

      {/* Modal Détails Paiement */}
      <Modal
        isOpen={estModalDetailsOuvert}
        onClose={fermerModalDetails}
        title="Détails du Paiement"
        size="md"
      >
        {detailsPaiementSelectionne && (
          <div className="space-y-4 text-gray-700">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-bold text-lg text-blue-800 mb-2">Paiement pour {getNomEleve(detailsPaiementSelectionne.eleveId)}</h3>
              <p><span className="font-medium">Montant:</span> {detailsPaiementSelectionne.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
              <p><span className="font-medium">Type:</span> {detailsPaiementSelectionne.type}</p>
              <p><span className="font-medium">Statut:</span> <span className={`px-2 py-0.5 text-sm rounded-full ${
                detailsPaiementSelectionne.statut === 'Payé' ? 'bg-green-100 text-green-800' :
                detailsPaiementSelectionne.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>{detailsPaiementSelectionne.statut}</span></p>
            </div>
            <p><span className="font-medium">Date:</span> {new Date(detailsPaiementSelectionne.date).toLocaleDateString('fr-FR')}</p>
            {detailsPaiementSelectionne.dateEcheance && (
              <p><span className="font-medium">Date d'échéance:</span> {new Date(detailsPaiementSelectionne.dateEcheance).toLocaleDateString('fr-FR')}</p>
            )}
            <p><span className="font-medium">Méthode:</span> {detailsPaiementSelectionne.methode || 'N/A'}</p>
            {detailsPaiementSelectionne.description && (
              <p><span className="font-medium">Description:</span> {detailsPaiementSelectionne.description}</p>
            )}
            {detailsPaiementSelectionne.reference && (
              <p><span className="font-medium">Référence:</span> {detailsPaiementSelectionne.reference}</p>
            )}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={fermerModalDetails}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Paiements;
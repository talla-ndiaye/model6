import { AlertCircle, Calendar, CheckCircle, Clock, CreditCard, Eye, Filter, Search, TrendingUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

import { classes, eleves, paiements } from '../../data/donneesTemporaires';

const Paiements = () => {
  const [payments, setPayments] = useState(paiements);
  const [filterStatut, setFilterStatut] = useState('');
  // const [filterType, setFilterType] = useState(''); // Removed filterType state
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);

  // --- Helper Functions ---
  const getEleveName = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const updatePaymentStatus = (paymentId, newStatut) => {
    setPayments(prevPayments => prevPayments.map(payment =>
      payment.id === paymentId ? { ...payment, statut: newStatut } : payment
    ));
    console.log('Mise à jour statut paiement:', paymentId, newStatut);
  };

  // --- Modal Functions for Details ---
  const openDetailsModal = (payment) => {
    setSelectedPaymentDetails(payment);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPaymentDetails(null);
  };

  // --- Date Filtering Logic ---
  const isDateInPeriod = (paymentDateString, period) => {
    const paymentDate = new Date(paymentDateString);
    const now = new Date();

    switch (period) {
      case 'today':
        return paymentDate.toDateString() === now.toDateString();
      case 'this_week':
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()); // Sunday (adjust if your week starts on Monday)
        const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6); // Saturday
        return paymentDate >= startOfWeek && paymentDate <= endOfWeek;
      case 'this_month':
        return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
      case 'this_year':
        return paymentDate.getFullYear() === now.getFullYear();
      default:
        return true; // No period filter
    }
  };

  // --- Data Filtering and Memoization ---
  const filteredPayments = useMemo(() => {
    let currentPayments = payments;

    // Filter by Status
    if (filterStatut !== '') {
      currentPayments = currentPayments.filter(payment => payment.statut === filterStatut);
    }
    // Filter by Period
    if (filterPeriod !== '') {
      currentPayments = currentPayments.filter(payment => isDateInPeriod(payment.date, filterPeriod));
    }
    // Filter by Class
    if (filterClass !== '') {
      currentPayments = currentPayments.filter(payment => {
        const eleve = eleves.find(e => e.id === payment.eleveId);
        return eleve && String(eleve.classeId) === String(filterClass);
      });
    }
    // Search by Student Name
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentPayments = currentPayments.filter(payment =>
        getEleveName(payment.eleveId).toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    // filterType is removed from here
    return currentPayments;
  }, [payments, filterStatut, filterPeriod, filterClass, searchTerm]); // Removed filterType from dependencies

  // --- Statistics Calculation ---
  const stats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + p.montant, 0);
    const paye = payments.filter(p => p.statut === 'Payé').reduce((sum, p) => sum + p.montant, 0);
    const enAttente = payments.filter(p => p.statut === 'En attente').reduce((sum, p) => sum + p.montant, 0);
    const enRetard = payments.filter(p => p.statut === 'En retard').reduce((sum, p) => sum + p.montant, 0);
    const tauxCollecte = total > 0 ? ((paye / total) * 100).toFixed(1) : 0;

    return { total, paye, enAttente, enRetard, tauxCollecte };
  }, [payments]);

  // --- Table Columns Definition ---
  const columns = [
    {
      header: 'Élève',
      accessor: 'eleveId',
      render: (payment) => getEleveName(payment.eleveId)
    },
    {
      header: 'Classe',
      accessor: 'classeId',
      render: (payment) => {
        const eleve = eleves.find(e => e.id === payment.eleveId);
        return eleve ? getClassName(eleve.classeId) : 'N/A';
      }
    },
    {
      header: 'Type', // Keep 'Type' column in table, but remove filter option
      accessor: 'type',
      render: (payment) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          payment.type === 'Scolarité' ? 'bg-blue-100 text-blue-800' :
          payment.type === 'Cantine' ? 'bg-green-100 text-green-800' :
          payment.type === 'Activités' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {payment.type}
        </span>
      )
    },
    {
      header: 'Montant',
      accessor: 'montant',
      render: (payment) => `${payment.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}`
    },
    {
      header: 'Statut',
      accessor: 'statut',
      render: (payment) => (
        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
          payment.statut === 'Payé' ? 'bg-green-100 text-green-800' :
          payment.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
          payment.statut === 'En retard' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {payment.statut === 'Payé' && <CheckCircle className="w-3 h-3" />}
          {payment.statut === 'En attente' && <AlertCircle className="w-3 h-3" />}
          {payment.statut === 'En retard' && <Clock className="w-3 h-3" />}
          {payment.statut}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (payment) => new Date(payment.date).toLocaleDateString('fr-FR')
    },
    { header: 'Méthode', accessor: 'methode' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (payment) => (
        <div className="flex space-x-2">
          {payment.statut !== 'Payé' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => updatePaymentStatus(payment.id, 'Payé')}
              className="px-3 py-1 text-xs"
            >
              Marquer payé
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => openDetailsModal(payment)}
            className="px-3 py-1 text-xs"
            icon={Eye}
          >
            Détails
          </Button>
        </div>
      )
    }
  ];

  // --- Unique filter options for dropdowns ---
  // uniquePaymentTypes is no longer needed for the filter dropdown
  const uniqueClasses = useMemo(() => {
    const classIdsWithPayments = new Set(paiements.map(p => eleves.find(e => e.id === p.eleveId)?.classeId).filter(Boolean));
    const classesWithPayments = classes.filter(c => classIdsWithPayments.has(c.id));
    return ['Toutes les classes', ...classesWithPayments.map(c => c.nom)];
  }, [paiements, eleves, classes]);


  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Paiements</h1>
        <p className="text-gray-600 text-lg">Suivi complet des paiements et de la situation financière des élèves.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Montant total attendu</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.paye.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.enAttente.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.enRetard.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
              <p className="text-sm text-gray-600 mt-1">Taux de collecte: <span className="font-semibold text-blue-600">{stats.tauxCollecte}%</span></p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payments List with Filters */}
      <Card className="p-6 shadow-lg">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">Détails des Paiements</h2>
          <div className="flex flex-wrap items-center gap-4">
            {/* Search by Student Name */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Filter by Period */}
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 w-4 h-4 text-gray-400" />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
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

            {/* Filter by Status */}
            <div className="relative flex items-center">
              <Filter className="absolute left-3 w-4 h-4 text-gray-400" />
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
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

            {/* Filter by Class */}
            <div className="relative flex items-center">
              <Users className="absolute left-3 w-4 h-4 text-gray-400" />
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
              >
                {uniqueClasses.map(classeName => (
                  <option key={classeName} value={classeName === 'Toutes les classes' ? '' : classes.find(c => c.nom === classeName)?.id || ''}>
                    {classeName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        <Table columns={columns} data={filteredPayments} />
      </Card>

      {/* Payment Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        title="Détails du Paiement"
        size="md"
      >
        {selectedPaymentDetails && (
          <div className="space-y-4 text-gray-700">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-bold text-lg text-blue-800 mb-2">Paiement pour {getEleveName(selectedPaymentDetails.eleveId)}</h3>
              <p><span className="font-medium">Montant:</span> {selectedPaymentDetails.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
              <p><span className="font-medium">Type:</span> {selectedPaymentDetails.type}</p>
              <p><span className="font-medium">Statut:</span> <span className={`px-2 py-0.5 text-sm rounded-full ${
                selectedPaymentDetails.statut === 'Payé' ? 'bg-green-100 text-green-800' :
                selectedPaymentDetails.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>{selectedPaymentDetails.statut}</span></p>
            </div>
            <p><span className="font-medium">Date:</span> {new Date(selectedPaymentDetails.date).toLocaleDateString('fr-FR')}</p>
            {selectedPaymentDetails.dateEcheance && (
              <p><span className="font-medium">Date d'échéance:</span> {new Date(selectedPaymentDetails.dateEcheance).toLocaleDateString('fr-FR')}</p>
            )}
            <p><span className="font-medium">Méthode:</span> {selectedPaymentDetails.methode || 'N/A'}</p>
            {selectedPaymentDetails.description && (
              <p><span className="font-medium">Description:</span> {selectedPaymentDetails.description}</p>
            )}
            {selectedPaymentDetails.reference && (
              <p><span className="font-medium">Référence:</span> {selectedPaymentDetails.reference}</p>
            )}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              {selectedPaymentDetails.statut !== 'Payé' && (
                <Button variant="success" onClick={() => { updatePaymentStatus(selectedPaymentDetails.id, 'Payé'); closeDetailsModal(); }}>
                  Marquer comme payé
                </Button>
              )}
              <Button variant="outline" onClick={closeDetailsModal}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Paiements;
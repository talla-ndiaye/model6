import { AlertCircle, Clock, DollarSign, Download, Eye, Plus, Receipt, Search, UserCheck } from 'lucide-react'; // Added UserCheck, AlertCircle icons
import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

import { classes, eleves, paiements as initialPaiements } from '../../data/donneesTemporaires';

const Recus = () => {
  const [payments, setPayments] = useState(initialPaiements);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterStatut, setFilterStatut] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // States for the two-step add payment process
  const [addPaymentStep, setAddPaymentStep] = useState(1); // 1: Enter Student ID, 2: Enter Payment Details
  const [tempEleveIdInput, setTempEleveIdInput] = useState('');
  const [loadedEleveInfo, setLoadedEleveInfo] = useState(null);
  const [eleveIdError, setEleveIdError] = useState('');

  const [newPaymentFormData, setNewPaymentFormData] = useState({
    montant: '',
    type: '',
    statut: 'En attente',
    date: new Date().toISOString().split('T')[0],
    methode: ''
  });

  // Helper functions
  const getEleveInfo = (eleveId) => eleves.find(e => e.id === eleveId);

  const getEleveName = (eleveId) => {
    const eleve = getEleveInfo(eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  // Memoized filtered payments
  const filteredPayments = useMemo(() => {
    let currentPayments = payments;

    const filtered = currentPayments.filter(payment => {
      const eleve = getEleveInfo(payment.eleveId);
      const fullName = eleve ? `${eleve.prenom} ${eleve.nom}`.toLowerCase() : '';
      const idRecu = `REC-${payment.id.toString().padStart(4, '0')}`;
      const search = searchQuery.toLowerCase();

      const matchStatut = !filterStatut || payment.statut === filterStatut;
      const matchType = !filterType || payment.type === filterType;
      const matchSearch =
        fullName.includes(search) ||
        idRecu.includes(search) ||
        payment.type.toLowerCase().includes(search);

      return matchStatut && matchType && matchSearch;
    });
    return filtered;
  }, [payments, filterStatut, filterType, searchQuery]);


  // KPI calculations (using the full payments list, not filtered, for totals)
  const totalPaid = payments.filter(p => p.statut === 'Payé').reduce((sum, p) => sum + p.montant, 0);
  const totalPending = payments.filter(p => p.statut === 'En attente').reduce((sum, p) => sum + p.montant, 0);
  const totalCount = payments.length;
  const totalPaidCount = payments.filter(p => p.statut === 'Payé').length;
  const totalPendingCount = payments.filter(p => p.statut === 'En attente').length;


  // --- Handlers ---
  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const handleDownloadReceipt = (payment) => {
    alert(`Fonctionnalité de téléchargement PDF pour le reçu REC-${payment.id.toString().padStart(4, '0')} (pour ${getEleveName(payment.eleveId)})`);
  };

  const handleOpenAddPaymentModal = () => {
    setAddPaymentStep(1); // Start at step 1
    setTempEleveIdInput('');
    setLoadedEleveInfo(null);
    setEleveIdError('');
    setNewPaymentFormData({
        montant: '',
        type: '',
        statut: 'En attente',
        date: new Date().toISOString().split('T')[0],
        methode: ''
    });
    setShowAddPaymentModal(true);
  };

  const handleLoadStudentInfo = () => {
    const studentId = parseInt(tempEleveIdInput);
    if (isNaN(studentId)) {
        setEleveIdError("L'ID élève doit être un nombre.");
        setLoadedEleveInfo(null);
        return;
    }

    const student = eleves.find(e => e.id === studentId);
    if (student) {
        setLoadedEleveInfo(student);
        setEleveIdError('');
        setAddPaymentStep(2); // Proceed to step 2
    } else {
        setEleveIdError("Aucun élève trouvé avec cet ID.");
        setLoadedEleveInfo(null);
    }
  };

  const handleAddPaymentSubmit = (e) => {
    e.preventDefault();

    const newId = Math.max(...payments.map(p => p.id)) + 1;
    const newPayment = {
      id: newId,
      eleveId: loadedEleveInfo.id, // Use the ID from the loaded student
      montant: parseFloat(newPaymentFormData.montant),
      type: newPaymentFormData.type,
      statut: newPaymentFormData.statut,
      date: newPaymentFormData.date,
      methode: newPaymentFormData.methode
    };

    setPayments(prevPayments => [...prevPayments, newPayment]);
    alert(`Paiement ajouté: REC-${newId.toString().padStart(4, '0')} pour ${getEleveName(newPayment.eleveId)}`);
    console.log("Nouveau paiement ajouté:", newPayment);

    // Reset form and close modal
    setAddPaymentStep(1);
    setTempEleveIdInput('');
    setLoadedEleveInfo(null);
    setEleveIdError('');
    setNewPaymentFormData({
      montant: '',
      type: '',
      statut: 'En attente',
      date: new Date().toISOString().split('T')[0],
      methode: ''
    });
    setShowAddPaymentModal(false);
  };

  const handleCancelAddPayment = () => {
    setAddPaymentStep(1);
    setTempEleveIdInput('');
    setLoadedEleveInfo(null);
    setEleveIdError('');
    setNewPaymentFormData({
        montant: '',
        type: '',
        statut: 'En attente',
        date: new Date().toISOString().split('T')[0],
        methode: ''
    });
    setShowAddPaymentModal(false);
  };


  // --- Table Columns ---
  const columns = [
    {
      header: 'N° Reçu',
      accessor: 'id',
      render: (p) => `REC-${p.id.toString().padStart(4, '0')}`,
    },
    {
      header: 'Élève',
      accessor: 'eleveId',
      render: (p) => getEleveName(p.eleveId),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (p) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          p.type === 'Scolarité' ? 'bg-blue-100 text-blue-800' :
          p.type === 'Cantine' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {p.type}
        </span>
      )
    },
    {
      header: 'Montant',
      accessor: 'montant',
      render: (p) => `${p.montant.toFixed(2)} Fcfa`,
    },
    {
      header: 'Statut',
      accessor: 'statut',
      render: (p) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          p.statut === 'Payé' ? 'bg-green-100 text-green-800' :
          p.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {p.statut}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (p) => new Date(p.date).toLocaleDateString('fr-FR'),
    },
    { header: 'Méthode', accessor: 'methode' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (p) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleViewReceipt(p)} icon={Eye}>
            Aperçu
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDownloadReceipt(p)} icon={Download}>
            PDF
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des reçus</h1>
          <p className="text-gray-600">Consultez, filtrez et téléchargez les reçus de paiement</p>
        </div>
        <Button onClick={handleOpenAddPaymentModal} icon={Plus}> {/* Use new handler */}
          Nouveau paiement
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card className="p-4 bg-blue-50 border border-blue-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">Total payé</p>
              <p className="text-xl font-bold text-blue-900">{totalPaid.toFixed(2)} Fcfa</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-yellow-50 border border-yellow-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-700">Montant en attente</p>
              <p className="text-xl font-bold text-yellow-900">{totalPending.toFixed(2)} Fcfa</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-green-50 border border-green-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <Receipt className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-green-700">Paiements traités</p>
              <p className="text-xl font-bold text-green-900">{totalPaidCount} / {totalCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters + Search */}
      <Card className="p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <InputField
              label="Statut"
              type="select"
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              options={[
                { value: '', label: 'Tous les statuts' },
                { value: 'Payé', label: 'Payé' },
                { value: 'En attente', label: 'En attente' },
                { value: 'Annulé', label: 'Annulé' }
              ]}
              className="text-gray-700 min-w-[150px]"
            />

            <InputField
              label="Type"
              type="select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: '', label: 'Tous les types' },
                { value: 'Scolarité', label: 'Scolarité' },
                { value: 'Cantine', label: 'Cantine' },
                { value: 'Transport', label: 'Transport' },
                { value: 'Activités', label: 'Activités' }
              ]}
              className="text-gray-700 min-w-[150px]"
            />
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un reçu..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        <Table columns={columns} data={filteredPayments} noDataMessage="Aucun reçu trouvé." />
      </Card>

      {/* View Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Aperçu du reçu"
        size="md"
      >
        {selectedPayment && (
          <div className="space-y-6 p-4">
            <div className="text-center border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">EcoleManager</h2>
              <p className="text-gray-600">Établissement scolaire</p>
              <p className="text-sm text-gray-500">123 Rue de l'École, 75001 Paris</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Informations du reçu</h3>
                <p><span className="text-gray-600">N° Reçu:</span> <span className="font-medium text-gray-900">REC-{selectedPayment.id.toString().padStart(4, '0')}</span></p>
                <p><span className="text-gray-600">Date:</span> <span className="font-medium text-gray-900">{new Date(selectedPayment.date).toLocaleDateString('fr-FR')}</span></p>
                <p><span className="text-gray-600">Méthode:</span> <span className="font-medium text-gray-900">{selectedPayment.methode}</span></p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Informations élève</h3>
                {(() => {
                  const eleve = getEleveInfo(selectedPayment.eleveId);
                  return eleve ? (
                    <>
                      <p><span className="text-gray-600">Nom:</span> <span className="font-medium text-gray-900">{eleve.prenom} {eleve.nom}</span></p>
                      <p><span className="text-gray-600">Email:</span> <span className="font-medium text-gray-900">{eleve.email}</span></p>
                      <p><span className="text-gray-600">Téléphone:</span> <span className="font-medium text-gray-900">{eleve.telephone}</span></p>
                    </>
                  ) : (
                    <p className="text-gray-500">Non disponible</p>
                  );
                })()}
              </div>
            </div>

            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Détail du paiement</h3>
              <div className="flex justify-between border-b border-gray-200 py-2">
                <span className="text-gray-800">{selectedPayment.type}</span>
                <span className="font-semibold text-gray-900">{selectedPayment.montant.toFixed(2)} Fcfa</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg text-gray-900">
                <span>Total</span>
                <span>{selectedPayment.montant.toFixed(2)} Fcfa</span>
              </div>
            </div>

            <div className="text-center pt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                selectedPayment.statut === 'Payé' ? 'bg-green-100 text-green-800' :
                selectedPayment.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                <Receipt className="w-4 h-4 mr-1" />
                {selectedPayment.statut}
              </span>
            </div>

            <div className="flex justify-center pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => handleDownloadReceipt(selectedPayment)} icon={Download}>
                Télécharger PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add New Payment Modal - Two Steps */}
      <Modal
        isOpen={showAddPaymentModal}
        onClose={handleCancelAddPayment}
        title={addPaymentStep === 1 ? "Rechercher l'élève" : "Enregistrer un nouveau paiement"}
        size="md"
      >
        {addPaymentStep === 1 && (
          <div className="space-y-4 p-2">
            <InputField
              label="ID de l'élève"
              type="number"
              value={tempEleveIdInput}
              onChange={(e) => {
                setTempEleveIdInput(e.target.value);
                setEleveIdError(''); // Clear error on change
              }}
              placeholder="Ex: 1, 2, 3..."
              required
            />
            {eleveIdError && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {eleveIdError}
              </p>
            )}
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleCancelAddPayment}>
                Annuler
              </Button>
              <Button onClick={handleLoadStudentInfo} icon={UserCheck}>
                Charger l'élève
              </Button>
            </div>
          </div>
        )}

        {addPaymentStep === 2 && loadedEleveInfo && (
          <form onSubmit={handleAddPaymentSubmit} className="space-y-4 p-2">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-inner mb-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Élève sélectionné :</h3>
                <p className="text-gray-900 font-medium">{loadedEleveInfo.prenom} {loadedEleveInfo.nom}</p>
                <p className="text-gray-700 text-sm">Classe: {getClassName(loadedEleveInfo.classeId)} | ID: {loadedEleveInfo.id}</p>
            </div>

            <InputField
              label="Montant (Fcfa)"
              type="number"
              value={newPaymentFormData.montant}
              onChange={(e) => setNewPaymentFormData({ ...newPaymentFormData, montant: e.target.value })}
              min="0"
              step="0.01"
              required
            />
            <InputField
              label="Type de paiement"
              type="select"
              value={newPaymentFormData.type}
              onChange={(e) => setNewPaymentFormData({ ...newPaymentFormData, type: e.target.value })}
              options={[
                { value: '', label: 'Sélectionner un type' },
                { value: 'Scolarité', label: 'Scolarité' },
                { value: 'Cantine', label: 'Cantine' },
                { value: 'Transport', label: 'Transport' },
                { value: 'Activités', label: 'Activités' }
              ]}
              required
              className="text-gray-700"
            />
            <InputField
              label="Statut"
              type="select"
              value={newPaymentFormData.statut}
              onChange={(e) => setNewPaymentFormData({ ...newPaymentFormData, statut: e.target.value })}
              options={[
                { value: 'En attente', label: 'En attente' },
                { value: 'Payé', label: 'Payé' },
                { value: 'Annulé', label: 'Annulé' }
              ]}
              required
              className="text-gray-700"
            />
            <InputField
              label="Date du paiement"
              type="date"
              value={newPaymentFormData.date}
              onChange={(e) => setNewPaymentFormData({ ...newPaymentFormData, date: e.target.value })}
              required
              className="text-gray-700"
            />
            <InputField
              label="Méthode de paiement"
              type="select"
              value={newPaymentFormData.methode}
              onChange={(e) => setNewPaymentFormData({ ...newPaymentFormData, methode: e.target.value })}
              options={[
                { value: '', label: 'Sélectionner une méthode' },
                { value: 'Virement', label: 'Virement' },
                { value: 'Chèque', label: 'Chèque' },
                { value: 'Espèces', label: 'Espèces' },
                { value: 'Mobile Money', label: 'Mobile Money' }
              ]}
              required
              className="text-gray-700"
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setAddPaymentStep(1)}>
                Retour
              </Button>
              <Button type="submit">
                Enregistrer le paiement
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Recus;
import React, { useState } from 'react';
import { Receipt, Eye, Download, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { paiements, eleves } from '../../data/donneesTemporaires';

const Recus = () => {
  const [payments, setPayments] = useState(paiements);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterStatut, setFilterStatut] = useState('');
  const [filterType, setFilterType] = useState('');

  const getEleveName = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getEleveInfo = (eleveId) => {
    return eleves.find(e => e.id === eleveId);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatut = filterStatut === '' || payment.statut === filterStatut;
    const matchesType = filterType === '' || payment.type === filterType;
    return matchesStatut && matchesType;
  });

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
    console.log('Affichage reçu pour paiement:', payment);
  };

  const handleDownloadReceipt = (payment) => {
    console.log('Téléchargement reçu PDF pour paiement:', payment);
    // Simulation du téléchargement PDF
    alert(`Téléchargement du reçu pour ${getEleveName(payment.eleveId)} - ${payment.montant}€`);
  };

  const columns = [
    {
      header: 'N° Reçu',
      accessor: 'id',
      render: (payment) => `REC-${payment.id.toString().padStart(4, '0')}`
    },
    {
      header: 'Élève',
      accessor: 'eleveId',
      render: (payment) => getEleveName(payment.eleveId)
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (payment) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          payment.type === 'Scolarité' ? 'bg-blue-100 text-blue-800' :
          payment.type === 'Cantine' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {payment.type}
        </span>
      )
    },
    {
      header: 'Montant',
      accessor: 'montant',
      render: (payment) => `${payment.montant.toFixed(2)}€`
    },
    {
      header: 'Statut',
      accessor: 'statut',
      render: (payment) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          payment.statut === 'Payé' ? 'bg-green-100 text-green-800' :
          payment.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewReceipt(payment)}
            icon={Eye}
          >
            Aperçu
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDownloadReceipt(payment)}
            icon={Download}
          >
            PDF
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des reçus</h1>
        <p className="text-gray-600">Consulter et télécharger les reçus de paiement</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="sm:w-48">
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="Payé">Payé</option>
              <option value="En attente">En attente</option>
              <option value="En retard">En retard</option>
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="Scolarité">Scolarité</option>
              <option value="Cantine">Cantine</option>
              <option value="Transport">Transport</option>
              <option value="Activités">Activités</option>
            </select>
          </div>
        </div>

        <Table columns={columns} data={filteredPayments} />
      </Card>

      {/* Modal aperçu reçu */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Aperçu du reçu"
        size="md"
      >
        {selectedPayment && (
          <div className="space-y-6">
            {/* En-tête du reçu */}
            <div className="text-center border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">EcoleManager</h2>
              <p className="text-gray-600">Établissement scolaire</p>
              <p className="text-sm text-gray-500">123 Rue de l'École, 75001 Paris</p>
            </div>

            {/* Informations du reçu */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Informations du reçu</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">N° Reçu:</span> REC-{selectedPayment.id.toString().padStart(4, '0')}</p>
                  <p><span className="text-gray-600">Date:</span> {new Date(selectedPayment.date).toLocaleDateString('fr-FR')}</p>
                  <p><span className="text-gray-600">Méthode:</span> {selectedPayment.methode}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Informations élève</h3>
                <div className="space-y-1 text-sm">
                  {(() => {
                    const eleve = getEleveInfo(selectedPayment.eleveId);
                    return eleve ? (
                      <>
                        <p><span className="text-gray-600">Nom:</span> {eleve.prenom} {eleve.nom}</p>
                        <p><span className="text-gray-600">Email:</span> {eleve.email}</p>
                        <p><span className="text-gray-600">Téléphone:</span> {eleve.telephone}</p>
                      </>
                    ) : (
                      <p className="text-gray-500">Informations non disponibles</p>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Détail du paiement */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Détail du paiement</h3>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-700">{selectedPayment.type}</span>
                <span className="font-semibold">{selectedPayment.montant.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between items-center py-2 font-bold text-lg">
                <span>Total</span>
                <span>{selectedPayment.montant.toFixed(2)}€</span>
              </div>
            </div>

            {/* Statut */}
            <div className="text-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                selectedPayment.statut === 'Payé' ? 'bg-green-100 text-green-800' :
                selectedPayment.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                <Receipt className="w-4 h-4 mr-1" />
                {selectedPayment.statut}
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => handleDownloadReceipt(selectedPayment)}
                icon={Download}
              >
                Télécharger PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Recus;
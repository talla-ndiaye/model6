import React, { useState } from 'react';
import { CreditCard, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { paiements, eleves } from '../../data/donneesTemporaires';

const Paiements = () => {
  const [payments, setPayments] = useState(paiements);
  const [filterStatut, setFilterStatut] = useState('');

  const getEleveName = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const updatePaymentStatus = (paymentId, newStatut) => {
    setPayments(payments.map(payment => 
      payment.id === paymentId ? { ...payment, statut: newStatut } : payment
    ));
    console.log('Mise à jour statut paiement:', paymentId, newStatut);
  };

  const filteredPayments = payments.filter(payment => 
    filterStatut === '' || payment.statut === filterStatut
  );

  const stats = {
    total: payments.reduce((sum, p) => sum + p.montant, 0),
    paye: payments.filter(p => p.statut === 'Payé').reduce((sum, p) => sum + p.montant, 0),
    enAttente: payments.filter(p => p.statut === 'En attente').reduce((sum, p) => sum + p.montant, 0),
    retard: payments.filter(p => p.statut === 'En retard').length
  };

  const columns = [
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
        <span className={`px-2 py-1 text-xs rounded-full flex items-center ${
          payment.statut === 'Payé' ? 'bg-green-100 text-green-800' :
          payment.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {payment.statut === 'Payé' && <CheckCircle className="w-3 h-3 mr-1" />}
          {payment.statut === 'En attente' && <AlertCircle className="w-3 h-3 mr-1" />}
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
            >
              Marquer payé
            </Button>
          )}
          <Button size="sm" variant="outline">
            Détails
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des paiements</h1>
        <p className="text-gray-600">Suivi des paiements et finances</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total attendu</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total.toFixed(2)}€</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Encaissé</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.paye.toFixed(2)}€</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.enAttente.toFixed(2)}€</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-red-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Taux de collecte</p>
              <p className="text-2xl font-semibold text-gray-900">
                {((stats.paye / stats.total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Liste des paiements</h2>
          <div className="flex items-center space-x-4">
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="Payé">Payé</option>
              <option value="En attente">En attente</option>
              <option value="En retard">En retard</option>
            </select>
            <Button>Nouveau paiement</Button>
          </div>
        </div>

        <Table columns={columns} data={filteredPayments} />
      </Card>
    </div>
  );
};

export default Paiements;
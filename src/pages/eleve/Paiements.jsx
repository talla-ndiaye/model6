import {
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Eye, // For KPIs
    FileText // For 'No data' message
    ,
    Receipt
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext'; // To get the logged-in student's user info
import { eleves, paiements } from '../../data/donneesTemporaires'; // Data sources

const MesPaiementsEleve = () => {
  const { user } = useAuth(); // Get the logged-in user
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Find the logged-in student's profile
  const eleveProfile = useMemo(() => {
    return eleves.find(e => e.email === user.email);
  }, [user.email]);

  // Filter payments related to this specific student
  const mesPaiements = useMemo(() => {
    if (!eleveProfile) return [];
    return paiements.filter(p => p.eleveId === eleveProfile.id);
  }, [paiements, eleveProfile]);

  // Calculate KPIs for the student's payments
  const kpis = useMemo(() => {
    const totalPaid = mesPaiements
      .filter(p => p.statut === 'Payé')
      .reduce((sum, p) => sum + p.montant, 0);

    const totalPending = mesPaiements
      .filter(p => p.statut === 'En attente')
      .reduce((sum, p) => sum + p.montant, 0);

    const totalPaymentsCount = mesPaiements.length;
    const paidPaymentsCount = mesPaiements.filter(p => p.statut === 'Payé').length;
    const pendingPaymentsCount = mesPaiements.filter(p => p.statut === 'En attente').length;

    return {
      totalPaid,
      totalPending,
      totalPaymentsCount,
      paidPaymentsCount,
      pendingPaymentsCount
    };
  }, [mesPaiements]);


  // Handlers for modals and download
  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const handleDownloadReceipt = (payment) => {
    alert(`Fonctionnalité de téléchargement PDF pour le reçu REC-${payment.id.toString().padStart(4, '0')} (pour ${eleveProfile?.prenom} ${eleveProfile?.nom})`);
    // In a real app, integrate a PDF generation library here
  };

  // Columns for the payments table
  const columns = [
    {
      header: 'N° Reçu',
      accessor: 'id',
      render: (p) => `REC-${p.id.toString().padStart(4, '0')}`,
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

  // If student profile not found, display an error
  if (!eleveProfile) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center bg-gray-50 border border-gray-200 shadow-sm">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Profil élève non trouvé</h3>
          <p className="text-gray-600">
            Impossible de récupérer vos informations de paiement. Veuillez vérifier que votre profil élève est correctement configuré.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes paiements</h1>
        <p className="text-gray-600">Consultez l'historique de vos paiements à l'établissement.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card className="p-4 bg-blue-50 border border-blue-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">Total payé</p>
              <p className="text-xl font-bold text-blue-900">{kpis.totalPaid.toFixed(2)} Fcfa</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-yellow-50 border border-yellow-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-700">Total en attente</p>
              <p className="text-xl font-bold text-yellow-900">{kpis.totalPending.toFixed(2)} Fcfa</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-green-50 border border-green-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-green-700">Paiements traités</p>
              <p className="text-xl font-bold text-green-900">{kpis.paidPaymentsCount} / {kpis.totalPaymentsCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payments History Table */}
      <Card className="p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Receipt className="w-5 h-5 mr-2 text-blue-600" />
          Historique de vos paiements
        </h2>
        {mesPaiements.length > 0 ? (
          <Table
            columns={columns}
            data={mesPaiements}
            noDataMessage="Vous n'avez pas encore d'historique de paiements."
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4" />
            <p>Aucun paiement n'a été enregistré pour votre profil.</p>
          </div>
        )}
      </Card>

      {/* Receipt Detail Modal (reused from Recus component) */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Détails du reçu"
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
                {/* Student info directly from eleveProfile as it's THEIR payment */}
                {eleveProfile ? (
                  <>
                    <p><span className="text-gray-600">Nom:</span> <span className="font-medium text-gray-900">{eleveProfile.prenom} {eleveProfile.nom}</span></p>
                    <p><span className="text-gray-600">Email:</span> <span className="font-medium text-gray-900">{eleveProfile.email}</span></p>
                    <p><span className="text-gray-600">Téléphone:</span> <span className="font-medium text-gray-900">{eleveProfile.telephone}</span></p>
                  </>
                ) : (
                  <p className="text-gray-500">Non disponible</p>
                )}
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
    </div>
  );
};

export default MesPaiementsEleve;
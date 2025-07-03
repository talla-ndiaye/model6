import {
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  TrendingUp
} from 'lucide-react';
import { useMemo } from 'react';
import Slider from 'react-slick';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';

import { classes, eleves, paiements } from '../../data/donneesTemporaires';

const TableauDeBordComptable = () => {
  const getEleveName = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const kpis = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const paiementsPayes = paiements.filter(p => p.statut === 'Payé');
    const paiementsEnAttente = paiements.filter(p => p.statut === 'En attente');

    const totalRevenus = paiementsPayes.reduce((sum, p) => sum + p.montant, 0);
    const revenusCeMois = paiementsPayes
      .filter(p => new Date(p.date).getMonth() === currentMonth && new Date(p.date).getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.montant, 0);

    return {
      totalRevenus,
      revenusCeMois,
      paiementsEnAttente: paiementsEnAttente.reduce((sum, p) => sum + p.montant, 0),
      nombrePaiementsTotal: paiements.length,
      nombrePaiementsPayes: paiementsPayes.length,
      nombrePaiementsEnAttente: paiementsEnAttente.length,
    };
  }, []);

  const paymentsTableColumns = [
    {
      header: 'Élève',
      accessor: 'eleveId',
      render: (p) => getEleveName(p.eleveId)
    },
    {
      header: 'Classe',
      accessor: 'eleveId',
      render: (p) => getClassName(eleves.find(e => e.id === p.eleveId)?.classeId)
    },
    { header: 'Montant', accessor: 'montant', render: (p) => `${p.montant} Fcfa` },
    { header: 'Type', accessor: 'type' },
    {
      header: 'Statut',
      accessor: 'statut',
      render: (p) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
      render: (p) => new Date(p.date).toLocaleDateString('fr-FR')
    },
    { header: 'Méthode', accessor: 'methode' }
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 }
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Comptable</h1>
        <p className="text-gray-600">Vue d'ensemble des finances scolaires</p>
      </div>

      {/* KPIs Slider */}
      <Slider {...sliderSettings} className="px-4">
        <Card className="p-6 text-center bg-blue-50 border-blue-100 shadow-sm m-2">
          <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-blue-800">Revenus Totaux</p>
          <p className="text-2xl font-bold text-blue-900">{kpis.totalRevenus} Fcfa</p>
        </Card>
        <Card className="p-6 text-center bg-green-50 border-green-100 shadow-sm m-2">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <p className="text-sm text-green-800">Revenus ce mois</p>
          <p className="text-2xl font-bold text-green-900">{kpis.revenusCeMois} Fcfa</p>
        </Card>
        <Card className="p-6 text-center bg-yellow-50 border-yellow-100 shadow-sm m-2">
          <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
          <p className="text-sm text-yellow-800">Paiements en attente</p>
          <p className="text-2xl font-bold text-yellow-900">{kpis.paiementsEnAttente} Fcfa</p>
        </Card>
        <Card className="p-6 text-center bg-indigo-50 border-indigo-100 shadow-sm m-2">
          <FileText className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
          <p className="text-sm text-indigo-800">Nombre de paiements</p>
          <p className="text-2xl font-bold text-indigo-900">{kpis.nombrePaiementsPayes} / {kpis.nombrePaiementsTotal}</p>
        </Card>
      </Slider>

      {/* Derniers paiements */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Derniers Paiements Reçus
          </h2>
          <Table
            columns={paymentsTableColumns}
            data={paiements.filter(p => p.statut === 'Payé').sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5)}
            noDataMessage="Aucun paiement reçu récent."
          />
        </Card>

        <Card className="p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-600" />
            Paiements en Attente
          </h2>
          <Table
            columns={paymentsTableColumns}
            data={paiements.filter(p => p.statut === 'En attente')}
            noDataMessage="Aucun paiement en attente."
          />
        </Card>
      </div>
    </div>
  );
};

export default TableauDeBordComptable;

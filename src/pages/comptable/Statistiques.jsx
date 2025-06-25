// Imports principaux
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import Slider from "react-slick";

import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Table from '../../components/ui/Table';

import { classes, eleves, paiements } from '../../data/donneesTemporaires';

import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

const StatistiquePaiements = () => {
  // États des filtres
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
  const [selectedClasseId, setSelectedClasseId] = useState('');
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');

  // Helpers
  const getEleveName = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  // Filtrage des paiements
  const filteredPaiements = useMemo(() => {
    let filtered = paiements;

    if (dateFilter.startDate) {
      filtered = filtered.filter(p => new Date(p.date) >= new Date(dateFilter.startDate));
    }
    if (dateFilter.endDate) {
      filtered = filtered.filter(p => new Date(p.date) <= new Date(dateFilter.endDate));
    }
    if (selectedClasseId) {
      filtered = filtered.filter(p => {
        const eleve = eleves.find(e => e.id === p.eleveId);
        return eleve && String(eleve.classeId) === String(selectedClasseId);
      });
    }
    if (selectedPaymentType) {
      filtered = filtered.filter(p => p.type === selectedPaymentType);
    }
    if (selectedPaymentStatus) {
      filtered = filtered.filter(p => p.statut === selectedPaymentStatus);
    }

    return filtered;
  }, [paiements, dateFilter, selectedClasseId, selectedPaymentType, selectedPaymentStatus]);

  // Calcul KPIs
  const kpis = useMemo(() => {
    const paidPayments = filteredPaiements.filter(p => p.statut === 'Payé');
    const pendingPayments = filteredPaiements.filter(p => p.statut === 'En attente');
    const cancelledPayments = filteredPaiements.filter(p => p.statut === 'Annulé');

    const totalRevenus = paidPayments.reduce((sum, p) => sum + p.montant, 0);
    const montantTotalEnAttente = pendingPayments.reduce((sum, p) => sum + p.montant, 0);
    const nombrePaiementsTotal = filteredPaiements.length;
    const nombrePaiementsPayes = paidPayments.length;
    const nombrePaiementsEnAttente = pendingPayments.length;
    const nombrePaiementsAnnules = cancelledPayments.length;

    const montantMoyenPaiement = paidPayments.length > 0 ? totalRevenus / paidPayments.length : 0;
    const pourcentagePayes = nombrePaiementsTotal > 0 ? (nombrePaiementsPayes / nombrePaiementsTotal) * 100 : 0;

    return {
      totalRevenus,
      montantTotalEnAttente,
      nombrePaiementsTotal,
      nombrePaiementsPayes,
      nombrePaiementsEnAttente,
      nombrePaiementsAnnules,
      montantMoyenPaiement,
      pourcentagePayes
    };
  }, [filteredPaiements]);

  // Données graphiques

  // Évolution mensuelle des revenus
  const monthlyRevenueData = useMemo(() => {
    const data = {};
    filteredPaiements.filter(p => p.statut === 'Payé').forEach(p => {
      const date = new Date(p.date);
      const monthYear = `${date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' })}`;
      if (!data[monthYear]) data[monthYear] = 0;
      data[monthYear] += p.montant;
    });
    return Object.keys(data).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const dateA = new Date(`${monthA} 1, 20${yearA}`);
      const dateB = new Date(`${monthB} 1, 20${yearB}`);
      return dateA - dateB;
    }).map(key => ({
      name: key,
      Revenus: parseFloat(data[key].toFixed(2))
    }));
  }, [filteredPaiements]);

  // Répartition des paiements par type
  const paymentTypeDistributionData = useMemo(() => {
    const data = {};
    filteredPaiements.filter(p => p.statut === 'Payé').forEach(p => {
      if (!data[p.type]) data[p.type] = 0;
      data[p.type] += p.montant;
    });
    return Object.keys(data).map(key => ({
      name: key,
      value: parseFloat(data[key].toFixed(2))
    }));
  }, [filteredPaiements]);

  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Répartition par statut
  const paymentStatusData = useMemo(() => {
    const payeCount = filteredPaiements.filter(p => p.statut === 'Payé').length;
    const enAttenteCount = filteredPaiements.filter(p => p.statut === 'En attente').length;
    const annuleCount = filteredPaiements.filter(p => p.statut === 'Annulé').length;

    return [
      { name: 'Payé', count: payeCount, color: '#10B981' },
      { name: 'En attente', count: enAttenteCount, color: '#F59E0B' },
      { name: 'Annulé', count: annuleCount, color: '#EF4444' }
    ];
  }, [filteredPaiements]);

  // Revenus par classe
  const revenueByClassData = useMemo(() => {
    const data = {};
    filteredPaiements.filter(p => p.statut === 'Payé').forEach(p => {
      const eleve = eleves.find(e => e.id === p.eleveId);
      if (eleve) {
        const className = getClassName(eleve.classeId);
        if (!data[className]) data[className] = 0;
        data[className] += p.montant;
      }
    });
    return Object.keys(data).map(key => ({
      name: key,
      Revenus: parseFloat(data[key].toFixed(2))
    })).sort((a, b) => b.Revenus - a.Revenus);
  }, [filteredPaiements, eleves, classes]);

  // Colonnes tableau
  const paymentsTableColumns = [
    {
      header: 'Élève',
      accessor: 'eleveId',
      render: (payment) => getEleveName(payment.eleveId)
    },
    {
      header: 'Classe',
      accessor: 'eleveId',
      render: (payment) => getClassName(eleves.find(e => e.id === payment.eleveId)?.classeId)
    },
    { header: 'Montant', accessor: 'montant', render: (payment) => `${payment.montant.toFixed(2)} Fcfa` },
    { header: 'Type', accessor: 'type' },
    {
      header: 'Statut',
      accessor: 'statut',
      render: (payment) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
    { header: 'Méthode', accessor: 'methode' }
  ];

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 400,
    slidesToShow: 3,
    slidesToScroll: 2,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } }
    ]
  };

  const kpiItems = [
    {
      icon: <DollarSign className="w-8 h-8 text-blue-600 mb-3" />,
      label: "Revenus Totaux",
      value: `${kpis.totalRevenus.toFixed(2)} Fcfa`,
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-900"
    },
    {
      icon: <Clock className="w-8 h-8 text-yellow-600 mb-3" />,
      label: "Montant En Attente",
      value: `${kpis.montantTotalEnAttente.toFixed(2)} Fcfa`,
      bg: "bg-yellow-50",
      border: "border-yellow-100",
      text: "text-yellow-900"
    },
    {
      icon: <FileText className="w-8 h-8 text-indigo-600 mb-3" />,
      label: "Total Paiements",
      value: kpis.nombrePaiementsTotal,
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      text: "text-indigo-900"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-green-600 mb-3" />,
      label: "Paiements Payés",
      value: kpis.nombrePaiementsPayes,
      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-900"
    },
    {
      icon: <AlertCircle className="w-8 h-8 text-red-600 mb-3" />,
      label: "Paiements En Attente",
      value: kpis.nombrePaiementsEnAttente,
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-900"
    },
    {
      icon: <Award className="w-8 h-8 text-purple-600 mb-3" />,
      label: "Taux de Paiement (%)",
      value: `${kpis.pourcentagePayes.toFixed(2)}%`,
      bg: "bg-purple-50",
      border: "border-purple-100",
      text: "text-purple-900"
    }
  ];

  return (
    <div className="space-y-6 px-4 md:px-8 lg:px-12">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Statistiques des Paiements</h1>
        <p className="text-gray-600 mt-1">Analyse détaillée des flux financiers</p>
      </header>

      {/* Filtres */}
      <Card className="p-6 shadow-md bg-white rounded-lg">
        <h2 className="flex items-center text-lg font-semibold text-gray-900 mb-5">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Filtres des données
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <InputField
            label="Date de début"
            type="date"
            value={dateFilter.startDate}
            onChange={e => setDateFilter({ ...dateFilter, startDate: e.target.value })}
            className="text-gray-700"
          />
          <InputField
            label="Date de fin"
            type="date"
            value={dateFilter.endDate}
            onChange={e => setDateFilter({ ...dateFilter, endDate: e.target.value })}
            className="text-gray-700"
          />
          <div>
            <label htmlFor="classe-filter" className="block mb-1 text-sm font-medium text-gray-700">Classe</label>
            <select
              id="classe-filter"
              value={selectedClasseId}
              onChange={e => setSelectedClasseId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="type-filter" className="block mb-1 text-sm font-medium text-gray-700">Type de paiement</label>
            <select
              id="type-filter"
              value={selectedPaymentType}
              onChange={e => setSelectedPaymentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les types</option>
              {[...new Set(paiements.map(p => p.type))].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status-filter" className="block mb-1 text-sm font-medium text-gray-700">Statut du paiement</label>
            <select
              id="status-filter"
              value={selectedPaymentStatus}
              onChange={e => setSelectedPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              {[...new Set(paiements.map(p => p.statut))].map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Slider KPIs */}
      <section>
        <Slider {...sliderSettings}>
          {kpiItems.map((item, idx) => (
            <div key={idx} className="px-2">
              <Card className={`p-6 text-center ${item.bg} ${item.border} shadow-md rounded-lg flex flex-col justify-center items-center`}>
                {item.icon}
                <p className={`text-sm font-medium mb-1 ${item.text}`}>{item.label}</p>
                <p className={`text-3xl font-bold ${item.text}`}>{item.value}</p>
              </Card>
            </div>
          ))}
        </Slider>
      </section>

      {/* Graphiques */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6 shadow-md bg-white rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Revenus (Mensuel)</h2>
          {monthlyRevenueData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={value => `${value.toFixed(2)} Fcfa`} />
                <Legend />
                <Line type="monotone" dataKey="Revenus" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
              Pas de données de revenus pour les filtres actuels.
            </div>
          )}
        </Card>

        <Card className="p-6 shadow-md bg-white rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Paiements par Type</h2>
          {paymentTypeDistributionData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={paymentTypeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentTypeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={value => `${value.toFixed(2)} Fcfa`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
              Pas de données de répartition par type pour les filtres actuels.
            </div>
          )}
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6 shadow-md bg-white rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Statut</h2>
          {paymentStatusData.length && paymentStatusData.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#82ca9d"
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
              Pas de données de statut pour les filtres actuels.
            </div>
          )}
        </Card>

        <Card className="p-6 shadow-md bg-white rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenus par Classe</h2>
          {revenueByClassData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueByClassData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={value => `${value.toFixed(2)} Fcfa`} />
                <Legend />
                <Bar dataKey="Revenus" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
              Pas de données de revenus par classe.
            </div>
          )}
        </Card>
      </section>

      {/* Tableau des paiements */}
      <section>
        <Card className="p-6 shadow-md bg-white rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Liste des Paiements</h2>
          <Table
            data={filteredPaiements}
            columns={paymentsTableColumns}
            noDataMessage="Aucun paiement trouvé avec les filtres sélectionnés."
          />
        </Card>
      </section>
    </div>
  );
};

export default StatistiquePaiements;

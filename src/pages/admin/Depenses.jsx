import {
    Calendar // For date filter
    , // For "Edit Expense" button (optional)
    DollarSign, // For "Delete Expense" button (optional, but good for management)
    Edit2, // For "Add Expense" button
    Eye,
    PlusCircle, Search, // For evolution chart
    Tag, // For "View Details" button
    Trash2, // For stats or general finance icon
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
} from 'recharts'; // Recharts for the evolution graph
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField'; // For form fields
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

import { depenses as initialDepenses } from '../../data/donneesTemporaires'; // Import initial expenses data

const GestionDepenses = () => {
  const [depenses, setDepenses] = useState(initialDepenses);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDepense, setSelectedDepense] = useState(null); // For viewing/editing details

  // Form state for adding/editing expense
  const [formDepense, setFormDepense] = useState({
    id: null,
    description: '',
    montant: '',
    date: '',
    categorie: ''
  });

  // Filter states
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPeriod, setFilterPeriod] = useState(''); // New filter for period
  const [searchTerm, setSearchTerm] = useState(''); // Search by description

  // --- Helper Functions ---
  const getNextId = () => {
    return depenses.length > 0 ? Math.max(...depenses.map(d => d.id)) + 1 : 1;
  };

  const isDateInPeriod = (depenseDateString, period) => {
    const depenseDate = new Date(depenseDateString);
    const now = new Date();
    now.setHours(0,0,0,0); // Reset time for accurate date comparison

    switch (period) {
      case 'today':
        return depenseDate.toDateString() === now.toDateString();
      case 'this_week':
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()); // Sunday
        const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6); // Saturday
        return depenseDate >= startOfWeek && depenseDate <= endOfWeek;
      case 'this_month':
        return depenseDate.getMonth() === now.getMonth() && depenseDate.getFullYear() === now.getFullYear();
      case 'this_year':
        return depenseDate.getFullYear() === now.getFullYear();
      default:
        return true; // No period filter
    }
  };

  // --- Data Filtering and Memoization ---
  const filteredDepenses = useMemo(() => {
    let currentDepenses = depenses;

    if (filterCategory !== '') {
      currentDepenses = currentDepenses.filter(d => d.categorie === filterCategory);
    }
    if (filterPeriod !== '') {
      currentDepenses = currentDepenses.filter(d => isDateInPeriod(d.date, filterPeriod));
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentDepenses = currentDepenses.filter(d =>
        d.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        d.categorie.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    return currentDepenses.sort((a,b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
  }, [depenses, filterCategory, filterPeriod, searchTerm]);

  // --- Chart Data Processing ---
  const depensesEvolutionData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const data = [];
    for (let i = 11; i >= 0; i--) { // Last 12 months
      let m = currentMonth - i;
      let y = currentYear;
      if (m < 0) { m += 12; y -= 1; }
      data.push({
        name: new Date(y, m, 1).toLocaleString('fr-FR', { month: 'short', year: '2-digit' }),
        Montant: 0
      });
    }

    depenses.forEach(d => {
      const depenseDate = new Date(d.date);
      const monthLabel = depenseDate.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
      const index = data.findIndex(item => item.name === monthLabel);
      if (index !== -1) {
        data[index].Montant += d.montant;
      }
    });
    return data;
  }, [depenses]);

  // --- Statistics Calculation ---
  const stats = useMemo(() => {
    const totalCurrentMonth = depenses.filter(d => {
      const dDate = new Date(d.date);
      const now = new Date();
      return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear();
    }).reduce((sum, d) => sum + d.montant, 0);

    const totalYear = depenses.filter(d => {
        const dDate = new Date(d.date);
        const now = new Date();
        return dDate.getFullYear() === now.getFullYear();
    }).reduce((sum, d) => sum + d.montant, 0);

    return { totalCurrentMonth, totalYear };
  }, [depenses]);


  // --- Modal Functions ---
  const openAddModal = () => {
    setFormDepense({
      id: null, // New expense
      description: '',
      montant: '',
      date: new Date().toISOString().split('T')[0], // Default to today
      categorie: ''
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (depense) => {
    setSelectedDepense(depense);
    setFormDepense({
      id: depense.id,
      description: depense.description,
      montant: depense.montant,
      date: depense.date,
      categorie: depense.categorie
    });
    setIsAddModalOpen(true); // Re-use add modal for editing
  };

  const openDetailsModal = (depense) => {
    setSelectedDepense(depense);
    setIsDetailsModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedDepense(null); // Clear selected if editing
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedDepense(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormDepense(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formDepense.description || !formDepense.montant || !formDepense.date || !formDepense.categorie) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    if (selectedDepense) { // Editing existing expense
      setDepenses(prevDepenses => prevDepenses.map(d =>
        d.id === formDepense.id ? { ...formDepense, montant: parseFloat(formDepense.montant) } : d
      ));
      console.log("Dépense modifiée:", { ...formDepense, montant: parseFloat(formDepense.montant) });
    } else { // Adding new expense
      const newDepense = {
        ...formDepense,
        id: getNextId(),
        montant: parseFloat(formDepense.montant) // Ensure montant is a number
      };
      setDepenses(prevDepenses => [...prevDepenses, newDepense]);
      console.log("Nouvelle dépense ajoutée:", newDepense);
    }
    closeAddModal();
  };

  const handleDeleteDepense = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      setDepenses(prevDepenses => prevDepenses.filter(d => d.id !== id));
      console.log("Dépense supprimée:", id);
    }
  };

  // --- Table Columns Definition ---
  const columns = [
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
          <Button size="sm" variant="outline" icon={Eye} onClick={() => openDetailsModal(depense)} className="p-2">
            {/* Détails */}
          </Button>
          <Button size="sm" variant="info" icon={Edit2} onClick={() => openEditModal(depense)} className="p-2">
            {/* Modifier */}
          </Button>
          <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDeleteDepense(depense.id)} className="p-2">
            {/* Supprimer */}
          </Button>
        </div>
      )
    }
  ];

  // Unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const categories = new Set(initialDepenses.map(d => d.categorie));
    return ['Toutes les catégories', ...Array.from(categories).sort()];
  }, [initialDepenses]);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Dépenses</h1>
        <p className="text-gray-600 text-lg">Suivi détaillé de toutes les dépenses de l'établissement.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total dépenses ce mois</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCurrentMonth.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.totalYear.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Evolution Chart */}
      <Card className="p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Évolution Mensuelle des Dépenses</h2>
        <div style={{ width: '100%', height: '300px' }}> {/* Set explicit height for ResponsiveContainer */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={depensesEvolutionData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value) => `${(value / 1000).toLocaleString('fr-FR')}K FCFA`} />
              <Tooltip formatter={(value) => `${value.toLocaleString('fr-FR')} FCFA`} />
              <Legend />
              <Line type="monotone" dataKey="Montant" stroke="#01579B" activeDot={{ r: 8 }} /> {/* Red line for expenses */}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* History Table with Filters and Add Button */}
      <Card className="p-6 shadow-lg">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Historique des Dépenses</h2>
          <div className="flex flex-wrap items-center gap-4">
            {/* Search by Description */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dépense..."
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

            {/* Filter by Category */}
            <div className="relative flex items-center">
              <Tag className="absolute left-3 w-4 h-4 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
              >
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat === 'Toutes les catégories' ? '' : cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <Button onClick={openAddModal} icon={PlusCircle} className="px-4 py-2">
              Ajouter Dépense
            </Button>
          </div>
        </div>
        <Table columns={columns} data={filteredDepenses} />
      </Card>

      {/* Add/Edit Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title={selectedDepense ? "Modifier la dépense" : "Ajouter une nouvelle dépense"}
        size="sm"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 p-2">
          <InputField
            label="Description"
            name="description"
            value={formDepense.description}
            onChange={handleFormChange}
            placeholder="Ex: Salaires du mois de juin"
            required
          />
          <InputField
            label="Montant (FCFA)"
            name="montant"
            type="number"
            value={formDepense.montant}
            onChange={handleFormChange}
            placeholder="Ex: 1500000"
            required
          />
          <InputField
            label="Date"
            name="date"
            type="date"
            value={formDepense.date}
            onChange={handleFormChange}
            required
          />
          <div className="relative">
            <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              id="categorie"
              name="categorie"
              value={formDepense.categorie}
              onChange={handleFormChange}
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
            <Button variant="outline" onClick={closeAddModal}>
              Annuler
            </Button>
            <Button type="submit">
              {selectedDepense ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details Expense Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        title="Détails de la dépense"
        size="sm"
      >
        {selectedDepense && (
          <div className="space-y-3 text-gray-700 p-2">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <h3 className="font-bold text-lg text-blue-800 mb-1">{selectedDepense.description}</h3>
              <p className="text-2xl font-bold text-gray-900">{selectedDepense.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
            </div>
            <p><span className="font-medium">Catégorie:</span> {selectedDepense.categorie}</p>
            <p><span className="font-medium">Date:</span> {new Date(selectedDepense.date).toLocaleDateString('fr-FR')}</p>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={closeDetailsModal}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GestionDepenses;
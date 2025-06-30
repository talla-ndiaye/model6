import { Edit, Eye, Plus, Search, Trash2, Upload, Users } from 'lucide-react'; // Added Upload icon
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { classes, enseignants } from '../../data/donneesTemporaires';

const Classes = () => {
  const [classrooms, setClassrooms] = useState(classes);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNiveau, setFilterNiveau] = useState('');
  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: '',
    niveau: '',
    enseignantPrincipal: '',
    nombreEleves: '',
    salle: ''
  });

  
  //const niveaux = [...new Set(classes.map(c => c.niveau))].sort();
  const niveaux = ['6e','5e','4e','3e','2nd','1er','Tle'];

  const filteredClassrooms = classrooms.filter(classroom => {
    const matchesSearch = classroom.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          classroom.salle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNiveau = filterNiveau === '' || classroom.niveau === filterNiveau;
    return matchesSearch && matchesNiveau;
  });

  const getEnseignantName = (enseignantId) => {
    const enseignant = enseignants.find(e => e.id === enseignantId);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Non assigné';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const classData = {
      ...formData,
      enseignantPrincipal: parseInt(formData.enseignantPrincipal),
      nombreEleves: editingClass ? parseInt(formData.nombreEleves) : 0, 
    };

    if (editingClass) {
      console.log('Modification classe:', { ...classData, id: editingClass.id });
      setClassrooms(classrooms.map(classroom =>
        classroom.id === editingClass.id ? { ...classData, id: classroom.id } : classroom
      ));
    } else {
      const newClass = {
        ...classData,
        id: Math.max(...classrooms.map(c => c.id)) + 1 // Ensure unique ID
      };
      console.log('Ajout classe:', newClass);
      setClassrooms([...classrooms, newClass]);
    }

    resetForm();
  };

  const handleEdit = (classroom) => {
    setEditingClass(classroom);
    setFormData({
      nom: classroom.nom,
      niveau: classroom.niveau,
      enseignantPrincipal: classroom.enseignantPrincipal.toString(),
      nombreEleves: classroom.nombreEleves.toString(), 
      salle: classroom.salle
    });
    setShowModal(true);
  };

  

  const handleImportStudents = () => {
    if (editingClass) {
      navigate(`/admin/import-eleves/classe/${editingClass.id}`);
    } 
    setShowModal(false); 
  };


  const resetForm = () => {
    setFormData({
      nom: '',
      niveau: '',
      enseignantPrincipal: '',
      nombreEleves: '',
      salle: ''
    });
    setEditingClass(null);
    setShowModal(false);
  };

  const columns = [
    { header: 'Nom', accessor: 'nom' },
    { header: 'Niveau', accessor: 'niveau' },
    {
      header: 'Enseignant principal',
      accessor: 'enseignantPrincipal',
      render: (classroom) => getEnseignantName(classroom.enseignantPrincipal)
    },
    {
      header: 'Effectif',
      accessor: 'nombreEleves',
      render: (classroom) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1 text-gray-500" />
          {classroom.nombreEleves}
        </div>
      )
    },
    { header: 'Salle', accessor: 'salle' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (classroom) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`./details/${classroom.id}`)}
            icon={Eye}
          >
            Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(classroom)}
            icon={Edit}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="danger"
            
            icon={Trash2}
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des classes</h1>
          <p className="text-gray-600">Organiser les classes et leurs enseignants</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={Plus}>
          Nouvelle classe
        </Button>
      </div>

      <Card>
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <InputField
              placeholder="Rechercher par nom de classe ou salle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterNiveau}
              onChange={(e) => setFilterNiveau(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Tous les niveaux</option>
              {niveaux.map(niveau => (
                <option key={niveau} value={niveau}>
                  {niveau}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table columns={columns} data={filteredClassrooms} />
      </Card>

      {/* Modal d'ajout/modification */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingClass ? 'Modifier la classe' : 'Nouvelle classe'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Nom de la classe"
            value={formData.nom}
            onChange={(e) => setFormData({...formData, nom: e.target.value})}
            placeholder="ex: Terminale S1"
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.niveau}
              onChange={(e) => setFormData({...formData, niveau: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              required
            >
              <option value="">Sélectionner un niveau</option>
              {niveaux.map(niveau => (
                <option key={niveau} value={niveau}>
                  {niveau}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enseignant principal
            </label>
            <select
              value={formData.enseignantPrincipal}
              onChange={(e) => setFormData({...formData, enseignantPrincipal: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Aucun enseignant assigné</option>
              {enseignants.map(enseignant => (
                <option key={enseignant.id} value={enseignant.id}>
                  {enseignant.prenom} {enseignant.nom}
                </option>
              ))}
            </select>
          </div>

          <InputField
            label="Nombre d'élèves (sera mis à jour automatiquement)"
            type="number"
            value={formData.nombreEleves}
            onChange={(e) => setFormData({...formData, nombreEleves: e.target.value})} // Keep for editing existing class
            min="0" // Allow 0 students initially
            max="100" // Increased max for realism
            disabled={!editingClass} // Disable if adding new class (count is 0 initially)
            className={!editingClass ? 'bg-gray-100 cursor-not-allowed' : ''} // Style disabled state
          />

          <InputField
            label="Salle"
            value={formData.salle}
            onChange={(e) => setFormData({...formData, salle: e.target.value})}
            placeholder="ex: A101"
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={resetForm}>
              Annuler
            </Button>
            <Button type="submit">
              {editingClass ? 'Modifier' : 'Créer'}
            </Button>
            {editingClass && ( // Only show import button if editing an existing class
              <Button
                variant="secondary" // Or another suitable variant
                onClick={handleImportStudents}
                icon={Upload}
              >
                Importer élèves
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Classes;
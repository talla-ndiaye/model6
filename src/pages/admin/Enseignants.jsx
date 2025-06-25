import { BookOpen, Edit, Eye, Layers, Mail, Phone, Plus, Search, Trash2 } from 'lucide-react'; // Added necessary icons
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { classes, enseignants, matieres } from '../../data/donneesTemporaires';

const Enseignants = () => {
  const [teachers, setTeachers] = useState(enseignants);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term
  const [filterMatiere, setFilterMatiere] = useState(''); // New state for subject filter
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    matieres: [],
    classes: []
  });

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          teacher.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMatiere = filterMatiere === '' || teacher.matieres.includes(parseInt(filterMatiere));
    return matchesSearch && matchesMatiere;
  });

  const getMatiereNames = (matiereIds) => {
    return matiereIds.map(id => {
      const matiere = matieres.find(m => m.id === id);
      return matiere ? matiere.nom : 'N/A'; // Handle cases where matiere might not be found
    }).filter(Boolean).join(', ');
  };

  const getClasseNames = (classeIds) => {
    return classeIds.map(id => {
      const classe = classes.find(c => c.id === id);
      return classe ? classe.nom : 'N/A'; // Handle cases where classe might not be found
    }).filter(Boolean).join(', ');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const teacherData = {
      ...formData,
      matieres: formData.matieres.map(id => parseInt(id)),
      classes: formData.classes.map(id => parseInt(id))
    };

    if (editingTeacher) {
      console.log('Modification enseignant:', { ...teacherData, id: editingTeacher.id });
      setTeachers(teachers.map(teacher =>
        teacher.id === editingTeacher.id ? { ...teacherData, id: teacher.id } : teacher
      ));
    } else {
      const newTeacher = {
        ...teacherData,
        id: Math.max(...teachers.map(t => t.id)) + 1
      };
      console.log('Ajout enseignant:', newTeacher);
      setTeachers([...teachers, newTeacher]);
    }

    resetForm();
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      nom: teacher.nom,
      prenom: teacher.prenom,
      email: teacher.email,
      telephone: teacher.telephone,
      matieres: teacher.matieres.map(id => id.toString()),
      classes: teacher.classes.map(id => id.toString())
    });
    setShowDetail(false); // Close detail modal if open
    setShowModal(true); // Open edit modal
  };

  const handleDetail = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetail(true);
  };

  const handleDelete = (teacher) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${teacher.prenom} ${teacher.nom} ?`)) {
      console.log('Suppression enseignant:', teacher);
      setTeachers(teachers.filter(t => t.id !== teacher.id));
      setShowDetail(false); // Close detail modal after deletion
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      matieres: [],
      classes: []
    });
    setEditingTeacher(null);
    setShowModal(false);
  };

  const columns = [
    {
      header: 'Nom complet',
      accessor: 'nom',
      render: (teacher) => `${teacher.prenom} ${teacher.nom}`
    },
    { header: 'Email', accessor: 'email' },
    { header: 'Téléphone', accessor: 'telephone' },
    {
      header: 'Matières',
      accessor: 'matieres',
      render: (teacher) => getMatiereNames(teacher.matieres)
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (teacher) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDetail(teacher)}
            icon={Eye}
          >
            Détails
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(teacher)}
            icon={Edit}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(teacher)}
            icon={Trash2}
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      {Icon && <Icon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />} {/* Aligned icon with text */}
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des enseignants</h1>
          <p className="text-gray-600">Gérer le corps enseignant</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={Plus}>
          Nouvel enseignant
        </Button>
      </div>

      <Card>
        {/* Search and Filter Bar - NEW */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <InputField
              placeholder="Rechercher par nom ou prénom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterMatiere}
              onChange={(e) => setFilterMatiere(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Toutes les matières</option>
              {matieres.map(matiere => (
                <option key={matiere.id} value={matiere.id.toString()}>
                  {matiere.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table columns={columns} data={filteredTeachers} />
      </Card>

      {/* Modal d'ajout/modification */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingTeacher ? 'Modifier l\'enseignant' : 'Nouvel enseignant'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Prénom"
              value={formData.prenom}
              onChange={(e) => setFormData({...formData, prenom: e.target.value})}
              required
            />
            <InputField
              label="Nom"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              required
            />
          </div>

          <InputField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />

          <InputField
            label="Téléphone"
            value={formData.telephone}
            onChange={(e) => setFormData({...formData, telephone: e.target.value})}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matières enseignées
            </label>
            <select
              multiple
              value={formData.matieres}
              onChange={(e) => setFormData({
                ...formData,
                matieres: Array.from(e.target.selectedOptions, option => option.value)
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              size="4"
            >
              {matieres.map(matiere => (
                <option key={matiere.id} value={matiere.id}>
                  {matiere.nom}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl/Cmd pour sélectionner plusieurs matières</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classes assignées
            </label>
            <select
              multiple
              value={formData.classes}
              onChange={(e) => setFormData({
                ...formData,
                classes: Array.from(e.target.selectedOptions, option => option.value)
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              size="3"
            >
              {classes.map(classe => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={resetForm}>
              Annuler
            </Button>
            <Button type="submit">
              {editingTeacher ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de détails - Amélioré */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title="Détails de l'enseignant"
        size="md"
      >
        {selectedTeacher && (
          <div className="space-y-6">
            {/* Header section with Name and Avatar */}
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                {selectedTeacher.prenom.charAt(0)}{selectedTeacher.nom.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedTeacher.prenom} {selectedTeacher.nom}
                </h3>
                <p className="text-sm text-gray-500">Enseignant</p> {/* Static role for now */}
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Coordonnées</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailRow
                  icon={Mail}
                  label="Email"
                  value={selectedTeacher.email}
                />
                <DetailRow
                  icon={Phone}
                  label="Téléphone"
                  value={selectedTeacher.telephone}
                />
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Informations Académiques</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailRow
                  icon={Layers} // Icon for subjects
                  label="Matières enseignées"
                  value={getMatiereNames(selectedTeacher.matieres)}
                />
                <DetailRow
                  icon={BookOpen} // Icon for classes
                  label="Classes assignées"
                  value={getClasseNames(selectedTeacher.classes)}
                />
              </div>
            </div>

            {/* Action buttons at the bottom of the modal */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowDetail(false)}>
                Fermer
              </Button>
              <Button variant="secondary" onClick={() => handleEdit(selectedTeacher)} icon={Edit}>
                Modifier
              </Button>
              <Button variant="danger" onClick={() => handleDelete(selectedTeacher)} icon={Trash2}>
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Enseignants;
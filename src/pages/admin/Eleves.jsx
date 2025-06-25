import { BookOpen, CalendarDays, Edit, Eye, Home, Mail, Phone, Plus, Search, Trash2 } from 'lucide-react'; // Added more icons
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { classes, eleves } from '../../data/donneesTemporaires';

const Eleves = () => {
  const [students, setStudents] = useState(eleves);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    classeId: '',
    telephone: '',
    email: '',
    adresse: ''
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClasse = filterClasse === '' || student.classeId.toString() === filterClasse;
    return matchesSearch && matchesClasse;
  });

  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Non assigné';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const studentData = {
      ...formData,
      classeId: parseInt(formData.classeId)
    };

    if (editingStudent) {
      console.log('Modification élève:', { ...studentData, id: editingStudent.id });
      setStudents(students.map(student =>
        student.id === editingStudent.id ? { ...studentData, id: student.id, parentIds: student.parentIds } : student
      ));
    } else {
      const newStudent = {
        ...studentData,
        id: Math.max(...students.map(s => s.id)) + 1,
        parentIds: []
      };
      console.log('Ajout élève:', newStudent);
      setStudents([...students, newStudent]);
    }

    resetForm();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      nom: student.nom,
      prenom: student.prenom,
      dateNaissance: student.dateNaissance,
      classeId: student.classeId.toString(),
      telephone: student.telephone,
      email: student.email,
      adresse: student.adresse
    });
    setShowDetailModal(false); // Close detail modal if open
    setShowModal(true); // Open edit modal
  };

  const handleDetail = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleDelete = (student) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${student.prenom} ${student.nom} ?`)) {
      console.log('Suppression élève:', student);
      setStudents(students.filter(s => s.id !== student.id));
      setShowDetailModal(false); // Close detail modal after deletion
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      dateNaissance: '',
      classeId: '',
      telephone: '',
      email: '',
      adresse: ''
    });
    setEditingStudent(null);
    setShowModal(false);
  };

  const columns = [
    {
      header: 'Nom complet',
      accessor: 'nom',
      render: (student) => `${student.prenom} ${student.nom}`
    },
    {
      header: 'Date de naissance',
      accessor: 'dateNaissance',
      render: (student) => new Date(student.dateNaissance).toLocaleDateString('fr-FR')
    },
    {
      header: 'Classe',
      accessor: 'classeId',
      render: (student) => getClassName(student.classeId)
    },
    { header: 'Téléphone', accessor: 'telephone' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (student) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDetail(student)}
            icon={Eye}
          >
            Détails
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(student)}
            icon={Edit}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(student)}
            icon={Trash2}
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      {Icon && <Icon className="w-5 h-5 text-blue-500 flex-shrink-0" />}
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des élèves</h1>
          <p className="text-gray-600">Gérer les informations des élèves</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={Plus}>
          Nouvel élève
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <InputField
              placeholder="Rechercher par nom ou prénom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search} // Added search icon to input
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterClasse}
              onChange={(e) => setFilterClasse(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700" // Added text color
            >
              <option value="">Toutes les classes</option>
              {classes.map(classe => (
                <option key={classe.id} value={classe.id.toString()}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredStudents}
        />
      </Card>

      {/* Modal d'ajout/modification */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingStudent ? 'Modifier l\'élève' : 'Nouvel élève'}
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
            label="Date de naissance"
            type="date"
            value={formData.dateNaissance}
            onChange={(e) => setFormData({...formData, dateNaissance: e.target.value})}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classe <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.classeId}
              onChange={(e) => setFormData({...formData, classeId: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              required
            >
              <option value="">Sélectionner une classe</option>
              {classes.map(classe => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
            </select>
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

          <InputField
            label="Adresse"
            value={formData.adresse}
            onChange={(e) => setFormData({...formData, adresse: e.target.value})}
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={resetForm}>
              Annuler
            </Button>
            <Button type="submit">
              {editingStudent ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de détails - Amélioré */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails de l'élève"
        size="md"
      >
        {selectedStudent && (
          <div className="space-y-6"> {/* Increased overall spacing */}
            {/* Header section with Name and Avatar */}
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                {selectedStudent.prenom.charAt(0)}{selectedStudent.nom.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedStudent.prenom} {selectedStudent.nom}
                </h3>
                <p className="text-sm text-gray-500">{getClassName(selectedStudent.classeId)}</p>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Informations Personnelles</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailRow
                  icon={CalendarDays}
                  label="Date de naissance"
                  value={new Date(selectedStudent.dateNaissance).toLocaleDateString('fr-FR')}
                />
                <DetailRow
                  icon={BookOpen}
                  label="Classe"
                  value={getClassName(selectedStudent.classeId)}
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Coordonnées</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailRow
                  icon={Mail}
                  label="Email"
                  value={selectedStudent.email}
                />
                <DetailRow
                  icon={Phone}
                  label="Téléphone"
                  value={selectedStudent.telephone}
                />
                <DetailRow
                  icon={Home}
                  label="Adresse"
                  value={selectedStudent.adresse}
                />
              </div>
            </div>

            {/* Action buttons at the bottom of the modal */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Fermer
              </Button>
              <Button variant="secondary" onClick={() => handleEdit(selectedStudent)} icon={Edit}>
                Modifier
              </Button>
              
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Eleves;
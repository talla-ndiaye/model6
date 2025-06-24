import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { eleves, classes } from '../../data/donneesTemporaires';

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
    setShowModal(true);
  };

  const handleDetail = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleDelete = (student) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${student.prenom} ${student.nom} ?`)) {
      console.log('Suppression élève:', student);
      setStudents(students.filter(s => s.id !== student.id));
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
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterClasse}
              onChange={(e) => setFilterClasse(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

      {/* Modal de détails */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails de l'élève"
        size="md"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <p className="mt-1 text-sm text-gray-900">{selectedStudent.prenom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <p className="mt-1 text-sm text-gray-900">{selectedStudent.nom}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(selectedStudent.dateNaissance).toLocaleDateString('fr-FR')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Classe</label>
              <p className="mt-1 text-sm text-gray-900">{getClassName(selectedStudent.classeId)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{selectedStudent.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <p className="mt-1 text-sm text-gray-900">{selectedStudent.telephone}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <p className="mt-1 text-sm text-gray-900">{selectedStudent.adresse}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Eleves;
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { enseignants, matieres, classes } from '../../data/donneesTemporaires';

const Enseignants = () => {
  const [teachers, setTeachers] = useState(enseignants);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    matieres: [],
    classes: []
  });

  const getMatiereNames = (matiereIds) => {
    return matiereIds.map(id => {
      const matiere = matieres.find(m => m.id === id);
      return matiere ? matiere.nom : '';
    }).filter(Boolean).join(', ');
  };

  const getClasseNames = (classeIds) => {
    return classeIds.map(id => {
      const classe = classes.find(c => c.id === id);
      return classe ? classe.nom : '';
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
    setShowModal(true);
  };

  const handleDetail = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetail(true);
  };

  const handleDelete = (teacher) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${teacher.prenom} ${teacher.nom} ?`)) {
      console.log('Suppression enseignant:', teacher);
      setTeachers(teachers.filter(t => t.id !== teacher.id));
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
        <Table columns={columns} data={teachers} />
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

      {/* Modal de détails */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title="Détails de l'enseignant"
        size="md"
      >
        {selectedTeacher && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <p className="mt-1 text-sm text-gray-900">{selectedTeacher.prenom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <p className="mt-1 text-sm text-gray-900">{selectedTeacher.nom}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{selectedTeacher.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <p className="mt-1 text-sm text-gray-900">{selectedTeacher.telephone}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Matières enseignées</label>
              <p className="mt-1 text-sm text-gray-900">{getMatiereNames(selectedTeacher.matieres)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Classes assignées</label>
              <p className="mt-1 text-sm text-gray-900">{getClasseNames(selectedTeacher.classes)}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Enseignants;
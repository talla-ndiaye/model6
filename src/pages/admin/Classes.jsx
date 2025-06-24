import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { classes, enseignants } from '../../data/donneesTemporaires';

const Classes = () => {
  const [classrooms, setClassrooms] = useState(classes);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    niveau: '',
    enseignantPrincipal: '',
    nombreEleves: '',
    salle: ''
  });

  const niveaux = ['6ème', '5ème', '4ème', '3ème'];

  const getEnseignantName = (enseignantId) => {
    const enseignant = enseignants.find(e => e.id === enseignantId);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Non assigné';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const classData = {
      ...formData,
      enseignantPrincipal: parseInt(formData.enseignantPrincipal),
      nombreEleves: parseInt(formData.nombreEleves)
    };

    if (editingClass) {
      console.log('Modification classe:', { ...classData, id: editingClass.id });
      setClassrooms(classrooms.map(classroom => 
        classroom.id === editingClass.id ? { ...classData, id: classroom.id } : classroom
      ));
    } else {
      const newClass = { 
        ...classData, 
        id: Math.max(...classrooms.map(c => c.id)) + 1
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

  const handleDelete = (classroom) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la classe ${classroom.nom} ?`)) {
      console.log('Suppression classe:', classroom);
      setClassrooms(classrooms.filter(c => c.id !== classroom.id));
    }
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
      header: 'Élèves',
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
            onClick={() => handleEdit(classroom)}
            icon={Edit}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(classroom)}
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
        <Table columns={columns} data={classrooms} />
      </Card>

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
            placeholder="ex: 3ème A"
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.niveau}
              onChange={(e) => setFormData({...formData, niveau: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            label="Nombre d'élèves"
            type="number"
            value={formData.nombreEleves}
            onChange={(e) => setFormData({...formData, nombreEleves: e.target.value})}
            min="1"
            max="35"
            required
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
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Classes;
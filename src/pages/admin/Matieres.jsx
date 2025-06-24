import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import { matieres } from '../../data/donneesTemporaires';

const Matieres = () => {
  const [subjects, setSubjects] = useState(matieres);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    coefficient: '',
    couleur: '#3b82f6'
  });

  const couleursPredefinies = [
    '#3b82f6', '#ef4444', '#f59e0b', '#10b981', 
    '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const subjectData = {
      ...formData,
      coefficient: parseInt(formData.coefficient)
    };

    if (editingSubject) {
      console.log('Modification matière:', { ...subjectData, id: editingSubject.id });
      setSubjects(subjects.map(subject => 
        subject.id === editingSubject.id ? { ...subjectData, id: subject.id } : subject
      ));
    } else {
      const newSubject = { 
        ...subjectData, 
        id: Math.max(...subjects.map(s => s.id)) + 1
      };
      console.log('Ajout matière:', newSubject);
      setSubjects([...subjects, newSubject]);
    }
    
    resetForm();
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      nom: subject.nom,
      code: subject.code,
      coefficient: subject.coefficient.toString(),
      couleur: subject.couleur
    });
    setShowModal(true);
  };

  const handleDelete = (subject) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la matière ${subject.nom} ?`)) {
      console.log('Suppression matière:', subject);
      setSubjects(subjects.filter(s => s.id !== subject.id));
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      code: '',
      coefficient: '',
      couleur: '#3b82f6'
    });
    setEditingSubject(null);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des matières</h1>
          <p className="text-gray-600">Configurer les matières enseignées</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={Plus}>
          Nouvelle matière
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: subject.couleur }}
                >
                  {subject.code}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{subject.nom}</h3>
                  <p className="text-sm text-gray-600">Coefficient: {subject.coefficient}</p>
                </div>
              </div>
              
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(subject)}
                  icon={Edit}
                />
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(subject)}
                  icon={Trash2}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingSubject ? 'Modifier la matière' : 'Nouvelle matière'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Nom de la matière"
            value={formData.nom}
            onChange={(e) => setFormData({...formData, nom: e.target.value})}
            placeholder="ex: Mathématiques"
            required
          />

          <InputField
            label="Code de la matière"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
            placeholder="ex: MATH"
            required
          />

          <InputField
            label="Coefficient"
            type="number"
            value={formData.coefficient}
            onChange={(e) => setFormData({...formData, coefficient: e.target.value})}
            min="1"
            max="10"
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.couleur}
                onChange={(e) => setFormData({...formData, couleur: e.target.value})}
                className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
              <div className="flex flex-wrap gap-2">
                {couleursPredefinies.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({...formData, couleur: color})}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={resetForm}>
              Annuler
            </Button>
            <Button type="submit">
              {editingSubject ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Matieres;
import { BookOpen, Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import { matieres } from '../../data/donneesTemporaires';

const Matieres = () => {
  const [subjects, setSubjects] = useState(matieres);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    coefficient: '',
    couleur: '#3b82f6' // Default color for the background circle, not icon color
  });

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
    setShowDetailModal(false);
    setShowModal(true);
  };

  const handleDetail = (subject) => {
    setSelectedSubject(subject);
    setShowDetailModal(true);
  };

  const handleDelete = (subject) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la matière ${subject.nom} ?`)) {
      console.log('Suppression matière:', subject);
      setSubjects(subjects.filter(s => s.id !== subject.id));
      setShowDetailModal(false);
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

  const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm text-gray-800 font-semibold">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des matières</h1>
          <p className="text-gray-600">Gérez les matières enseignées</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={Plus}>
          Nouvelle Matière
        </Button>
      </div>

      <div className="mb-6">
        <InputField
          placeholder="Rechercher une matière par nom ou code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={Search}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id} className="p-6 relative flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-blue-600 border border-blue-200"
                  // Background color of the circle still uses subject.couleur, but icon inside won't.
                  // The '1A' suffix creates a very light transparency for the background color
                  // The '40' suffix creates a more visible transparency for the border color
                  style={{ backgroundColor: subject.couleur + '1A', borderColor: subject.couleur + '40' }}
                >
                  {/* Changed icon color to a fixed blue, not dependent on subject.couleur */}
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{subject.nom}</h3>
                  <p className="text-sm text-gray-600 uppercase">{subject.code}</p>
                </div>
              </div>

              <div className="flex space-x-1 mt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(subject)}
                  icon={Edit}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(subject)}
                  icon={Trash2}
                />
              </div>
            </div>

            <div className="w-full mt-auto">
              <Button
                variant="outline"
                onClick={() => handleDetail(subject)}
                className="w-full"
              >
                Voir les détails
              </Button>
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

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails de la matière"
        size="sm"
      >
        {selectedSubject && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                // Background color of the circle still uses subject.couleur
                style={{ backgroundColor: selectedSubject.couleur + '1A', color: selectedSubject.couleur }}
              >
                {/* Fixed icon color in detail modal as well */}
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedSubject.nom}</h3>
                <p className="text-sm text-gray-500 uppercase">{selectedSubject.code}</p>
              </div>
            </div>

            <DetailRow label="Nom complet" value={selectedSubject.nom} />
            <DetailRow label="Code" value={selectedSubject.code} />
            <DetailRow label="Coefficient" value={selectedSubject.coefficient} />
            <DetailRow label="Couleur (Hex)" value={selectedSubject.couleur} />

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Fermer
              </Button>
              <Button variant="secondary" onClick={() => handleEdit(selectedSubject)} icon={Edit}>
                Modifier
              </Button>
              <Button variant="danger" onClick={() => handleDelete(selectedSubject)} icon={Trash2}>
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Matieres;
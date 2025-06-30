import { BadgeCheck, BookOpen, CalendarDays, Edit, Eye, Home, Mail, Phone, Plus, Search, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { classes, eleves, utilisateurs, } from '../../data/donneesTemporaires';

const Eleves = () => {
  const [students, setStudents] = useState(eleves);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [filterSexe, setFilterSexe] = useState('');


  const navigate = useNavigate(); 

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    classeId: '',
    telephone: '',
    email: '',
    adresse: '',
    sexe: '',
    parentIds: []
  });

  const getParentInfo = (parentId) => {
    return utilisateurs.find(user => user.id === parentId && user.role === 'parent');
  };

  const getParentsContact = (parentIds) => {
    if (!parentIds || parentIds.length === 0) return 'Non renseigné';
    return parentIds.map(parentId => {
      const parent = getParentInfo(parentId);
      if (parent) {
        return (
          <div key={parentId} className="mb-1 last:mb-0">
            <p className="text-sm font-medium text-gray-900">{parent.prenom} {parent.nom}</p>
            <p className="text-xs text-gray-600 flex items-center"><Phone className="w-3 h-3 mr-1" />{parent.telephone || 'N/A'}</p>
            <p className="text-xs text-gray-600 flex items-center"><Mail className="w-3 h-3 mr-1" />{parent.email || 'N/A'}</p>
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };


  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.prenom.toLowerCase().includes(searchTerm.toLowerCase())||
                          student.telephone.toLowerCase().includes(searchTerm.toLowerCase())||
                          student.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClasse = filterClasse === '' || student.classeId.toString() === filterClasse;
    const matchesSexe = filterSexe === '' || student.sexe === filterSexe;

    return matchesSearch && matchesClasse && matchesSexe;
  }).sort((a, b) => {
    const nameA = `${a.prenom} ${a.nom}`.toLowerCase();
    const nameB = `${b.prenom} ${b.nom}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Non assigné';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const studentData = {
      ...formData,
      classeId: parseInt(formData.classeId),
      parentIds: formData.parentIds.map(Number)
    };

    if (editingStudent) {
      console.log('Modification élève:', { ...studentData, id: editingStudent.id });
      setStudents(students.map(student =>
        student.id === editingStudent.id ? { ...studentData, id: student.id } : student
      ));
    } else {
      const newStudent = {
        ...studentData,
        id: Math.max(...students.map(s => s.id)) + 1, 
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
      adresse: student.adresse,
      sexe: student.sexe || '',
      parentIds: student.parentIds?.map(String) || []
    });
    setShowDetailModal(false); 
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
      setShowDetailModal(false); 
    }
  };

  const handleViewProfile = (studentId) => {
    setShowDetailModal(false); 
    navigate(`profil/${studentId}`);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      dateNaissance: '',
      classeId: '',
      telephone: '',
      email: '',
      adresse: '',
      sexe: '',
      parentIds: []
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
    {
      header: 'Parent(s) Contact',
      accessor: 'parentIds',
      render: (student) => getParentsContact(student.parentIds)
    },
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

  const parentOptions = utilisateurs.filter(u => u.role === 'parent').map(p => ({
    value: p.id,
    label: `${p.prenom} ${p.nom} (ID: ${p.id})`
  }));

  return (
    <div className="space-y-6">
      <div className="block lg:flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des élèves</h1>
          <p className="text-gray-600">Gérer les informations des élèves</p>
        </div>
        <div className='row'>
          <Button onClick={() => setShowModal(true)} icon={Plus} className='w-full'>
          Nouvel élève
        </Button>
        </div>
        
      </div>

      <Card>
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
              value={filterClasse}
              onChange={(e) => setFilterClasse(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Toutes les classes</option>
              {classes.map(classe => (
                <option key={classe.id} value={classe.id.toString()}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={filterSexe}
              onChange={(e) => setFilterSexe(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Tous les sexes</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
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

          <InputField
            label="Sexe"
            type="select"
            value={formData.sexe}
            onChange={(e) => setFormData({...formData, sexe: e.target.value})}
            options={[
              { value: '', label: 'Sélectionner le sexe' },
              { value: 'M', label: 'Masculin' },
              { value: 'F', label: 'Féminin' }
            ]}
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

          <InputField
            label="Parent(s) associé(s)"
            type="select"
            multiple
            value={formData.parentIds}
            onChange={(e) => setFormData({...formData, parentIds: Array.from(e.target.selectedOptions, option => option.value)})}
            options={parentOptions}
            placeholder="Sélectionner un ou plusieurs parents"
            className="h-32"
          />
          <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl/Cmd pour sélectionner plusieurs parents</p>

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
          <div className="space-y-6">
            {/* Header  */}
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

            {/* infos*/}
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
                <DetailRow
                  icon={selectedStudent.sexe === 'M' ? User : User}
                  label="Sexe"
                  value={selectedStudent.sexe === 'M' ? 'Masculin' : selectedStudent.sexe === 'F' ? 'Féminin' : 'Non spécifié'}
                />
                <DetailRow
                  icon={BadgeCheck}
                  label="Matricule"
                  value={(selectedStudent.matricule)}
                />
              </div>
            </div>

            {/* Contact  */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Coordonnées Élève</h4>
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

            {/* Parent Infos */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Informations Parentales</h4>
              {selectedStudent.parentIds && selectedStudent.parentIds.length > 0 ? (
                selectedStudent.parentIds.map(parentId => {
                  const parent = getParentInfo(parentId);
                  if (parent) {
                    return (
                      <div key={parentId} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailRow icon={User} label="Parent" value={`${parent.prenom} ${parent.nom}`} />
                        <DetailRow icon={Phone} label="Téléphone Parent" value={parent.telephone || 'N/A'} />
                        <DetailRow icon={Mail} label="Email Parent" value={parent.email || 'N/A'} />
                      </div>
                    );
                  }
                  return null;
                })
              ) : (
                <p className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">Aucun parent associé.</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Fermer
              </Button>
              <Button variant="secondary" onClick={() => handleEdit(selectedStudent)} icon={Edit}>
                Modifier
              </Button>
              <Button variant="danger" onClick={() => handleDelete(selectedStudent)} icon={Trash2}>
                Supprimer
              </Button>
              
              <Button
                variant="primary" 
                onClick={() => handleViewProfile(selectedStudent.id)}
                icon={Eye}
              >
                Voir profil complet
              </Button>
            </div>
            
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Eleves;
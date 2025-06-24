import { AlertCircle, CheckCircle, Clock, Users, UserX, XCircle } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { classes, eleves, presences as initialPresences } from '../../data/donneesTemporaires';

const GestionPresences = () => {
  const { user } = useAuth();
  const [presences, setPresences] = useState(initialPresences);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Récupérer les classes de l'enseignant
  const mesClasses = classes.filter(classe => 
    classe.enseignantPrincipal === user.id || 
    user.classes?.includes(classe.id)
  );

  // Récupérer les élèves de la classe sélectionnée
  const elevesClasse = selectedClass 
    ? eleves.filter(eleve => eleve.classeId === parseInt(selectedClass))
    : [];

  // Récupérer les présences du jour pour la classe
  const presencesDuJour = presences.filter(presence => 
    presence.date === selectedDate && 
    presence.classeId === parseInt(selectedClass)
  );

  const getPresenceForStudent = (eleveId) => {
    return presencesDuJour.find(p => p.eleveId === eleveId);
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'retard':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'renvoye':
        return <UserX className="w-5 h-5 text-purple-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'present':
        return 'Présent';
      case 'absent':
        return 'Absent';
      case 'retard':
        return 'En retard';
      case 'renvoye':
        return 'Renvoyé';
      default:
        return 'Non défini';
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'retard':
        return 'bg-orange-100 text-orange-800';
      case 'renvoye':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (eleveId, newStatus) => {
    const existingPresence = getPresenceForStudent(eleveId);
    const now = new Date().toISOString();

    if (existingPresence) {
      // Mettre à jour la présence existante
      setPresences(presences.map(p => 
        p.id === existingPresence.id 
          ? { ...p, statut: newStatus, dateModification: now }
          : p
      ));
    } else {
      // Créer une nouvelle présence
      const newPresence = {
        id: Math.max(...presences.map(p => p.id)) + 1,
        eleveId,
        date: selectedDate,
        statut: newStatus,
        heureDebut: '08:00',
        heureFin: '17:00',
        enseignantId: user.id,
        classeId: parseInt(selectedClass),
        justifie: false,
        motifJustification: '',
        commentaire: '',
        dateCreation: now,
        dateModification: now
      };
      setPresences([...presences, newPresence]);
    }

    console.log(`Présence mise à jour: Élève ${eleveId}, Statut: ${newStatus}`);
  };

  const openCommentModal = (eleve) => {
    setSelectedStudent(eleve);
    setShowModal(true);
  };

  const saveComment = (commentaire) => {
    const presence = getPresenceForStudent(selectedStudent.id);
    if (presence) {
      setPresences(presences.map(p => 
        p.id === presence.id 
          ? { ...p, commentaire, dateModification: new Date().toISOString() }
          : p
      ));
    }
    setShowModal(false);
    setSelectedStudent(null);
  };

  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : '';
  };

  const getStats = () => {
    const total = elevesClasse.length;
    const presents = presencesDuJour.filter(p => p.statut === 'present').length;
    const absents = presencesDuJour.filter(p => p.statut === 'absent').length;
    const retards = presencesDuJour.filter(p => p.statut === 'retard').length;
    const renvoyes = presencesDuJour.filter(p => p.statut === 'renvoye').length;
    const nonDefinis = total - presencesDuJour.length;

    return { total, presents, absents, retards, renvoyes, nonDefinis };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des présences</h1>
        <p className="text-gray-600">Marquer les présences de vos élèves</p>
      </div>

      {/* Filtres */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classe
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner une classe</option>
              {mesClasses.map(classe => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Card>

      {selectedClass && (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="p-4 text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </Card>

            <Card className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats.presents}</p>
              <p className="text-sm text-gray-600">Présents</p>
            </Card>

            <Card className="p-4 text-center">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{stats.absents}</p>
              <p className="text-sm text-gray-600">Absents</p>
            </Card>

            <Card className="p-4 text-center">
              <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">{stats.retards}</p>
              <p className="text-sm text-gray-600">Retards</p>
            </Card>

            <Card className="p-4 text-center">
              <UserX className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{stats.renvoyes}</p>
              <p className="text-sm text-gray-600">Renvoyés</p>
            </Card>

            <Card className="p-4 text-center">
              <AlertCircle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-600">{stats.nonDefinis}</p>
              <p className="text-sm text-gray-600">Non définis</p>
            </Card>
          </div>

          {/* Liste des élèves */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Présences - {getClassName(parseInt(selectedClass))} - {new Date(selectedDate).toLocaleDateString('fr-FR')}
              </h2>

              <div className="space-y-4">
                {elevesClasse.map(eleve => {
                  const presence = getPresenceForStudent(eleve.id);
                  const statut = presence?.statut || 'non_defini';

                  return (
                    <div key={eleve.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {eleve.prenom.charAt(0)}{eleve.nom.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {eleve.prenom} {eleve.nom}
                          </h3>
                          <p className="text-sm text-gray-600">{eleve.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Statut actuel */}
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(statut)}
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(statut)}`}>
                            {getStatusLabel(statut)}
                          </span>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleStatusChange(eleve.id, 'present')}
                            className={`p-2 rounded-lg transition-colors ${
                              statut === 'present' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                            }`}
                            title="Présent"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleStatusChange(eleve.id, 'absent')}
                            className={`p-2 rounded-lg transition-colors ${
                              statut === 'absent' 
                                ? 'bg-red-100 text-red-600' 
                                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                            }`}
                            title="Absent"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleStatusChange(eleve.id, 'retard')}
                            className={`p-2 rounded-lg transition-colors ${
                              statut === 'retard' 
                                ? 'bg-orange-100 text-orange-600' 
                                : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'
                            }`}
                            title="En retard"
                          >
                            <Clock className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleStatusChange(eleve.id, 'renvoye')}
                            className={`p-2 rounded-lg transition-colors ${
                              statut === 'renvoye' 
                                ? 'bg-purple-100 text-purple-600' 
                                : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                            }`}
                            title="Renvoyé"
                          >
                            <UserX className="w-4 h-4" />
                          </button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openCommentModal(eleve)}
                          >
                            Commentaire
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Modal commentaire */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Commentaire - ${selectedStudent?.prenom} ${selectedStudent?.nom}`}
        size="md"
      >
        {selectedStudent && (
          <CommentForm
            student={selectedStudent}
            presence={getPresenceForStudent(selectedStudent.id)}
            onSave={saveComment}
            onCancel={() => setShowModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

// Composant pour le formulaire de commentaire
const CommentForm = ({ student, presence, onSave, onCancel }) => {
  const [commentaire, setCommentaire] = useState(presence?.commentaire || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(commentaire);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Commentaire sur la présence
        </label>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          rows={4}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ajouter un commentaire..."
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          Enregistrer
        </Button>
      </div>
    </form>
  );
};

export default GestionPresences;
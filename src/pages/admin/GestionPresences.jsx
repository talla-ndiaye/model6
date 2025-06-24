import { AlertCircle, CheckCircle, Clock, Edit, Users, UserX, XCircle } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import { classes, eleves, presences as initialPresences } from '../../data/donneesTemporaires';

const GestionPresencesAdmin = () => {
  const [presences, setPresences] = useState(initialPresences);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPresence, setSelectedPresence] = useState(null);
  const [formData, setFormData] = useState({
    justifie: false,
    motifJustification: '',
    commentaire: ''
  });

  // Récupérer les élèves de la classe sélectionnée
  const elevesClasse = selectedClass 
    ? eleves.filter(eleve => eleve.classeId === parseInt(selectedClass))
    : [];

  // Récupérer les présences du jour pour la classe
  const presencesDuJour = presences.filter(presence => 
    presence.date === selectedDate && 
    (!selectedClass || presence.classeId === parseInt(selectedClass))
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

  const getEleveName = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const openJustificationModal = (presence) => {
    setSelectedPresence(presence);
    setFormData({
      justifie: presence.justifie,
      motifJustification: presence.motifJustification || '',
      commentaire: presence.commentaire || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setPresences(presences.map(p => 
      p.id === selectedPresence.id 
        ? { 
            ...p, 
            justifie: formData.justifie,
            motifJustification: formData.motifJustification,
            commentaire: formData.commentaire,
            dateModification: new Date().toISOString()
          }
        : p
    ));

    console.log('Justification mise à jour:', {
      presenceId: selectedPresence.id,
      ...formData
    });

    setShowModal(false);
    setSelectedPresence(null);
  };

  const resetForm = () => {
    setFormData({
      justifie: false,
      motifJustification: '',
      commentaire: ''
    });
    setSelectedPresence(null);
    setShowModal(false);
  };

  const getStats = () => {
    const total = presencesDuJour.length;
    const presents = presencesDuJour.filter(p => p.statut === 'present').length;
    const absents = presencesDuJour.filter(p => p.statut === 'absent').length;
    const retards = presencesDuJour.filter(p => p.statut === 'retard').length;
    const renvoyes = presencesDuJour.filter(p => p.statut === 'renvoye').length;
    const justifies = presencesDuJour.filter(p => p.justifie).length;
    const nonJustifies = presencesDuJour.filter(p => !p.justifie && p.statut !== 'present').length;

    return { total, presents, absents, retards, renvoyes, justifies, nonJustifies };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des présences</h1>
        <p className="text-gray-600">Administrer les présences et justifications</p>
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
              <option value="">Toutes les classes</option>
              {classes.map(classe => (
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

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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
          <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{stats.justifies}</p>
          <p className="text-sm text-gray-600">Justifiés</p>
        </Card>

        <Card className="p-4 text-center">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">{stats.nonJustifies}</p>
          <p className="text-sm text-gray-600">Non justifiés</p>
        </Card>
      </div>

      {/* Liste des présences */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Présences du {new Date(selectedDate).toLocaleDateString('fr-FR')}
          </h2>

          <div className="space-y-4">
            {presencesDuJour.map(presence => {
              const eleve = eleves.find(e => e.id === presence.eleveId);
              
              return (
                <div key={presence.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {eleve?.prenom.charAt(0)}{eleve?.nom.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {getEleveName(presence.eleveId)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getClassName(presence.classeId)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Statut */}
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(presence.statut)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(presence.statut)}`}>
                        {getStatusLabel(presence.statut)}
                      </span>
                    </div>

                    {/* Justification */}
                    <div className="flex items-center space-x-2">
                      {presence.justifie ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Justifié
                        </span>
                      ) : presence.statut !== 'present' ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Non justifié
                        </span>
                      ) : null}
                    </div>

                    {/* Commentaire */}
                    {presence.commentaire && (
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 truncate" title={presence.commentaire}>
                          {presence.commentaire}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openJustificationModal(presence)}
                      icon={Edit}
                    >
                      Gérer
                    </Button>
                  </div>
                </div>
              );
            })}

            {presencesDuJour.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune présence enregistrée pour cette date</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Modal de gestion des justifications */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={`Gestion de la présence - ${selectedPresence ? getEleveName(selectedPresence.eleveId) : ''}`}
        size="md"
      >
        {selectedPresence && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Statut:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedPresence.statut)}
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedPresence.statut)}`}>
                      {getStatusLabel(selectedPresence.statut)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Classe:</span>
                  <p className="font-medium">{getClassName(selectedPresence.classeId)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <p className="font-medium">{new Date(selectedPresence.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Enseignant:</span>
                  <p className="font-medium">Prof. Martin</p>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="justifie"
                checked={formData.justifie}
                onChange={(e) => setFormData({...formData, justifie: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="justifie" className="ml-2 block text-sm text-gray-900">
                Absence/Retard justifié(e)
              </label>
            </div>

            <InputField
              label="Motif de justification"
              value={formData.motifJustification}
              onChange={(e) => setFormData({...formData, motifJustification: e.target.value})}
              placeholder="Rendez-vous médical, problème de transport..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire administratif
              </label>
              <textarea
                value={formData.commentaire}
                onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Commentaire interne..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button type="submit">
                Enregistrer
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default GestionPresencesAdmin;
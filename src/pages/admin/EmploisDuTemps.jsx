import {
  BookOpen,
  Calendar,
  Clock,
  Edit,
  GraduationCap,
  Layers,
  MapPin,
  Plus,
  Trash2,
  User,
  Users
} from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import { classes, emploisDuTemps, enseignants, matieres } from '../../data/donneesTemporaires';

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
    {Icon && <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />}
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const EmploisDuTempsPage = () => {
  const [classeSelectionnee, setClasseSelectionnee] = useState('');
  const [modalOuverte, setModalOuverte] = useState(false);
  const [coursSelectionne, setCoursSelectionne] = useState(null);
  const [typeModal, setTypeModal] = useState('');

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const heures = [
    '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00','16:00-18:00'
  ];

  const getEmploiForClass = (classeId) => {
    return emploisDuTemps.filter(e => String(e.classeId) === String(classeId));
  };

  const getCoursPourJourHeure = (jour, heure) => {
    const cours = getEmploiForClass(classeSelectionnee).find(
      e => e.jour === jour && e.heure === heure
    );

    if (!cours) return null;

    const matiere = matieres.find(m => m.id === cours.matiereId);
    const enseignant = enseignants.find(e => e.id === cours.enseignantId);

    return {
      ...cours,
      matiereNom: matiere?.nom || 'Matière inconnue',
      matiereCode: matiere?.code || 'XXX',
      matiereCouleur: matiere?.couleur || '#60A5FA',
      enseignantNomComplet: enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Enseignant inconnu',
      salle: cours.salle || 'N/A'
    };
  };

  const ouvrirModal = (type, cours = null) => {
    if (type === 'ajouter' && classeSelectionnee) {
      setCoursSelectionne({ ...cours, classeId: parseInt(classeSelectionnee) });
    } else {
      setCoursSelectionne(cours);
    }
    setTypeModal(type);
    setModalOuverte(true);
  };

  const fermerModal = () => {
    setModalOuverte(false);
    setCoursSelectionne(null);
    setTypeModal('');
  };

  const getClassNameById = (classeId) => {
    return classes.find(c => String(c.id) === String(classeId))?.nom || 'Classe inconnue';
  };

  const FormulaireCours = () => {
    const [formData, setFormData] = useState(coursSelectionne || {
      classeId: classeSelectionnee ? parseInt(classeSelectionnee) : '',
      jour: '',
      heure: '',
      matiereId: '',
      enseignantId: '',
      salle: ''
    });

    const gererSoumission = (e) => {
      e.preventDefault();
      const newCoursData = {
        ...formData,
        classeId: parseInt(formData.classeId),
        matiereId: parseInt(formData.matiereId),
        enseignantId: parseInt(formData.enseignantId)
      };

      console.log('Données cours soumises:', newCoursData);

      if (typeModal === 'modifier' && coursSelectionne) {
        // je mettrai ici l'api
      } else {  
      }

      fermerModal();
    };

    return (
      <form onSubmit={gererSoumission} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Classe *"
            type="select"
            value={formData.classeId}
            onChange={(e) => setFormData({...formData, classeId: e.target.value})}
            options={[{ value: '', label: 'Sélectionner une classe' }, ...classes.map(c => ({ value: c.id, label: c.nom }))]}
            required
            className="text-gray-700"
          />
          <InputField
            label="Jour *"
            type="select"
            value={formData.jour}
            onChange={(e) => setFormData({...formData, jour: e.target.value})}
            options={[{ value: '', label: 'Sélectionner un jour' }, ...jours.map(jour => ({ value: jour, label: jour }))]}
            required
            className="text-gray-700"
          />
          <InputField
            label="Heure *"
            type="select"
            value={formData.heure}
            onChange={(e) => setFormData({...formData, heure: e.target.value})}
            options={[{ value: '', label: 'Sélectionner une heure' }, ...heures.map(heure => ({ value: heure, label: heure }))]}
            required
            className="text-gray-700"
          />
          <InputField
            label="Matière *"
            type="select"
            value={formData.matiereId}
            onChange={(e) => setFormData({...formData, matiereId: e.target.value})}
            options={[{ value: '', label: 'Sélectionner une matière' }, ...matieres.map(matiere => ({ value: matiere.id, label: matiere.nom }))]}
            required
            className="text-gray-700"
          />
          <InputField
            label="Enseignant *"
            type="select"
            value={formData.enseignantId}
            onChange={(e) => setFormData({...formData, enseignantId: e.target.value})}
            options={[{ value: '', label: 'Sélectionner un enseignant' }, ...enseignants.map(enseignant => ({ value: enseignant.id, label: `${enseignant.prenom} ${enseignant.nom}` }))]}
            required
            className="text-gray-700"
          />
          <InputField
            label="Salle"
            type="text"
            value={formData.salle}
            onChange={(e) => setFormData({...formData, salle: e.target.value})}
            placeholder="Salle 101"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={fermerModal}>
            Annuler
          </Button>
          <Button type="submit">
            {typeModal === 'ajouter' ? 'Ajouter' : 'Modifier'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emplois du Temps</h1>
          <p className="text-gray-600">Gérez les emplois du temps des classes</p>
        </div>
        <Button
          onClick={() => ouvrirModal('ajouter')}
          icon={Plus}
          className="shadow-md hover:shadow-lg"
        >
          Ajouter un cours
        </Button>
      </div>

      {/* Sélection de classe */}
      <Card className="p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <Calendar className="h-6 w-6 text-blue-600" />
          <select
            value={classeSelectionnee}
            onChange={(e) => setClasseSelectionnee(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 max-w-xs"
          >
            <option value="">Sélectionner une classe</option>
            {classes.map(classe => (
              <option key={classe.id} value={classe.id}>{classe.nom}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Grille de l'emploi du temps */}
      {classeSelectionnee ? (
        <Card className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 border-b border-gray-200">
                  Heures
                </th>
                {jours.map(jour => (
                  <th key={jour} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    {jour}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {heures.map(heure => (
                <tr key={heure}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 border-r border-gray-200">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      {heure}
                    </div>
                  </td>
                  {jours.map(jour => {
                    const cours = getCoursPourJourHeure(jour, heure);
                    return (
                      <td key={`${jour}-${heure}`} className="px-2 py-3 border border-gray-200 h-28 align-top">
                        {cours ? (
                          <div
                            className="h-full rounded-lg p-2 text-xs cursor-pointer hover:opacity-90 transition-opacity flex flex-col justify-between items-center text-center" 
                            style={{ backgroundColor: 'rgb(220 238 255)', borderColor: 'rgb(180 210 255)', color: 'rgb(37 99 235)' }}
                            onClick={() => ouvrirModal('voir', cours)}
                          >
                            <div className="font-bold text-sm leading-tight mb-1">{cours.matiereNom}</div>
                            <div className="text-xs opacity-90 mb-1">{cours.matiereCode}</div>
                            <div className="flex items-center text-xs opacity-90 mb-0.5">
                              <User className="w-3 h-3 mr-1 text-blue-600" />
                              <span className="truncate">{cours.enseignantNomComplet}</span>
                            </div>
                            <div className="flex items-center text-xs opacity-90">
                              <MapPin className="w-3 h-3 mr-1 text-blue-600" />
                              <span>{cours.salle}</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => ouvrirModal('ajouter', { jour, heure, classeId: parseInt(classeSelectionnee) })}
                            className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center text-gray-400"
                          >
                            <Plus className="h-4 w-4 text-blue-400" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card className="text-center py-12 shadow-sm">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">Sélectionnez une classe pour afficher l'emploi du temps.</p>
          <p className="text-gray-400 text-sm mt-2">Utilisez le menu déroulant ci-dessus pour choisir une classe spécifique.</p>
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOuverte}
        onClose={fermerModal}
        title={
          (typeModal === 'ajouter' && 'Ajouter un cours') ||
          (typeModal === 'modifier' && 'Modifier le cours') ||
          (typeModal === 'voir' && 'Détails du cours')
        }
        size="md"
      >
        {typeModal === 'voir' ? (
          <div className="space-y-4">
            <div className="text-center bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-inner">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-gray-900">{coursSelectionne?.matiereNom}</h4>
              <p className="text-gray-600">{getClassNameById(coursSelectionne?.classeId)}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailRow icon={Calendar} label="Jour" value={coursSelectionne?.jour} />
              <DetailRow icon={Clock} label="Heure" value={coursSelectionne?.heure} />
              <DetailRow icon={GraduationCap} label="Enseignant" value={coursSelectionne?.enseignantNomComplet} />
              <DetailRow icon={MapPin} label="Salle" value={coursSelectionne?.salle} />
              <DetailRow icon={Layers} label="Code Matière" value={coursSelectionne?.matiereCode} />
              <DetailRow icon={BookOpen} label="ID Matière" value={coursSelectionne?.matiereId} />
              <DetailRow icon={Users} label="ID Enseignant" value={coursSelectionne?.enseignantId} />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => ouvrirModal('modifier', coursSelectionne)}
                icon={Edit}
              >
                Modifier
              </Button>
              <Button
                variant="danger"
                onClick={() => console.log('Simulating delete for:', coursSelectionne)}
                icon={Trash2}
              >
                Supprimer
              </Button>
            </div>
          </div>
        ) : (
          <FormulaireCours />
        )}
      </Modal>

    </div>
  );
};

export default EmploisDuTempsPage;
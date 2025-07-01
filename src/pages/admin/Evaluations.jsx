import { CalendarDays, Clock, GraduationCap, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';

import { classes, enseignants, evaluations as initialEvaluations, matieres } from '../../data/donneesTemporaires';

const GestionEvaluations = () => {
  const [evaluations, setEvaluations] = useState(initialEvaluations);
  const [afficherModalAjoutModification, setAfficherModalAjoutModification] = useState(false);
  const [afficherModalDetails, setAfficherModalDetails] = useState(false);
  const [evaluationEnEdition, setEvaluationEnEdition] = useState(null);
  const [detailsEvaluationSelectionnee, setDetailsEvaluationSelectionnee] = useState(null);

  const [donneesFormulaire, setDonneesFormulaire] = useState({
    id: null,
    matiereId: '',
    classeId: '',
    niveau: '',
    date: '',
    heureDebut: '',
    heureFin: '',
    dureeHeures: '',
    type: '',
    description: '',
    enseignantId: ''
  });

  const [niveauSelectionne, setNiveauSelectionne] = useState('');
  const [filtreMatiere, setFiltreMatiere] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [texteRecherche, setTexteRecherche] = useState('');

  const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const plagesHoraires = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
  ];
  const getNombreDeCreneaux = (dureeHeures) => dureeHeures;
  const getIndexHeureDebut = (heureDebut) => plagesHoraires.findIndex(slot => slot.startsWith(heureDebut));

  const getProchainId = () => evaluations.length > 0 ? Math.max(...evaluations.map(e => e.id)) + 1 : 1;
  const getNomClasse = (id) => classes.find(c => c.id === id)?.nom || 'N/A';
  const getNomMatiere = (id) => matieres.find(m => m.id === id)?.nom || 'N/A';
  const getNomEnseignant = (id) => enseignants.find(e => e.id === id)?.prenom + ' ' + enseignants.find(e => e.id === id)?.nom || 'N/A';

  const niveauxUniques = useMemo(() => {
    const niveaux = new Set(classes.map(c => c.niveau));
    return ['', 'Sélectionner un niveau', ...Array.from(niveaux).sort()];
  }, [classes]);

  const matieresUniques = useMemo(() => {
    const matieresDansEvaluations = new Set(initialEvaluations.map(e => e.matiereId));
    const matieresDisponibles = matieres.filter(m => matieresDansEvaluations.has(m.id));
    return ['', 'Toutes les matières', ...matieresDisponibles.map(m => m.nom).sort()];
  }, [initialEvaluations, matieres]);

  const typesUniques = useMemo(() => {
    const types = new Set(initialEvaluations.map(e => e.type));
    return ['', 'Tous les types', ...Array.from(types).sort()];
  }, [initialEvaluations]);

  const evaluationsFiltreesPourEmploiDuTemps = useMemo(() => {
    if (!niveauSelectionne || niveauSelectionne === 'Sélectionner un niveau') {
      return [];
    }

    let evaluationsActuelles = evaluations.filter(e => e.niveau === niveauSelectionne);

    if (filtreMatiere && filtreMatiere !== 'Toutes les matières') {
        const matiereId = matieres.find(m => m.nom === filtreMatiere)?.id;
        evaluationsActuelles = evaluationsActuelles.filter(e => e.matiereId === matiereId);
    }
    if (filtreType && filtreType !== 'Tous les types') {
        evaluationsActuelles = evaluationsActuelles.filter(e => e.type === filtreType);
    }
    if (texteRecherche) {
      const texteRechercheMin = texteRecherche.toLowerCase();
      evaluationsActuelles = evaluationsActuelles.filter(e =>
        e.description.toLowerCase().includes(texteRechercheMin) ||
        getNomMatiere(e.matiereId).toLowerCase().includes(texteRechercheMin) ||
        e.type.toLowerCase().includes(texteRechercheMin)
      );
    }
    return evaluationsActuelles;
  }, [evaluations, niveauSelectionne, filtreMatiere, filtreType, texteRecherche, matieres]);

  const creneauxOccupes = useMemo(() => {
    const creneaux = new Set();
    evaluationsFiltreesPourEmploiDuTemps.forEach(evalItem => {
      const nomJourEval = new Date(evalItem.date).toLocaleDateString('fr-FR', { weekday: 'long' });
      const indexJour = joursSemaine.indexOf(nomJourEval);
      if (indexJour !== -1) {
        const indexDebut = getIndexHeureDebut(evalItem.heureDebut);
        const numCreneaux = getNombreDeCreneaux(evalItem.dureeHeures);
        for (let i = 0; i < numCreneaux; i++) {
          creneaux.add(`${indexJour}-${indexDebut + i}`);
        }
      }
    });
    return creneaux;
  }, [evaluationsFiltreesPourEmploiDuTemps, joursSemaine, getIndexHeureDebut, getNombreDeCreneaux]);

  const ouvrirModalAjout = () => {
    setEvaluationEnEdition(null);
    setDonneesFormulaire({
      id: null,
      matiereId: '',
      classeId: '',
      niveau: niveauSelectionne || '',
      date: new Date().toISOString().split('T')[0],
      heureDebut: '08:00',
      heureFin: '09:00',
      dureeHeures: '1',
      type: '',
      description: '',
      enseignantId: ''
    });
    setAfficherModalAjoutModification(true);
  };

  const ouvrirModalModification = (evaluation) => {
    setEvaluationEnEdition(evaluation);
    setDonneesFormulaire({
      id: evaluation.id,
      matiereId: evaluation.matiereId.toString(),
      classeId: evaluation.classeId.toString(),
      niveau: evaluation.niveau,
      date: evaluation.date,
      heureDebut: evaluation.heureDebut,
      heureFin: evaluation.heureFin,
      dureeHeures: evaluation.dureeHeures.toString(),
      type: evaluation.type,
      description: evaluation.description,
      enseignantId: evaluation.enseignantId.toString()
    });
    setAfficherModalAjoutModification(true);
  };

  const ouvrirModalDetails = (evaluation) => {
    setDetailsEvaluationSelectionnee(evaluation);
    setAfficherModalDetails(true);
  };

  const fermerModalAjoutModification = () => {
    setAfficherModalAjoutModification(false);
    setEvaluationEnEdition(null);
  };

  const fermerModalDetails = () => {
    setAfficherModalDetails(false);
    setDetailsEvaluationSelectionnee(null);
  };

  const gererChangementFormulaire = (e) => {
    const { name, value } = e.target;
    let nouvellesDonneesFormulaire = { ...donneesFormulaire, [name]: value };

    if (name === 'classeId') {
      const objetClasseSelectionnee = classes.find(c => String(c.id) === value);
      nouvellesDonneesFormulaire.niveau = objetClasseSelectionnee ? objetClasseSelectionnee.niveau : '';
    }

    if (name === 'heureDebut' || name === 'dureeHeures') {
        const debut = nouvellesDonneesFormulaire.heureDebut;
        const duree = parseInt(nouvellesDonneesFormulaire.dureeHeures);
        if (debut && !isNaN(duree) && duree > 0) {
            const [h, m] = debut.split(':').map(Number);
            const dateFin = new Date();
            dateFin.setHours(h + duree, m, 0, 0);
            nouvellesDonneesFormulaire.heureFin = `${String(dateFin.getHours()).padStart(2, '0')}:${String(dateFin.getMinutes()).padStart(2, '0')}`;
        }
    }
    setDonneesFormulaire(nouvellesDonneesFormulaire);
  };

  const gererSoumissionAjoutModification = (e) => {
    e.preventDefault();
    if (!donneesFormulaire.matiereId || !donneesFormulaire.classeId || !donneesFormulaire.date || !donneesFormulaire.heureDebut || !donneesFormulaire.heureFin || !donneesFormulaire.dureeHeures || !donneesFormulaire.type || !donneesFormulaire.enseignantId) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }

    const donneesEvaluation = {
      ...donneesFormulaire,
      matiereId: parseInt(donneesFormulaire.matiereId),
      classeId: parseInt(donneesFormulaire.classeId),
      enseignantId: parseInt(donneesFormulaire.enseignantId),
      dureeHeures: parseInt(donneesFormulaire.dureeHeures),
      niveau: classes.find(c => c.id === parseInt(donneesFormulaire.classeId))?.niveau || ''
    };

    if (evaluationEnEdition) {
      setEvaluations(evals => evals.map(e =>
        e.id === evaluationEnEdition.id ? { ...donneesEvaluation, id: e.id } : e
      ));
      console.log("Évaluation modifiée:", { ...donneesEvaluation, id: evaluationEnEdition.id });
    } else {
      const nouvelleEvaluation = {
        ...donneesEvaluation,
        id: getProchainId(),
      };
      setEvaluations(evals => [...evals, nouvelleEvaluation]);
      console.log("Nouvelle évaluation ajoutée:", nouvelleEvaluation);
    }
    fermerModalAjoutModification();
  };

  const gererSuppressionEvaluation = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette évaluation ?")) {
      setEvaluations(evals => evals.filter(e => e.id !== id));
      console.log("Évaluation supprimée:", id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Planification des Évaluations</h1>
        <p className="text-gray-600">Visualisez et gérez le planning des compositions et devoirs par niveau.</p>
      </div>

      <Card className="p-6 shadow-sm">
        <label htmlFor="select-niveau" className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner un Niveau pour afficher le planning : <span className="text-red-500">*</span>
        </label>
        <select
          id="select-niveau"
          value={niveauSelectionne}
          onChange={(e) => setNiveauSelectionne(e.target.value)}
          className="block w-full md:w-1/2 lg:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
        >
          {niveauxUniques.map(niveau => (
            <option key={niveau} value={niveau}>{niveau}</option>
          ))}
        </select>
        {!niveauSelectionne && <p className="text-red-500 text-xs mt-2">Veuillez sélectionner un niveau pour voir l'emploi du temps des évaluations.</p>}
      </Card>

      {niveauSelectionne && niveauSelectionne !== 'Sélectionner un niveau' && (
        <>
          <Card className="p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Filtres et Actions</h2>
              <Button onClick={ouvrirModalAjout} icon={Plus}>
                Planifier une Évaluation
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <InputField
                  placeholder="Rechercher par matière, type..."
                  value={texteRecherche}
                  onChange={(e) => setTexteRecherche(e.target.value)}
                  className="pl-9"
                />
              </div>

              <select
                value={filtreMatiere}
                onChange={(e) => setFiltreMatiere(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              >
                {matieresUniques.map(matiereName => (
                  <option key={matiereName} value={matiereName}>{matiereName}</option>
                ))}
              </select>

              <select
                value={filtreType}
                onChange={(e) => setFiltreType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              >
                {typesUniques.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </Card>

          <Card className="p-0 overflow-x-auto shadow-sm">
            <div className="p-6 mb-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                Emploi du temps des Évaluations - Niveau {niveauSelectionne}
              </h2>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-28">Horaires</th>
                  {joursSemaine.map((jour, index) => (
                    <th key={index} className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      {jour}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plagesHoraires.map((heure, heureIndex) => {
                  return (
                    <tr key={heureIndex}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 border-r border-gray-200">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-500" />
                          {heure}
                        </div>
                      </td>
                      {joursSemaine.map((jour, jourIndex) => {
                        const estOccupe = creneauxOccupes.has(`${jourIndex}-${heureIndex}`);
                        if (estOccupe) return null;

                        const evaluationsDansCreneau = evaluationsFiltreesPourEmploiDuTemps.filter(evalItem => {
                          const nomJourEval = new Date(evalItem.date).toLocaleDateString('fr-FR', { weekday: 'long' });
                          return nomJourEval === jour && getIndexHeureDebut(evalItem.heureDebut) === heureIndex;
                        });

                        const premiereEval = evaluationsDansCreneau[0];

                        return (
                          <td
                            key={`${jour}-${heureIndex}`}
                            rowSpan={premiereEval ? getNombreDeCreneaux(premiereEval.dureeHeures) : 1}
                            className={`p-1 border border-gray-200 h-28 align-top ${premiereEval ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors' : ''}`}
                            onClick={premiereEval ? () => ouvrirModalDetails(premiereEval) : undefined}
                          >
                            {premiereEval ? (
                              <div
                                className="h-full rounded-lg p-1.5 text-xs flex flex-col justify-between items-center text-center text-blue-800 font-medium leading-tight"
                                title={`${premiereEval.type} - ${getNomMatiere(premiereEval.matiereId)} (${getNomClasse(premiereEval.classeId)}) par ${getNomEnseignant(premiereEval.enseignantId)}`}
                              >
                                <p className="font-semibold text-blue-900">{getNomMatiere(premiereEval.matiereId)}</p>
                                <p className="text-xs text-blue-700">{premiereEval.type}</p>
                                <p className="text-xs text-blue-700">{getNomClasse(premiereEval.classeId)}</p>
                                <p className="text-xs flex items-center gap-1 text-blue-600"><GraduationCap className='w-3 h-3'/> {getNomEnseignant(premiereEval.enseignantId)}</p>
                                <p className="text-xs flex items-center gap-1 text-blue-600"><Clock className='w-3 h-3'/> {premiereEval.heureDebut} - {premiereEval.heureFin}</p>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                                Libre
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {evaluationsFiltreesPourEmploiDuTemps.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    Aucune évaluation trouvée pour le niveau sélectionné avec les filtres actuels.
                </div>
            )}
          </Card>
        </>
      )}

      <Modal
        isOpen={afficherModalAjoutModification}
        onClose={fermerModalAjoutModification}
        title={evaluationEnEdition ? "Modifier l'évaluation" : "Planifier une nouvelle évaluation"}
        size="md"
      >
        <form onSubmit={gererSoumissionAjoutModification} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Date"
              name="date"
              type="date"
              value={donneesFormulaire.date}
              onChange={gererChangementFormulaire}
              required
            />
            <InputField
              label="Heure de début"
              name="heureDebut"
              type="time"
              value={donneesFormulaire.heureDebut}
              onChange={gererChangementFormulaire}
              required
            />
            <InputField
              label="Durée (heures)"
              name="dureeHeures"
              type="select"
              value={donneesFormulaire.dureeHeures}
              onChange={gererChangementFormulaire}
              options={[
                { value: '', label: 'Sélectionner durée' },
                { value: '1', label: '1 heure' },
                { value: '2', label: '2 heures' },
                { value: '3', label: '3 heures' },
                { value: '4', label: '4 heures' },
              ]}
              required
            />
            <InputField
              label="Heure de fin (automatique)"
              name="heureFin"
              type="time"
              value={donneesFormulaire.heureFin}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <InputField
            label="Type d'évaluation"
            name="type"
            value={donneesFormulaire.type}
            onChange={gererChangementFormulaire}
            placeholder="Ex: Composition, Devoir Surveillé"
            required
          />
          <InputField
            label="Description"
            name="description"
            value={donneesFormulaire.description}
            onChange={gererChangementFormulaire}
            placeholder="Détails sur l'évaluation"
            type="textarea"
            rows="2"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="matiereId" className="block text-sm font-medium text-gray-700 mb-1">Matière <span className="text-red-500">*</span></label>
              <select
                id="matiereId"
                name="matiereId"
                value={donneesFormulaire.matiereId}
                onChange={gererChangementFormulaire}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                required
              >
                <option value="">Sélectionner une matière</option>
                {matieres.map(matiere => (
                  <option key={matiere.id} value={matiere.id}>{matiere.nom}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label htmlFor="classeId" className="block text-sm font-medium text-gray-700 mb-1">Classe <span className="text-red-500">*</span></label>
              <select
                id="classeId"
                name="classeId"
                value={donneesFormulaire.classeId}
                onChange={gererChangementFormulaire}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                required
              >
                <option value="">Sélectionner une classe</option>
                {classes.map(classe => (
                  <option key={classe.id} value={classe.id}>{classe.nom}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label htmlFor="enseignantId" className="block text-sm font-medium text-gray-700 mb-1">Enseignant <span className="text-red-500">*</span></label>
              <select
                id="enseignantId"
                name="enseignantId"
                value={donneesFormulaire.enseignantId}
                onChange={gererChangementFormulaire}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                required
              >
                <option value="">Sélectionner un enseignant</option>
                {enseignants.map(enseignant => (
                  <option key={enseignant.id} value={enseignant.id}>{enseignant.prenom} {enseignant.nom}</option>
                ))}
              </select>
            </div>
            <InputField
              label="Niveau (Automatique)"
              name="niveau"
              value={donneesFormulaire.niveau}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={fermerModalAjoutModification}>
              Annuler
            </Button>
            <Button type="submit">
              {evaluationEnEdition ? 'Modifier' : 'Planifier'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={afficherModalDetails}
        onClose={fermerModalDetails}
        title="Détails de l'évaluation"
        size="md"
      >
        {detailsEvaluationSelectionnee && (
          <div className="space-y-4 p-2 text-gray-700">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-bold text-lg text-blue-800 mb-2">{detailsEvaluationSelectionnee.type} - {getNomMatiere(detailsEvaluationSelectionnee.matiereId)}</h3>
                <p><span className="font-medium">Date:</span> {new Date(detailsEvaluationSelectionnee.date).toLocaleDateString('fr-FR')}</p>
                <p><span className="font-medium">Heure:</span> {detailsEvaluationSelectionnee.heureDebut} - {detailsEvaluationSelectionnee.heureFin} ({detailsEvaluationSelectionnee.dureeHeures}h)</p>
            </div>
            <p><span className="font-medium">Classe:</span> {getNomClasse(detailsEvaluationSelectionnee.classeId)} ({detailsEvaluationSelectionnee.niveau})</p>
            <p><span className="font-medium">Enseignant:</span> {getNomEnseignant(detailsEvaluationSelectionnee.enseignantId)}</p>
            {detailsEvaluationSelectionnee.description && (
                <p><span className="font-medium">Description:</span> {detailsEvaluationSelectionnee.description}</p>
            )}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={fermerModalDetails}>Fermer</Button>
              <Button variant="info" onClick={() => { fermerModalDetails(); ouvrirModalModification(detailsEvaluationSelectionnee); }}>Modifier</Button>
              <Button variant="danger" onClick={() => { fermerModalDetails(); gererSuppressionEvaluation(detailsEvaluationSelectionnee.id); }}>Supprimer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GestionEvaluations;
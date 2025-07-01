import { AlertCircle, Calendar, CheckCircle, Clock, Edit, Users, UserX, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { classes, presences as donneesPresencesInitiales, eleves, enseignants } from '../../data/donneesTemporaires';

const GestionPresences = () => {
  const { user } = useAuth();
  const [presences, setPresences] = useState(donneesPresencesInitiales);
  const [classeSelectionnee, setClasseSelectionnee] = useState('');
  const [dateSelectionnee, setDateSelectionnee] = useState(new Date().toISOString().split('T')[0]);
  const [afficherModalSignalement, setAfficherModalSignalement] = useState(false);
  const [eleveSelectionnePourSignalement, setEleveSelectionnePourSignalement] = useState(null);

  const [formulaireSignalement, setFormulaireSignalement] = useState({
    statut: 'absent',
    commentaire: ''
  });

  const enseignantConnecte = useMemo(() => {
    return user?.role === 'enseignant'
      ? enseignants.find(e => e.id === user.id)
      : null;
  }, [user, enseignants]);
  
  const mesClasses = useMemo(() => {
    return enseignantConnecte ? classes.filter(classe => enseignantConnecte.classes?.includes(classe.id)) : [];
  }, [enseignantConnecte, classes]);
  
  const elevesDeLaClasseSelectionnee = useMemo(() => {
    return classeSelectionnee
      ? eleves.filter(eleve => String(eleve.classeId) === String(classeSelectionnee))
              .sort((a, b) => {
                const nomA = a.nom.toLowerCase();
                const nomB = b.nom.toLowerCase();
                if (nomA < nomB) return -1;
                if (nomA > nomB) return 1;
                const prenomA = b.prenom.toLowerCase();
                const prenomB = b.prenom.toLowerCase(); 
                if (prenomA < prenomB) return -1;
                if (prenomA > prenomB) return 1;
                return 0;
              })
      : [];
  }, [classeSelectionnee, eleves]);

  useEffect(() => {
    if (!classeSelectionnee) {
      return;
    }

    const elevesSansEnregistrement = elevesDeLaClasseSelectionnee.filter(eleve =>
      !presences.some(p =>
        String(p.eleveId) === String(eleve.id) &&
        p.date === dateSelectionnee &&
        String(p.classeId) === String(classeSelectionnee)
      )
    );

    const nouveauxEnregistrementsPresents = elevesSansEnregistrement.map(eleve => ({
      id: Math.random().toString(36).substr(2, 9),
      eleveId: eleve.id,
      date: dateSelectionnee,
      statut: 'present',
      heureDebut: '08:00',
      heureFin: '17:00',
      enseignantId: user.id,
      classeId: parseInt(classeSelectionnee),
      justifie: false,
      motifJustification: '',
      commentaire: '',
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString()
    }));

    if (nouveauxEnregistrementsPresents.length > 0) {
      setPresences(prevPresences => [...prevPresences, ...nouveauxEnregistrementsPresents]);
    }
  }, [classeSelectionnee, dateSelectionnee, elevesDeLaClasseSelectionnee, presences, user]);

  const presencesDuJourFiltrees = useMemo(() => {
    return presences.filter(p =>
      p.date === dateSelectionnee &&
      String(p.classeId) === String(classeSelectionnee)
    );
  }, [presences, dateSelectionnee, classeSelectionnee]);

  const donneesTableau = useMemo(() => {
    if (!classeSelectionnee) return [];

    return elevesDeLaClasseSelectionnee.map(eleve => {
      const enregistrementPresence = presencesDuJourFiltrees.find(p => String(p.eleveId) === String(eleve.id));
      return {
        id: enregistrementPresence?.id || `temp-${eleve.id}-${dateSelectionnee}`,
        eleveId: eleve.id,
        classeId: eleve.classeId,
        date: dateSelectionnee,
        statut: enregistrementPresence?.statut || 'present',
        heureDebut: enregistrementPresence?.heureDebut || '08:00',
        heureFin: enregistrementPresence?.heureFin || '17:00',
        enseignantId: enregistrementPresence?.enseignantId || user.id,
        justifie: false,
        motifJustification: '',
        commentaire: ''
      };
    });
  }, [classeSelectionnee, elevesDeLaClasseSelectionnee, presencesDuJourFiltrees, dateSelectionnee, user]);

  const getNomEleve = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getNomClasse = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const getIconeStatut = (statut) => {
    switch (statut) {
      case 'present': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'retard': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'renvoye': return <UserX className="w-5 h-5 text-purple-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLibelleStatut = (statut) => {
    switch (statut) {
      case 'present': return 'Présent';
      case 'absent': return 'Absent';
      case 'retard': return 'En retard';
      case 'renvoye': return 'Renvoyé';
      default: return 'Inconnu';
    }
  };

  const getCouleurStatut = (statut) => {
    switch (statut) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'retard': return 'bg-orange-100 text-orange-800';
      case 'renvoye': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ouvrirModalSignalement = (eleve) => {
    setEleveSelectionnePourSignalement(eleve);
    const enregistrementExistant = presencesDuJourFiltrees.find(p => String(p.eleveId) === String(eleve.id));
    setFormulaireSignalement({
      statut: enregistrementExistant?.statut === 'present' ? 'absent' : enregistrementExistant?.statut || 'absent',
      commentaire: enregistrementExistant?.commentaire || ''
    });
    setAfficherModalSignalement(true);
  };

  const gererSoumissionSignalement = (e) => {
    e.preventDefault();
    const { statut, commentaire } = formulaireSignalement;
    const now = new Date().toISOString();

    setPresences(prevPresences => {
      const indexExistant = prevPresences.findIndex(p =>
        String(p.eleveId) === String(eleveSelectionnePourSignalement.id) &&
        p.date === dateSelectionnee &&
        String(p.classeId) === String(classeSelectionnee)
      );

      if (indexExistant > -1) {
        return prevPresences.map((p, index) =>
          index === indexExistant
            ? {
                ...p,
                statut: statut,
                commentaire: commentaire,
                justifie: false,
                dateModification: now
              }
            : p
        );
      } else {
        const nouvelEnregistrement = {
          id: Math.random().toString(36).substr(2, 9),
          eleveId: eleveSelectionnePourSignalement.id,
          date: dateSelectionnee,
          statut: statut,
          heureDebut: '08:00',
          heureFin: '17:00',
          enseignantId: user.id,
          classeId: parseInt(classeSelectionnee),
          justifie: false,
          motifJustification: '',
          commentaire: '',
          dateCreation: now,
          dateModification: now
        };
        return [...prevPresences, nouvelEnregistrement];
      }
    });

    setAfficherModalSignalement(false);
    setEleveSelectionnePourSignalement(null);
  };

  const reinitialiserFormulaireSignalement = () => {
    setFormulaireSignalement({ statut: 'absent', commentaire: '' });
    setEleveSelectionnePourSignalement(null);
    setAfficherModalSignalement(false);
  };

  const statistiques = useMemo(() => {
    const total = donneesTableau.length;
    const presents = donneesTableau.filter(p => p.statut === 'present').length;
    const absents = donneesTableau.filter(p => p.statut === 'absent').length;
    const retards = donneesTableau.filter(p => p.statut === 'retard').length;
    const renvoyes = donneesTableau.filter(p => p.statut === 'renvoye').length;
    const nonMarques = total - (presents + absents + retards + renvoyes);

    return { total, presents, absents, retards, renvoyes, nonMarques };
  }, [donneesTableau]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des présences</h1>
        <p className="text-gray-600">Marquer les présences de vos élèves</p>
      </div>

      <Card className="p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="select-class" className="block text-sm font-medium text-gray-700 mb-1">
              Classe
            </label>
            <select
              id="select-class"
              value={classeSelectionnee}
              onChange={(e) => setClasseSelectionnee(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
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
            <label htmlFor="select-date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              id="select-date"
              type="date"
              value={dateSelectionnee}
              onChange={(e) => setDateSelectionnee(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>
        </div>
      </Card>

      {classeSelectionnee ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="p-4 text-center bg-blue-50 border-blue-100 shadow-sm">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-800">{statistiques.total}</p>
              <p className="text-sm text-blue-600">Total Élèves</p>
            </Card>

            <Card className="p-4 text-center bg-green-50 border-green-100 shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-800">{statistiques.presents}</p>
              <p className="text-sm text-green-600">Présents</p>
            </Card>

            <Card className="p-4 text-center bg-red-50 border-red-100 shadow-sm">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-800">{statistiques.absents}</p>
              <p className="text-sm text-red-600">Absents</p>
            </Card>

            <Card className="p-4 text-center bg-orange-50 border-orange-100 shadow-sm">
              <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-800">{statistiques.retards}</p>
              <p className="text-sm text-orange-600">Retards</p>
            </Card>

            <Card className="p-4 text-center bg-purple-50 border-purple-100 shadow-sm">
              <UserX className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-800">{statistiques.renvoyes}</p>
              <p className="text-sm text-purple-600">Renvoyés</p>
            </Card>

            <Card className="p-4 text-center bg-gray-50 border-gray-100 shadow-sm">
              <AlertCircle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-800">{statistiques.nonMarques}</p>
              <p className="text-sm text-gray-600">Non marqués</p>
            </Card>
          </div>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Liste des élèves - {getNomClasse(parseInt(classeSelectionnee))} - {new Date(dateSelectionnee).toLocaleDateString('fr-FR')}
              </h2>

              <div className="space-y-4">
                {donneesTableau.length > 0 ? (
                  donneesTableau.map(presence => {
                    const eleve = eleves.find(e => e.id === presence.eleveId);
                    const statut = presence?.statut;

                    const isSignalerDisabled = statut !== 'present';

                    return (
                      <div key={presence.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {eleve?.prenom.charAt(0)}{eleve?.nom.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {eleve?.prenom} {eleve?.nom}
                            </h3>
                            <p className="text-sm text-gray-600">{eleve?.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 min-w-[100px] justify-end">
                            {getIconeStatut(statut)}
                            <span className={`px-2 py-1 text-xs rounded-full ${getCouleurStatut(statut)}`}>
                              {getLibelleStatut(statut)}
                            </span>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => ouvrirModalSignalement(eleve)}
                            icon={Edit}
                            disabled={isSignalerDisabled}
                            title={isSignalerDisabled ? `Déjà marqué comme ${getLibelleStatut(statut)}` : "Signaler une absence/un retard"}
                          >
                            Signaler
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun élève dans cette classe ou pour cette date.</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-12 text-center shadow-sm">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sélectionnez une classe</h3>
          <p className="text-gray-600">
            Pour marquer les présences, veuillez sélectionner une de vos classes
            dans le menu déroulant ci-dessus.
          </p>
        </Card>
      )}

      <Modal
        isOpen={afficherModalSignalement}
        onClose={reinitialiserFormulaireSignalement}
        title={`Signaler la présence de ${eleveSelectionnePourSignalement?.prenom} ${eleveSelectionnePourSignalement?.nom}`}
        size="sm"
      >
        {eleveSelectionnePourSignalement && (
          <form onSubmit={gererSoumissionSignalement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={formulaireSignalement.statut}
                onChange={(e) => setFormulaireSignalement({ ...formulaireSignalement, statut: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 capitalize"
                required
              >
                <option value="absent">Absent</option>
                <option value="retard">En retard</option>
                <option value="renvoye">Renvoyé</option>
              </select>
            </div>

            <InputField
              label="Date"
              type="date"
              value={dateSelectionnee}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
            <InputField
              label="Heure de début"
              type="time"
              value={new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />

            <InputField
              label="Commentaire"
              type="textarea"
              value={formulaireSignalement.commentaire}
              onChange={(e) => setFormulaireSignalement({ ...formulaireSignalement, commentaire: e.target.value })}
              rows={3}
              placeholder="Ajouter un commentaire (ex: motif de l'absence)"
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={reinitialiserFormulaireSignalement}>
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

export default GestionPresences;
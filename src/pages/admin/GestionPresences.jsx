import { AlertCircle, Calendar, CheckCircle, Clock, Edit, Users, UserX, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import Slider from 'react-slick';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

import { NavLink } from 'react-router-dom';
import { presences as allPresencesData, classes, eleves, enseignants } from '../../data/donneesTemporaires';

const GestionPresencesAdmin = () => {
  const [presences, setPresences] = useState(allPresencesData); 
  const [classeSelectionnee, setClasseSelectionnee] = useState('');
  const [dateSelectionnee, setDateSelectionnee] = useState('');
  const [statutSelectionne, setStatutSelectionne] = useState(''); 

  const [afficherModalJustification, setAfficherModalJustification] = useState(false);
  const [presenceSelectionneePourJustification, setPresenceSelectionneePourJustification] = useState(null);

  const [afficherModalDetailsEleve, setAfficherModalDetailsEleve] = useState(false);
  const [eleveSelectionnePourDetails, setEleveSelectionnePourDetails] = useState(null);

  const [donneesFormulaire, setDonneesFormulaire] = useState({
    justifie: false,
    motifJustification: '',
    commentaire: ''
  });

  // Fonctions gets affaires yi

  const getNomEleve = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getNomClasse = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const getNomEnseignant = (enseignantId) => {
    const enseignant = enseignants.find(e => e.id === enseignantId);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Enseignant inconnu';
  };

  const getIconeStatut = (statut) => {
    switch (statut) {
      case 'absent': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'retard': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'renvoye': return <UserX className="w-5 h-5 text-purple-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLibelleStatut = (statut) => {
    switch (statut) {
      case 'absent': return 'Absent';
      case 'retard': return 'En retard';
      case 'renvoye': return 'Renvoyé';
      default: return 'Inconnu';
    }
  };

  const getCouleurStatut = (statut) => {
    switch (statut) {
      case 'absent': return 'bg-red-100 text-red-800';
      case 'retard': return 'bg-orange-100 text-orange-800';
      case 'renvoye': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const lesPresences = useMemo(() => {
    return presences;
  }, [presences]);

  // --- Données du tableau cumulé ---
  const tableauCumules = useMemo(() => {
    const carteDonneesEleve = new Map(); // Carte pour stocker les totaux  pour chaque élève

    let filtreActuel = lesPresences;

    if (classeSelectionnee !== '') {
      filtreActuel = filtreActuel.filter(p => String(p.classeId) === String(classeSelectionnee));
    }
    if (dateSelectionnee !== '') {
      filtreActuel = filtreActuel.filter(p => p.date === dateSelectionnee);
    }
    if (statutSelectionne !== '') { 
      filtreActuel = filtreActuel.filter(p => p.statut === statutSelectionne);
    }

    // Agrégat les totaux pour chaque élève
    filtreActuel.forEach(p => {
      if (!carteDonneesEleve.has(p.eleveId)) {
        carteDonneesEleve.set(p.eleveId, {
          eleveId: p.eleveId,
          classeId: p.classeId, 
          absences: 0,
          retards: 0,
          renvoyes: 0,
          justifies: 0,
          totalProblemes: 0,
          enregistrementsProblematiques: [] 
        });
      }
      const statistiquesEleve = carteDonneesEleve.get(p.eleveId);
      statistiquesEleve.totalProblemes++;
      statistiquesEleve.enregistrementsProblematiques.push(p);

      if (p.statut === 'absent') statistiquesEleve.absences++;
      if (p.statut === 'retard') statistiquesEleve.retards++;
      if (p.statut === 'renvoye') statistiquesEleve.renvoyes++;
      if (p.justifie) statistiquesEleve.justifies++;
    });

    //  tableau  décroissant
    return Array.from(carteDonneesEleve.values()).sort((a, b) => b.totalProblemes - a.totalProblemes);
  }, [lesPresences, classeSelectionnee, dateSelectionnee, statutSelectionne]);

  const statistiques = useMemo(() => {
    const toutesLesProblematiques = lesPresences; 
    const filtreProblemes = tableauCumules.flatMap(data => data.enregistrementsProblematiques); 
    const totalEntreesProblematiques = filtreProblemes.length;
    const totalAbsents = filtreProblemes.filter(p => p.statut === 'absent').length;
    const totalRetards = filtreProblemes.filter(p => p.statut === 'retard').length;
    const totalRenvoyes = filtreProblemes.filter(p => p.statut === 'renvoye').length;
    const totalJustifies = filtreProblemes.filter(p => p.justifie).length;
    const totalNonJustifies = totalEntreesProblematiques - totalJustifies;

    const elevesUniquesAffectes = new Set(filtreProblemes.map(p => p.eleveId)).size;

    const totalElevesDansContexte = classeSelectionnee ? eleves.filter(e => String(e.classeId) === String(classeSelectionnee)).length : eleves.length;

    return {
      totalEntreesProblematiques,
      totalAbsents,
      totalRetards,
      totalRenvoyes,
      totalJustifies,
      totalNonJustifies,
      elevesUniquesAffectes,
      totalElevesDansContexte
    };
  }, [lesPresences, tableauCumules, classeSelectionnee]);

  // KPIs
  const elementsStatistiques = useMemo(() => [
    {
      icon: Users, value: statistiques.elevesUniquesAffectes, label: 'Élèves concernés',
      color: 'text-blue-800', bg: 'bg-blue-50', borderColor: 'border-blue-100'
    },
    {
      icon: XCircle, value: statistiques.totalAbsents, label: 'Absences (Total)',
      color: 'text-red-800', bg: 'bg-red-50', borderColor: 'border-red-100'
    },
    {
      icon: Clock, value: statistiques.totalRetards, label: 'Retards (Total)',
      color: 'text-orange-800', bg: 'bg-orange-50', borderColor: 'border-orange-100'
    },
    {
      icon: UserX, value: statistiques.totalRenvoyes, label: 'Renvoyés (Total)',
      color: 'text-purple-800', bg: 'bg-purple-50', borderColor: 'border-purple-100'
    },
    {
      icon: CheckCircle, value: statistiques.totalJustifies, label: 'Justifiés',
      color: 'text-teal-800', bg: 'bg-teal-50', borderColor: 'border-teal-100'
    },
    {
      icon: AlertCircle, value: statistiques.totalNonJustifies, label: 'Non justifiés',
      color: 'text-rose-800', bg: 'bg-rose-50', borderColor: 'border-rose-100'
    },
    {
      icon: Users, value: statistiques.totalElevesDansContexte, label: 'Total Élèves (Classe)',
      color: 'text-indigo-800', bg: 'bg-indigo-50', borderColor: 'border-indigo-100'
    },
  ], [statistiques]);

  // Paramètres du slider
  const parametresSlider = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } }, // grand écran (desktop large)
      { breakpoint: 1024, settings: { slidesToShow: 2 } }, // écran moyen (tablette)
      { breakpoint: 768, settings: { slidesToShow: 1 } }, // petit écran (mobile)
    ]
  };

  //  Modals
  const ouvrirModalJustification = (presence) => {
    if (presence.statut === 'present' || presence.statut === 'non_marque') {
      alert("Ce statut ne nécessite pas de justification ou n'est pas un enregistrement à gérer.");
      return;
    }
    setPresenceSelectionneePourJustification(presence);
    setDonneesFormulaire({
      justifie: presence.justifie || false,
      motifJustification: presence.motifJustification || '',
      commentaire: presence.commentaire || ''
    });
    setAfficherModalJustification(true);
  };

  const gererSoumissionJustification = (e) => {
    e.preventDefault();

    const presenceMiseAJour = {
      ...presenceSelectionneePourJustification,
      justifie: donneesFormulaire.justifie,
      motifJustification: donneesFormulaire.motifJustification,
      commentaire: donneesFormulaire.commentaire,
      dateModification: new Date().toISOString()
    };

    setPresences(prevPresences => {
      const indexExistant = prevPresences.findIndex(p => String(p.id) === String(presenceMiseAJour.id));
      if (indexExistant > -1) {
        return prevPresences.map((p, index) =>
          index === indexExistant ? presenceMiseAJour : p
        );
      }
      return prevPresences;
    });

    console.log('Justification mise à jour:', presenceMiseAJour);
    setAfficherModalJustification(false);
    setPresenceSelectionneePourJustification(null);
    // Important: Mettre à jour les enregistrements dans le modal de détails de l'élève si il est ouvert
    if (eleveSelectionnePourDetails) {
        setEleveSelectionnePourDetails(prev => ({
            ...prev,
            enregistrementsProblematiques: prev.enregistrementsProblematiques.map(rec => rec.id === presenceMiseAJour.id ? presenceMiseAJour : rec)
        }));
    }
  };

  const reinitialiserFormulaireJustification = () => {
    setDonneesFormulaire({
      justifie: false,
      motifJustification: '',
      commentaire: ''
    });
    setPresenceSelectionneePourJustification(null);
    setAfficherModalJustification(false);
  };

  const ouvrirModalDetailsEleve = (donneesAgregeesEleve) => {
    setEleveSelectionnePourDetails(donneesAgregeesEleve);
    setAfficherModalDetailsEleve(true);
  };

  const fermerModalDetailsEleve = () => {
    setAfficherModalDetailsEleve(false);
    setEleveSelectionnePourDetails(null);
  };


  const colonnesAgregees = [
    {
      header: 'Élève',
      accessor: 'eleveId',
      render: (data) => (
        
          <NavLink to={`/admin/eleves/profil/${data.eleveId}`}>
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {getNomEleve(data.eleveId).split(' ').map(n => n.charAt(0)).join('')}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{getNomEleve(data.eleveId)}</h3>
                <p className="text-sm text-gray-600">{getNomClasse(data.classeId)}</p>
              </div>
            </div>
          </NavLink>
          
      )
    },
    {
      header: 'Absences',
      accessor: 'absences',
      render: (data) => <span className="font-medium text-red-700">{data.absences}</span>
    },
    {
      header: 'Retards',
      accessor: 'retards',
      render: (data) => <span className="font-medium text-orange-700">{data.retards}</span>
    },
    {
      header: 'Renvoyés',
      accessor: 'renvoyes',
      render: (data) => <span className="font-medium text-purple-700">{data.renvoyes}</span>
    },
    {
      header: 'Total Cumulés', 
      accessor: 'totalProblemes',
      render: (data) => <span className="text-lg font-bold text-gray-900">{data.totalProblemes}</span>
    },
    {
      header: 'Justifiées',
      accessor: 'justifies',
      render: (data) => <span className="font-medium text-teal-700">{data.justifies}</span>
    },
    {
      header: 'Non justifiées',
      accessor: 'nonJustifies',
      render: (data) => <span className="font-medium text-rose-700">{data.totalProblemes - data.justifies}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (data) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => ouvrirModalDetailsEleve(data)}
          icon={Edit}
        >
          Voir détails
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Absences & Retards & Renvois</h1>
        <p className="text-gray-600">Suivi d'assiduité des élèves</p>
      </div>

      {/*  filtres */}
      <Card className="p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="">Toutes les classes</option>
              {classes.map(classe => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="select-date" className="block text-sm font-medium text-gray-700 mb-1">
              Date (Optionnel)
            </label>
            <input
              id="select-date"
              type="date"
              value={dateSelectionnee}
              onChange={(e) => setDateSelectionnee(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>

          {/* Filtre de statut pour les types problématiques */}
          <div>
            <label htmlFor="select-status" className="block text-sm font-medium text-gray-700 mb-1">
              Statut spécifique
            </label>
            <select
              id="select-status"
              value={statutSelectionne}
              onChange={(e) => setStatutSelectionne(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Tous les incidents</option>
              <option value="absent">Absent</option>
              <option value="retard">En retard</option>
              <option value="renvoye">Renvoyé</option>
            </select>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="relative -mx-3 mb-8">
        <Slider {...parametresSlider}>
          {elementsStatistiques.map((stat, idx) => (
            <div key={idx} className="px-3"> 
              <Card className={`p-4 text-center shadow-sm ${stat.borderColor} ${stat.bg}`}>
                <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: stat.color.replace('text-', '').replace('-800', '-100') }}> {/* Fond dynamique pour le conteneur d'icônes */}
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm">{stat.label}</p>
              </Card>
            </div>
          ))}
        </Slider>
      </div>


      {/* Liste  des présences  */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Tableau d'Assiduité
        </h2>

        {tableauCumules.length > 0 ? (
          <Table
            columns={colonnesAgregees}
            data={tableauCumules}
            noDataMessage="Aucun incident d'assiduité trouvé pour les filtres sélectionnés."
          />
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun incident d'assiduité à afficher. Essayez de changer les filtres.</p>
          </div>
        )}
      </Card>

      {/* Modal de Détails/Historique de l'élève spécifique */}
      <Modal
        isOpen={afficherModalDetailsEleve}
        onClose={fermerModalDetailsEleve}
        title={`Historique des incidents pour ${eleveSelectionnePourDetails ? getNomEleve(eleveSelectionnePourDetails.eleveId) : ''}`}
        size="md"
      >
        {eleveSelectionnePourDetails && eleveSelectionnePourDetails.enregistrementsProblematiques.length > 0 ? (
          <div className="space-y-4">
            {eleveSelectionnePourDetails.enregistrementsProblematiques.sort((a,b) => new Date(b.date) - new Date(a.date)).map(presence => (
              <div key={presence.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getIconeStatut(presence.statut)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {getLibelleStatut(presence.statut)} le {new Date(presence.date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-600">
                      {presence.heureDebut} - {presence.heureFin} {presence.heureArrivee && `(Arrivée: ${presence.heureArrivee})`}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => ouvrirModalJustification(presence)}
                  icon={Edit}
                >
                  Gérer
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 p-4">Aucun incident enregistré pour cet élève avec les filtres actuels.</p>
        )}
      </Modal>

      {/* Modal de gestion des justifications  */}
      <Modal
        isOpen={afficherModalJustification}
        onClose={reinitialiserFormulaireJustification}
        title={`Gérer la présence de ${presenceSelectionneePourJustification ? getNomEleve(presenceSelectionneePourJustification.eleveId) : ''}`}
        size="md"
      >
        {presenceSelectionneePourJustification && (
          <form onSubmit={gererSoumissionJustification} className="space-y-6 p-2">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-inner">
              <h3 className="font-semibold text-blue-800 mb-3">Informations sur la présence</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Statut actuel:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {getIconeStatut(presenceSelectionneePourJustification.statut)}
                    <span className={`px-2 py-1 text-xs rounded-full ${getCouleurStatut(presenceSelectionneePourJustification.statut)}`}>
                      {getLibelleStatut(presenceSelectionneePourJustification.statut)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Classe:</span>
                  <p className="font-medium text-gray-900">{getNomClasse(presenceSelectionneePourJustification.classeId)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <p className="font-medium text-gray-900">{new Date(presenceSelectionneePourJustification.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Enseignant ayant marqué:</span>
                  <p className="font-medium text-gray-900">{presenceSelectionneePourJustification.enseignantId ? getNomEnseignant(presenceSelectionneePourJustification.enseignantId) : 'Non défini'}</p>
                </div>
              </div>
            </div>

            {/*  formulaire de justification */}
            {presenceSelectionneePourJustification.statut !== 'present' && presenceSelectionneePourJustification.statut !== 'non_marque' && (
              <div className="space-y-4">
                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    id="justifie"
                    checked={donneesFormulaire.justifie}
                    onChange={(e) => setDonneesFormulaire({ ...donneesFormulaire, justifie: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="justifie" className="ml-2 block text-sm font-medium text-gray-900">
                    Absence/Retard justifié(e)
                  </label>
                </div>

                <InputField
                  label="Motif de justification"
                  value={donneesFormulaire.motifJustification}
                  onChange={(e) => setDonneesFormulaire({ ...donneesFormulaire, motifJustification: e.target.value })}
                  placeholder="Rendez-vous médical, problème de transport..."
                  type="textarea"
                  rows="2"
                  disabled={!donneesFormulaire.justifie}
                />

                <InputField
                  label="Commentaire administratif"
                  value={donneesFormulaire.commentaire}
                  onChange={(e) => setDonneesFormulaire({ ...donneesFormulaire, commentaire: e.target.value })}
                  placeholder="Commentaire interne..."
                  type="textarea"
                  rows="3"
                />
              </div>
            )}
            {/* Messages pour les statuts non gérables */}
            {presenceSelectionneePourJustification.statut === 'non_marque' && (
              <div className="text-center py-4 text-gray-600">
                Cette entrée n'est pas une présence enregistrée. Vous devez d'abord marquer la présence de l'élève.
              </div>
            )}
            {presenceSelectionneePourJustification.statut === 'present' && (
              <div className="text-center py-4 text-gray-600">
                Un élève présent n'a pas besoin de justification.
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={reinitialiserFormulaireJustification}>
                Annuler
              </Button>
              <Button type="submit" disabled={presenceSelectionneePourJustification.statut === 'present' || presenceSelectionneePourJustification.statut === 'non_marque'}>
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
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock,
  CreditCard,
  Home,
  Mail,
  Phone,
  User as UserIcon,
  UserX,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/ui/Card";


import Button from "../../components/ui/Button";
import {
  classes,
  eleves,
  enseignants,
  matieres,
  notes,
  paiements,
  presences as toutesLesPresences,
  utilisateurs,
} from "../../data/donneesTemporaires";

const ProfilEleve = () => {
  const { eleveId } = useParams();

  const navigate = useNavigate();
  const profilEleve = useMemo(() => { // Renommé eleveProfile en profilEleve
    return eleves.find((e) => e.id === parseInt(eleveId));
  }, [eleves, eleveId]);

  const paiementsEleve = useMemo(() => { // Renommé studentPayments en paiementsEleve
    return profilEleve
      ? paiements.filter((p) => p.eleveId === profilEleve.id)
      : [];
  }, [profilEleve, paiements]);

  const notesEleve = useMemo(() => { // Renommé studentNotes en notesEleve
    return profilEleve
      ? notes.filter((n) => n.eleveId === profilEleve.id)
      : [];
  }, [profilEleve, notes]);

  const presencesEleve = useMemo(() => { // Renommé studentPresences en presencesEleve
    return profilEleve
      ? toutesLesPresences.filter( // Utilisation du nouveau nom
          (p) => p.eleveId === profilEleve.id && p.statut !== "present"
        )
      : [];
  }, [profilEleve, toutesLesPresences]); // Dépendance mise à jour

  const getNomClasse = (classeId) => { // Renommé getClassName en getNomClasse
    const classe = classes.find((c) => c.id === classeId);
    return classe ? classe.nom : "Non assigné";
  };

  const getNomMatiere = (matiereId) => { // Renommé getMatiereName en getNomMatiere
    const matiere = matieres.find((m) => m.id === matiereId);
    return matiere ? matiere.nom : "Matière inconnue";
  };

  const getLibelleSexe = (codeSexe) => { // Renommé getSexeLabel en getLibelleSexe
    return codeSexe === "M"
      ? "Masculin"
      : codeSexe === "F"
      ? "Féminin"
      : "Non spécifié";
  };

  const getNomEnseignant = (enseignantId) => { // Renommé getEnseignantName en getNomEnseignant
    const enseignant = enseignants.find((e) => e.id === enseignantId);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : "Non défini";
  };

  const getIconeStatutPresence = (statut) => { // Renommé getPresenceStatusIcon en getIconeStatutPresence
    switch (statut) {
      case "absent":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "retard":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "renvoye":
        return <UserX className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLibelleStatutPresence = (statut) => { // Renommé getPresenceStatusLabel en getLibelleStatutPresence
    switch (statut) {
      case "absent":
        return "Absent";
      case "retard":
        return "En retard";
      case "renvoye":
        return "Renvoyé";
      default:
        return "Statut inconnu";
    }
  };

  const getInfoParent = (parentId) => { // Renommé getParentInfo en getInfoParent
    return utilisateurs.find(
      (user) => user.id === parentId && user.role === "parent"
    );
  };

  const LigneDetail = ({ icon: Icon, label, value }) => ( // Renommé DetailRow en LigneDetail
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      {Icon && <Icon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-words">
          {value}
        </p>
      </div>
    </div>
  );

  if (!profilEleve) { // Utilisation du nouveau nom
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Card className="p-10 text-center shadow-lg rounded-xl border border-gray-200 bg-white">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Élève non trouvé
            </h3>
            <p className="text-sm text-gray-600">
              L'ID de l'élève spécifié dans l'URL ne correspond à aucun élève.
              Veuillez vérifier l'adresse ou la disponibilité des données.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              icon={ArrowLeft}
              className="mb-2"
            >
              Retour
            </Button>
            <h2 className="text-xl font-bold text-gray-900">Profil de: {profilEleve.prenom} {profilEleve.nom}</h2>
            <p className="text-gray-600">Informations détaillées sur {profilEleve.prenom} {profilEleve.nom}.</p>
          </div>
        </div>

        {/* Infos eleve */}
        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white">
          <div className="flex items-center space-x-5 pb-4 mb-4 border-b border-gray-200">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold uppercase flex-shrink-0">
              {profilEleve.prenom.charAt(0)}
              {profilEleve.nom.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {profilEleve.prenom} {profilEleve.nom}
              </h3>
              <p className="text-sm text-gray-600">
                Matriclue: {profilEleve.matricule}
              </p>
              
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LigneDetail // Utilisation du nouveau nom
              icon={CalendarDays}
              label="Date de naissance"
              value={new Date(profilEleve.dateNaissance).toLocaleDateString(
                "fr-FR"
              )}
            />
            <LigneDetail // Utilisation du nouveau nom
              icon={BookOpen}
              label="Classe"
              value={getNomClasse(profilEleve.classeId)}
            />
            <LigneDetail // Utilisation du nouveau nom
              icon={UserIcon}
              label="Sexe"
              value={getLibelleSexe(profilEleve.sexe)}
            />
            <LigneDetail icon={Mail} label="Email" value={profilEleve.email} /> {/* Utilisation du nouveau nom */}
            <LigneDetail // Utilisation du nouveau nom
              icon={Phone}
              label="Téléphone"
              value={profilEleve.telephone || "N/A"}
            />
            <LigneDetail // Utilisation du nouveau nom
              icon={Home}
              label="Adresse"
              value={profilEleve.adresse || "N/A"}
            />
          </div>
        </Card>

        {/* Infos Parents */}
        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <UserIcon className="w-6 h-6 mr-2 text-indigo-600" /> Informations
            des Parents
          </h2>
          {profilEleve.parentIds && profilEleve.parentIds.length > 0 ? (
            <div className="space-y-4">
              {profilEleve.parentIds.map((parentId) => {
                const parent = getInfoParent(parentId); // Utilisation du nouveau nom
                return parent ? (
                  <div
                    key={parentId}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <LigneDetail // Utilisation du nouveau nom
                      icon={UserIcon}
                      label="Nom Complet"
                      value={`${parent.prenom} ${parent.nom}`}
                    />
                    <LigneDetail // Utilisation du nouveau nom
                      icon={Phone}
                      label="Téléphone"
                      value={parent.telephone || "N/A"}
                    />
                    <LigneDetail // Utilisation du nouveau nom
                      icon={Mail}
                      label="Email"
                      value={parent.email || "N/A"}
                    />
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center p-4">
              Aucun parent associé à cet élève.
            </p>
          )}
        </Card>

        {/* Infos Paiements */}
        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-6 h-6 mr-2 text-purple-600" /> Historique
            des Paiements
          </h2>
          {paiementsEleve.length > 0 ? ( // Utilisation du nouveau nom
            <div className="space-y-3">
              {paiementsEleve // Utilisation du nouveau nom
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {p.type} -{" "}
                        {p.montant.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "XOF",
                        })}
                      </p>
                      <p className="text-xs text-gray-600">
                        Date: {new Date(p.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        p.statut === "Payé"
                          ? "bg-green-100 text-green-800"
                          : p.statut === "En attente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {p.statut}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center p-4">
              Aucun historique de paiement disponible pour cet élève.
            </p>
          )}
        </Card>

        {/* Infos Notes */}
        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-orange-600" /> Historique des
            Notes
          </h2>
          {notesEleve.length > 0 ? ( // Utilisation du nouveau nom
            <div className="space-y-3">
              {notesEleve // Utilisation du nouveau nom
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((note) => (
                  <div
                    key={note.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {getNomMatiere(note.matiereId)} - {note.type} {/* Utilisation du nouveau nom */}
                      </p>
                      <p className="text-xs text-gray-600">
                        Date: {new Date(note.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <span
                      className={`font-bold text-lg ${
                        note.note >= 10 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {note.note}/20
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center p-4">
              Aucune note enregistrée pour cet élève.
            </p>
          )}
        </Card>

        {/* Infos Absences & Retards */}
        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <UserX className="w-6 h-6 mr-2 text-red-600" /> Absences & Retards
          </h2>
          {presencesEleve.length > 0 ? ( // Utilisation du nouveau nom
            <div className="space-y-3">
              {presencesEleve // Utilisation du nouveau nom
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      {getIconeStatutPresence(p.statut)} {/* Utilisation du nouveau nom */}
                      <div>
                        <p className="font-semibold text-gray-800">
                          {getLibelleStatutPresence(p.statut)} -{" "} {/* Utilisation du nouveau nom */}
                          {new Date(p.date).toLocaleDateString("fr-FR")}
                        </p>
                        <p className="text-xs text-gray-600">
                          {p.heureDebut || "N/A"} - {p.heureFin || "N/A"}{" "}
                          {p.heureArrivee ? `(Arrivée: ${p.heureArrivee})` : ""}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        p.justifie
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {p.justifie ? "Justifié" : "Non justifié"}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center p-4">
              Aucune absence ou retard enregistré pour cet élève.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilEleve;
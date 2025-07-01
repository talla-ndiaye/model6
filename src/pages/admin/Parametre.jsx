import { Home, KeyRound, Lock, Mail, Phone, Save, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';

const parametresInitiauxEcole = {
  nomEcole: "École Djolof",
  anneeScolaire: "2025-2026",
  adresseEcole: "Rue 10, Almadies, Dakar",
  contactEmail: "contact@ecoledjolof.sn",
  contactPhone: "778901234"
};

const ParametresAdmin = () => {
  const { user, updateUser } = useAuth();

  const [parametresEcole, setParametresEcole] = useState(parametresInitiauxEcole);
  const [afficherModalModifierParametresEcole, setAfficherModalModifierParametresEcole] = useState(false);
  const [donneesFormulaireEcole, setDonneesFormulaireEcole] = useState(parametresEcole);

  const [informationsAdmin, setInformationsAdmin] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || ''
  });
  const [afficherModalModifierInfosAdmin, setAfficherModalModifierInfosAdmin] = useState(false);
  const [donneesFormulaireAdmin, setDonneesFormulaireAdmin] = useState(informationsAdmin);

  const [afficherModalChangerMotDePasse, setAfficherModalChangerMotDePasse] = useState(false);
  const [formulaireMotDePasse, setFormulaireMotDePasse] = useState({
    motDePasseActuel: '',
    nouveauMotDePasse: '',
    confirmerNouveauMotDePasse: ''
  });

  const gererChangementFormulaire = (e, typeFormulaire) => {
    const { name, value } = e.target;
    if (typeFormulaire === 'ecole') {
      setDonneesFormulaireEcole(prev => ({ ...prev, [name]: value }));
    } else if (typeFormulaire === 'admin') {
      setDonneesFormulaireAdmin(prev => ({ ...prev, [name]: value }));
    } else if (typeFormulaire === 'motdepasse') {
      setFormulaireMotDePasse(prev => ({ ...prev, [name]: value }));
    }
  };

  const ouvrirModifierParametresEcole = () => {
    setDonneesFormulaireEcole(parametresEcole);
    setAfficherModalModifierParametresEcole(true);
  };
  const fermerModifierParametresEcole = () => {
    setAfficherModalModifierParametresEcole(false);
  };
  const gererEnregistrementParametresEcole = (e) => {
    e.preventDefault();
    console.log("Enregistrement des paramètres de l'école:", donneesFormulaireEcole);
    setParametresEcole(donneesFormulaireEcole);
    fermerModifierParametresEcole();
    alert("Paramètres de l'école mis à jour avec succès !");
  };

  const ouvrirModifierInfosAdmin = () => {
    setDonneesFormulaireAdmin(informationsAdmin);
    setAfficherModalModifierInfosAdmin(true);
  };
  const fermerModifierInfosAdmin = () => {
    setAfficherModalModifierInfosAdmin(false);
  };
  const gererEnregistrementInfosAdmin = (e) => {
    e.preventDefault();
    console.log("Enregistrement des informations personnelles de l'admin:", donneesFormulaireAdmin);
    setInformationsAdmin(donneesFormulaireAdmin);
    fermerModifierInfosAdmin();
    alert("Vos informations personnelles ont été mises à jour !");
  };

  const ouvrirModalChangerMotDePasse = () => {
    setFormulaireMotDePasse({
      motDePasseActuel: '',
      nouveauMotDePasse: '',
      confirmerNouveauMotDePasse: ''
    });
    setAfficherModalChangerMotDePasse(true);
  };
  const fermerModalChangerMotDePasse = () => {
    setAfficherModalChangerMotDePasse(false);
  };
  const gererChangementMotDePasse = (e) => {
    e.preventDefault();
    const { motDePasseActuel, nouveauMotDePasse, confirmerNouveauMotDePasse } = formulaireMotDePasse;

    if (nouveauMotDePasse !== confirmerNouveauMotDePasse) {
      alert("Le nouveau mot de passe et la confirmation ne correspondent pas.");
      return;
    }
    if (nouveauMotDePasse.length < 6) {
      alert("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (motDePasseActuel !== user?.motDePasse) {
        alert("L'ancien mot de passe est incorrect.");
        return;
    }

    console.log("Mot de passe changé pour l'utilisateur:", user?.email, "Nouveau mot de passe:", nouveauMotDePasse);

    fermerModalChangerMotDePasse();
    alert("Votre mot de passe a été modifié avec succès !");
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6 sm:p-10 font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
          Paramètres Administrateur
        </h1>
        <p className="text-lg text-gray-700">
          Gérez les configurations générales de l'établissement et votre profil.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">

        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white flex flex-col items-center text-center">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
            <UserIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Mon Profil</h2>
          <p className="text-gray-600 text-sm mb-4">
            Modifiez vos informations personnelles d'administrateur.
          </p>
          <div className="text-left text-sm text-gray-700 w-full mb-4 space-y-1">
            <p className="font-semibold">{informationsAdmin.prenom} {informationsAdmin.nom}</p>
            <p className="flex items-center gap-1"><Mail className="w-4 h-4" /> {informationsAdmin.email}</p>
            <p className="flex items-center gap-1"><Phone className="w-4 h-4" /> {informationsAdmin.telephone}</p>
          </div>
          <Button variant="outline" className="w-full mt-auto" onClick={ouvrirModifierInfosAdmin}>
            Modifier mon profil
          </Button>
        </Card>

        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white flex flex-col items-center text-center">
          <div className="bg-yellow-100 text-yellow-600 p-4 rounded-full mb-4">
            <Home className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Paramètres de l'École</h2>
          <p className="text-gray-600 text-sm mb-4">
            Configurez le nom, l'année scolaire, les contacts et l'adresse de l'établissement.
          </p>
          <div className="text-left text-sm text-gray-700 w-full mb-4 space-y-1">
            <p className="font-semibold">{parametresEcole.nomEcole}</p>
            <p>{parametresEcole.anneeScolaire}</p>
            <p className="flex items-center gap-1"><Mail className="w-4 h-4" /> {parametresEcole.contactEmail}</p>
            <p className="flex items-center gap-1"><Phone className="w-4 h-4" /> {parametresEcole.contactPhone}</p>
            <p className="flex items-center gap-1"><Home className="w-4 h-4" /> {parametresEcole.adresseEcole}</p>
          </div>
          <Button variant="outline" className="w-full mt-auto" onClick={ouvrirModifierParametresEcole}>
            Modifier les paramètres
          </Button>
        </Card>

        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white flex flex-col items-center text-center">
          <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sécurité & Mot de passe</h2>
          <p className="text-gray-600 text-sm mb-4">
            Changez votre mot de passe pour maintenir la sécurité de votre compte.
          </p>
          <Button variant="outline" className="w-full mt-auto" onClick={ouvrirModalChangerMotDePasse} icon={KeyRound}>
            Changer le mot de passe
          </Button>
        </Card>

      </div>

      <Modal
        isOpen={afficherModalModifierParametresEcole}
        onClose={fermerModifierParametresEcole}
        title="Modifier les paramètres de l'école"
        size="md"
      >
        <form onSubmit={gererEnregistrementParametresEcole} className="space-y-4">
          <InputField
            label="Nom de l'École"
            name="nomEcole"
            value={donneesFormulaireEcole.nomEcole}
            onChange={(e) => gererChangementFormulaire(e, 'ecole')}
            required
          />
          <InputField
            label="Année Scolaire"
            name="anneeScolaire"
            value={donneesFormulaireEcole.anneeScolaire}
            onChange={(e) => gererChangementFormulaire(e, 'ecole')}
            placeholder="Ex: 2024-2025"
            required
          />
          <InputField
            label="Adresse de l'École"
            name="adresseEcole"
            value={donneesFormulaireEcole.adresseEcole}
            onChange={(e) => gererChangementFormulaire(e, 'ecole')}
            required
          />
          <InputField
            label="Email de Contact"
            name="contactEmail"
            type="email"
            value={donneesFormulaireEcole.contactEmail}
            onChange={(e) => gererChangementFormulaire(e, 'ecole')}
            required
          />
          <InputField
            label="Téléphone de Contact"
            name="contactPhone"
            value={donneesFormulaireEcole.contactPhone}
            onChange={(e) => gererChangementFormulaire(e, 'ecole')}
            required
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={fermerModifierParametresEcole}>
              Annuler
            </Button>
            <Button type="submit" icon={Save}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={afficherModalModifierInfosAdmin}
        onClose={fermerModifierInfosAdmin}
        title="Modifier mon profil administrateur"
        size="md"
      >
        <form onSubmit={gererEnregistrementInfosAdmin} className="space-y-4">
          <InputField
            label="Prénom"
            name="prenom"
            value={donneesFormulaireAdmin.prenom}
            onChange={(e) => gererChangementFormulaire(e, 'admin')}
            required
          />
          <InputField
            label="Nom"
            name="nom"
            value={donneesFormulaireAdmin.nom}
            onChange={(e) => gererChangementFormulaire(e, 'admin')}
            required
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            value={donneesFormulaireAdmin.email}
            onChange={(e) => gererChangementFormulaire(e, 'admin')}
            required
          />
          <InputField
            label="Téléphone"
            name="telephone"
            value={donneesFormulaireAdmin.telephone}
            onChange={(e) => gererChangementFormulaire(e, 'admin')}
            required
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={fermerModifierInfosAdmin}>
              Annuler
            </Button>
            <Button type="submit" icon={Save}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={afficherModalChangerMotDePasse}
        onClose={fermerModalChangerMotDePasse}
        title="Changer le mot de passe"
        size="sm"
      >
        <form onSubmit={gererChangementMotDePasse} className="space-y-4">
          <InputField
            label="Ancien mot de passe"
            name="motDePasseActuel"
            type="password"
            value={formulaireMotDePasse.motDePasseActuel}
            onChange={(e) => gererChangementFormulaire(e, 'motdepasse')}
            required
          />
          <InputField
            label="Nouveau mot de passe"
            name="nouveauMotDePasse"
            type="password"
            value={formulaireMotDePasse.nouveauMotDePasse}
            onChange={(e) => gererChangementFormulaire(e, 'motdepasse')}
            required
          />
          <InputField
            label="Confirmer nouveau mot de passe"
            name="confirmerNouveauMotDePasse"
            type="password"
            value={formulaireMotDePasse.confirmerNouveauMotDePasse}
            onChange={(e) => gererChangementFormulaire(e, 'motdepasse')}
            required
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={fermerModalChangerMotDePasse}>
              Annuler
            </Button>
            <Button type="submit" icon={Lock}>
              Changer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ParametresAdmin;
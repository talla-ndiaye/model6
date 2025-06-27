import { Home, KeyRound, Lock, Mail, Phone, Save, User as UserIcon } from 'lucide-react'; // Added KeyRound and Lock icons
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext'; // Import useAuth to get connected user

// Assuming you have a dummy data for school settings or it can come from a context
const initialSchoolSettings = {
  nomEcole: "École Djolof",
  anneeScolaire: "2025-2026",
  adresseEcole: "Rue 10, Almadies, Dakar",
  contactEmail: "contact@ecoledjolof.sn",
  contactPhone: "778901234"
};

const ParametresAdmin = () => {
  const { user, updateUser } = useAuth(); // Get connected user and a potential updateUser function from AuthContext
  
  // State for School Settings
  const [schoolSettings, setSchoolSettings] = useState(initialSchoolSettings);
  const [showEditSchoolSettingsModal, setShowEditSchoolSettingsModal] = useState(false);
  const [formDataSchool, setFormDataSchool] = useState(schoolSettings); // Form data for editing school settings

  // State for Admin Personal Info Settings
  const [adminInfo, setAdminInfo] = useState({ 
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || ''
  });
  const [showEditAdminInfoModal, setShowEditAdminInfoModal] = useState(false);
  const [formDataAdmin, setFormDataAdmin] = useState(adminInfo); // Form data for editing admin info

  // State for Password Change
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // --- Helper Functions for Forms ---
  const handleFormChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'school') {
      setFormDataSchool(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'admin') {
      setFormDataAdmin(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'password') {
      setPasswordForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- School Settings Modal Logic ---
  const openEditSchoolSettings = () => {
    setFormDataSchool(schoolSettings);
    setShowEditSchoolSettingsModal(true);
  };
  const closeEditSchoolSettings = () => {
    setShowEditSchoolSettingsModal(false);
  };
  const handleSaveSchoolSettings = (e) => {
    e.preventDefault();
    console.log("Saving school settings:", formDataSchool);
    setSchoolSettings(formDataSchool);
    closeEditSchoolSettings();
    alert("Paramètres de l'école mis à jour avec succès !");
  };

  // --- Admin Personal Info Modal Logic ---
  const openEditAdminInfo = () => {
    setFormDataAdmin(adminInfo);
    setShowEditAdminInfoModal(true);
  };
  const closeEditAdminInfo = () => {
    setShowEditAdminInfoModal(false);
  };
  const handleSaveAdminInfo = (e) => {
    e.preventDefault();
    console.log("Saving admin personal info:", formDataAdmin);
    setAdminInfo(formDataAdmin);
    // if (updateUser) { updateUser({ ...user, ...formDataAdmin }); }
    closeEditAdminInfo();
    alert("Vos informations personnelles ont été mises à jour !");
  };

  // --- Password Change Modal Logic ---
  const openChangePasswordModal = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setShowChangePasswordModal(true);
  };
  const closeChangePasswordModal = () => {
    setShowChangePasswordModal(false);
  };
  const handleChangePassword = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (newPassword !== confirmNewPassword) {
      alert("Le nouveau mot de passe et la confirmation ne correspondent pas.");
      return;
    }
    if (newPassword.length < 6) {
      alert("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    // Simulate checking current password (in a real app, this would be a backend call)
    if (currentPassword !== user?.motDePasse) { // Assuming user has a motDePasse field
        alert("L'ancien mot de passe est incorrect.");
        return;
    }

    // In a real application, you would send this to your backend for password update
    console.log("Password changed for user:", user?.email, "New password:", newPassword);
    
    // If useAuth provides an updateUser function and your backend supports it, update the user's password in context
    // if (updateUser) {
    //   updateUser({ ...user, motDePasse: newPassword });
    // }

    closeChangePasswordModal();
    alert("Votre mot de passe a été modifié avec succès !");
  };


  return (
    <div className="bg-gray-50 min-h-screen p-6 sm:p-10 font-sans">
      {/* Page Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
          Paramètres Administrateur
        </h1>
        <p className="text-lg text-gray-700">
          Gérez les configurations générales de l'établissement et votre profil.
        </p>
      </header>

      {/* Settings Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">

        {/* Section 1: Mon Profil Administrateur */}
        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white flex flex-col items-center text-center">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
            <UserIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Mon Profil</h2>
          <p className="text-gray-600 text-sm mb-4">
            Modifiez vos informations personnelles d'administrateur.
          </p>
          <div className="text-left text-sm text-gray-700 w-full mb-4 space-y-1">
            <p className="font-semibold">{adminInfo.prenom} {adminInfo.nom}</p>
            <p className="flex items-center gap-1"><Mail className="w-4 h-4" /> {adminInfo.email}</p>
            <p className="flex items-center gap-1"><Phone className="w-4 h-4" /> {adminInfo.telephone}</p>
          </div>
          <Button variant="outline" className="w-full mt-auto" onClick={openEditAdminInfo}>
            Modifier mon profil
          </Button>
        </Card>

        {/* Section 2: Paramètres Généraux de l'École */}
        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white flex flex-col items-center text-center">
          <div className="bg-yellow-100 text-yellow-600 p-4 rounded-full mb-4">
            <Home className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Paramètres de l'École</h2>
          <p className="text-gray-600 text-sm mb-4">
            Configurez le nom, l'année scolaire, les contacts et l'adresse de l'établissement.
          </p>
          <div className="text-left text-sm text-gray-700 w-full mb-4 space-y-1">
            <p className="font-semibold">{schoolSettings.nomEcole}</p>
            <p>{schoolSettings.anneeScolaire}</p>
            <p className="flex items-center gap-1"><Mail className="w-4 h-4" /> {schoolSettings.contactEmail}</p>
            <p className="flex items-center gap-1"><Phone className="w-4 h-4" /> {schoolSettings.contactPhone}</p>
            <p className="flex items-center gap-1"><Home className="w-4 h-4" /> {schoolSettings.adresseEcole}</p>
          </div>
          <Button variant="outline" className="w-full mt-auto" onClick={openEditSchoolSettings}>
            Modifier les paramètres
          </Button>
        </Card>

        {/* Section 3: Sécurité et Mot de passe (NEW SECTION) */}
        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white flex flex-col items-center text-center">
          <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sécurité & Mot de passe</h2>
          <p className="text-gray-600 text-sm mb-4">
            Changez votre mot de passe pour maintenir la sécurité de votre compte.
          </p>
          <Button variant="outline" className="w-full mt-auto" onClick={openChangePasswordModal} icon={KeyRound}>
            Changer le mot de passe
          </Button>
        </Card>

      </div>

      {/* Modal for Editing School Settings */}
      <Modal
        isOpen={showEditSchoolSettingsModal}
        onClose={closeEditSchoolSettings}
        title="Modifier les paramètres de l'école"
        size="md"
      >
        <form onSubmit={handleSaveSchoolSettings} className="space-y-4">
          <InputField
            label="Nom de l'École"
            name="nomEcole"
            value={formDataSchool.nomEcole}
            onChange={(e) => handleFormChange(e, 'school')}
            required
          />
          <InputField
            label="Année Scolaire"
            name="anneeScolaire"
            value={formDataSchool.anneeScolaire}
            onChange={(e) => handleFormChange(e, 'school')}
            placeholder="Ex: 2024-2025"
            required
          />
          <InputField
            label="Adresse de l'École"
            name="adresseEcole"
            value={formDataSchool.adresseEcole}
            onChange={(e) => handleFormChange(e, 'school')}
            required
          />
          <InputField
            label="Email de Contact"
            name="contactEmail"
            type="email"
            value={formDataSchool.contactEmail}
            onChange={(e) => handleFormChange(e, 'school')}
            required
          />
          <InputField
            label="Téléphone de Contact"
            name="contactPhone"
            value={formDataSchool.contactPhone}
            onChange={(e) => handleFormChange(e, 'school')}
            required
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={closeEditSchoolSettings}>
              Annuler
            </Button>
            <Button type="submit" icon={Save}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal for Editing Admin Personal Info */}
      <Modal
        isOpen={showEditAdminInfoModal}
        onClose={closeEditAdminInfo}
        title="Modifier mon profil administrateur"
        size="md"
      >
        <form onSubmit={handleSaveAdminInfo} className="space-y-4">
          <InputField
            label="Prénom"
            name="prenom"
            value={formDataAdmin.prenom}
            onChange={(e) => handleFormChange(e, 'admin')}
            required
          />
          <InputField
            label="Nom"
            name="nom"
            value={formDataAdmin.nom}
            onChange={(e) => handleFormChange(e, 'admin')}
            required
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            value={formDataAdmin.email}
            onChange={(e) => handleFormChange(e, 'admin')}
            required
          />
          <InputField
            label="Téléphone"
            name="telephone"
            value={formDataAdmin.telephone}
            onChange={(e) => handleFormChange(e, 'admin')}
            required
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={closeEditAdminInfo}>
              Annuler
            </Button>
            <Button type="submit" icon={Save}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal for Changing Password (NEW MODAL) */}
      <Modal
        isOpen={showChangePasswordModal}
        onClose={closeChangePasswordModal}
        title="Changer le mot de passe"
        size="sm" 
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <InputField
            label="Ancien mot de passe"
            name="currentPassword"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => handleFormChange(e, 'password')}
            required
          />
          <InputField
            label="Nouveau mot de passe"
            name="newPassword"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => handleFormChange(e, 'password')}
            required
          />
          <InputField
            label="Confirmer nouveau mot de passe"
            name="confirmNewPassword"
            type="password"
            value={passwordForm.confirmNewPassword}
            onChange={(e) => handleFormChange(e, 'password')}
            required
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={closeChangePasswordModal}>
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
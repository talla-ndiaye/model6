import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RedirectToDashboard from './routes/RedirectToDashboard';

// Pages publiques
import Connexion from './pages/Connexion';
// Pages Admin
import Classes from './pages/admin/Classes';
import ClasseDetails from "./pages/admin/ClassesDetails";
import GestionDepenses from "./pages/admin/Depenses";
import Eleves from './pages/admin/Eleves';
import EmploisDuTemps from './pages/admin/EmploisDuTemps';
import Enseignants from './pages/admin/Enseignants';
import GestionPresencesAdmin from './pages/admin/GestionPresences';
import GestionUtilisateurs from './pages/admin/GestionUtilisateurs';
import ImportEleves from './pages/admin/ImportEleves';
import Matieres from './pages/admin/Matieres';
import NotesBulletins from './pages/admin/NotesBulletins';
import Paiements from './pages/admin/Paiements';
import ParametresAdmin from "./pages/admin/Parametre";
import ProfilEleve from "./pages/admin/ProfilEleve";
import TableauDeBord from './pages/admin/TableauDeBord';


// Pages Enseignant
import GestionEvaluations from "./pages/admin/Evaluations";
import EmploiDuTempsEnseignant from './pages/enseignant/EmploiDuTemps';
import GestionNotes from './pages/enseignant/GestionNotes';
import GestionPresences from './pages/enseignant/GestionPresences';
import MesClasses from './pages/enseignant/MesClasses';
import TableauDeBordEnseignant from './pages/enseignant/TableauDeBord';

// Pages Élève
import EmploiDuTempsEleve from './pages/eleve/EmploiDuTemps';
import NotesEleve from './pages/eleve/Notes';
import MesPaiementsEleve from "./pages/eleve/Paiements";
import PresencesEleve from './pages/eleve/Presences';

// Pages Parent
import MesEnfants from './pages/parent/MesEnfants';
import HistoriquePaiementsParent from "./pages/parent/Paiements";
import PresencesEnfants from './pages/parent/PresencesEnfants';

// Pages Comptable

import ProfilEnseignant from "./pages/admin/ProfilEnseignant";
import Recus from './pages/comptable/Recus';
import StatistiquesPaiements from './pages/comptable/Statistiques';
import TableauDeBordComptable from './pages/comptable/TableauDebord';
import NotFoundPage from "./pages/PageIntrouvable";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirection  selon le rôle */}
          <Route path="/" element={<RedirectToDashboard />} />

          {/* Route publique */}
          <Route path="/connexion" element={<Connexion />} />

          {/* Touts mes composants seront enveloppés par le Dashbord */}
          <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Routes Admin */}
            <Route path="admin/tableau-de-bord" element={<TableauDeBord />} />
            <Route path="admin/parametres" element={<ParametresAdmin />} />
            <Route path="admin/gestion-utilisateurs" element={<GestionUtilisateurs />} />
            <Route path="admin/eleves" element={<Eleves />} />
            <Route path="admin/eleves/profil/:eleveId" element={<ProfilEleve />} />
            <Route path="admin/enseignants" element={<Enseignants />} />
            <Route path="admin/enseignants/profil/:enseignantId" element={<ProfilEnseignant />} />
            <Route path="admin/classes" element={<Classes />} />
            <Route path="admin/matieres" element={<Matieres />} />
            <Route path="admin/emplois-du-temps" element={<EmploisDuTemps />} />
            <Route path="admin/notes-bulletins" element={<NotesBulletins />} />
            <Route path="admin/paiements" element={<Paiements />} />
            <Route path="admin/import-eleves/classe/:classeId" element={<ImportEleves />} />
            <Route path="admin/presences" element={<GestionPresencesAdmin />} />
            <Route path="admin/depenses" element={<GestionDepenses />} />
            <Route path="admin/evaluations" element={<GestionEvaluations />} />
            <Route path="admin/classes/details/:id" element={<ClasseDetails />} />


            {/* Routes Enseignant */}
            <Route path="enseignant/tableau-de-bord" element={<TableauDeBordEnseignant />} />
            <Route path="enseignant/mes-classes" element={<MesClasses />} />
            <Route path="enseignant/emploi-du-temps" element={<EmploiDuTempsEnseignant />} />
            <Route path="enseignant/gestion-notes" element={<GestionNotes />} />
            <Route path="enseignant/presences" element={<GestionPresences />} />

            {/* Routes Élève */}
            <Route path="eleve/tableau-de-bord" element={<TableauDeBordEnseignant />} />
            <Route path="eleve/emploi-du-temps" element={<EmploiDuTempsEleve />} />
            <Route path="eleve/notes" element={<NotesEleve />} />
            <Route path="eleve/presences" element={<PresencesEleve />} />
            <Route path="eleve/paiements" element={<MesPaiementsEleve />} />

            {/* Routes Parent */}
            <Route path="parent/tableau-de-bord" element={<TableauDeBordEnseignant />} />
            <Route path="parent/mes-enfants" element={<MesEnfants />} />
            <Route path="parent/paiements" element={<HistoriquePaiementsParent />} />
            <Route path="parent/presences" element={<PresencesEnfants />} />

            {/* Routes Comptable */}
            <Route path="comptable/tableau-de-bord" element={<TableauDeBordComptable />} />
            <Route path="comptable/paiements" element={<Recus />} />
            <Route path="comptable/statistiques" element={<StatistiquesPaiements />} />

            
          
          </Route>
          
          {/* Route introuvable */}
          <Route path="*" element={<NotFoundPage />} />

          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

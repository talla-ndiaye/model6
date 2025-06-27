import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";


import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages publiques
import Connexion from './pages/Connexion';

// Pages Admin
import Classes from './pages/admin/Classes';
import Eleves from './pages/admin/Eleves';
import EmploisDuTemps from './pages/admin/EmploisDuTemps';
import Enseignants from './pages/admin/Enseignants';
import GestionUtilisateurs from './pages/admin/GestionUtilisateurs';
import ImportEleves from './pages/admin/ImportEleves';
import Matieres from './pages/admin/Matieres';
import NotesBulletins from './pages/admin/NotesBulletins';
import Paiements from './pages/admin/Paiements';
import TableauDeBord from './pages/admin/TableauDeBord';

// Pages Enseignant
import EmploiDuTempsEnseignant from './pages/enseignant/EmploiDuTemps';
import GestionNotes from './pages/enseignant/GestionNotes';
import MesClasses from './pages/enseignant/MesClasses';
import TableauDeBordEnseignant from './pages/enseignant/TableauDeBord';

// Pages Élève
import EmploiDuTempsEleve from './pages/eleve/EmploiDuTemps';
import NotesEleve from './pages/eleve/Notes';

// Pages Parent
import MesEnfants from './pages/parent/MesEnfants';

// Pages Comptable
import GestionDepenses from "./pages/admin/Depenses";
import GestionPresencesAdmin from './pages/admin/GestionPresences';
import ParametresAdmin from "./pages/admin/Parametre";
import ProfilEleve from "./pages/admin/ProfilEleve";
import Recus from './pages/comptable/Recus';
import StatistiquesPaiements from './pages/comptable/Statistiques';
import TableauDeBordComptable from './pages/comptable/TableauDebord';
import MesPaiementsEleve from "./pages/eleve/Paiements";
import PresencesEleve from './pages/eleve/Presences';
import GestionPresences from './pages/enseignant/GestionPresences';
import HistoriquePaiementsParent from "./pages/parent/Paiements";
import PresencesEnfants from './pages/parent/PresencesEnfants';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route publique */}
          <Route path="/connexion" element={<Connexion />} />
          
          {/* Routes protégées avec layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            {/* Routes Admin */}
            <Route path="admin/tableau-de-bord" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TableauDeBord />
              </ProtectedRoute>
            } />
            <Route path="admin/parametres" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ParametresAdmin />
              </ProtectedRoute>
            } />
            <Route path="admin/gestion-utilisateurs" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <GestionUtilisateurs />
              </ProtectedRoute>
            } />
            <Route path="admin/eleves" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Eleves />
              </ProtectedRoute>
            } />
            <Route path="admin/eleves/profil/:eleveId" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProfilEleve />
              </ProtectedRoute>
            } />
            <Route path="admin/enseignants" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Enseignants />
              </ProtectedRoute>
            } />
            <Route path="admin/classes" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Classes />
              </ProtectedRoute>
            } />
            <Route path="admin/matieres" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Matieres />
              </ProtectedRoute>
            } />
            <Route path="admin/emplois-du-temps" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EmploisDuTemps />
              </ProtectedRoute>
            } />
            <Route path="admin/notes-bulletins" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <NotesBulletins />
              </ProtectedRoute>
            } />
            <Route path="admin/paiements" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Paiements />
              </ProtectedRoute>
            } />
            <Route path="admin/import-eleves" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ImportEleves />
              </ProtectedRoute>
            } />
            <Route path="admin/presences" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <GestionPresencesAdmin />
              </ProtectedRoute>
            } />
            <Route path="admin/depenses" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <GestionDepenses />
              </ProtectedRoute>
            } />

            {/* Routes Enseignant */}
            <Route path="enseignant/tableau-de-bord" element={
              <ProtectedRoute allowedRoles={['enseignant']}>
                <TableauDeBordEnseignant />
              </ProtectedRoute>
            } />
            <Route path="enseignant/mes-classes" element={
              <ProtectedRoute allowedRoles={['enseignant']}>
                <MesClasses />
              </ProtectedRoute>
            } />
            <Route path="enseignant/emploi-du-temps" element={
              <ProtectedRoute allowedRoles={['enseignant']}>
                <EmploiDuTempsEnseignant />
              </ProtectedRoute>
            } />
            <Route path="enseignant/gestion-notes" element={
              <ProtectedRoute allowedRoles={['enseignant']}>
                <GestionNotes />
              </ProtectedRoute>
            } />
            <Route path="enseignant/presences" element={
              <ProtectedRoute allowedRoles={['enseignant']}>
                <GestionPresences />
              </ProtectedRoute>
            } />

            {/* Routes Élève */}
            <Route path="eleve/tableau-de-bord" element={
              <ProtectedRoute allowedRoles={['eleve']}>
                <TableauDeBordEnseignant />
              </ProtectedRoute>
            } />
            <Route path="eleve/emploi-du-temps" element={
              <ProtectedRoute allowedRoles={['eleve']}>
                <EmploiDuTempsEleve />
              </ProtectedRoute>
            } />
            <Route path="eleve/notes" element={
              <ProtectedRoute allowedRoles={['eleve']}>
                <NotesEleve />
              </ProtectedRoute>
            } />
            <Route path="eleve/presences" element={
              <ProtectedRoute allowedRoles={['eleve']}>
                <PresencesEleve />
              </ProtectedRoute>
            } />
            <Route path="eleve/paiements" element={
              <ProtectedRoute allowedRoles={['eleve']}>
                <MesPaiementsEleve />
              </ProtectedRoute>
            } />

            {/* Routes Parent */}
            <Route path="parent/tableau-de-bord" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <TableauDeBordEnseignant />
              </ProtectedRoute>
            } />
            <Route path="parent/mes-enfants" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <MesEnfants />
              </ProtectedRoute>
            } />
            <Route path="parent/paiements" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <HistoriquePaiementsParent />
              </ProtectedRoute>
            } />

            <Route path="parent/presences" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <PresencesEnfants />
              </ProtectedRoute>
            } />

            {/* Routes Comptable */}
            <Route path="comptable/tableau-de-bord" element={
              <ProtectedRoute allowedRoles={['comptable']}>
                <TableauDeBordComptable />
              </ProtectedRoute>
            } />
            <Route path="comptable/paiements" element={
              <ProtectedRoute allowedRoles={['comptable']}>
                <Recus />
              </ProtectedRoute>
            } />
            <Route path="comptable/statistiques" element={
              <ProtectedRoute allowedRoles={['comptable']}>
                <StatistiquesPaiements />
              </ProtectedRoute>
            } />
          </Route>

          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/connexion" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
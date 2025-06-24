import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages publiques
import Connexion from './pages/Connexion';

// Pages Admin
import TableauDeBord from './pages/admin/TableauDeBord';
import GestionUtilisateurs from './pages/admin/GestionUtilisateurs';
import Eleves from './pages/admin/Eleves';
import Enseignants from './pages/admin/Enseignants';
import Classes from './pages/admin/Classes';
import Matieres from './pages/admin/Matieres';
import EmploisDuTemps from './pages/admin/EmploisDuTemps';
import NotesBulletins from './pages/admin/NotesBulletins';
import Paiements from './pages/admin/Paiements';
import ImportEleves from './pages/admin/ImportEleves';

// Pages Enseignant
import TableauDeBordEnseignant from './pages/enseignant/TableauDeBord';
import MesClasses from './pages/enseignant/MesClasses';
import EmploiDuTempsEnseignant from './pages/enseignant/EmploiDuTemps';
import GestionNotes from './pages/enseignant/GestionNotes';

// Pages Élève
import EmploiDuTempsEleve from './pages/eleve/EmploiDuTemps';
import NotesEleve from './pages/eleve/Notes';

// Pages Parent
import MesEnfants from './pages/parent/MesEnfants';

// Pages Comptable
import Recus from './pages/comptable/Recus';

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

            {/* Routes Élève */}
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

            {/* Routes Parent */}
            <Route path="parent/mes-enfants" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <MesEnfants />
              </ProtectedRoute>
            } />

            {/* Routes Comptable */}
            <Route path="comptable/recus" element={
              <ProtectedRoute allowedRoles={['comptable']}>
                <Recus />
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
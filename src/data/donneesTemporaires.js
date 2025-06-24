// Données temporaires pour simulation
export const utilisateurs = [
  {
    id: 1,
    email: 'admin@ecole.fr',
    motDePasse: 'admin123',
    role: 'admin',
    nom: 'Dubois',
    prenom: 'Marie',
    telephone: '0123456789'
  },
  {
    id: 2,
    email: 'prof@ecole.fr',
    motDePasse: 'prof123',
    role: 'enseignant',
    nom: 'Martin',
    prenom: 'Pierre',
    telephone: '0123456788',
    matieres: [1, 2]
  },
  {
    id: 3,
    email: 'parent@ecole.fr',
    motDePasse: 'parent123',
    role: 'parent',
    nom: 'Durand',
    prenom: 'Sophie',
    telephone: '0123456787',
    enfants: [1, 2]
  },
  {
    id: 4,
    email: 'eleve@ecole.fr',
    motDePasse: 'eleve123',
    role: 'eleve',
    nom: 'Durand',
    prenom: 'Lucas',
    telephone: '0123456786',
    classeId: 1
  },
  {
    id: 5,
    email: 'comptable@ecole.fr',
    motDePasse: 'comptable123',
    role: 'comptable',
    nom: 'Moreau',
    prenom: 'Julie',
    telephone: '0123456785'
  }
];

export const eleves = [
  {
    id: 1,
    nom: 'Durand',
    prenom: 'Lucas',
    dateNaissance: '2008-03-15',
    classeId: 1,
    parentIds: [3],
    telephone: '0123456786',
    email: 'eleve@ecole.fr',
    adresse: '123 Rue de la Paix, 75001 Paris'
  },
  {
    id: 2,
    nom: 'Durand',
    prenom: 'Emma',
    dateNaissance: '2010-07-22',
    classeId: 2,
    parentIds: [3],
    telephone: '0123456784',
    email: 'emma@ecole.fr',
    adresse: '123 Rue de la Paix, 75001 Paris'
  },
  {
    id: 3,
    nom: 'Bernard',
    prenom: 'Antoine',
    dateNaissance: '2009-01-10',
    classeId: 1,
    parentIds: [],
    telephone: '0123456783',
    email: 'antoine@ecole.fr',
    adresse: '456 Avenue des Champs, 75002 Paris'
  }
];

export const enseignants = [
  {
    id: 2,
    nom: 'Martin',
    prenom: 'Pierre',
    email: 'prof@ecole.fr',
    telephone: '0123456788',
    matieres: [1, 2],
    classes: [1, 2]
  },
  {
    id: 6,
    nom: 'Lefebvre',
    prenom: 'Claire',
    email: 'claire@ecole.fr',
    telephone: '0123456782',
    matieres: [3, 4],
    classes: [2, 3]
  }
];

export const classes = [
  {
    id: 1,
    nom: '3ème A',
    niveau: '3ème',
    enseignantPrincipal: 2,
    nombreEleves: 25,
    salle: 'A101'
  },
  {
    id: 2,
    nom: '4ème B',
    niveau: '4ème',
    enseignantPrincipal: 6,
    nombreEleves: 22,
    salle: 'B205'
  },
  {
    id: 3,
    nom: '5ème C',
    niveau: '5ème',
    enseignantPrincipal: 6,
    nombreEleves: 28,
    salle: 'C301'
  }
];

export const matieres = [
  {
    id: 1,
    nom: 'Mathématiques',
    code: 'MATH',
    coefficient: 4,
    couleur: '#3b82f6'
  },
  {
    id: 2,
    nom: 'Français',
    code: 'FR',
    coefficient: 4,
    couleur: '#ef4444'
  },
  {
    id: 3,
    nom: 'Histoire-Géographie',
    code: 'HG',
    coefficient: 3,
    couleur: '#f59e0b'
  },
  {
    id: 4,
    nom: 'Sciences Physiques',
    code: 'SP',
    coefficient: 3,
    couleur: '#10b981'
  }
];

export const emploisDuTemps = [
  {
    id: 1,
    classeId: 1,
    jour: 'Lundi',
    heure: '08:00-09:00',
    matiereId: 1,
    enseignantId: 2,
    salle: 'A101'
  },
  {
    id: 2,
    classeId: 1,
    jour: 'Lundi',
    heure: '09:00-10:00',
    matiereId: 2,
    enseignantId: 2,
    salle: 'A101'
  },
  {
    id: 3,
    classeId: 1,
    jour: 'Mardi',
    heure: '08:00-09:00',
    matiereId: 3,
    enseignantId: 6,
    salle: 'B205'
  }
];

export const notes = [
  {
    id: 1,
    eleveId: 1,
    matiereId: 1,
    note: 15.5,
    coefficient: 2,
    date: '2024-01-15',
    type: 'Contrôle',
    commentaire: 'Bon travail'
  },
  {
    id: 2,
    eleveId: 1,
    matiereId: 2,
    note: 12.0,
    coefficient: 1,
    date: '2024-01-20',
    type: 'Devoir',
    commentaire: 'Peut mieux faire'
  }
];

export const paiements = [
  {
    id: 1,
    eleveId: 1,
    montant: 150.00,
    type: 'Scolarité',
    statut: 'Payé',
    date: '2024-01-01',
    methode: 'Virement'
  },
  {
    id: 2,
    eleveId: 2,
    montant: 75.50,
    type: 'Cantine',
    statut: 'En attente',
    date: '2024-01-15',
    methode: 'Chèque'
  }
];

export const evenements = [
  {
    id: 1,
    titre: 'Réunion parents-professeurs',
    description: 'Rencontre avec les familles de 3ème',
    date: '2024-02-15',
    type: 'Réunion'
  },
  {
    id: 2,
    titre: 'Sortie pédagogique',
    description: 'Visite du musée des sciences',
    date: '2024-02-20',
    type: 'Sortie'
  }
];

// Nouvelles données pour les présences
export const presences = [
  {
    id: 1,
    eleveId: 1,
    date: '2024-01-15',
    statut: 'present', // present, absent, retard, renvoye
    heureDebut: '08:00',
    heureFin: '17:00',
    enseignantId: 2,
    classeId: 1,
    justifie: true,
    motifJustification: 'Rendez-vous médical',
    commentaire: 'Arrivé à 9h30',
    dateCreation: '2024-01-15T08:00:00',
    dateModification: '2024-01-15T10:00:00'
  },
  {
    id: 2,
    eleveId: 2,
    date: '2024-01-15',
    statut: 'absent',
    heureDebut: '08:00',
    heureFin: '17:00',
    enseignantId: 2,
    classeId: 2,
    justifie: false,
    motifJustification: '',
    commentaire: 'Absence non justifiée',
    dateCreation: '2024-01-15T08:00:00',
    dateModification: '2024-01-15T08:00:00'
  },
  {
    id: 3,
    eleveId: 3,
    date: '2024-01-15',
    statut: 'retard',
    heureDebut: '08:00',
    heureFin: '17:00',
    enseignantId: 2,
    classeId: 1,
    justifie: true,
    motifJustification: 'Transport en retard',
    commentaire: 'Arrivé à 8h15',
    dateCreation: '2024-01-15T08:15:00',
    dateModification: '2024-01-15T08:15:00'
  }
];
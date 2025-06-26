// Données temporaires pour simulation - Contexte Sénégalais

export const utilisateurs = [
  {
    id: 1,
    email: 'admin@ecole.sn',
    motDePasse: 'admin123',
    role: 'admin',
    nom: 'Diop',
    prenom: 'Fatou',
    telephone: '771234567'
  },
  {
    id: 2,
    email: 'prof@ecole.sn',
    motDePasse: 'prof123',
    role: 'enseignant',
    nom: 'Diallo',
    prenom: 'Moussa',
    telephone: '702345678',
    matieres: [1, 2] // IDs de matières
  },
  {
    id: 3,
    email: 'parent@ecole.sn',
    motDePasse: 'parent123',
    role: 'parent',
    nom: 'Ndiaye',
    prenom: 'Aïcha',
    telephone: '763456789',
    enfants: [1, 2] // IDs des élèves (enfants)
  },
  {
    id: 4,
    email: 'eleve@ecole.sn', // Cet email sera utilisé pour Lucas
    motDePasse: 'eleve123',
    role: 'eleve',
    nom: 'Ndiaye',
    prenom: 'Lucas', // Un prénom international est plausible
    telephone: '784567890',
    classeId: 1 // ID de la classe
  },
  {
    id: 5,
    email: 'comptable@ecole.sn',
    motDePasse: 'comptable123',
    role: 'comptable',
    nom: 'Sow',
    prenom: 'Aminata',
    telephone: '775678901'
  }
];

export const eleves = [
  {
    id: 1, // ID correspondant à l'utilisateur Lucas ci-dessus
    nom: 'Ndiaye',
    prenom: 'Lucas',
    dateNaissance: '2008-03-15',
    sexe: 'M', // Ajout du sexe pour la répartition G/F
    classeId: 1, // ID de la classe
    parentIds: [3], // ID du parent
    telephone: '784567890',
    email: 'eleve@ecole.sn',
    adresse: 'Rue 1 x 2, Sicap Liberté 6, Dakar' // Adresse plus spécifique au Sénégal
  },
  {
    id: 2,
    nom: 'Ndiaye',
    prenom: 'Mariama', // Prénom sénégalais
    dateNaissance: '2010-07-22',
    classeId: 2, // ID de la classe
    sexe: 'F', // Ajout du sexe
    parentIds: [3],
    telephone: '776789012',
    email: 'mariama@ecole.sn',
    adresse: 'Rue 1 x 2, Sicap Liberté 6, Dakar'
  },
  {
    id: 3,
    nom: 'Fall',
    prenom: 'Omar', // Prénom sénégalais
    dateNaissance: '2009-01-10',
    sexe: 'M', // Ajout du sexe
    classeId: 1,
    parentIds: [], // Pas de parent enregistré dans ce jeu de données
    telephone: '707890123',
    email: 'omar@ecole.sn',
    adresse: 'Lot 123, Cité Fadia, Pikine' // Autre localisation
  },
  { // Nouvel élève pour diversifier les données
    id: 4,
    nom: 'Gueye',
    prenom: 'Fatou',
    dateNaissance: '2007-11-01',
    sexe: 'F',
    classeId: 1,
    parentIds: [],
    telephone: '771112233',
    email: 'fatou.gueye@ecole.sn',
    adresse: 'Cité Keur Gorgui, Dakar'
  },
  {
    id: 5,
    nom: 'Mbaye',
    prenom: 'Cheikh',
    dateNaissance: '2011-02-28',
    sexe: 'M',
    classeId: 2,
    parentIds: [],
    telephone: '704445566',
    email: 'cheikh.mbaye@ecole.sn',
    adresse: 'Grand Yoff, Dakar'
  },
];

export const enseignants = [
  {
    id: 2, // ID correspondant à l'utilisateur Moussa ci-dessus
    nom: 'Diallo',
    prenom: 'Moussa',
    email: 'prof@ecole.sn',
    telephone: '702345678',
    matieres: [1, 2], // IDs de matières
    classes: [1, 2] // IDs de classes où il enseigne
  },
  {
    id: 6,
    nom: 'Touré', // Nom sénégalais
    prenom: 'Khady', // Prénom sénégalais
    email: 'khady@ecole.sn',
    telephone: '778901234',
    matieres: [3, 4],
    classes: [2, 3]
  },
  { // Nouvel enseignant
    id: 7,
    nom: 'Sarr',
    prenom: 'Modou',
    email: 'modou.sarr@ecole.sn',
    telephone: '769998877',
    matieres: [1],
    classes: [1, 3]
  }
];

export const classes = [
  {
    id: 1,
    nom: 'Terminale S1', // Nom de classe plus réaliste
    niveau: 'Terminale',
    enseignantPrincipal: 2, // ID de l'enseignant principal
    nombreEleves: 35, // mis à jour
    salle: 'Salle A'
  },
  {
    id: 2,
    nom: 'Première L2',
    niveau: 'Première',
    enseignantPrincipal: 6,
    nombreEleves: 30, // mis à jour
    salle: 'Salle B'
  },
  {
    id: 3,
    nom: 'Seconde S',
    niveau: 'Seconde',
    enseignantPrincipal: 6,
    nombreEleves: 40, // mis à jour
    salle: 'Salle C'
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
    nom: 'Sciences de la Vie et de la Terre', // Nom complet
    code: 'SVT',
    coefficient: 3,
    couleur: '#f59e0b'
  },
  {
    id: 4,
    nom: 'Anglais',
    code: 'ANG',
    coefficient: 3,
    couleur: '#10b981'
  }
];

export const emploisDuTemps = [
  {
    id: 1,
    classeId: 1, // Terminale S1
    jour: 'Lundi',
    heure: '08:00-09:00',
    matiereId: 1, // Mathématiques
    enseignantId: 2, // Moussa Diallo
    salle: 'Salle A'
  },
  {
    id: 2,
    classeId: 1, // Terminale S1
    jour: 'Lundi',
    heure: '09:00-10:00',
    matiereId: 2, // Français
    enseignantId: 2, // Moussa Diallo
    salle: 'Salle A'
  },
  {
    id: 3,
    classeId: 2, // Première L2
    jour: 'Mardi',
    heure: '10:00-11:00',
    matiereId: 3, // SVT
    enseignantId: 6, // Khady Touré
    salle: 'Salle B'
  },
  {
    id: 4,
    classeId: 1, // Terminale S1
    jour: 'Mercredi',
    heure: '14:00-15:00',
    matiereId: 4, // Anglais
    enseignantId: 6, // Khady Touré
    salle: 'Salle A'
  }
];

export const notes = [
  {
    id: 1,
    eleveId: 1, // Lucas Ndiaye
    matiereId: 1, // Mathématiques
    note: 15.5,
    coefficient: 2,
    date: '2025-05-10', // Année actuelle au Sénégal
    type: 'Composition', // Terme plus courant au Sénégal
    commentaire: 'Excellente maîtrise des concepts.'
  },
  {
    id: 2,
    eleveId: 1, // Lucas Ndiaye
    matiereId: 2, // Français
    note: 12.0,
    coefficient: 1,
    date: '2025-05-15',
    type: 'Interrogation',
    commentaire: 'Bonne expression écrite, à améliorer sur la grammaire.'
  },
  {
    id: 3,
    eleveId: 2, // Mariama Ndiaye
    matiereId: 3, // SVT
    note: 18.0,
    coefficient: 3,
    date: '2025-05-20',
    type: 'Devoir surveillé',
    commentaire: 'Résultats exceptionnels.'
  }
];

export const paiements = [
  {
    id: 1,
    eleveId: 1, // Lucas Ndiaye
    montant: 25000, // Montant en FCFA
    type: 'Frais de scolarité',
    statut: 'Payé',
    date: '2025-01-05',
    methode: 'Orange Money', // Méthode de paiement courante
    description: 'Paiement du premier trimestre',
    reference: 'OM20250105LND1',
    dateEcheance: '2025-01-15'
  },
  {
    id: 2,
    eleveId: 2, // Mariama Ndiaye
    montant: 15000,
    type: 'Cotisation APEL', // Association des Parents d'Élèves
    statut: 'En attente',
    date: '2025-06-01', // Date future pour 'En attente'
    methode: 'Wave', // Autre méthode courante
    description: 'Cotisation annuelle APEL',
    reference: 'WV20250601MND1',
    dateEcheance: '2025-06-30'
  },
  {
    id: 3,
    eleveId: 1, // Lucas Ndiaye
    montant: 5000,
    type: 'Activité sportive',
    statut: 'En retard', // Statut en retard
    date: '2025-04-10',
    methode: 'Espèces',
    description: 'Participation tournoi de football',
    reference: 'ES20250410LND1',
    dateEcheance: '2025-04-01' // Date d'échéance passée
  },
  {
    id: 4,
    eleveId: 3, // Omar Fall
    montant: 30000,
    type: 'Frais de scolarité',
    statut: 'Payé',
    date: '2025-01-20',
    methode: 'Virement bancaire',
    description: 'Paiement du premier trimestre',
    reference: 'VB20250120OFL1',
    dateEcheance: '2025-01-25'
  },
  {
    id: 5,
    eleveId: 4, // Fatou Gueye
    montant: 25000,
    type: 'Frais de scolarité',
    statut: 'Payé',
    date: '2025-02-10',
    methode: 'Virement bancaire',
    description: 'Paiement premier trimestre',
    reference: 'VB20250210FGY1',
    dateEcheance: '2025-02-15'
  },
  {
    id: 6,
    eleveId: 5, // Cheikh Mbaye
    montant: 20000,
    type: 'Frais de scolarité',
    statut: 'En attente',
    date: '2025-03-05',
    methode: 'Espèces',
    description: 'Paiement deuxième trimestre',
    reference: 'ES20250305CMB1',
    dateEcheance: '2025-03-15'
  },
  {
    id: 7,
    eleveId: 1, // Lucas Ndiaye
    montant: 10000,
    type: 'Contribution voyage scolaire',
    statut: 'Payé',
    date: '2025-06-15',
    methode: 'Wave',
    description: 'Contribution pour le voyage à Saint-Louis',
    reference: 'WV20250615LND2',
    dateEcheance: '2025-06-20'
  },
  {
    id: 8,
    eleveId: 3, // Omar Fall
    montant: 8000,
    type: 'Achats fournitures',
    statut: 'En attente',
    date: '2025-06-20',
    methode: 'Orange Money',
    description: 'Achat de livres et cahiers',
    reference: 'OM20250620OFL2',
    dateEcheance: '2025-06-27'
  }
];

export const depenses = [ // Nouvel ensemble de données pour les dépenses
  {
    id: 1,
    description: 'Salaires enseignants',
    montant: 1500000,
    date: '2025-05-30',
    categorie: 'Personnel'
  },
  {
    id: 2,
    description: 'Achat de fournitures de bureau',
    montant: 75000,
    date: '2025-05-15',
    categorie: 'Fournitures'
  },
  {
    id: 3,
    description: 'Facture d\'électricité (Juin)',
    montant: 120000,
    date: '2025-06-10',
    categorie: 'Charges fixes'
  },
  {
    id: 4,
    description: 'Maintenance des climatiseurs',
    montant: 50000,
    date: '2025-06-05',
    categorie: 'Maintenance'
  },
  {
    id: 5,
    description: 'Internet et Téléphone (Juin)',
    montant: 40000,
    date: '2025-06-12',
    categorie: 'Charges fixes'
  },
  {
    id: 6,
    description: 'Achat de matériel sportif',
    montant: 90000,
    date: '2025-05-25',
    categorie: 'Fournitures'
  }
];


export const evenements = [
  {
    id: 1,
    titre: 'Cérémonie de remise des diplômes',
    description: 'Remise des diplômes aux élèves de Terminale',
    date: '2025-07-10', // Date au Sénégal
    type: 'Cérémonie',
    lieu: 'Cour de l\'école'
  },
  {
    id: 2,
    titre: 'Journée culturelle',
    description: 'Activités traditionnelles et modernes',
    date: '2025-06-20',
    type: 'Événement',
    lieu: 'Gymnase'
  },
  {
    id: 3,
    titre: 'Réunion des parents d\'élèves',
    description: 'Discussion sur les résultats du deuxième trimestre',
    date: '2025-06-28', // Date au Sénégal (future)
    type: 'Réunion',
    lieu: 'Salle polyvalente'
  }
];

// Données pour les présences (avec des statuts variés et des heures)
export const presences = [
  {
    id: 1,
    eleveId: 1, // Lucas Ndiaye
    date: '2025-06-24', // Date plus récente
    statut: 'absent', // absent
    heureDebut: '08:00', // Heure de début de cours manqué
    heureFin: '10:00', // Heure de fin de cours manqué
    enseignantId: 2, // Moussa Diallo
    classeId: 1, // Terminale S1
    justifie: true,
    motifJustification: 'Maladie (certificat médical)',
    commentaire: 'Certificat reçu par email',
    dateCreation: '2025-06-24T08:30:00',
    dateModification: '2025-06-24T10:00:00'
  },
  {
    id: 2,
    eleveId: 1, // Lucas Ndiaye
    date: '2025-06-23',
    statut: 'present', // présent
    heureDebut: '08:00',
    heureFin: '18:00',
    enseignantId: null, // N/A pour la présence générale
    classeId: 1,
    justifie: true, // Un élève présent est "justifié" d'être là
    motifJustification: 'Présent toute la journée',
    commentaire: '',
    dateCreation: '2025-06-23T18:00:00',
    dateModification: '2025-06-23T18:00:00'
  },
  {
    id: 3,
    eleveId: 2, // Mariama Ndiaye
    date: '2025-06-24',
    statut: 'retard', // en retard
    heureDebut: '08:00', // Heure normale du cours
    heureFin: '09:00', // Heure de fin du cours
    heureArrivee: '08:15', // Nouvelle info: heure d'arrivée réelle
    enseignantId: 6, // Khady Touré
    classeId: 2, // Première L2
    justifie: true,
    motifJustification: 'Problème de transport en commun',
    commentaire: 'Arrivée 15 min après le début du cours d\'SVT',
    dateCreation: '2025-06-24T08:15:00',
    dateModification: '2025-06-24T08:30:00'
  },
  {
    id: 4,
    eleveId: 3, // Omar Fall
    date: '2025-06-24',
    statut: 'absent', // absent
    heureDebut: '14:00',
    heureFin: '16:00',
    enseignantId: 2, // Moussa Diallo
    classeId: 1, // Terminale S1
    justifie: false,
    motifJustification: null,
    commentaire: 'Absence non justifiée pour les cours de l\'après-midi',
    dateCreation: '2025-06-24T14:05:00',
    dateModification: '2025-06-24T14:05:00'
  },
  {
    id: 5,
    eleveId: 1, // Lucas Ndiaye
    date: '2025-06-22', // Ancienne date
    statut: 'retard',
    heureDebut: '14:00',
    heureFin: '16:00',
    heureArrivee: '14:20',
    enseignantId: 6,
    classeId: 1,
    justifie: false,
    motifJustification: null,
    commentaire: 'Retard répété',
    dateCreation: '2025-06-22T14:20:00',
    dateModification: '2025-06-22T14:20:00'
  },
  {
    id: 6,
    eleveId: 2, // Mariama Ndiaye
    date: '2025-06-23',
    statut: 'present',
    heureDebut: '08:00',
    heureFin: '18:00',
    enseignantId: null,
    classeId: 2,
    justifie: true,
    motifJustification: 'Présente',
    commentaire: '',
    dateCreation: '2025-06-23T18:00:00',
    dateModification: '2025-06-23T18:00:00'
  },
];
/**
 * MODÉLISATION ET RELATIONS - SYSTÈME DE GESTION SCOLAIRE
 * ========================================================
 * 
 * Ce fichier définit la structure des données, les relations entre entités,
 * et les contraintes du système de gestion scolaire.
 */

// ============================================================================
// 1. ENTITÉS PRINCIPALES
// ============================================================================

/**
 * UTILISATEUR (User)
 * Entité de base pour tous les acteurs du système
 */
export const UserSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  email: "string (UNIQUE, NOT NULL)",
  motDePasse: "string (NOT NULL, HASHED)",
  role: "enum ['admin', 'enseignant', 'parent', 'eleve', 'comptable'] (NOT NULL)",
  nom: "string (NOT NULL)",
  prenom: "string (NOT NULL)",
  telephone: "string",
  dateCreation: "datetime (DEFAULT NOW)",
  dateModification: "datetime (ON UPDATE NOW)",
  actif: "boolean (DEFAULT true)",
  
  // Relations
  relations: {
    // Un utilisateur peut être un élève
    eleve: "hasOne(Eleve, foreign_key: userId)",
    // Un utilisateur peut être un enseignant
    enseignant: "hasOne(Enseignant, foreign_key: userId)",
    // Un utilisateur peut être un parent
    parent: "hasOne(Parent, foreign_key: userId)",
    // Un utilisateur peut être un comptable
    comptable: "hasOne(Comptable, foreign_key: userId)"
  }
};

/**
 * ÉLÈVE (Student)
 * Informations spécifiques aux élèves
 */
export const EleveSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  userId: "number (FK -> User.id, UNIQUE)",
  numeroEleve: "string (UNIQUE, AUTO_GENERATED)",
  dateNaissance: "date (NOT NULL)",
  lieuNaissance: "string",
  adresse: "text",
  classeId: "number (FK -> Classe.id)",
  niveauScolaire: "string",
  dateInscription: "date (DEFAULT TODAY)",
  statut: "enum ['actif', 'suspendu', 'diplome', 'transfere'] (DEFAULT 'actif')",
  
  // Informations médicales/urgence
  contactUrgence: "string",
  allergies: "text",
  remarquesMedicales: "text",
  
  relations: {
    user: "belongsTo(User, foreign_key: userId)",
    classe: "belongsTo(Classe, foreign_key: classeId)",
    parents: "belongsToMany(Parent, through: ParentEleve)",
    notes: "hasMany(Note, foreign_key: eleveId)",
    absences: "hasMany(Absence, foreign_key: eleveId)",
    paiements: "hasMany(Paiement, foreign_key: eleveId)",
    bulletins: "hasMany(Bulletin, foreign_key: eleveId)"
  }
};

/**
 * ENSEIGNANT (Teacher)
 * Informations spécifiques aux enseignants
 */
export const EnseignantSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  userId: "number (FK -> User.id, UNIQUE)",
  numeroEmploye: "string (UNIQUE, AUTO_GENERATED)",
  specialite: "string",
  diplomes: "text",
  dateEmbauche: "date",
  statut: "enum ['titulaire', 'contractuel', 'stagiaire', 'remplacant'] (DEFAULT 'titulaire')",
  salaire: "decimal(10,2)",
  
  relations: {
    user: "belongsTo(User, foreign_key: userId)",
    matieres: "belongsToMany(Matiere, through: EnseignantMatiere)",
    classes: "belongsToMany(Classe, through: EnseignantClasse)",
    classesResponsable: "hasMany(Classe, foreign_key: enseignantPrincipalId)",
    emploisDuTemps: "hasMany(EmploiDuTemps, foreign_key: enseignantId)",
    notes: "hasMany(Note, foreign_key: enseignantId)"
  }
};

/**
 * PARENT (Parent)
 * Informations spécifiques aux parents
 */
export const ParentSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  userId: "number (FK -> User.id, UNIQUE)",
  profession: "string",
  adresse: "text",
  telephoneTravail: "string",
  emailSecondaire: "string",
  
  relations: {
    user: "belongsTo(User, foreign_key: userId)",
    enfants: "belongsToMany(Eleve, through: ParentEleve)"
  }
};

/**
 * CLASSE (Class)
 * Organisation des élèves par groupes
 */
export const ClasseSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  nom: "string (NOT NULL, UNIQUE)",
  niveau: "string (NOT NULL)",
  section: "string",
  anneScolaire: "string (NOT NULL)",
  capaciteMax: "number (DEFAULT 30)",
  salle: "string",
  enseignantPrincipalId: "number (FK -> Enseignant.id)",
  
  relations: {
    enseignantPrincipal: "belongsTo(Enseignant, foreign_key: enseignantPrincipalId)",
    eleves: "hasMany(Eleve, foreign_key: classeId)",
    enseignants: "belongsToMany(Enseignant, through: EnseignantClasse)",
    emploisDuTemps: "hasMany(EmploiDuTemps, foreign_key: classeId)",
    matieres: "belongsToMany(Matiere, through: ClasseMatiere)"
  }
};

/**
 * MATIÈRE (Subject)
 * Disciplines enseignées
 */
export const MatiereSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  nom: "string (NOT NULL, UNIQUE)",
  code: "string (NOT NULL, UNIQUE)",
  description: "text",
  coefficient: "number (NOT NULL, DEFAULT 1)",
  couleur: "string (HEX COLOR, DEFAULT '#3b82f6')",
  type: "enum ['obligatoire', 'optionnelle', 'specialite']",
  
  relations: {
    enseignants: "belongsToMany(Enseignant, through: EnseignantMatiere)",
    classes: "belongsToMany(Classe, through: ClasseMatiere)",
    emploisDuTemps: "hasMany(EmploiDuTemps, foreign_key: matiereId)",
    notes: "hasMany(Note, foreign_key: matiereId)"
  }
};

/**
 * EMPLOI DU TEMPS (Schedule)
 * Planning des cours
 */
export const EmploiDuTempsSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  classeId: "number (FK -> Classe.id, NOT NULL)",
  matiereId: "number (FK -> Matiere.id, NOT NULL)",
  enseignantId: "number (FK -> Enseignant.id, NOT NULL)",
  jour: "enum ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']",
  heureDebut: "time (NOT NULL)",
  heureFin: "time (NOT NULL)",
  salle: "string",
  semaine: "enum ['A', 'B', 'toutes'] (DEFAULT 'toutes')",
  dateDebut: "date",
  dateFin: "date",
  
  relations: {
    classe: "belongsTo(Classe, foreign_key: classeId)",
    matiere: "belongsTo(Matiere, foreign_key: matiereId)",
    enseignant: "belongsTo(Enseignant, foreign_key: enseignantId)"
  }
};

/**
 * NOTE (Grade)
 * Évaluations des élèves
 */
export const NoteSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  eleveId: "number (FK -> Eleve.id, NOT NULL)",
  matiereId: "number (FK -> Matiere.id, NOT NULL)",
  enseignantId: "number (FK -> Enseignant.id, NOT NULL)",
  note: "decimal(4,2) (NOT NULL, CHECK >= 0 AND <= 20)",
  noteMax: "decimal(4,2) (DEFAULT 20)",
  coefficient: "number (NOT NULL, DEFAULT 1)",
  type: "enum ['controle', 'devoir', 'examen', 'oral', 'tp', 'projet']",
  date: "date (NOT NULL)",
  trimestre: "number (CHECK >= 1 AND <= 3)",
  commentaire: "text",
  
  relations: {
    eleve: "belongsTo(Eleve, foreign_key: eleveId)",
    matiere: "belongsTo(Matiere, foreign_key: matiereId)",
    enseignant: "belongsTo(Enseignant, foreign_key: enseignantId)"
  }
};

/**
 * BULLETIN (Report Card)
 * Bulletins scolaires
 */
export const BulletinSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  eleveId: "number (FK -> Eleve.id, NOT NULL)",
  trimestre: "number (NOT NULL, CHECK >= 1 AND <= 3)",
  anneScolaire: "string (NOT NULL)",
  moyenneGenerale: "decimal(4,2)",
  rang: "number",
  effectifClasse: "number",
  appreciationGenerale: "text",
  dateEdition: "datetime (DEFAULT NOW)",
  statut: "enum ['brouillon', 'valide', 'envoye'] (DEFAULT 'brouillon')",
  
  relations: {
    eleve: "belongsTo(Eleve, foreign_key: eleveId)",
    detailsMatieres: "hasMany(BulletinMatiere, foreign_key: bulletinId)"
  }
};

/**
 * DÉTAIL BULLETIN PAR MATIÈRE
 */
export const BulletinMatiereSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  bulletinId: "number (FK -> Bulletin.id, NOT NULL)",
  matiereId: "number (FK -> Matiere.id, NOT NULL)",
  moyenne: "decimal(4,2)",
  moyenneClasse: "decimal(4,2)",
  moyenneMax: "decimal(4,2)",
  moyenneMin: "decimal(4,2)",
  appreciation: "text",
  
  relations: {
    bulletin: "belongsTo(Bulletin, foreign_key: bulletinId)",
    matiere: "belongsTo(Matiere, foreign_key: matiereId)"
  }
};

/**
 * ABSENCE (Absence)
 * Gestion des absences
 */
export const AbsenceSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  eleveId: "number (FK -> Eleve.id, NOT NULL)",
  date: "date (NOT NULL)",
  heureDebut: "time",
  heureFin: "time",
  type: "enum ['maladie', 'familiale', 'autre', 'non_justifiee']",
  justifiee: "boolean (DEFAULT false)",
  motif: "text",
  documentJustificatif: "string (file path)",
  
  relations: {
    eleve: "belongsTo(Eleve, foreign_key: eleveId)"
  }
};

/**
 * PAIEMENT (Payment)
 * Gestion financière
 */
export const PaiementSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  eleveId: "number (FK -> Eleve.id, NOT NULL)",
  montant: "decimal(10,2) (NOT NULL)",
  type: "enum ['scolarite', 'cantine', 'transport', 'activites', 'fournitures']",
  statut: "enum ['en_attente', 'paye', 'en_retard', 'annule'] (DEFAULT 'en_attente')",
  methodePaiement: "enum ['especes', 'cheque', 'virement', 'carte', 'prelevement']",
  dateEcheance: "date (NOT NULL)",
  datePaiement: "date",
  numeroRecu: "string (UNIQUE)",
  commentaire: "text",
  
  relations: {
    eleve: "belongsTo(Eleve, foreign_key: eleveId)",
    recu: "hasOne(Recu, foreign_key: paiementId)"
  }
};

/**
 * REÇU (Receipt)
 * Justificatifs de paiement
 */
export const RecuSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  paiementId: "number (FK -> Paiement.id, NOT NULL)",
  numeroRecu: "string (UNIQUE, AUTO_GENERATED)",
  dateEmission: "datetime (DEFAULT NOW)",
  fichierPdf: "string (file path)",
  
  relations: {
    paiement: "belongsTo(Paiement, foreign_key: paiementId)"
  }
};

// ============================================================================
// 2. TABLES DE LIAISON (Many-to-Many)
// ============================================================================

/**
 * RELATION PARENT-ÉLÈVE
 */
export const ParentEleveSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  parentId: "number (FK -> Parent.id, NOT NULL)",
  eleveId: "number (FK -> Eleve.id, NOT NULL)",
  lienParente: "enum ['pere', 'mere', 'tuteur', 'autre'] (NOT NULL)",
  autorisationSortie: "boolean (DEFAULT true)",
  contactPrioritaire: "boolean (DEFAULT false)",
  
  constraints: {
    unique: ["parentId", "eleveId"]
  }
};

/**
 * RELATION ENSEIGNANT-MATIÈRE
 */
export const EnseignantMatiereSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  enseignantId: "number (FK -> Enseignant.id, NOT NULL)",
  matiereId: "number (FK -> Matiere.id, NOT NULL)",
  niveauCompetence: "enum ['debutant', 'confirme', 'expert'] (DEFAULT 'confirme')",
  
  constraints: {
    unique: ["enseignantId", "matiereId"]
  }
};

/**
 * RELATION ENSEIGNANT-CLASSE
 */
export const EnseignantClasseSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  enseignantId: "number (FK -> Enseignant.id, NOT NULL)",
  classeId: "number (FK -> Classe.id, NOT NULL)",
  role: "enum ['titulaire', 'intervenant'] (DEFAULT 'intervenant')",
  
  constraints: {
    unique: ["enseignantId", "classeId"]
  }
};

/**
 * RELATION CLASSE-MATIÈRE
 */
export const ClasseMatiereSchema = {
  id: "number (PK, AUTO_INCREMENT)",
  classeId: "number (FK -> Classe.id, NOT NULL)",
  matiereId: "number (FK -> Matiere.id, NOT NULL)",
  heuresParSemaine: "number (DEFAULT 1)",
  obligatoire: "boolean (DEFAULT true)",
  
  constraints: {
    unique: ["classeId", "matiereId"]
  }
};

// ============================================================================
// 3. CONTRAINTES ET RÈGLES MÉTIER
// ============================================================================

export const BusinessRules = {
  
  // Contraintes sur les utilisateurs
  users: {
    email: "Format email valide, unique dans le système",
    password: "Minimum 8 caractères, au moins 1 majuscule, 1 chiffre",
    roles: "Un utilisateur ne peut avoir qu'un seul rôle",
    deletion: "Soft delete uniquement (actif = false)"
  },

  // Contraintes sur les élèves
  eleves: {
    age: "Entre 3 et 25 ans",
    classe: "Un élève ne peut être que dans une seule classe à la fois",
    parents: "Au moins un parent/tuteur obligatoire",
    numeroEleve: "Format: YYYY-NNNN (année + numéro séquentiel)"
  },

  // Contraintes sur les classes
  classes: {
    capacite: "Maximum 35 élèves par classe",
    enseignantPrincipal: "Un enseignant principal par classe",
    niveau: "Cohérence avec l'âge des élèves",
    salle: "Une salle ne peut accueillir qu'une classe à la fois"
  },

  // Contraintes sur les emplois du temps
  emploisDuTemps: {
    horaires: "Pas de chevauchement pour un enseignant",
    duree: "Minimum 30 minutes, maximum 4 heures",
    pause: "Minimum 15 minutes entre deux cours",
    coherence: "Matière doit être enseignée par l'enseignant"
  },

  // Contraintes sur les notes
  notes: {
    valeur: "Entre 0 et 20 (ou noteMax définie)",
    coefficient: "Entre 0.5 et 5",
    date: "Ne peut pas être dans le futur",
    modification: "Possible jusqu'à 48h après saisie"
  },

  // Contraintes sur les paiements
  paiements: {
    montant: "Strictement positif",
    echeance: "Ne peut pas être dans le passé",
    statut: "Workflow: en_attente -> paye/en_retard -> annule",
    recu: "Généré automatiquement lors du paiement"
  }
};

// ============================================================================
// 4. INDEX ET PERFORMANCES
// ============================================================================

export const DatabaseIndexes = {
  users: [
    "INDEX idx_users_email (email)",
    "INDEX idx_users_role (role)",
    "INDEX idx_users_actif (actif)"
  ],
  
  eleves: [
    "INDEX idx_eleves_classe (classeId)",
    "INDEX idx_eleves_statut (statut)",
    "INDEX idx_eleves_numero (numeroEleve)"
  ],
  
  notes: [
    "INDEX idx_notes_eleve (eleveId)",
    "INDEX idx_notes_matiere (matiereId)",
    "INDEX idx_notes_date (date)",
    "INDEX idx_notes_trimestre (trimestre)",
    "COMPOSITE INDEX idx_notes_eleve_matiere (eleveId, matiereId)"
  ],
  
  emploisDuTemps: [
    "INDEX idx_emploi_classe (classeId)",
    "INDEX idx_emploi_enseignant (enseignantId)",
    "INDEX idx_emploi_jour_heure (jour, heureDebut)",
    "COMPOSITE INDEX idx_emploi_planning (classeId, jour, heureDebut)"
  ],
  
  paiements: [
    "INDEX idx_paiements_eleve (eleveId)",
    "INDEX idx_paiements_statut (statut)",
    "INDEX idx_paiements_echeance (dateEcheance)",
    "INDEX idx_paiements_type (type)"
  ]
};

// ============================================================================
// 5. VUES ET REQUÊTES FRÉQUENTES
// ============================================================================

export const CommonViews = {
  
  // Vue complète des élèves avec informations de classe
  vue_eleves_complet: `
    CREATE VIEW vue_eleves_complet AS
    SELECT 
      e.id,
      u.nom,
      u.prenom,
      u.email,
      e.dateNaissance,
      e.adresse,
      c.nom as classe,
      c.niveau,
      e.statut
    FROM eleves e
    JOIN users u ON e.userId = u.id
    LEFT JOIN classes c ON e.classeId = c.id
    WHERE u.actif = true
  `,

  // Vue des moyennes par élève et matière
  vue_moyennes_eleves: `
    CREATE VIEW vue_moyennes_eleves AS
    SELECT 
      n.eleveId,
      n.matiereId,
      m.nom as matiere,
      AVG(n.note * n.coefficient) / AVG(n.coefficient) as moyenne,
      COUNT(n.id) as nombre_notes
    FROM notes n
    JOIN matieres m ON n.matiereId = m.id
    GROUP BY n.eleveId, n.matiereId
  `,

  // Vue des paiements en retard
  vue_paiements_retard: `
    CREATE VIEW vue_paiements_retard AS
    SELECT 
      p.id,
      e.id as eleveId,
      u.nom,
      u.prenom,
      p.montant,
      p.type,
      p.dateEcheance,
      DATEDIFF(NOW(), p.dateEcheance) as jours_retard
    FROM paiements p
    JOIN eleves e ON p.eleveId = e.id
    JOIN users u ON e.userId = u.id
    WHERE p.statut = 'en_retard'
    AND p.dateEcheance < NOW()
  `
};

// ============================================================================
// 6. TRIGGERS ET AUTOMATISATIONS
// ============================================================================

export const DatabaseTriggers = {
  
  // Génération automatique du numéro d'élève
  trigger_numero_eleve: `
    CREATE TRIGGER before_insert_eleve
    BEFORE INSERT ON eleves
    FOR EACH ROW
    BEGIN
      IF NEW.numeroEleve IS NULL THEN
        SET NEW.numeroEleve = CONCAT(
          YEAR(NOW()), 
          '-', 
          LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(numeroEleve, 6) AS UNSIGNED)), 0) + 1 
                FROM eleves 
                WHERE numeroEleve LIKE CONCAT(YEAR(NOW()), '-%')), 4, '0')
        );
      END IF;
    END
  `,

  // Mise à jour automatique des moyennes dans les bulletins
  trigger_update_bulletin: `
    CREATE TRIGGER after_insert_note
    AFTER INSERT ON notes
    FOR EACH ROW
    BEGIN
      UPDATE bulletins b
      SET moyenneGenerale = (
        SELECT AVG(note * coefficient) / AVG(coefficient)
        FROM notes n
        WHERE n.eleveId = NEW.eleveId
        AND n.trimestre = b.trimestre
      )
      WHERE b.eleveId = NEW.eleveId
      AND b.trimestre = NEW.trimestre;
    END
  `,

  // Génération automatique du numéro de reçu
  trigger_numero_recu: `
    CREATE TRIGGER before_insert_recu
    BEFORE INSERT ON recus
    FOR EACH ROW
    BEGIN
      SET NEW.numeroRecu = CONCAT(
        'REC-',
        YEAR(NOW()),
        '-',
        LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(numeroRecu, 9) AS UNSIGNED)), 0) + 1 
              FROM recus 
              WHERE numeroRecu LIKE CONCAT('REC-', YEAR(NOW()), '-%')), 6, '0')
      );
    END
  `
};

// ============================================================================
// 7. SÉCURITÉ ET PERMISSIONS
// ============================================================================

export const SecurityRoles = {
  
  admin: {
    permissions: [
      "CREATE_USER", "UPDATE_USER", "DELETE_USER", "VIEW_ALL_USERS",
      "CREATE_ELEVE", "UPDATE_ELEVE", "DELETE_ELEVE", "VIEW_ALL_ELEVES",
      "CREATE_ENSEIGNANT", "UPDATE_ENSEIGNANT", "DELETE_ENSEIGNANT",
      "CREATE_CLASSE", "UPDATE_CLASSE", "DELETE_CLASSE",
      "CREATE_MATIERE", "UPDATE_MATIERE", "DELETE_MATIERE",
      "MANAGE_EMPLOI_TEMPS", "VIEW_ALL_NOTES", "MANAGE_PAIEMENTS",
      "GENERATE_REPORTS", "IMPORT_DATA", "EXPORT_DATA"
    ]
  },

  enseignant: {
    permissions: [
      "VIEW_OWN_CLASSES", "VIEW_OWN_ELEVES",
      "CREATE_NOTE", "UPDATE_OWN_NOTE", "DELETE_OWN_NOTE",
      "VIEW_OWN_EMPLOI_TEMPS", "VIEW_ELEVE_NOTES",
      "GENERATE_BULLETIN", "VIEW_ABSENCE"
    ]
  },

  parent: {
    permissions: [
      "VIEW_OWN_CHILDREN", "VIEW_CHILD_NOTES", "VIEW_CHILD_EMPLOI_TEMPS",
      "VIEW_CHILD_ABSENCES", "VIEW_CHILD_BULLETINS", "VIEW_CHILD_PAIEMENTS"
    ]
  },

  eleve: {
    permissions: [
      "VIEW_OWN_NOTES", "VIEW_OWN_EMPLOI_TEMPS",
      "VIEW_OWN_ABSENCES", "VIEW_OWN_BULLETINS"
    ]
  },

  comptable: {
    permissions: [
      "VIEW_ALL_PAIEMENTS", "UPDATE_PAIEMENT_STATUS",
      "GENERATE_RECU", "VIEW_FINANCIAL_REPORTS",
      "EXPORT_FINANCIAL_DATA"
    ]
  }
};

// ============================================================================
// 8. VALIDATION ET FORMATS
// ============================================================================

export const ValidationRules = {
  
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  telephone: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  codePostal: /^(?:0[1-9]|[1-8]\d|9[0-8])\d{3}$/,
  
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },

  note: {
    min: 0,
    max: 20,
    precision: 2
  },

  coefficient: {
    min: 0.5,
    max: 5,
    step: 0.5
  },

  age: {
    min: 3,
    max: 25
  },

  capaciteClasse: {
    min: 1,
    max: 35
  }
};

export default {
  UserSchema,
  EleveSchema,
  EnseignantSchema,
  ParentSchema,
  ClasseSchema,
  MatiereSchema,
  EmploiDuTempsSchema,
  NoteSchema,
  BulletinSchema,
  BulletinMatiereSchema,
  AbsenceSchema,
  PaiementSchema,
  RecuSchema,
  ParentEleveSchema,
  EnseignantMatiereSchema,
  EnseignantClasseSchema,
  ClasseMatiereSchema,
  BusinessRules,
  DatabaseIndexes,
  CommonViews,
  DatabaseTriggers,
  SecurityRoles,
  ValidationRules
};
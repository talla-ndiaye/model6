import enum

class RoleUtilisateur(enum.Enum):
    ADMIN = "administrateur"
    ENSEIGNANT = "enseignant"
    ELEVE = "eleve"
    PARENT = "parent"
    COMPTABLE = "comptable"

class StatutPaiement(enum.Enum):
    PAYE = "payé"
    EN_ATTENTE = "en_attente"

class TypePaiement(enum.Enum):
    INSCRIPTION = "inscription"
    MENSUALITE = "mensualité"
    AUTRE = "autre"

class Sexe(enum.Enum):
    MASCULIN = "M"
    FEMININ = "F"

class StatutPresence(enum.Enum):
    ABSENT = "absent"
    RETARD = "retard"
    RENVOI = "renvoi"

class TypeNote(enum.Enum):
    DEVOIR = "devoir"
    Composition = "interrogation"


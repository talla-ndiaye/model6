import enum
from data import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import enum

class Role(enum.Enum):
    ADMIN = "amdin"
    ELEVE = "eleve"
    PARENT = "parent"
    ENSEIGNANT = "enseignant"
    SECRETAIRE= "secretaire"

class Genre(enum.Enum):
    M = "M"
    F = "F"

class Ascidute(enum.Enum):
    ABSENT = "absent"
    RETARD = "retard"
    RENVOI = "renvoi"

class StatutDuPaiement(enum.Enum):
    PAYE = "paye"
    EN_ATTENTE = "EN_ATTENTE"

class TypeDuPaiement(enum.Enum):
    INSCRIPTION = "inscription"
    MENSUALITE = "mensualite"
    AUTRE = "autre"

# Table d'association pour les matières des enseignants
enseignant_matiere = db.Table(
    'enseignant_matiere',
    db.Column('enseignant_id', db.Integer, db.ForeignKey('enseignants.id')),
    db.Column('matiere_id', db.Integer, db.ForeignKey('matieres.id'))
)


class Matiere(db.Model):
    __tablename__ = 'matieres'
    
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(10), unique=True, nullable=False)

class Utilisateur(db.Model):
    __tablename__ = 'utilisateurs'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    role = db.Column(db.Enum(Role), nullable=False)
    creation = db.Column(db.DateTime, default=datetime.utcnow)
    modification = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Enseignant(db.Model):
    __tablename__ = 'enseignant'
    
    id = db.Column(db.Integer, primary_key=True)
    matricule = db.Column(db.String(20), unique=True, nullable=False)
    nom = db.Column(db.String(50), nullable=False)
    prenom = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    telephone = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
       
    # Relations
    matieres = db.relationship('Matiere', secondary=enseignant_matiere, backref='enseignants')


class Classe(db.Model):
    __tablename__ = 'classes'
    
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(50), nullable=False)
    niveau = db.Column(db.String(20), nullable=False)
    section = db.Column(db.String(10), nullable=False)
    effectif = db.Column(db.Integer, nullable=False)
    enseignant_pricipal = db.Column(db.Integer, db.ForeignKey('enseignants.id'))
   
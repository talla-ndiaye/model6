from database import db

class Classe(db.Model):
    __tablename__ = 'classes'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    salle = db.Column(db.String(50), nullable=False)
    niveau = db.Column(db.String(50), nullable=False)
    annee_scolaire = db.Column(db.String(20), nullable=False)

    # Clé étrangère vers Enseignant (et non Utilisateur)
    enseignant_principal_id = db.Column(db.Integer, db.ForeignKey('enseignants.id'), nullable=True)
    enseignant_principal = db.relationship('Enseignant', backref='classes_dirigees')

    def to_dict(self):
        return {
            "id": self.id,
            "nom": self.nom,
            "salle": self.salle,
            "niveau": self.niveau,
            "annee_scolaire": self.annee_scolaire,
            "enseignant_principal": self.enseignant_principal.to_dict() if self.enseignant_principal else None
        }

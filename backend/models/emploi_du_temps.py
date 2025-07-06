from database import db
from datetime import time
from sqlalchemy import Time

class EmploiDuTemps(db.Model):
    __tablename__ = 'emplois_du_temps'

    id = db.Column(db.Integer, primary_key=True)
    jour = db.Column(db.String(20), nullable=False)  # Exemple : "Lundi"
    heure_debut = db.Column(Time, nullable=False)
    heure_fin = db.Column(Time, nullable=False)

    # Relations
    classe_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    enseignant_id = db.Column(db.Integer, db.ForeignKey('enseignants.id'), nullable=False)
    matiere_id = db.Column(db.Integer, db.ForeignKey('matieres.id'), nullable=False)

    classe = db.relationship('Classe', backref='emplois_du_temps')
    enseignant = db.relationship('Enseignant', backref='emplois_du_temps')
    matiere = db.relationship('Matiere', backref='emplois_du_temps')

    def to_dict(self):
        return {
            "id": self.id,
            "jour": self.jour,
            "heure_debut": self.heure_debut.strftime("%H:%M"),
            "heure_fin": self.heure_fin.strftime("%H:%M"),
            "classe": self.classe.to_dict() if self.classe else None,
            "enseignant": self.enseignant.to_dict() if self.enseignant else None,
            "matiere": self.matiere.to_dict() if self.matiere else None
        }

from database import db

class EmploiDuTemps(db.Model):
    __tablename__ = 'emplois'
    id = db.Column(db.Integer, primary_key=True)
    jour = db.Column(db.String(20), nullable=False)
    heure = db.Column(db.String(20), nullable=False)  # Ex: "8:00-10:00"
    classe_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    enseignant_id = db.Column(db.Integer, db.ForeignKey('enseignants.id'), nullable=False)
    matiere_id = db.Column(db.Integer, db.ForeignKey('matieres.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "jour": self.jour,
            "heure": self.heure,
            "classe_id": self.classe_id,
            "enseignant_id": self.enseignant_id,
            "matiere_id": self.matiere_id
        }

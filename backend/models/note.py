from database import db

class Note(db.Model):
    __tablename__ = 'notes'

    id = db.Column(db.Integer, primary_key=True)
    valeur = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # exemple : "devoir", "examen", etc.
    periode = db.Column(db.String(50), nullable=False)  # exemple : "Trimestre 1"

    # Relations
    eleve_id = db.Column(db.Integer, db.ForeignKey('eleves.id'), nullable=False)
    matiere_id = db.Column(db.Integer, db.ForeignKey('matieres.id'), nullable=False)
    enseignant_id = db.Column(db.Integer, db.ForeignKey('enseignants.id'), nullable=True)

    eleve = db.relationship('Eleve', backref='notes')
    matiere = db.relationship('Matiere', backref='notes')
    enseignant = db.relationship('Enseignant', backref='notes')

    def to_dict(self):
        return {
            "id": self.id,
            "valeur": self.valeur,
            "type": self.type,
            "periode": self.periode,
            "eleve": {
                "id": self.eleve.id,
                "nom": self.eleve.nom,
                "prenom": self.eleve.prenom
            },
            "matiere": {
                "id": self.matiere.id,
                "nom": self.matiere.nom
            },
            "enseignant": {
                "id": self.enseignant.id,
                "nom": self.enseignant.nom,
                "prenom": self.enseignant.prenom
            } if self.enseignant else None
        }

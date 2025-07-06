from database import db
from datetime import date

class Presence(db.Model):
    __tablename__ = 'presences'

    id = db.Column(db.Integer, primary_key=True)
    eleve_id = db.Column(db.Integer, db.ForeignKey('eleves.id'), nullable=False)
    classe_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    professeur_id = db.Column(db.Integer, db.ForeignKey('enseignants.id'), nullable=False)
    
    date = db.Column(db.Date, default=date.today)
    statut = db.Column(db.String(10), nullable=False)  # 'present' ou 'absent'
    justifiee = db.Column(db.Boolean, default=False)
    motif = db.Column(db.String(255), nullable=True)
    commentaire = db.Column(db.Text, nullable=True)

    # 🔁 Relations
    eleve = db.relationship('Eleve', backref='presences')
    classe = db.relationship('Classe', backref='presences')
    professeur = db.relationship('Enseignant', backref='presences')

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date.isoformat(),
            "statut": self.statut,
            "justifiee": self.justifiee,
            "motif": self.motif,
            "commentaire": self.commentaire,
            "eleve": {
                "id": self.eleve.id,
                "nom": self.eleve.nom,
                "prenom": self.eleve.prenom
            },
            "classe": {
                "id": self.classe.id,
                "nom": self.classe.nom
            },
            "professeur": {
                "id": self.professeur.id,
                "nom": self.professeur.nom,
                "prenom": self.professeur.prenom
            }
        }

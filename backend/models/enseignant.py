from database import db

enseignant_matiere = db.Table(
    'enseignant_matiere',
    db.Column('enseignant_id', db.Integer, db.ForeignKey('enseignants.id')),
    db.Column('matiere_id', db.Integer, db.ForeignKey('matieres.id'))
)

class Enseignant(db.Model):
    __tablename__ = 'enseignants'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    telephone = db.Column(db.String(20), nullable=True)
    matricule = db.Column(db.String(50), unique=True, nullable=False)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)

    utilisateur = db.relationship('Utilisateur', backref=db.backref('enseignant', uselist=False))
    matieres = db.relationship('Matiere', secondary=enseignant_matiere, backref='enseignants')

    def to_dict(self):
        return {
            "id": self.id,
            "nom": self.nom,
            "prenom": self.prenom,
            "telephone": self.telephone,
            "matricule": self.matricule,
            "utilisateur": self.utilisateur.to_dict() if self.utilisateur else None,
            "matieres": [m.to_dict() for m in self.matieres]
        }

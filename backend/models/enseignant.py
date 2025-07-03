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
    matricule = db.Column(db.String(100), nullable=False)
    matieres = db.relationship('Matiere', secondary=enseignant_matiere, backref='enseignants')

    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'prenom': self.prenom,
            'matricule': self.matricule,
            'matieres': [matiere.to_dict() for matiere in self.matieres]
        }

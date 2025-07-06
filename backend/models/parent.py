from database import db

class Parent(db.Model):
    __tablename__ = 'parents'

    id = db.Column(db.Integer, primary_key=True)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False, unique=True)

    # Relation avec utilisateur
    utilisateur = db.relationship('Utilisateur', backref=db.backref('parent_profile', uselist=False))

    # Relation inverse avec enfants (déjà présente dans Eleve)
    def to_dict(self):
        return {
            "id": self.id,
            "utilisateur": {
                "id": self.utilisateur.id,
                "nom": self.utilisateur.nom,
                "prenom": self.utilisateur.prenom,
                "email": self.utilisateur.email,
                "telephone": self.utilisateur.telephone
            },
            "enfants": [e.to_dict() for e in self.utilisateur.enfants]
        }

from database import db

class Eleve(db.Model):
    __tablename__ = 'eleves'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    matricule = db.Column(db.String(50), unique=True, nullable=False)
    sexe = db.Column(db.String(1), nullable=False)  # 'M' ou 'F'
    date_naissance = db.Column(db.Date, nullable=True)
    adresse = db.Column(db.String(255), nullable=True)

    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)
    utilisateur = db.relationship('Utilisateur', foreign_keys=[utilisateur_id], backref=db.backref('eleve', uselist=False))

    classe_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    classe = db.relationship('Classe', backref='eleves')

    parent_id = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)
    parent = db.relationship('Utilisateur', foreign_keys=[parent_id], backref='enfants')

    def to_dict(self):
        return {
            "id": self.id,
            "nom": self.nom,
            "prenom": self.prenom,
            "matricule": self.matricule,
            "sexe": self.sexe,
            "date_naissance": self.date_naissance.isoformat() if self.date_naissance else None,
            "adresse": self.adresse,
            "classe": self.classe.to_dict() if self.classe else None,
            "parent": {
                "id": self.parent.id,
                "nom": self.parent.nom,
                "prenom": self.parent.prenom,
                "email": self.parent.email,
                "telephone": self.parent.telephone,
            } if self.parent else None
        }

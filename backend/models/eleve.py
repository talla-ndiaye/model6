from database import db

class Eleve(db.Model):
    __tablename__ = 'eleves'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    matricule = db.Column(db.String(50), unique=True, nullable=False)
    date_naissance = db.Column(db.String(20), nullable=False)
    adresse = db.Column(db.String(200), nullable=False)

    parent_nom = db.Column(db.String(100), nullable=False)
    parent_prenom = db.Column(db.String(100), nullable=False)
    parent_telephone = db.Column(db.String(20), nullable=False)

    classe_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    classe = db.relationship('Classe', backref='eleves')

    def to_dict(self):
        return {
            "id": self.id,
            "nom": self.nom,
            "prenom": self.prenom,
            "matricule": self.matricule,
            "date_naissance": self.date_naissance,
            "adresse": self.adresse,
            "parent_nom": self.parent_nom,
            "parent_prenom": self.parent_prenom,
            "parent_telephone": self.parent_telephone,
            "classe_id": self.classe_id,
            "classe": self.classe.nom if self.classe else None
    }

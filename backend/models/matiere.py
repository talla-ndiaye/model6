from database import db

class Matiere(db.Model):
    __tablename__ = 'matieres'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), unique=True, nullable=False)
    code = db.Column(db.String(100), unique=True, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "nom": self.nom,
            "code": self.code
        }

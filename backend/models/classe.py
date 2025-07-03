from database import db

class Classe(db.Model):
    __tablename__ = 'classes'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False, unique=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom
        }

from database import db
from datetime import datetime

class Depense(db.Model):
    __tablename__ = 'depenses'

    id = db.Column(db.Integer, primary_key=True)
    libelle = db.Column(db.String(100), nullable=False)
    montant = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # Ex: "salaire", "fourniture", "transport"
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.Date, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "libelle": self.libelle,
            "montant": self.montant,
            "type": self.type,
            "description": self.description,
            "date": self.date.isoformat()
        }

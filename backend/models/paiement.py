from database import db
from datetime import datetime

class Paiement(db.Model):
    __tablename__ = 'paiements'

    id = db.Column(db.Integer, primary_key=True)
    eleve_id = db.Column(db.Integer, db.ForeignKey('eleves.id'), nullable=False)
    montant = db.Column(db.Float, nullable=False)
    date_paiement = db.Column(db.Date, default=datetime.utcnow, nullable=False)
    periode = db.Column(db.String(50), nullable=False)  # ex : "Octobre 2024"
    methode = db.Column(db.String(50), nullable=True)   # ex : "Espèces", "Orange Money"
    statut = db.Column(db.String(20), default='réglé')  # réglé / partiel / en attente

    #  Nouveau champ : numéro de reçu (unique)
    recu = db.Column(db.String(100), unique=True, nullable=True)

    #  Relation avec élève
    eleve = db.relationship('Eleve', backref='paiements')

    def to_dict(self):
        return {
            "id": self.id,
            "eleve_id": self.eleve_id,
            "eleve": {
                "nom": self.eleve.nom,
                "prenom": self.eleve.prenom,
                "matricule": self.eleve.matricule
            },
            "montant": self.montant,
            "date_paiement": self.date_paiement.isoformat(),
            "periode": self.periode,
            "methode": self.methode,
            "statut": self.statut,
            "recu": self.recu
        }

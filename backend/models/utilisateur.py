from werkzeug.security import generate_password_hash, check_password_hash
from database import db
from models.enums import RoleUtilisateur
class Utilisateur(db.Model):
    __tablename__ = 'utilisateurs'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    mot_de_passe = db.Column(db.String(200), nullable=False)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)  # Facultatif mais utile
    telephone = db.Column(db.String(20), nullable=True)
    role = db.Column(db.Enum(RoleUtilisateur), nullable=False)

    # Dates pour audit
    date_creation = db.Column(db.DateTime, server_default=db.func.now())
    date_mise_a_jour = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # 🔐 Méthodes de sécurité
    def set_password(self, mot_de_passe):
        self.mot_de_passe = generate_password_hash(mot_de_passe)

    def check_password(self, mot_de_passe):
        return check_password_hash(self.mot_de_passe, mot_de_passe)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'nom': self.nom,
            'prenom': self.prenom,
            'telephone': self.telephone,
            'role': self.role.value
        }

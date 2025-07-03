from werkzeug.security import generate_password_hash, check_password_hash
from database import db
class Utilisateur(db.Model):
    __tablename__ = 'utilisateurs'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    mot_de_passe = db.Column(db.String(200), nullable=False)
    nom = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)

    def set_password(self, mot_de_passe):
        self.mot_de_passe = generate_password_hash(mot_de_passe)

    def check_password(self, mot_de_passe):
        return check_password_hash(self.mot_de_passe, mot_de_passe)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'nom': self.nom,
            'role': self.role
        }

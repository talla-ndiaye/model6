from flask import Flask
from flask_cors import CORS
from database import db

from routes.auth_routes import auth_bp
from flask_jwt_extended import JWTManager
from routes.classe_routes import classe_bp
from routes.eleve_routes import eleve_bp
from routes.matiere_routes import matiere_bp
from routes.enseignant_routes import enseignant_bp
from routes.emploi_routes import emploi_bp
from routes.eleve_routes import eleve_bp


app = Flask(__name__)
CORS(app)

#Definition ma cle de sécurit pour hasé les mot de passe
app.config['JWT_SECRET_KEY'] = 'ta_clef_secrete_pour_jwt'  # remplace par une clé secrète forte
jwt = JWTManager(app)


# Configurer la base SQLite (fichier local)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gestion_ecole.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Importation des routes
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(classe_bp, url_prefix='/api')
app.register_blueprint(matiere_bp, url_prefix='/api')
app.register_blueprint(enseignant_bp, url_prefix='/api')
app.register_blueprint(emploi_bp,url_prefix='/api')
app.register_blueprint(eleve_bp, url_prefix="/api")

db.init_app(app)

@app.route('/')
def hello():
    return "Bonjour, Flask est prêt !"

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crée les tables dans la base si elles n'existent pas
    app.run(debug=True)

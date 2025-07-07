from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from flask_migrate import Migrate
from dotenv import load_dotenv

from database import db, init_app  # <-- init_app ajouté

from routes.auth_routes import auth_bp
from routes.classe_routes import classe_bp
from routes.matiere_routes import matiere_bp
from routes.enseignant_routes import enseignant_bp
from routes.eleve_routes import eleve_bp
from routes.prarent_routes import parent_bp
from routes.emploi_du_temps_routes import emploi_bp
from routes.note_routes import note_bp
from routes.paiement_route import paiement_bp
from routes.statistiques_routes import statistiques_bp
from routes.Presence_route import presence_bp
from routes.depense_routes import depense_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

init_app(app)  # Initialise MySQL depuis .env
migrate = Migrate(app, db)  # 💡 Flask-Migrate activé


# Token JWT
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=12)
jwt = JWTManager(app)

# Routes
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(classe_bp, url_prefix='/api')
app.register_blueprint(matiere_bp, url_prefix='/api')
app.register_blueprint(enseignant_bp, url_prefix='/api')
app.register_blueprint(eleve_bp, url_prefix='/api')
app.register_blueprint(parent_bp, url_prefix='/api')
app.register_blueprint(emploi_bp, url_prefix='/api')
app.register_blueprint(note_bp, url_prefix="/api")
app.register_blueprint(paiement_bp, url_prefix="/api")
app.register_blueprint(statistiques_bp, url_prefix="/api")
app.register_blueprint(presence_bp, url_prefix="/api")
app.register_blueprint(depense_bp, url_prefix="/api")

@app.route('/')
def hello():
    return "Bonjour, Flask avec MySQL est prêt !"

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

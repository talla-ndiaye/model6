from flask import Blueprint, request, jsonify
from database import db
from models.utilisateur import Utilisateur
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    mot_de_passe = data.get('mot_de_passe')
    nom = data.get('nom')
    role = data.get('role', 'eleve')  # rôle par défaut : élève

    if Utilisateur.query.filter_by(email=email).first():
        return jsonify({'message': 'Email déjà utilisé'}), 400

    hashed_password = generate_password_hash(mot_de_passe)

    user = Utilisateur(email=email, mot_de_passe=hashed_password, nom=nom, role=role)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'Utilisateur créé avec succès'}), 201

@auth_bp.route('/login', methods=['POST'])
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    mot_de_passe = data.get('mot_de_passe')

    user = Utilisateur.query.filter_by(email=email).first()
    if not user or not user.check_password(mot_de_passe):
        return jsonify({'message': 'Email ou mot de passe incorrect'}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Connexion réussie',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200
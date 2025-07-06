from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database import db
from models.enseignant import Enseignant
from models.utilisateur import Utilisateur
from models.matiere import Matiere
from models.enums import RoleUtilisateur

enseignant_bp = Blueprint('enseignant', __name__)

# ➕ Ajouter un enseignant avec création d'utilisateur
@enseignant_bp.route('/enseignants', methods=['POST'])
@jwt_required()
def ajouter_enseignant():
    try:
        data = request.get_json()

        # Champs utilisateur
        email = data.get('email')
        mot_de_passe = 'test1234' #le mot de passe par defaut

        # Champs enseignant
        nom = data.get('nom')
        prenom = data.get('prenom')
        telephone = data.get('telephone')
        matricule = data.get('matricule')
        matieres = data.get('matieres', [])

        # Validation des champs requis
        if not all([email, nom, prenom, telephone, matricule]):
            return jsonify({'error': 'Tous les champs sont requis'}), 400

        if Utilisateur.query.filter_by(email=email).first():
            return jsonify({'error': 'Email déjà utilisé'}), 409

        if Enseignant.query.filter_by(matricule=matricule).first():
            return jsonify({'error': 'Matricule déjà utilisé'}), 409

        # Création de l'utilisateur
        utilisateur = Utilisateur(
            email=email,
            nom=nom,
            prenom=prenom,
            telephone=telephone,
            role=RoleUtilisateur.ENSEIGNANT
        )
        utilisateur.set_password(mot_de_passe)
        db.session.add(utilisateur)
        db.session.flush()  # Pour obtenir l'ID avant le commit

        # Récupération des matières
        matieres = Matiere.query.filter(Matiere.id.in_(matieres)).all()

        # Création de l'enseignant
        enseignant = Enseignant(
            nom=nom,
            prenom=prenom,
            telephone=telephone,
            matricule=matricule,
            utilisateur_id=utilisateur.id,
            matieres=matieres
        )
        db.session.add(enseignant)
        db.session.commit()

        return jsonify({'message': 'Enseignant ajouté avec le mot de passe par défaut', 'enseignant': enseignant.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur lors de l\'ajout : {str(e)}'}), 500


# 🔄 Modifier un enseignant
@enseignant_bp.route('/enseignants/<int:enseignant_id>', methods=['PUT'])
@jwt_required()
def modifier_enseignant(enseignant_id):
    try:
        enseignant = Enseignant.query.get(enseignant_id)
        if not enseignant:
            return jsonify({'error': 'Enseignant non trouvé'}), 404

        data = request.get_json()

        if 'nom' in data:
            enseignant.nom = data['nom']
        if 'prenom' in data:
            enseignant.prenom = data['prenom']
        if 'telephone' in data:
            enseignant.telephone = data['telephone']
        if 'matricule' in data:
            if Enseignant.query.filter_by(matricule=data['matricule']).filter(Enseignant.id != enseignant.id).first():
                return jsonify({'error': 'Matricule déjà utilisé'}), 400
            enseignant.matricule = data['matricule']

        # Mise à jour des matières
        if 'matieres' in data:
            nouvelles_matieres = Matiere.query.filter(Matiere.id.in_(data['matieres'])).all()
            enseignant.matieres = nouvelles_matieres

        # Mise à jour utilisateur
        utilisateur = enseignant.utilisateur
        if utilisateur:
            if 'email' in data:
                if Utilisateur.query.filter(Utilisateur.email == data['email'], Utilisateur.id != utilisateur.id).first():
                    return jsonify({'error': 'Email déjà utilisé'}), 400
                utilisateur.email = data['email']
            if 'nom_utilisateur' in data:
                utilisateur.nom = data['nom_utilisateur']

        db.session.commit()
        return jsonify({'message': 'Enseignant modifié', 'enseignant': enseignant.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur serveur : {str(e)}'}), 500


# 🗑 Supprimer un enseignant
@enseignant_bp.route('/enseignants/<int:enseignant_id>', methods=['DELETE'])
@jwt_required()
def supprimer_enseignant(enseignant_id):
    try:
        enseignant = Enseignant.query.get(enseignant_id)
        if not enseignant:
            return jsonify({'error': 'Enseignant non trouvé'}), 404

        utilisateur = enseignant.utilisateur

        db.session.delete(enseignant)
        if utilisateur:
            db.session.delete(utilisateur)

        db.session.commit()
        return jsonify({'message': 'Enseignant et utilisateur supprimés'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Suppression échouée : {str(e)}'}), 500


# 📋 Lister tous les enseignants
@enseignant_bp.route('/enseignants', methods=['GET'])
@jwt_required()
def lister_enseignants():
    try:
        enseignants = Enseignant.query.all()
        return jsonify([ens.to_dict() for ens in enseignants]), 200
    except Exception as e:
        return jsonify({'error': f'Erreur : {str(e)}'}), 500


# 🔍 Obtenir un enseignant par ID
@enseignant_bp.route('/enseignants/<int:id>', methods=['GET'])
@jwt_required()
def get_enseignant(id):
    try:
        enseignant = Enseignant.query.get(id)
        if not enseignant:
            return jsonify({"error": "Enseignant non trouvé"}), 404
        return jsonify(enseignant.to_dict()), 200
    except Exception as e:
        return jsonify({'error': f'Erreur : {str(e)}'}), 500

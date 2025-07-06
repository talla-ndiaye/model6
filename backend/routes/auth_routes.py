from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models.utilisateur import Utilisateur
from models.enums import RoleUtilisateur

auth_bp = Blueprint('auth', __name__)

# 🔐 Connexion
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        mot_de_passe = data.get('mot_de_passe')

        if not all([email, mot_de_passe]):
            return jsonify({"error": "Email et mot de passe requis"}), 400

        utilisateur = Utilisateur.query.filter_by(email=email).first()
        if utilisateur and utilisateur.check_password(mot_de_passe):
            access_token = create_access_token(identity=str(utilisateur.id))
            return jsonify({
                "message": "Connexion réussie",
                "access_token": access_token,
                "utilisateur": utilisateur.to_dict()
            }), 200

        return jsonify({"error": "Identifiants incorrects"}), 401

    except Exception as e:
        return jsonify({"error": f"Erreur serveur : {str(e)}"}), 500


# 🧾 Inscription
@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        mot_de_passe = data.get('mot_de_passe')
        nom = data.get('nom')
        prenom = data.get('prenom')
        telephone = data.get('telephone')
        role = data.get('role')

        if not all([email, mot_de_passe, nom, prenom, role]):
            return jsonify({"error": "Champs obligatoires manquants"}), 400

        if Utilisateur.query.filter_by(email=email).first():
            return jsonify({"error": "Email déjà utilisé"}), 409

        nouvel_utilisateur = Utilisateur(
            email=email,
            nom=nom,
            prenom=prenom,
            telephone=telephone,
            role=RoleUtilisateur(role)
        )
        nouvel_utilisateur.set_password(mot_de_passe)
        db.session.add(nouvel_utilisateur)
        db.session.commit()

        return jsonify({"message": "Utilisateur créé avec succès"}), 201

    except ValueError:
        return jsonify({"error": "Rôle invalide"}), 400
    except Exception as e:
        return jsonify({"error": f"Erreur serveur : {str(e)}"}), 500

# 🧾 Mes Infos
@auth_bp.route('/moi', methods=['GET'])
@jwt_required()
def utilisateur_actuel():
    try:
        utilisateur_id =get_jwt_identity()
        utilisateur = Utilisateur.query.get(utilisateur_id)
        
        if not utilisateur:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

        return jsonify({
                "message": "Connexion réussie",
                "utilisateur": utilisateur.to_dict()
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}),500

# 🚪 Déconnexion fictive
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"message": "Déconnexion réussie (token à supprimer côté client)"}), 200


# 📄 Liste des utilisateurs
@auth_bp.route('/utilisateurs', methods=['GET'])
@jwt_required()
def lister_utilisateurs():
    try:
        utilisateurs = Utilisateur.query.all()
        return jsonify([u.to_dict() for u in utilisateurs]), 200
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la récupération des utilisateurs : {str(e)}"}), 500


# 👤 Détails d’un utilisateur
@auth_bp.route('/utilisateurs/<int:id>', methods=['GET'])
@jwt_required()
def get_utilisateur(id):
    utilisateur = Utilisateur.query.get(id)
    if not utilisateur:
        return jsonify({"error": "Utilisateur non trouvé"}), 404
    return jsonify(utilisateur.to_dict()), 200


# ✏️ Modifier un utilisateur
@auth_bp.route('/utilisateurs/<int:id>', methods=['PUT'])
@jwt_required()
def modifier_utilisateur(id):
    try:
        utilisateur = Utilisateur.query.get(id)
        if not utilisateur:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        data = request.get_json()
        utilisateur.nom = data.get('nom', utilisateur.nom)
        utilisateur.prenom = data.get('prenom', utilisateur.prenom)
        utilisateur.telephone = data.get('telephone', utilisateur.telephone)

        # Facultatif : mise à jour du rôle
        role = data.get('role')
        if role:
            try:
                utilisateur.role = RoleUtilisateur(role)
            except ValueError:
                return jsonify({"error": "Rôle invalide"}), 400

        db.session.commit()
        return jsonify({"message": "Utilisateur mis à jour", "utilisateur": utilisateur.to_dict()}), 200

    except Exception as e:
        return jsonify({"error": f"Erreur lors de la mise à jour : {str(e)}"}), 500


# ❌ Supprimer un utilisateur
@auth_bp.route('/utilisateurs/<int:id>', methods=['DELETE'])
@jwt_required()
def supprimer_utilisateur(id):
    try:
        utilisateur = Utilisateur.query.get(id)
        if not utilisateur:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        db.session.delete(utilisateur)
        db.session.commit()
        return jsonify({"message": "Utilisateur supprimé"}), 200

    except Exception as e:
        return jsonify({"error": f"Erreur lors de la suppression : {str(e)}"}), 500


# 🔑 Modifier le mot de passe d’un utilisateur (ADMIN uniquement)
@auth_bp.route('/utilisateurs/<int:id>/motdepasse', methods=['PUT'])
@jwt_required()
def modifier_mot_de_passe(id):
    try:
        admin_id = get_jwt_identity()
        admin = Utilisateur.query.get(admin_id)

        if not admin or admin.role != RoleUtilisateur.ADMIN:
            return jsonify({"error": "Accès réservé aux administrateurs"}), 403

        utilisateur = Utilisateur.query.get(id)
        if not utilisateur:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        data = request.get_json()
        nouveau_mot_de_passe = data.get("nouveau_mot_de_passe")

        if not nouveau_mot_de_passe:
            return jsonify({"error": "Le nouveau mot de passe est requis"}), 400

        utilisateur.set_password(nouveau_mot_de_passe)
        db.session.commit()

        return jsonify({"message": "Mot de passe mis à jour avec succès"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la mise à jour du mot de passe : {str(e)}"}), 500


# 🔐 Modifier son propre mot de passe (self-service)
@auth_bp.route('/utilisateurs/motdepasse', methods=['PUT'])
@jwt_required()
def changer_son_mot_de_passe():
    try:
        user_id = get_jwt_identity()
        utilisateur = Utilisateur.query.get(user_id)

        data = request.get_json()
        ancien = data.get("ancien_mot_de_passe")
        nouveau = data.get("nouveau_mot_de_passe")

        if not all([ancien, nouveau]):
            return jsonify({"error": "Ancien et nouveau mot de passe requis"}), 400

        if not utilisateur.check_password(ancien):
            return jsonify({"error": "Ancien mot de passe incorrect"}), 403

        utilisateur.set_password(nouveau)
        db.session.commit()

        return jsonify({"message": "Mot de passe modifié avec succès"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur : {str(e)}"}), 500

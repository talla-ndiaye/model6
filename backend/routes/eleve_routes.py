from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database import db
from models.eleve import Eleve
from models.utilisateur import Utilisateur
from models.classe import Classe
from models.enums import RoleUtilisateur
from datetime import datetime

eleve_bp = Blueprint('eleve', __name__)

@eleve_bp.route('/eleves', methods=['POST'])
@jwt_required()
def ajouter_eleve():
    try:
        data = request.get_json()

        nom = data.get('nom')
        prenom = data.get('prenom')
        sexe = data.get('sexe')  # doit être 'M' ou 'F'
        matricule = data.get('matricule')
        date_naissance_str = data.get('date_naissance')
        adresse = data.get('adresse')
        classe_id = data.get('classe_id')
        parent_nom = data.get('parent_nom')
        parent_prenom = data.get('parent_prenom')
        parent_telephone = data.get('parent_telephone')

        # Validation
        if not all([nom, prenom, sexe, matricule, classe_id, parent_nom, parent_prenom, parent_telephone]):
            return jsonify({"error": "Tous les champs obligatoires doivent être remplis"}), 400
        if sexe not in ['M', 'F']:
            return jsonify({"error": "Le champ 'sexe' doit être 'M' ou 'F'"}), 400

        # Conversion date
        date_naissance = None
        if date_naissance_str:
            try:
                date_naissance = datetime.strptime(date_naissance_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({"error": "Format de date incorrect. Utilisez AAAA-MM-JJ."}), 400

        # Classe
        classe = Classe.query.get(classe_id)
        if not classe:
            return jsonify({"error": "Classe introuvable"}), 404

        # Parent
        parent_email = f"{parent_telephone}@parent.com".lower().strip()
        parent_utilisateur = Utilisateur.query.filter_by(email=parent_email).first()
        if not parent_utilisateur:
            parent_utilisateur = Utilisateur(
                email=parent_email,
                nom=parent_nom,
                prenom=parent_prenom,
                telephone=parent_telephone,
                role=RoleUtilisateur.PARENT
            )
            parent_utilisateur.set_password("parent123")
            db.session.add(parent_utilisateur)
            db.session.flush()

        # Élève
        eleve_email = f"{matricule}@eleve.com".lower().strip()
        if Utilisateur.query.filter_by(email=eleve_email).first():
            return jsonify({"error": "Un utilisateur élève avec ce matricule existe déjà"}), 409

        eleve_utilisateur = Utilisateur(
            email=eleve_email,
            nom=nom,
            prenom=prenom,
            role=RoleUtilisateur.ELEVE
        )
        eleve_utilisateur.set_password("eleve1234")
        db.session.add(eleve_utilisateur)
        db.session.flush()

        eleve = Eleve(
            nom=nom,
            prenom=prenom,
            sexe=sexe,
            matricule=matricule,
            date_naissance=date_naissance,
            adresse=adresse,
            classe_id=classe_id,
            utilisateur_id=eleve_utilisateur.id,
            parent_id=parent_utilisateur.id
        )
        db.session.add(eleve)
        db.session.commit()

        return jsonify({"message": "Élève et parent créés avec succès", "eleve": eleve.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de l'ajout de l'élève : {str(e)}"}), 500


# 🔄 Modifier un élève
@eleve_bp.route('/eleves/<int:eleve_id>', methods=['PUT'])
@jwt_required()
def modifier_eleve(eleve_id):
    try:
        eleve = Eleve.query.get(eleve_id)
        if not eleve:
            return jsonify({"error": "Élève non trouvé"}), 404

        data = request.get_json()

        # Mise à jour des champs élève
        if 'nom' in data:
            eleve.nom = data['nom']
            eleve.utilisateur.nom = data['nom']  # aussi dans utilisateur
        if 'prenom' in data:
            eleve.prenom = data['prenom']
            eleve.utilisateur.prenom = data['prenom']  # aussi dans utilisateur
        if 'matricule' in data:
            # Attention à l'unicité
            existe = Eleve.query.filter(Eleve.matricule == data['matricule'], Eleve.id != eleve.id).first()
            if existe:
                return jsonify({"error": "Matricule déjà utilisé"}), 400
            eleve.matricule = data['matricule']

            # Mettre à jour l'email utilisateur lié
            eleve.utilisateur.email = f"{data['matricule']}@eleve.com"
        if 'date_naissance' in data:
            try:
                eleve.date_naissance = datetime.strptime(data['date_naissance'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({"error": "Format de date incorrect. Utilisez AAAA-MM-JJ."}), 400
        if 'adresse' in data:
            eleve.adresse = data['adresse']
        if 'classe_id' in data:
            classe = Classe.query.get(data['classe_id'])
            if not classe:
                return jsonify({"error": "Classe introuvable"}), 404
            eleve.classe_id = data['classe_id']

        # Mise à jour du parent si infos fournies
        if 'parent_nom' in data or 'parent_prenom' in data or 'parent_telephone' in data:
            parent = eleve.parent
            if not parent:
                return jsonify({"error": "Parent introuvable"}), 404

            if 'parent_nom' in data:
                parent.nom = data['parent_nom']
            if 'parent_prenom' in data:
                parent.prenom = data['parent_prenom']
            if 'parent_telephone' in data:
                nouveau_tel = data['parent_telephone']
                parent.telephone = nouveau_tel
                parent.email = f"{nouveau_tel}@parent.com"

        db.session.commit()
        return jsonify({"message": "Élève modifié avec succès", "eleve": eleve.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la modification : {str(e)}"}), 500


# 📋 Détails d’un élève
@eleve_bp.route('/eleves/<int:eleve_id>', methods=['GET'])
@jwt_required()
def get_eleve(eleve_id):
    eleve = Eleve.query.get(eleve_id)
    if not eleve:
        return jsonify({"error": "Élève non trouvé"}), 404
    return jsonify(eleve.to_dict()), 200


# 🗑 Supprimer un élève et son utilisateur
@eleve_bp.route('/eleves/<int:eleve_id>', methods=['DELETE'])
@jwt_required()
def supprimer_eleve(eleve_id):
    try:
        eleve = Eleve.query.get(eleve_id)
        if not eleve:
            return jsonify({"error": "Élève non trouvé"}), 404

        utilisateur = eleve.utilisateur

        db.session.delete(eleve)
        if utilisateur:
            db.session.delete(utilisateur)

        db.session.commit()
        return jsonify({"message": "Élève et utilisateur supprimés"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la suppression : {str(e)}"}), 500
    

    # 📋 Lister tous les élèves
@eleve_bp.route('/eleves', methods=['GET'])
@jwt_required()
def lister_eleves():
    try:
        # Optionnel : pagination (page & per_page)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        pagination = Eleve.query.paginate(page=page, per_page=per_page, error_out=False)
        eleves = pagination.items

        return jsonify({
            "eleves": [eleve.to_dict() for eleve in eleves],
            "total": pagination.total,
            "pages": pagination.pages,
            "page": pagination.page,
            "per_page": pagination.per_page
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erreur lors de la récupération des élèves : {str(e)}"}), 500

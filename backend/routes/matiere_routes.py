from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.matiere import Matiere
from database import db
from sqlalchemy.exc import IntegrityError

matiere_bp = Blueprint('matiere', __name__)

# ➕ Ajouter une matière
@matiere_bp.route('/matieres', methods=['POST'])
@jwt_required()
def ajouter_matiere():
    try:
        data = request.get_json()
        code = data.get('code')
        nom = data.get('nom')

        if not code or not nom:
            return jsonify({'error': 'Code et nom sont requis'}), 400

        if Matiere.query.filter_by(code=code).first():
            return jsonify({'error': 'Ce code existe déjà'}), 400

        if Matiere.query.filter_by(nom=nom).first():
            return jsonify({'error': 'Ce nom existe déjà'}), 400

        nouvelle_matiere = Matiere(code=code, nom=nom)
        db.session.add(nouvelle_matiere)
        db.session.commit()

        return jsonify({
            'message': 'Matière ajoutée avec succès',
            'matiere': nouvelle_matiere.to_dict()
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Erreur d’intégrité (doublon ou données invalides)'}), 500
    except Exception as e:
        return jsonify({'error': f'Erreur serveur : {str(e)}'}), 500


# 📄 Liste des matières
@matiere_bp.route('/matieres', methods=['GET'])
@jwt_required()
def liste_matieres():
    try:
        matieres = Matiere.query.all()
        return jsonify([m.to_dict() for m in matieres]), 200
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la récupération des matières : {str(e)}'}), 500


# ✏️ Modifier une matière
@matiere_bp.route('/matieres/<int:id>', methods=['PUT'])
@jwt_required()
def modifier_matiere(id):
    try:
        data = request.get_json()
        nouveau_code = data.get('code')
        nouveau_nom = data.get('nom')

        if not nouveau_code or not nouveau_nom:
            return jsonify({'error': 'Code et nom sont requis'}), 400

        matiere = Matiere.query.get(id)
        if not matiere:
            return jsonify({'error': 'Matière non trouvée'}), 404

        # Vérification code unique
        if nouveau_code != matiere.code:
            if Matiere.query.filter_by(code=nouveau_code).first():
                return jsonify({'error': 'Code déjà utilisé'}), 400

        # Vérification nom unique
        if nouveau_nom != matiere.nom:
            if Matiere.query.filter_by(nom=nouveau_nom).first():
                return jsonify({'error': 'Nom déjà utilisé'}), 400

        matiere.code = nouveau_code
        matiere.nom = nouveau_nom
        db.session.commit()

        return jsonify({
            'message': 'Matière modifiée avec succès',
            'matiere': matiere.to_dict()
        }), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Erreur d’intégrité en base de données'}), 500
    except Exception as e:
        return jsonify({'error': f'Erreur serveur : {str(e)}'}), 500


# ❌ Supprimer une matière
@matiere_bp.route('/matieres/<int:id>', methods=['DELETE'])
@jwt_required()
def supprimer_matiere(id):
    try:
        matiere = Matiere.query.get(id)
        if not matiere:
            return jsonify({'error': 'Matière non trouvée'}), 404

        db.session.delete(matiere)
        db.session.commit()

        return jsonify({'message': 'Matière supprimée avec succès'}), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Erreur d’intégrité (conflit de clé étrangère ?)'}), 500
    except Exception as e:
        return jsonify({'error': f'Erreur serveur : {str(e)}'}), 500

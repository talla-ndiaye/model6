from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from database import db
from models.depense import Depense

depense_bp = Blueprint('depense', __name__)

# ➕ Ajouter une dépense
@depense_bp.route('/depenses', methods=['POST'])
@jwt_required()
def ajouter_depense():
    try:
        data = request.get_json()

        libelle = data.get('libelle')
        montant = data.get('montant')
        type_depense = data.get('type')
        description = data.get('description')
        date_str = data.get('date')  # optionnelle

        if not all([libelle, montant, type_depense]):
            return jsonify({"error": "Champs requis : libelle, montant, type"}), 400

        date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else datetime.today().date()

        depense = Depense(
            libelle=libelle,
            montant=montant,
            type=type_depense,
            description=description,
            date=date
        )

        db.session.add(depense)
        db.session.commit()

        return jsonify({"message": "Dépense ajoutée", "depense": depense.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de l'ajout de la dépense : {str(e)}"}), 500


# 🔁 Modifier une dépense
@depense_bp.route('/depenses/<int:id>', methods=['PUT'])
@jwt_required()
def modifier_depense(id):
    try:
        depense = Depense.query.get(id)
        if not depense:
            return jsonify({"error": "Dépense non trouvée"}), 404

        data = request.get_json()

        if 'libelle' in data:
            depense.libelle = data['libelle']
        if 'montant' in data:
            depense.montant = data['montant']
        if 'type' in data:
            depense.type = data['type']
        if 'description' in data:
            depense.description = data['description']
        if 'date' in data:
            depense.date = datetime.strptime(data['date'], '%Y-%m-%d').date()

        db.session.commit()
        return jsonify({"message": "Dépense modifiée", "depense": depense.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la modification : {str(e)}"}), 500


# ❌ Supprimer une dépense
@depense_bp.route('/depenses/<int:id>', methods=['DELETE'])
@jwt_required()
def supprimer_depense(id):
    try:
        depense = Depense.query.get(id)
        if not depense:
            return jsonify({"error": "Dépense non trouvée"}), 404

        db.session.delete(depense)
        db.session.commit()
        return jsonify({"message": "Dépense supprimée"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la suppression : {str(e)}"}), 500


# 📋 Liste des dépenses
@depense_bp.route('/depenses', methods=['GET'])
@jwt_required()
def lister_depenses():
    try:
        depenses = Depense.query.order_by(Depense.date.desc()).all()
        return jsonify([d.to_dict() for d in depenses]), 200
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la récupération des dépenses : {str(e)}"}), 500


# 🔍 Détails d'une dépense
@depense_bp.route('/depenses/<int:id>', methods=['GET'])
@jwt_required()
def get_depense(id):
    try:
        depense = Depense.query.get(id)
        if not depense:
            return jsonify({"error": "Dépense non trouvée"}), 404
        return jsonify(depense.to_dict()), 200
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la récupération : {str(e)}"}), 500

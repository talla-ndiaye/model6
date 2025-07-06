from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import SQLAlchemyError
from database import db
from models.paiement import Paiement
from models.eleve import Eleve
from datetime import datetime

paiement_bp = Blueprint('paiement', __name__)

# ➕ Ajouter un paiement
@paiement_bp.route('/paiements', methods=['POST'])
@jwt_required()
def ajouter_paiement():
    try:
        data = request.get_json()
        eleve_id = data.get('eleve_id')
        montant = data.get('montant')
        periode = data.get('periode')
        methode = data.get('methode', 'espèces')
        statut = data.get('statut', 'réglé')
        recu = data.get('recu')

        if not all([eleve_id, montant, periode, recu]):
            return jsonify({"error": "Champs requis : eleve_id, montant, periode, recu"}), 400

        eleve = Eleve.query.get(eleve_id)
        if not eleve:
            return jsonify({"error": "Élève introuvable"}), 404

        paiement = Paiement(
            eleve_id=eleve_id,
            montant=montant,
            periode=periode,
            methode=methode,
            statut=statut,
            recu=recu
        )
        db.session.add(paiement)
        db.session.commit()

        return jsonify({"message": "Paiement enregistré", "paiement": paiement.to_dict()}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de l'ajout : {str(e)}"}), 500


# 📋 Lister tous les paiements
@paiement_bp.route('/paiements', methods=['GET'])
@jwt_required()
def lister_paiements():
    try:
        paiements = Paiement.query.all()
        return jsonify([p.to_dict() for p in paiements]), 200
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la récupération : {str(e)}"}), 500


# 🔍 Détails d’un paiement
@paiement_bp.route('/paiements/<int:id>', methods=['GET'])
@jwt_required()
def get_paiement(id):
    paiement = Paiement.query.get(id)
    if not paiement:
        return jsonify({"error": "Paiement non trouvé"}), 404
    return jsonify(paiement.to_dict()), 200


# 🔄 Modifier un paiement
@paiement_bp.route('/paiements/<int:id>', methods=['PUT'])
@jwt_required()
def modifier_paiement(id):
    try:
        paiement = Paiement.query.get(id)
        if not paiement:
            return jsonify({"error": "Paiement non trouvé"}), 404

        data = request.get_json()
        paiement.montant = data.get('montant', paiement.montant)
        paiement.periode = data.get('periode', paiement.periode)
        paiement.methode = data.get('methode', paiement.methode)
        paiement.statut = data.get('statut', paiement.statut)
        paiement.recu = data.get('recu', paiement.recu)

        db.session.commit()
        return jsonify({"message": "Paiement mis à jour", "paiement": paiement.to_dict()}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la modification : {str(e)}"}), 500


# 🗑 Supprimer un paiement
@paiement_bp.route('/paiements/<int:id>', methods=['DELETE'])
@jwt_required()
def supprimer_paiement(id):
    try:
        paiement = Paiement.query.get(id)
        if not paiement:
            return jsonify({"error": "Paiement non trouvé"}), 404

        db.session.delete(paiement)
        db.session.commit()
        return jsonify({"message": "Paiement supprimé avec succès"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la suppression : {str(e)}"}), 500

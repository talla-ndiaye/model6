from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from database import db
from models.emploi_du_temps import EmploiDuTemps
from models.classe import Classe
from models.enseignant import Enseignant
from models.matiere import Matiere

emploi_bp = Blueprint('emploi_du_temps', __name__)

# 🔹 Ajouter un créneau à l'emploi du temps
@emploi_bp.route('/emplois', methods=['POST'])
@jwt_required()
def ajouter_emploi():
    try:
        data = request.get_json()
        jour = data.get('jour')
        heure_debut = data.get('heure_debut')
        heure_fin = data.get('heure_fin')
        classe_id = data.get('classe_id')
        enseignant_id = data.get('enseignant_id')
        matiere_id = data.get('matiere_id')

        # Vérification des champs obligatoires
        if not all([jour, heure_debut, heure_fin, classe_id, enseignant_id, matiere_id]):
            return jsonify({"error": "Tous les champs sont requis"}), 400

        # Vérification des entités existantes
        if not Classe.query.get(classe_id):
            return jsonify({"error": "Classe introuvable"}), 404
        if not Enseignant.query.get(enseignant_id):
            return jsonify({"error": "Enseignant introuvable"}), 404
        if not Matiere.query.get(matiere_id):
            return jsonify({"error": "Matière introuvable"}), 404

        emploi = EmploiDuTemps(
            jour=jour,
            heure_debut=datetime.strptime(heure_debut, "%H:%M").time(),
            heure_fin=datetime.strptime(heure_fin, "%H:%M").time(),
            classe_id=classe_id,
            enseignant_id=enseignant_id,
            matiere_id=matiere_id
        )
        db.session.add(emploi)
        db.session.commit()
        return jsonify({"message": "Créneau ajouté", "emploi": emploi.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur serveur : {str(e)}"}), 500


# 📋 Lister tout l'emploi du temps
@emploi_bp.route('/emplois', methods=['GET'])
@jwt_required()
def lister_emplois():
    try:
        emplois = EmploiDuTemps.query.all()
        return jsonify([emploi.to_dict() for emploi in emplois]), 200
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la récupération : {str(e)}"}), 500


# 📘 Lister l'emploi du temps par classe
@emploi_bp.route('/emplois/classe/<int:classe_id>', methods=['GET'])
@jwt_required()
def emploi_par_classe(classe_id):
    try:
        emplois = EmploiDuTemps.query.filter_by(classe_id=classe_id).all()
        return jsonify([e.to_dict() for e in emplois]), 200
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la récupération : {str(e)}"}), 500


# ✏️ Modifier un créneau
@emploi_bp.route('/emplois/<int:id>', methods=['PUT'])
@jwt_required()
def modifier_emploi(id):
    try:
        emploi = EmploiDuTemps.query.get(id)
        if not emploi:
            return jsonify({"error": "Créneau introuvable"}), 404

        data = request.get_json()
        emploi.jour = data.get('jour', emploi.jour)
        emploi.heure_debut = datetime.strptime(data.get('heure_debut', emploi.heure_debut.strftime('%H:%M')), "%H:%M").time()
        emploi.heure_fin = datetime.strptime(data.get('heure_fin', emploi.heure_fin.strftime('%H:%M')), "%H:%M").time()

        if 'classe_id' in data:
            if not Classe.query.get(data['classe_id']):
                return jsonify({"error": "Classe introuvable"}), 404
            emploi.classe_id = data['classe_id']

        if 'enseignant_id' in data:
            if not Enseignant.query.get(data['enseignant_id']):
                return jsonify({"error": "Enseignant introuvable"}), 404
            emploi.enseignant_id = data['enseignant_id']

        if 'matiere_id' in data:
            if not Matiere.query.get(data['matiere_id']):
                return jsonify({"error": "Matière introuvable"}), 404
            emploi.matiere_id = data['matiere_id']

        db.session.commit()
        return jsonify({"message": "Créneau mis à jour", "emploi": emploi.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur serveur : {str(e)}"}), 500


# 🗑 Supprimer un créneau
@emploi_bp.route('/emplois/<int:id>', methods=['DELETE'])
@jwt_required()
def supprimer_emploi(id):
    try:
        emploi = EmploiDuTemps.query.get(id)
        if not emploi:
            return jsonify({"error": "Créneau introuvable"}), 404

        db.session.delete(emploi)
        db.session.commit()
        return jsonify({"message": "Créneau supprimé"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la suppression : {str(e)}"}), 500

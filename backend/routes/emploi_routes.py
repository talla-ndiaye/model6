from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.emploi import EmploiDuTemps
from models.enseignant import Enseignant
from models.matiere import Matiere
from models.classe import Classe
from database import db
import re

emploi_bp = Blueprint('emploi', __name__)

def valider_format_heure(heure):
    # Format attendu HH:MM-HH:MM
    pattern = r'^\d{1,2}:\d{2}-\d{1,2}:\d{2}$'
    return re.match(pattern, heure)

#Ajouter Un emploi du temps
@emploi_bp.route('/emplois', methods=['POST'])
@jwt_required()
def ajouter_emploi():
    data = request.get_json()
    jour = data.get('jour')
    heure = data.get('heure')
    classe_id = data.get('classe_id')
    enseignant_id = data.get('enseignant_id')
    matiere_id = data.get('matiere_id')

    if not all([jour, heure, classe_id, enseignant_id, matiere_id]):
        return jsonify({"error": "Tous les champs sont obligatoires"}), 400
    
    if not valider_format_heure(heure):
        return jsonify({"error": "Le format de l'heure doit être HH:MM-HH:MM"}), 400

    nouvel_emploi = EmploiDuTemps(
        jour=jour,
        heure=heure,
        classe_id=classe_id,
        enseignant_id=enseignant_id,
        matiere_id=matiere_id
    )
    db.session.add(nouvel_emploi)
    db.session.commit()

    return jsonify({
        "message": "Créneau ajouté",
        "emploi": nouvel_emploi.to_dict()
    }), 201

@emploi_bp.route('/emplois', methods=['GET'])
@jwt_required()
def liste_emplois():
    emplois = EmploiDuTemps.query.all()
    return jsonify([e.to_dict() for e in emplois]), 200

#Obtenir L'emploi du temps d'une classe
@emploi_bp.route('/emplois/classe/<int:classe_id>', methods=['GET'])
@jwt_required()
def emploi_par_classe(classe_id):
    emplois = EmploiDuTemps.query.filter_by(classe_id=classe_id).all()

    if not emplois:
        return jsonify({"message": "Aucun emploi du temps trouvé pour cette classe"}), 404

    emplois_formates = []
    for emploi in emplois:
        matiere = Matiere.query.get(emploi.matiere_id)
        enseignant = Enseignant.query.get(emploi.enseignant_id)
        classe = Classe.query.get(emploi.classe_id)

        emplois_formates.append({
            "id": emploi.id,
            "jour": emploi.jour,
            "heure": emploi.heure,
            "classe": classe.nom if classe else None,
            "enseignant": f"{enseignant.nom} {enseignant.prenom}" if enseignant else None,
            "matiere": matiere.nom if matiere else None
        })

    return jsonify(emplois_formates), 200

#Modifier un emploi du temps d'une classe
@emploi_bp.route('/emplois/<int:emploi_id>', methods=['PUT'])
@jwt_required()
def modifier_emploi(emploi_id):
    data = request.get_json()
    emploi = EmploiDuTemps.query.get(emploi_id)
    if not emploi:
        return jsonify({"error": "Créneau non trouvé"}), 404

    jour = data.get('jour')
    heure = data.get('heure')
    classe_id = data.get('classe_id')
    enseignant_id = data.get('enseignant_id')
    matiere_id = data.get('matiere_id')

    if heure and not valider_format_heure(heure):
        return jsonify({"error": "Le format de l'heure doit être HH:MM-HH:MM"}), 400

    if jour:
        emploi.jour = jour
    if heure:
        emploi.heure = heure
    if classe_id:
        emploi.classe_id = classe_id
    if enseignant_id:
        emploi.enseignant_id = enseignant_id
    if matiere_id:
        emploi.matiere_id = matiere_id

    db.session.commit()
    return jsonify({
        "message": "Créneau modifié",
        "emploi": emploi.to_dict()
    }), 200

#Suppression d'un emploi du temps d'une classe

@emploi_bp.route('/emplois/<int:emploi_id>', methods=['DELETE'])
@jwt_required()
def supprimer_emploi(emploi_id):
    emploi = EmploiDuTemps.query.get(emploi_id)
    if not emploi:
        return jsonify({"error": "Créneau non trouvé"}), 404

    db.session.delete(emploi)
    db.session.commit()
    return jsonify({"message": "Créneau supprimé"}), 200

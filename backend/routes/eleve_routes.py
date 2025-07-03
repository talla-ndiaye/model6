from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.eleve import Eleve
from database import db

eleve_bp = Blueprint('eleve', __name__)

# Ajouter un élève
@eleve_bp.route('/eleves', methods=['POST'])
@jwt_required()
def ajouter_eleve():
    data = request.get_json()
    champs = ['nom', 'prenom', 'matricule', 'date_naissance', 'adresse',
              'parent_nom', 'parent_prenom', 'parent_telephone', 'classe_id']

    if not all(data.get(champ) for champ in champs):
        return jsonify({"error": "Tous les champs sont requis"}), 400

    if Eleve.query.filter_by(matricule=data['matricule']).first():
        return jsonify({"error": "Matricule déjà utilisé"}), 400

    eleve = Eleve(
        nom=data['nom'],
        prenom=data['prenom'],
        matricule=data['matricule'],
        date_naissance=data['date_naissance'],
        adresse=data['adresse'],
        parent_nom=data['parent_nom'],
        parent_prenom=data['parent_prenom'],
        parent_telephone=data['parent_telephone'],
        classe_id=data['classe_id']
    )
    db.session.add(eleve)
    db.session.commit()

    return jsonify({"message": "Élève ajouté", "eleve": eleve.to_dict()}), 201


# Obtenir tous les élèves
@eleve_bp.route('/eleves', methods=['GET'])
@jwt_required()
def liste_eleves():
    eleves = Eleve.query.all()
    return jsonify([e.to_dict() for e in eleves]), 200


# Obtenir les infos d’un élève par ID
@eleve_bp.route('/eleves/<int:eleve_id>', methods=['GET'])
@jwt_required()
def get_eleve(eleve_id):
    eleve = Eleve.query.get(eleve_id)
    if not eleve:
        return jsonify({"error": "Élève introuvable"}), 404
    return jsonify(eleve.to_dict()), 200


# Modifier un élève
@eleve_bp.route('/eleves/<int:eleve_id>', methods=['PUT'])
@jwt_required()
def modifier_eleve(eleve_id):
    eleve = Eleve.query.get(eleve_id)
    if not eleve:
        return jsonify({"error": "Élève introuvable"}), 404

    data = request.get_json()
    for champ in ['nom', 'prenom', 'matricule', 'date_naissance', 'adresse',
                  'parent_nom', 'parent_prenom', 'parent_telephone', 'classe_id']:
        if champ in data:
            setattr(eleve, champ, data[champ])

    db.session.commit()
    return jsonify({"message": "Élève modifié", "eleve": eleve.to_dict()}), 200


# Supprimer un élève
@eleve_bp.route('/eleves/<int:eleve_id>', methods=['DELETE'])
@jwt_required()
def supprimer_eleve(eleve_id):
    eleve = Eleve.query.get(eleve_id)
    if not eleve:
        return jsonify({"error": "Élève introuvable"}), 404

    db.session.delete(eleve)
    db.session.commit()
    return jsonify({"message": "Élève supprimé"}), 200

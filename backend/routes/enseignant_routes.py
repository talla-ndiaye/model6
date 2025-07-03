from flask import Blueprint, request, jsonify
from models.enseignant import Enseignant
from models.matiere import Matiere
from database import db
from flask_jwt_extended import jwt_required

enseignant_bp = Blueprint('enseignant', __name__)

#Route pour ajouter un enseignant
@enseignant_bp.route('/enseignants', methods=['POST'])
@jwt_required()
def ajouter_enseignant():
    data = request.get_json()
    nom = data.get('nom')
    prenom = data.get('prenom')
    matiere_ids = data.get('matiere_ids', [])

    if not nom or not prenom:
        return jsonify({"error": "Nom et prénom requis"}), 400

    enseignant = Enseignant(nom=nom, prenom=prenom)

    for matiere_id in matiere_ids:
        matiere = Matiere.query.get(matiere_id)
        if matiere:
            enseignant.matieres.append(matiere)

    db.session.add(enseignant)
    db.session.commit()

    return jsonify({"message": "Enseignant ajouté avec succès", "enseignant": enseignant.to_dict()}), 201

#Route pour la liste des enseignants
@enseignant_bp.route('/enseignants', methods=['GET'])
@jwt_required()
def liste_enseignants():
    enseignants = Enseignant.query.all()
    return jsonify([e.to_dict() for e in enseignants]), 200

#Route pour modifier un enseignant
@enseignant_bp.route('/enseignants/<int:enseignant_id>', methods=['PUT'])
@jwt_required()
def modifier_enseignant(enseignant_id):
    data = request.get_json()
    nom = data.get('nom')
    prenom = data.get('prenom')
    matiere_ids = data.get('matiere_ids', [])

    enseignant = Enseignant.query.get(enseignant_id)
    if not enseignant:
        return jsonify({"message": "Enseignant non trouvé"}), 404

    if nom:
        enseignant.nom = nom
    if prenom:
        enseignant.prenom = prenom

    if matiere_ids:
        # Récupérer les matières par ID et les associer
        matieres = Matiere.query.filter(Matiere.id.in_(matiere_ids)).all()
        enseignant.matieres = matieres

    db.session.commit()

    return jsonify({"message": "Enseignant modifié avec succès", "enseignant": enseignant.to_dict()}), 200

#Route pour supprimer un enseignant
@enseignant_bp.route('/enseignants/<int:enseignant_id>', methods=['DELETE'])
@jwt_required()
def supprimer_enseignant(enseignant_id):
    enseignant = Enseignant.query.get(enseignant_id)
    if not enseignant:
        return jsonify({"message": "Enseignant non trouvé"}), 404

    db.session.delete(enseignant)
    db.session.commit()

    return jsonify({"message": "Enseignant supprimé avec succès"}), 200

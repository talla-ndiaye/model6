from flask import Blueprint, request, jsonify
from models.classe import Classe
from database import db
from flask_jwt_extended import jwt_required

classe_bp = Blueprint('classe', __name__)

@classe_bp.route('/classes', methods=['POST'])
@jwt_required()
def ajouter_classe():
    data = request.get_json()
    nom = data.get('nom')

    if not nom:
        return jsonify({'error': 'Le nom est requis'}), 400

    # Vérifier si la classe existe déjà
    if Classe.query.filter_by(nom=nom).first():
        return jsonify({'error': 'Classe déjà existante'}), 400

    nouvelle_classe = Classe(nom=nom)
    db.session.add(nouvelle_classe)
    db.session.commit()

    return jsonify({'message': 'Classe ajoutée avec succès', 'classe': nouvelle_classe.to_dict()}), 201


@classe_bp.route('/classes', methods=['GET'])
@jwt_required()
def liste_classes():
    classes = Classe.query.all()
    return jsonify([c.to_dict() for c in classes]), 200

@classe_bp.route('/classes/<int:classe_id>', methods=['PUT'])
@jwt_required()
def update_classe(classe_id):
    data = request.get_json()
    nouvelle_nom = data.get('nom')

    if not nouvelle_nom:
        return jsonify({"message": "Le nom est requis"}), 400

    classe = Classe.query.get(classe_id)
    if not classe:
        return jsonify({"message": "Classe non trouvée"}), 404

    classe.nom = nouvelle_nom
    db.session.commit()

    return jsonify({"message": "Classe modifiée avec succès", "classe": classe.to_dict()}), 200


@classe_bp.route('/classes/<int:classe_id>', methods=['DELETE'])
@jwt_required()
def supprimer_classe(classe_id):
    classe = Classe.query.get(classe_id)
    if not classe:
        return jsonify({"message": "Classe non trouvée"}), 404

    db.session.delete(classe)
    db.session.commit()

    return jsonify({"message": "Classe supprimée avec succès"}), 200

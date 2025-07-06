from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database import db
from models.classe import Classe
from sqlalchemy.exc import SQLAlchemyError
from models.enseignant import Enseignant
classe_bp = Blueprint('classe', __name__)

# 🔹 Ajouter une nouvelle classe
@classe_bp.route('/classes', methods=['POST'])
@jwt_required()
def ajouter_classe():
    try:
        data = request.get_json()

        # Champs requis
        nom = data.get('nom')
        salle = data.get('salle')
        niveau = data.get('niveau')
        annee_scolaire = data.get('annee_scolaire')
        enseignant_principal_id = data.get('enseignant_principal_id')

        if not all([nom, salle, niveau, annee_scolaire]):
            return jsonify({"error": "Champs requis : nom, salle, niveau, année scolaire"}), 400

        # Vérifier si l’enseignant existe (si fourni)
        if enseignant_principal_id:
            enseignant = Enseignant.query.get(enseignant_principal_id)
            if not enseignant:
                return jsonify({"error": "Enseignant principal introuvable"}), 404

        # Création et sauvegarde de la classe
        nouvelle_classe = Classe(
            nom=nom,
            salle=salle,
            niveau=niveau,
            annee_scolaire=annee_scolaire,
            enseignant_principal_id=enseignant_principal_id
        )
        db.session.add(nouvelle_classe)
        db.session.commit()

        return jsonify({"message": "Classe ajoutée", "classe": nouvelle_classe.to_dict()}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de l'ajout : {str(e)}"}), 500

# 🔹 Récupérer la liste de toutes les classes
@classe_bp.route('/classes', methods=['GET'])
@jwt_required()
def lister_classes():
    try:
        classes = Classe.query.all()
        return jsonify([classe.to_dict() for classe in classes]), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Erreur lors de la récupération des classes : {str(e)}"}), 500

# 🔹 Modifier une classe
@classe_bp.route('/classes/<int:classe_id>', methods=['PUT'])
@jwt_required()
def modifier_classe(classe_id):
    try:
        classe = Classe.query.get(classe_id)
        if not classe:
            return jsonify({"error": "Classe non trouvée"}), 404

        data = request.get_json()

        # Mise à jour des champs si fournis
        if 'nom' in data:
            classe.nom = data['nom']
        if 'salle' in data:
            classe.salle = data['salle']
        if 'niveau' in data:
            classe.niveau = data['niveau']
        if 'annee_scolaire' in data:
            classe.annee_scolaire = data['annee_scolaire']
        if 'enseignant_principal_id' in data:
            enseignant = Enseignant.query.get(data['enseignant_principal_id'])
            if not enseignant:
                return jsonify({"error": "Enseignant principal introuvable"}), 404
            classe.enseignant_principal_id = data['enseignant_principal_id']

        db.session.commit()
        return jsonify({"message": "Classe mise à jour", "classe": classe.to_dict()}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la modification : {str(e)}"}), 500

# 🔹 Supprimer une classe
@classe_bp.route('/classes/<int:classe_id>', methods=['DELETE'])
@jwt_required()
def supprimer_classe(classe_id):
    try:
        classe = Classe.query.get(classe_id)
        if not classe:
            return jsonify({"error": "Classe non trouvée"}), 404

        db.session.delete(classe)
        db.session.commit()
        return jsonify({"message": "Classe supprimée avec succès"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la suppression : {str(e)}"}), 500

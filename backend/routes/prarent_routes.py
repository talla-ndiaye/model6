from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models.utilisateur import Utilisateur
from models.enums import RoleUtilisateur

parent_bp = Blueprint('parent', __name__)

@parent_bp.route('/parents', methods=['GET'])
@jwt_required()
def lister_parents():
    try:
        # Pagination optionnelle
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        pagination = Utilisateur.query.filter_by(role=RoleUtilisateur.PARENT).paginate(page=page, per_page=per_page, error_out=False)
        parents = pagination.items

        return jsonify({
            "parents": [parent.to_dict() for parent in parents],
            "total": pagination.total,
            "pages": pagination.pages,
            "page": pagination.page,
            "per_page": pagination.per_page
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erreur lors de la récupération des parents : {str(e)}"}), 500

@parent_bp.route('/parents/<int:parent_id>/enfants', methods=['GET'])
@jwt_required()
def get_enfants_du_parent(parent_id):
    try:
        parent = Utilisateur.query.get(parent_id)
        if not parent:
            return jsonify({"error": "Parent non trouvé"}), 404

        # .enfants est la liste des élèves liés à ce parent
        enfants = parent.enfants

        return jsonify({
            "parent": parent.to_dict(),
            "enfants": [enfant.to_dict() for enfant in enfants]
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erreur lors de la récupération des enfants : {str(e)}"}), 500
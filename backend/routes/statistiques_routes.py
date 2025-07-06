from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from database import db
from models.eleve import Eleve
from models.paiement import Paiement
from sqlalchemy import func

statistiques_bp = Blueprint('statistiques', __name__)

@statistiques_bp.route('/stats', methods=['GET'])
@jwt_required()
def statistiques():
    try:
        total_eleves = Eleve.query.count()

        # Filtrage par sexe commenté (à activer après ajout du champ 'sexe' dans Eleve)
        # total_garcons = Eleve.query.filter(Eleve.sexe == 'M').count()
        # total_filles = Eleve.query.filter(Eleve.sexe == 'F').count()

        total_paiements = db.session.query(func.coalesce(func.sum(Paiement.montant), 0)).scalar()
        paiements_en_retard = Paiement.query.filter(Paiement.est_paye == False).count()

        return jsonify({
            "total_eleves": total_eleves,
            # "total_garcons": total_garcons,
            # "total_filles": total_filles,
            "total_paiements": total_paiements,
            "paiements_en_retard": paiements_en_retard
        })

    except Exception as e:
        return jsonify({"error": f"Erreur lors du calcul des statistiques : {str(e)}"}), 500

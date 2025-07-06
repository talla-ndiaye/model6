from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from database import db
from models.presence import Presence
from models.eleve import Eleve
from models.classe import Classe
from models.enseignant import Enseignant

presence_bp = Blueprint('presence', __name__)

# ➕ Ajouter une présence
@presence_bp.route('/presences', methods=['POST'])
@jwt_required()
def ajouter_presence():
    try:
        data = request.get_json()

        eleve_id = data.get('eleve_id')
        classe_id = data.get('classe_id')
        professeur_id = data.get('professeur_id')
        statut = data.get('statut')  # Ex: "absent" ou "present"
        date_str = data.get('date')
        commentaire = data.get('commentaire')

        if not all([eleve_id, classe_id, professeur_id, statut]):
            return jsonify({'error': 'Champs requis : eleve_id, classe_id, professeur_id, statut'}), 400

        # Vérifier les entités
        eleve = Eleve.query.get(eleve_id)
        if not eleve:
            return jsonify({"error": "Élève introuvable"}), 404

        classe = Classe.query.get(classe_id)
        if not classe:
            return jsonify({"error": "Classe introuvable"}), 404

        professeur = Enseignant.query.get(professeur_id)
        if not professeur:
            return jsonify({"error": "Professeur introuvable"}), 404

        date_presence = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else datetime.today().date()

        presence = Presence(
            eleve_id=eleve.id,
            classe_id=classe.id,
            professeur_id=professeur.id,
            statut=statut,
            date=date_presence,
            justifiee=False,
            motif=None,
            commentaire=commentaire or None
        )

        db.session.add(presence)
        db.session.commit()

        return jsonify({"message": "Présence ajoutée", "presence": presence.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur : {str(e)}"}), 500

# ✏️ Modifier une présence
@presence_bp.route('/presences/<int:id>', methods=['PUT'])
@jwt_required()
def modifier_presence(id):
    try:
        presence = Presence.query.get(id)
        if not presence:
            return jsonify({'error': 'Présence non trouvée'}), 404

        data = request.get_json()

        if 'statut' in data:
            presence.statut = data['statut']
        if 'justifiee' in data:
            presence.justifiee = data['justifiee']
        if 'motif' in data:
            presence.motif = data['motif']
        if 'commentaire' in data:
            presence.commentaire = data['commentaire']
        if 'date' in data:
            try:
                presence.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({"error": "Format de date incorrect (attendu: AAAA-MM-JJ)"}), 400

        db.session.commit()
        return jsonify({"message": "Présence modifiée", "presence": presence.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur : {str(e)}'}), 500

# ❌ Supprimer une présence
@presence_bp.route('/presences/<int:id>', methods=['DELETE'])
@jwt_required()
def supprimer_presence(id):
    try:
        presence = Presence.query.get(id)
        if not presence:
            return jsonify({'error': 'Présence non trouvée'}), 404

        db.session.delete(presence)
        db.session.commit()
        return jsonify({"message": "Présence supprimée"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur lors de la suppression : {str(e)}'}), 500

# 📋 Lister toutes les présences (optionnel: filtrer par classe, élève ou date)
@presence_bp.route('/presences', methods=['GET'])
@jwt_required()
def lister_presences():
    try:
        eleve_id = request.args.get('eleve_id')
        classe_id = request.args.get('classe_id')
        date_str = request.args.get('date')

        query = Presence.query

        if eleve_id:
            query = query.filter_by(eleve_id=eleve_id)
        if classe_id:
            query = query.filter_by(classe_id=classe_id)
        if date_str:
            try:
                date_filter = datetime.strptime(date_str, '%Y-%m-%d').date()
                query = query.filter_by(date=date_filter)
            except ValueError:
                return jsonify({"error": "Format de date incorrect (attendu: AAAA-MM-JJ)"}), 400

        presences = query.all()
        return jsonify([p.to_dict() for p in presences]), 200

    except Exception as e:
        return jsonify({'error': f'Erreur lors de la récupération : {str(e)}'}), 500

# 🔍 Détail d’une présence
@presence_bp.route('/presences/<int:id>', methods=['GET'])
@jwt_required()
def get_presence(id):
    presence = Presence.query.get(id)
    if not presence:
        return jsonify({'error': 'Présence non trouvée'}), 404
    return jsonify(presence.to_dict()), 200

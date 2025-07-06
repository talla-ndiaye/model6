from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.note import Note
from models.eleve import Eleve
from models.matiere import Matiere
from models.enseignant import Enseignant
from database import db

note_bp = Blueprint('note', __name__)

# ➕ Ajouter une note
@note_bp.route('/notes', methods=['POST'])
@jwt_required()
def ajouter_note():
    try:
        data = request.get_json()
        valeur = data.get('valeur')
        type_note = data.get('type')
        periode = data.get('periode')
        eleve_id = data.get('eleve_id')
        matiere_id = data.get('matiere_id')
        enseignant_id = data.get('enseignant_id')

        if not all([valeur, type_note, periode, eleve_id, matiere_id]):
            return jsonify({"error": "Tous les champs sont requis"}), 400

        nouvelle_note = Note(
            valeur=valeur,
            type=type_note,
            periode=periode,
            eleve_id=eleve_id,
            matiere_id=matiere_id,
            enseignant_id=enseignant_id
        )
        db.session.add(nouvelle_note)
        db.session.commit()

        return jsonify({"message": "Note ajoutée avec succès", "note": nouvelle_note.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur : {str(e)}"}), 500

# 📝 Modifier une note
@note_bp.route('/notes/<int:id>', methods=['PUT'])
@jwt_required()
def modifier_note(id):
    try:
        note = Note.query.get(id)
        if not note:
            return jsonify({"error": "Note introuvable"}), 404

        data = request.get_json()
        note.valeur = data.get('valeur', note.valeur)
        note.type = data.get('type', note.type)
        note.periode = data.get('periode', note.periode)
        note.matiere_id = data.get('matiere_id', note.matiere_id)
        note.enseignant_id = data.get('enseignant_id', note.enseignant_id)

        db.session.commit()
        return jsonify({"message": "Note modifiée avec succès", "note": note.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur : {str(e)}"}), 500

# 🗑 Supprimer une note
@note_bp.route('/notes/<int:id>', methods=['DELETE'])
@jwt_required()
def supprimer_note(id):
    try:
        note = Note.query.get(id)
        if not note:
            return jsonify({"error": "Note introuvable"}), 404
        db.session.delete(note)
        db.session.commit()
        return jsonify({"message": "Note supprimée avec succès"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur : {str(e)}"}), 500

# 📋 Liste des notes
@note_bp.route('/notes', methods=['GET'])
@jwt_required()
def lister_notes():
    notes = Note.query.all()
    return jsonify([note.to_dict() for note in notes]), 200

# 🔍 Détail d’une note
@note_bp.route('/notes/<int:id>', methods=['GET'])
@jwt_required()
def detail_note(id):
    note = Note.query.get(id)
    if not note:
        return jsonify({"error": "Note introuvable"}), 404
    return jsonify(note.to_dict()), 200

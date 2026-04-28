import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from roadmap.app import generate_full_roadmap
from quiz.question_engine import generate_questions

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "success",
        "message": "AI Roadmap Service is running 🚀"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy"
    })


@app.route("/generate-roadmap", methods=["POST"])
def generate():
    try:
        data = request.get_json() or {}

        topic = data.get("topic", "").strip()
        level = data.get("level", "Beginner").strip()
        duration = data.get("duration", "3 Months").strip()

        # Validation
        if not topic:
            return jsonify({
                "status": "error",
                "message": "Topic is required"
            }), 400

        result = generate_full_roadmap(topic, level, duration)

        # If AI returned error
        if isinstance(result, dict) and result.get("error"):
            return jsonify({
                "status": "error",
                "message": result.get("error"),
                "details": result.get("details", "")
            }), 500

        return jsonify({
            "status": "success",
            "data": result
        }), 200

    except Exception as e:
        print("FLASK ERROR:", e)
        return jsonify({
            "status": "error",
            "message": "Internal server error",
            "details": str(e)
        }), 500
    
@app.route("/generate-quiz", methods=["POST"])
def generate_quiz():
    try:
        data = request.get_json() or {}

        topic = data.get("topic", "").strip()
        difficulty = data.get("difficulty", "Beginner").strip()
        qtype = data.get("qtype", "Theory").strip()

        if not topic:
            return jsonify({
                "status": "error",
                "message": "Topic is required"
            }), 400

        if not (questions := generate_questions(topic, difficulty, qtype)):
            return jsonify({
                "status": "error",
                "message": "Quiz generation failed"
            }), 500

        return jsonify({
            "status": "success",
            "data": questions
        }), 200

    except Exception as e:
        print("QUIZ ERROR:", traceback.format_exc())
        return jsonify({
            "status": "error",
            "message": "Internal server error",
            "details": str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
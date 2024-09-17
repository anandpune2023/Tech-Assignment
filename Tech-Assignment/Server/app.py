from flask import Flask, jsonify, request, session
from flask_cors import CORS
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from functools import wraps
import json
import datetime
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)

GOOGLE_CLIENT_ID = '894318375330-md7o1eme02ci60mu6adas602h3iflea0.apps.googleusercontent.com'

current_directory = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(current_directory, 'data.json')

def load_reviews():
    with open(file_path, 'r') as file:
        return json.load(file)


def save_reviews(reviews):
    with open(file_path, 'w') as file:
        json.dump(reviews, file, indent=4)


def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
       
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split()[1]  

        if not token:
            return jsonify({"message": "Unauthorized, please log in"}), 403

        try:
            id_info = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
            session['user_info'] = id_info  
        except ValueError:
            return jsonify({"message": "Invalid token"}), 403

        return f(*args, **kwargs)
    return decorated_function

@app.route('/reviews', methods=['GET'])
def get_reviews():
    try:
        reviews = load_reviews()
        return jsonify(reviews), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reviews/<int:review_id>/respond', methods=['POST'])
@token_required
def respond_to_review(review_id):
    try:
        reviews = load_reviews()
        data = request.json
        response_text = data.get('response')

        for review in reviews:
            if review['reviewId'] == review_id:
                review['response'] = {
                    "comment": response_text,
                    "updateTime": datetime.datetime.utcnow().isoformat() + 'Z'
                }
                save_reviews(reviews)
                return jsonify({"message": "Response added successfully!"}), 200
        return jsonify({"message": "Review not found!"}), 404
    except Exception as e:
        return jsonify({"message": f"Error occurred: {str(e)}"}), 500

@app.route('/google-auth', methods=['POST'])
def google_auth():
    token = request.json.get('token')
    try:
        id_info = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        session['google_token'] = token
        session['user_info'] = id_info
        return jsonify({"message": "User authenticated", "user": id_info}), 200
    except ValueError:
        return jsonify({"error": "Invalid token"}), 400

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('google_token', None)
    session.pop('user_info', None)
    return jsonify({"message": "Logged out successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True)

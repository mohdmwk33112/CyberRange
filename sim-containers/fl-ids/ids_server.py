import os
import pickle
import json
import pandas as pd
import xgboost as xgb
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load model and metadata
MODEL_PATH = "federated_ids_model.json" # Using JSON for better compatibility
FEATURE_NAMES_PATH = "feature_names.json"

print(f"Loading feature names from {FEATURE_NAMES_PATH}...")
with open(FEATURE_NAMES_PATH, 'r') as f:
    metadata = json.load(f)
    feature_names = metadata['feature_names']
    class_names = metadata['class_names']

print(f"Loading model from {MODEL_PATH}...")
try:
    # Initialize XGBRegressor or XGBClassifier
    model = xgb.XGBClassifier()
    model.load_model(MODEL_PATH)
    print(f"Final model type: {type(model)}")
except Exception as e:
    print(f"ERROR loading model: {str(e)}")
    model = None

@app.route('/livez', methods=['GET'])
def livez():
    return jsonify({"status": "alive"}), 200

@app.route('/readyz', methods=['GET'])
def readyz():
    if model is None:
        return jsonify({"status": "not_ready", "error": "Model not loaded"}), 503
    return jsonify({"status": "ready"}), 200

@app.route('/startupz', methods=['GET'])
def startupz():
    if os.path.exists(MODEL_PATH) and os.path.exists(FEATURE_NAMES_PATH):
        return jsonify({"status": "started"}), 200
    return jsonify({"status": "failed", "error": "Model files missing"}), 503

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print(f"Received prediction request: {len(data.get('features', [])) if data else 0} features")
        
        if not data or 'features' not in data:
            print("Error: No features provided")
            return jsonify({"error": "No features provided"}), 400

        features = data['features']
        
        if isinstance(features, list):
            if len(features) != len(feature_names):
                print(f"Error: Invalid feature count. Expected {len(feature_names)}, got {len(features)}")
                return jsonify({
                    "error": f"Invalid feature count. Expected {len(feature_names)}, got {len(features)}"
                }), 400
            df = pd.DataFrame([features], columns=feature_names)
        elif isinstance(features, dict):
            df = pd.DataFrame([features])
            for col in feature_names:
                if col not in df.columns:
                    df[col] = 0
            df = df[feature_names]
        else:
            print("Error: Features must be a list or a dictionary")
            return jsonify({"error": "Features must be a list or a dictionary"}), 400

        # Predict
        print("Running model.predict...")
        prediction_idx = model.predict(df)[0]
        prediction_label = class_names[prediction_idx]
        
        # Get probabilities
        print("Running model.predict_proba...")
        probabilities = model.predict_proba(df)[0].tolist()
        prob_dict = {class_names[i]: float(probabilities[i]) for i in range(len(class_names))}

        print(f"Prediction successful: {prediction_label}")
        return jsonify({
            "prediction_index": int(prediction_idx),
            "prediction_label": prediction_label,
            "confidence": float(max(probabilities)),
            "all_probabilities": prob_dict
        })

    except Exception as e:
        print(f"EXCEPTION in predict: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

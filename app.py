from flask import Flask, render_template, request, jsonify
import easyocr
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)
reader = easyocr.Reader(['en'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json['image']
    image_data = base64.b64decode(data.split(',')[1])
    image = Image.open(BytesIO(image_data)).convert('RGB')
    image_np = np.array(image)
    
    results = reader.readtext(image_np)

    predictions = []
    for (bbox, text, confidence) in results:
        predictions.append({'text': text, 'confidence': round(confidence * 100, 2)})

    return jsonify(predictions)

if __name__ == '__main__':
    app.run(debug=True)

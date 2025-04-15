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

    # Convert base64 to grayscale PIL image
    image = Image.open(BytesIO(image_data)).convert('L')  # Grayscale
    image_np = np.array(image)

    # Apply thresholding to enhance text
    _, thresh = cv2.threshold(image_np, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Run OCR with beamsearch for better accuracy
    results = reader.readtext(
        thresh,
        detail=1,
        paragraph=False,
        decoder='beamsearch'
    )

    predictions = []
    for (bbox, text, confidence) in results:
        if confidence > 0.4:  # Filter out low confidence detections
            predictions.append({
                'text': text,
                'confidence': round(confidence * 100, 2)
            })

    return jsonify(predictions)

if __name__ == '__main__':
    app.run(debug=True)
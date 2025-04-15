from flask import Flask, request, jsonify
from flask import send_from_directory
from server import util
import os

app = Flask(__name__, static_folder="../client", template_folder="../client")

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(os.path.join(app.static_folder), filename)

@app.route('/')
def home():
    return app.send_static_file("app.html")

@app.route('/classify_image', methods=['GET','POST'])

def classify_image():
    image_data = request.form.get('image_data')
    response = jsonify(util.classify_image(image_data))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    print("Starting Python Flask Server for Footballer Image Classification")
    util.load_saved_artifacts()
    app.run()


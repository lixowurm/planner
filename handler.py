from flask import Flask, send_from_directory, Blueprint
import os
from pyDepend.address import address
from pyDepend.pdf_creator import pdf_creator
from dotenv import load_dotenv

load_dotenv()

handler = Flask(__name__)
# Register blueprints
handler.register_blueprint(address)
handler.register_blueprint(pdf_creator)

@handler.route('/')
def index():
    return send_from_directory('frontend', 'index.html')

@handler.route('/<path:path>')
def static_files(path):
    return send_from_directory('frontend', path)

if __name__ == '__main__':
     handler.run(debug=True, host='0.0.0.0', port=5000)

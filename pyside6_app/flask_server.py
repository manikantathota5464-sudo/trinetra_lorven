from flask import Flask, jsonify
from models.app_backend import AppBackend

app = Flask(__name__)
backend = AppBackend()

@app.route('/')
def index():
    return "<h1>TRINETHRA API running</h1><p>Use /kpis, /alerts, /cameras etc.</p>"

@app.route('/kpis')
def kpis():
    return jsonify(backend.getDashboardKpis())

@app.route('/cameras')
def cameras():
    return jsonify(backend.getCameras())

@app.route('/alerts')
def alerts():
    return jsonify(backend.getAlerts())

if __name__ == '__main__':
    # Run on localhost port 5000
    app.run(host='127.0.0.1', port=5000)

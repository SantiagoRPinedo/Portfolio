import os
import json
from flask import Flask, render_template, jsonify

app = Flask(__name__)

# --- RUTAS A LAS 4 BASES DE DATOS JSON (Compatibles con Linux y Producción) ---
DATA_PATH = os.path.join('static', 'data', 'data.json')
VLOG_DATA_PATH = os.path.join('static', 'data', 'vlog_data.json')
ARCADE_DATA_PATH = os.path.join('static', 'data', 'arcade_data.json')
FAQ_DATA_PATH = os.path.join('static', 'data', 'faq_data.json')

def cargar_json(ruta):
    """Función genérica y segura para cargar archivos JSON."""
    try:
        with open(ruta, 'r', encoding='utf-8') as archivo:
            return json.load(archivo)
    except FileNotFoundError:
        print(f"ADVERTENCIA: El archivo '{ruta}' no se encontró. Se usarán datos vacíos.")
        return {}
    except json.JSONDecodeError:
        print(f"ERROR: El archivo '{ruta}' tiene un formato incorrecto.")
        return {}

def cargar_datos_portafolio(): return cargar_json(DATA_PATH)
def cargar_datos_vlog(): return cargar_json(VLOG_DATA_PATH)
def cargar_datos_arcade(): return cargar_json(ARCADE_DATA_PATH)
def cargar_datos_faq(): return cargar_json(FAQ_DATA_PATH)

# --- RUTAS DE NAVEGACIÓN ---

@app.route('/')
def home():
    """Landing Page Principal (Profesional)."""
    datos = cargar_datos_portafolio()
    return render_template('index.html', 
                           perfil=datos.get('perfil', {}), 
                           habilidades=datos.get('habilidades', []), 
                           proyectos=datos.get('proyectos_personales', []), 
                           experiencia=datos.get('experiencia', []),
                           contacto=datos.get('contacto', {}),
                           ui_text=datos.get('ui_text', {})
                           )

@app.route('/arcade')
def arcade():
    """Zona de Videojuegos (Carga desde arcade_data.json)."""
    datos_globales = cargar_datos_portafolio()
    datos_arcade = cargar_datos_arcade()
    return render_template('arcade.html', 
                           arcade_games=datos_arcade.get('arcade_games', []),
                           perfil=datos_globales.get('perfil', {}), 
                           contacto=datos_globales.get('contacto', {}),
                           ui_text=datos_globales.get('ui_text', {})
                           )

@app.route('/faq')
def faq():
    """Sección de Preguntas y Respuestas (Carga desde faq_data.json)."""
    datos_globales = cargar_datos_portafolio()
    datos_faq = cargar_datos_faq()
    return render_template('faq.html', 
                           q_and_a=datos_faq.get('q_and_a', []),
                           perfil=datos_globales.get('perfil', {}), 
                           contacto=datos_globales.get('contacto', {}),
                           ui_text=datos_globales.get('ui_text', {})
                           )

@app.route('/vlog')
def vlog():
    """Bitácora Personal y Multimedia (Carga desde vlog_data.json)."""
    datos_globales = cargar_datos_portafolio()
    datos_vlog = cargar_datos_vlog()
    return render_template('vlog.html', 
                           vlog_estatus=datos_vlog.get('vlog_estatus', {}),
                           vlog_winamp=datos_vlog.get('vlog_winamp', {}),
                           instagram=datos_vlog.get('instagram', {}),
                           vlog_posts=datos_vlog.get('vlog_posts', []),
                           perfil=datos_globales.get('perfil', {}), 
                           contacto=datos_globales.get('contacto', {}),
                           ui_text=datos_globales.get('ui_text', {})
                           )

# --- ENDPOINT DE API INTEGRADO (Para main.js y traducciones) ---
@app.route('/api/data')
def get_portfolio_data():
    """Une las 4 bases de datos en una sola respuesta para el Frontend."""
    d_global = cargar_datos_portafolio()
    d_vlog = cargar_datos_vlog()
    d_arcade = cargar_datos_arcade()
    d_faq = cargar_datos_faq()
    
    # El operador ** desempaqueta y fusiona los 4 diccionarios limpiamente
    datos_completos = {**d_global, **d_vlog, **d_arcade, **d_faq}
    return jsonify(datos_completos)

if __name__ == '__main__':
    app.run(debug=True)
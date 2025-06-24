import json
from flask import Flask, render_template

app = Flask(__name__)

# --- Buenas Prácticas: Cargar datos desde JSON ---
def cargar_datos_portafolio():
    """Abre y carga los datos desde el archivo data.json."""
    try:
        with open('data.json', 'r', encoding='utf-8') as archivo:
            return json.load(archivo)
    except FileNotFoundError:
        print("ADVERTENCIA: El archivo 'data.json' no se encontró. Se usarán datos vacíos.")
        return {}
    except json.JSONDecodeError:
        print("ERROR: El archivo 'data.json' tiene un formato incorrecto y no se pudo leer.")
        return {}

@app.route('/')
def home():
    """Ruta principal que renderiza el portafolio."""
    datos = cargar_datos_portafolio()
    
    # Pasamos cada sección del diccionario JSON a la plantilla.
    # Usamos .get() para evitar errores si una clave no existiera en el JSON.
    return render_template('index.html', 
                           perfil=datos.get('perfil', {}), 
                           habilidades=datos.get('habilidades', []), 
                           proyectos=datos.get('proyectos_personales', []), 
                           experiencia=datos.get('experiencia', []),
                           contacto=datos.get('contacto', {}),
                           ui_text=datos.get('ui_text', {})  # <-- ¡LA LÍNEA QUE FALTABA!
                           )

if __name__ == '__main__':
    app.run(debug=True)
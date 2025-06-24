import json
from flask import Flask, render_template

app = Flask(__name__)

# --- Buenas Prácticas: Cargar datos desde JSON ---
# Se separa completamente el contenido de la lógica de la aplicación.
def cargar_datos_portafolio():
    """Abre y carga los datos desde el archivo data.json."""
    try:
        # Usamos 'utf-8' para asegurar la correcta lectura de acentos y caracteres especiales.
        with open('data.json', 'r', encoding='utf-8') as archivo:
            return json.load(archivo)
    except FileNotFoundError:
        # En caso de que el archivo no exista, devolvemos diccionarios vacíos para evitar errores.
        print("ADVERTENCIA: El archivo 'data.json' no se encontró. Se usarán datos vacíos.")
        return {"perfil": {}, "habilidades": {}, "proyectos_personales": [], "experiencia": [], "contacto": {}}
    except json.JSONDecodeError:
        # En caso de que el JSON esté mal formado.
        print("ERROR: El archivo 'data.json' tiene un formato incorrecto y no se pudo leer.")
        return {"perfil": {}, "habilidades": {}, "proyectos_personales": [], "experiencia": [], "contacto": {}}


@app.route('/')
def home():
    """Ruta principal que renderiza el portafolio."""
    datos = cargar_datos_portafolio()
    
    return render_template('index.html', 
                           perfil=datos.get('perfil', {}), 
                           habilidades=datos.get('habilidades', []),
                           proyectos=datos.get('proyectos_personales', []), 
                           experiencia=datos.get('experiencia', []),
                           contacto=datos.get('contacto', {}))

if __name__ == '__main__':
    app.run(debug=True)
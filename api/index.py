import os
import sys

# 1. Determinar rutas absolutas
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, 'backend')

# 2. Agregar al path para que Python encuentre los módulos
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# 3. Importación ESTÁTICA - Crucial para que el bundler de Vercel incluya la carpeta 'backend'
# Al usar 'from backend.main...', Vercel sabe que debe empaquetar esa carpeta.
print(f"Iniciando carga de la aplicación desde {backend_dir}...")
from backend.main import app # noqa

print("Aplicación FastAPI cargada exitosamente.")

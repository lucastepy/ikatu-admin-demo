import os
import sys

# Add the parent directory to sys.path to import models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from database import Base
    import models
except ImportError:
    print("Error: No se pudo importar Base o models. Asegúrate de ejecutar el script desde el directorio raíz o backend.")
    sys.exit(1)

# Mapeo de términos técnicos a descripciones amigables
MAPEO_TERMINOS = {
    'id': 'ID / Identificador',
    'cod': 'Código',
    'codigo': 'Código',
    'nom': 'Nombre',
    'nombre': 'Nombre',
    'dsc': 'Descripción',
    'descripcion': 'Descripción',
    'ruc': 'RUC',
    'doc': 'Documento / CI',
    'documento': 'Documento / CI',
    'razon_social': 'Razón Social',
    'tel': 'Teléfono',
    'telefono': 'Teléfono',
    'dir': 'Dirección',
    'direccion': 'Dirección',
    'fec': 'Fecha',
    'fecha': 'Fecha',
    'est': 'Estado',
    'estado': 'Estado',
    'val': 'Valor / Monto',
    'monto': 'Monto',
    'total': 'Total',
    'obs': 'Observación',
    'observacion': 'Observación',
    'cat': 'Categoría',
    'categoria': 'Categoría',
    'prod': 'Producto',
    'producto': 'Producto',
    'cli': 'Cliente',
    'cliente': 'Cliente',
    'suc': 'Sucursal',
    'sucursal': 'Sucursal',
    'dep': 'Departamento',
    'dis': 'Distrito',
    'ciu': 'Ciudad',
    'bar': 'Barrio',
    'geo': 'Geo-posicionamiento',
    'stock': 'Stock / Existencia',
    'precio': 'Precio',
    'costo': 'Costo',
    'iva': 'IVA',
    'imagen': 'URL de Imagen',
    'tenantid': 'ID de Inquilino (Tenant)',
    'creado_en': 'Fecha de Creación',
    'usuario_alta': 'Usuario que creó',
    'fecha_alta': 'Fecha de alta',
    'usuario_mod': 'Último usuario que modificó',
    'fecha_mod': 'Fecha de última modificación',
}

def adivinar_descripcion(column_name, table_name):
    clean_table = table_name.replace('_', ' ').title().replace(' ', '')
    
    # Manejar ID o COD
    if column_name.endswith('_id') or column_name.endswith('_cod') or column_name == 'id' or column_name == 'codigo':
        return f"Cód.{clean_table}"
    
    # Manejar Nombres
    if column_name.endswith('_nombre') or column_name.endswith('_nom') or column_name == 'nombre' or column_name == 'nombre_comercial':
        return f"Nom.{clean_table}"
    
    # Manejar Descripciones
    if column_name.endswith('_dsc') or column_name.endswith('_descripcion') or column_name == 'descripcion':
        return f"Dsc.{clean_table}"

    # Fallback al mapeo general si no coincide con los patrones especiales
    parts = column_name.split('_')
    clean_name = column_name
    if len(parts) > 1 and len(parts[0]) <= 4:
        clean_name = "_".join(parts[1:])

    if clean_name in MAPEO_TERMINOS:
        return MAPEO_TERMINOS[clean_name]

    return clean_name.replace('_', ' ').capitalize()

def generate_sql():
    output_file = os.path.join(os.path.dirname(__file__), 'apply_comments.sql')
    sql_lines = []
    
    sql_lines.append("-- SCRIPT GENERADO AUTOMÁTICAMENTE PARA COMENTARIOS DE COLUMNAS")
    sql_lines.append("-- Siguiendo formato: Cód.Tabla, Nom.Tabla, Dsc.Tabla")
    sql_lines.append("-- Ejecutar este script en el esquema correspondiente del inquilino\n")

    for table_name, table in Base.metadata.tables.items():
        if table_name.startswith('public.'):
            continue
            
        sql_lines.append(f"-- Tabla: {table_name}")
        for column in table.columns:
            desc = adivinar_descripcion(column.name, table_name)
            sql_lines.append(f"COMMENT ON COLUMN {table_name}.{column.name} IS '{desc}';")
        sql_lines.append("")

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_lines))
    
    print(f"✅ Script SQL generado con éxito en: {output_file}")
    print(f"📝 Se han procesado {len(Base.metadata.tables)} tablas.")
    print("\nInstrucciones:")
    print("1. Abre el archivo generado.")
    print("2. Copia el contenido.")
    print("3. Ejecútalo en tu gestor de base de datos (DBeaver, pgAdmin, etc.).")

if __name__ == "__main__":
    generate_sql()

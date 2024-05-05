import pandas as pd
import bcrypt
from pymongo import MongoClient
from datetime import datetime

client = MongoClient('localhost', 27017)
db_name = 'PAP'

if db_name in client.list_database_names():
    client.drop_database(db_name)

db = client[db_name]

admin_colecc = db['administradores']

def generar_hash_contraseña(contraseña_plana):
    return bcrypt.hashpw(contraseña_plana.encode('utf-8'), bcrypt.gensalt())

admin = {
    'nombre': 'Administrador',
    'apellidos': 'Administrador',
    'usuario': 'admin',
    'pass': generar_hash_contraseña('admin')
}

admin_colecc.insert_one(admin)

print("Administrador creado e insertado correctamente.")
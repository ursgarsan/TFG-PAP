import pandas as pd
from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client['PAP']
prof_colecc = db['profesores']
asign_colecc = db['asignaturas']
grupo_colecc = db['grupos']

datos_prof = pd.read_excel("docs_iniciales/infoProf.xlsx", usecols=[0, 1, 2], header=None)
datos_dep = pd.read_excel("docs_iniciales/infoDep.xlsx", header=None)

capacidades = datos_dep.iloc[1, 11:]
for indice,fila in datos_prof.iterrows():
    profesor = {
        'orden': fila[0],
        'nombre': fila[1],
        'uvus': fila[2],
        'capacidad': capacidades[indice + 11]
    }
    prof_colecc.insert_one(profesor)

print("Datos insertados en la colección 'profesores' de la base de datos 'PAP'.")

asignaturas = datos_dep.iloc[7:, :11]

for indice, fila in asignaturas.iterrows():
    asignatura = {
        'nombre': fila[2],
        'titulacion': fila[0],
        'codigo': fila[1],
        'acronimo': fila[3]
    }

    asignatura_existente = asign_colecc.find_one({
        'nombre': asignatura['nombre'],
        'titulacion': asignatura['titulacion'],
        'codigo': asignatura['codigo'],
        'acronimo': asignatura['acronimo']
    })

    if asignatura_existente is None:
        asign_colecc.insert_one(asignatura)

print("Datos insertados en la colección 'asignaturas' de la base de datos 'PAP'.")

for indice, fila in asignaturas.iterrows():
    horario = []
    if not pd.isnull(fila[9]):
        horario.append(fila[9])
    if not pd.isnull(fila[10]):
        horario.append(fila[10])

    if fila[4] in ['Turno 1', 'Turno 2']:
        tipo = fila[4]
    else:
        tipo = 'T' if fila[4] in ['A', 'B'] else 'L'
    
    grupo = {
        'tipo': tipo,
        'grupo': fila[5],
        'cuatrimestre': fila[6],
        'acreditacion': fila[7]
    }

    if horario:
        grupo['horario'] = horario

    # Buscar la asignatura correspondiente utilizando el acrónimo
    asignatura_correspondiente = asign_colecc.find_one({'acronimo': fila[3]})
    if asignatura_correspondiente:
        grupo['asignatura_id'] = asignatura_correspondiente['_id']
        grupo_colecc.insert_one(grupo)
    else:
        print(f"No se pudo encontrar la asignatura correspondiente al acrónimo '{fila[3]}' para el grupo '{fila[5]}'")

print("Datos insertados en la colección 'grupos' de la base de datos 'PAP'.")
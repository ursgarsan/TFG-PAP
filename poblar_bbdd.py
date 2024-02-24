import pandas as pd
from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client['PAP']
prof_colecc = db['profesores']
asign_colecc = db['asignaturas']

datos_prof = pd.read_excel("docs_iniciales/infoProf.xlsx", usecols=[0, 1, 2], header=None)
datos_dep = pd.read_excel("docs_iniciales/infoDep.xlsx", header=None)

# capacidades = datos_dep.iloc[1, 11:]
# for indice,fila in datos_prof.iterrows():
#     profesor = {
#         'orden': fila[0],
#         'nombre': fila[1],
#         'uvus': fila[2],
#         'capacidad': capacidades[indice + 11]
#     }
#     prof_colecc.insert_one(profesor)

# print("Datos insertados en la colección 'profesores' de la base de datos 'PAP'.")

asignaturas = datos_dep.iloc[8:, :11]
# print(asignaturas)
for indice, fila in asignaturas.iterrows():
    horario = []
    if not pd.isnull(fila[9]):
        horario.append(fila[9])
    if not pd.isnull(fila[10]):
        horario.append(fila[10])
    
    asignatura = {
        'nombre': fila[2],
        'titulacion': fila[0],
        'codigo': fila[1],
        'acronimo': fila[3],
        'cuatrimestre': fila[6],
        'creditos': fila[7],
        'horario': horario
    }
    # print(asignatura)
    asign_colecc.insert_one(asignatura)


print("Datos insertados en la colección 'asignaturas' de la base de datos 'PAP'.")
import pandas as pd
import bcrypt
from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db_name = 'PAP'

if db_name in client.list_database_names():
    client.drop_database(db_name)

db = client[db_name]

admin_colecc = db['administradores']
prof_colecc = db['profesores']
asign_colecc = db['asignaturas']
grupo_colecc = db['grupos']

datos_prof = pd.read_excel("data/infoProf.xlsx", usecols=[0, 1, 2], header=None)
datos_dep = pd.read_excel("data/infoDep.xlsx", header=None)

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

capacidades = datos_dep.iloc[1, 11:]
for indice,fila in datos_prof.iterrows():
    profesor = {
        'orden': fila[0],
        'nombre': fila[1],
        'uvus': fila[2],
        'capacidad': capacidades[indice + 11]
    }
    prof_colecc.insert_one(profesor)

print("Datos insertados en 'profesores' de la base de datos 'PAP'.")

asignaturas = datos_dep.iloc[7:, :11]

for indice, fila in asignaturas.iterrows():
    asignatura = {
        'nombre': fila[2],
        'titulacion': fila[0],
        'codigo': fila[1],
        'acronimo': fila[3],
        'curso': '2023-2024',
        'grupos': []
    }

    asignatura_existente = asign_colecc.find_one({
        'nombre': asignatura['nombre'],
        'titulacion': asignatura['titulacion'],
        'codigo': asignatura['codigo'],
        'acronimo': asignatura['acronimo']
    })

    if asignatura_existente is None:
        asign_colecc.insert_one(asignatura)

print("Datos insertados en 'asignaturas' de la base de datos 'PAP'.")

def formatHorario(horario):
    new_horario = []
    for elemento in horario:
        clases_separadas = elemento.split(' // ')
        for clase in clases_separadas:
            if '-' in clase:
                dia, hora = clase.split(' - ')
            else:
                dia = clase
                hora = None
            if hora is None:
                hora = '18:30 a 19:50'
            else:
                # si no existe hora de fin se le pone la predeterminada con su duración redeterminada (1h y 50min)
                if 'a' not in hora:
                    horas_aux, minutos_aux = hora.split(':')
                    horas_aux = int(horas_aux)
                    minutos_aux = int(minutos_aux)
                    horas_aux += 1
                    minutos_aux += 50
                    if minutos_aux >= 60:
                        minutos_aux -= 60
                        horas_aux +=1
                    hora_aux = f"{horas_aux}:{minutos_aux:02d}"
                    hora = hora + ' a ' + hora_aux
            dias = dia.split(' ')
            new_horario.append({'dias': dias, 'hora': hora})

    return new_horario

for indice, fila in asignaturas.iterrows():
    horario = []
    if not pd.isnull(fila[9]):
        horario.append(fila[9])
    if not pd.isnull(fila[10]):
        horario.append(fila[10])

    if fila[4] in ['Turno 1', 'Turno 2']:
        tipo = fila[4]
    else:
        tipo = 'Teoría' if fila[4] in ['A', 'B'] else 'Laboratorio'
    
    grupo = {
        'tipo': tipo,
        'grupo': fila[5],
        'cuatrimestre': fila[6],
        'acreditacion': fila[7],
        'curso': '2023-2024'
    }

    if horario:
        grupo['horario'] = formatHorario(horario)

    # Buscar la asignatura correspondiente utilizando el acrónimo
    asignatura_correspondiente = asign_colecc.find_one({'codigo': fila[1]})
    if asignatura_correspondiente:
        grupo['asignatura_id'] = asignatura_correspondiente['_id']
        grupo_colecc.insert_one(grupo)
        # Actualizar la lista de grupos de la asignatura
        asign_colecc.update_one(
            {'_id': asignatura_correspondiente['_id']},
            {'$push': {'grupos': grupo['_id']}}
        )
    else:
        print(f"No se pudo encontrar la asignatura correspondiente al codigo '{fila[1]}' para el grupo '{fila[5]}'")

print("Datos insertados en 'grupos' de la base de datos 'PAP'.")

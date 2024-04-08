document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('agregarHorario').addEventListener('click', function() {
    var horarioContainer = document.getElementById('horarioContainer');
    var numHorarios = document.querySelectorAll('.horarioEntry').length;
  
    var newHorarioEntry = document.createElement('div');
    newHorarioEntry.classList.add('horarioEntry');
  
    ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].forEach(function(day) {
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'horario_['+ numHorarios +']_' + day.toLowerCase();
      checkbox.name = `horario[${numHorarios}][dias]`;
      checkbox.value = day;
  
      var label = document.createElement('label');
      label.htmlFor = 'horario_['+ numHorarios +']_' + day.toLowerCase();
      label.textContent = day;
  
      newHorarioEntry.appendChild(checkbox);
      newHorarioEntry.appendChild(label);
      newHorarioEntry.appendChild(document.createElement('br'));
    });
  
    var horaInicioLabel = document.createElement('label');
    horaInicioLabel.htmlFor = 'hora_inicio';
    horaInicioLabel.textContent = 'Hora de inicio:';
    newHorarioEntry.appendChild(horaInicioLabel);
  
    var horaInicioInput = document.createElement('input');
    horaInicioInput.type = 'text';
    horaInicioInput.id = 'hora_inicio';
    horaInicioInput.name = `horario[${numHorarios}][hora_inicio]`;
    horaInicioInput.classList.add('form-control');
    newHorarioEntry.appendChild(horaInicioInput);
    newHorarioEntry.appendChild(document.createElement('br'));
  
    var horaFinLabel = document.createElement('label');
    horaFinLabel.htmlFor = 'hora_fin';
    horaFinLabel.textContent = 'Hora de fin:';
    newHorarioEntry.appendChild(horaFinLabel);
  
    var horaFinInput = document.createElement('input');
    horaFinInput.type = 'text';
    horaFinInput.id = 'hora_fin';
    horaFinInput.name = `horario[${numHorarios}][hora_fin]`;
    horaFinInput.classList.add('form-control');
    newHorarioEntry.appendChild(horaFinInput);
    newHorarioEntry.appendChild(document.createElement('br'));
  
    horarioContainer.appendChild(newHorarioEntry);
  });
  
});


let selectedUVUS = localStorage.getItem('selectedUVUS');

// Función para establecer el uvus y guardarlo en el almacenamiento local
function setSelectedUVUS(uvus) {
  selectedUVUS = uvus;
  localStorage.setItem('selectedUVUS', uvus);
  // Enviar el valor de selectedUVUS al servidor
  fetch('/setSelectedUVUS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ selectedUVUS })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to set selected UVUS');
    }
    // Recargar la página para reflejar el cambio en res.locals
    window.location.reload();
  })
  .catch(error => {
    console.error('Error:', error);
  });
}


function updateNavbar() {
  const selectedUVUSPlaceholder = document.getElementById('selectedUVUSPlaceholder');
  if (selectedUVUSPlaceholder) {
      if (selectedUVUS) {
          selectedUVUSPlaceholder.textContent = selectedUVUS;
      } else {
          selectedUVUSPlaceholder.textContent = 'No UVUS selected';
      }
  } else {
      console.error('No se encontró el elemento #selectedUVUSPlaceholder');
  }
}

function clearSelectedUVUS() {
  selectedUVUS = null;
  localStorage.removeItem('selectedUVUS'); // Elimina el UVUS seleccionado del almacenamiento local
  // Enviar null al servidor para borrar el UVUS seleccionado
  fetch('/setSelectedUVUS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ selectedUVUS: null }) // Envía null para borrar el UVUS
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to clear selected UVUS');
    }
    // Recargar la página para reflejar el cambio en res.locals
    window.location.reload();
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  // Asignar el valor de selectedUVUS a res.locals.selectedUVUS
  fetch('/setSelectedUVUS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ selectedUVUS })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to set selected UVUS');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
});

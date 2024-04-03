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
          selectedUVUSPlaceholder.textContent = '';
      }
  }
}

function clearSelectedUVUS() {
  selectedUVUS = null;
  localStorage.removeItem('selectedUVUS');
  fetch('/setSelectedUVUS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ selectedUVUS: null })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to clear selected UVUS');
    }
    window.location.reload();
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
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

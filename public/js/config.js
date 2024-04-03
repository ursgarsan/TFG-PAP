$(document).ready(function() {
    $('#tablaData').DataTable({
      pagingType: 'simple_numbers',
      language: {
        "sProcessing":     "Procesando...",
        "sLengthMenu":     "Mostrar _MENU_ registros",
        "sZeroRecords":    "No se encontraron resultados",
        "sEmptyTable":     "Ningún dato disponible en esta tabla",
        "sInfo":           "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "sInfoEmpty":      "Mostrando registros del 0 al 0 de un total de 0 registros",
        "sInfoFiltered":   "(filtrado de un total de _MAX_ registros)",
        "sInfoPostFix":    "",
        "sSearch":         "Buscar:",
        "sUrl":            "",
        "sInfoThousands":  ",",
        "sLoadingRecords": "Cargando...",
        "oPaginate": {
            "sFirst":    "Primero",
            "sLast":     "Último",
            "sNext":     "Siguiente",
            "sPrevious": "Anterior"
        },
        "oAria": {
            "sSortAscending":  ": Activar para ordenar la columna de manera ascendente",
            "sSortDescending": ": Activar para ordenar la columna de manera descendente"
        }
      }
    });
    
    $('#tablaData').on('click', 'tr[data-href]', function() {
      window.location.href = $(this).data('href');
    });

    $('#btnDescargar').on('click', function() {
      Swal.fire({
        icon: 'success',
        text: '¡La plantilla se ha descargado correctamente!',
        showConfirmButton: false,
        timer: 1500
      });
    });

    // Verificar si el archivo se cargó correctamente o si hubo un error y mostrar SweetAlert2
    const urlParams = new URLSearchParams(window.location.search);
    const uploaded = urlParams.get('uploaded');
    const error = urlParams.get('error');
    if (uploaded === 'true') {
      Swal.fire({
        icon: 'success',
        text: '¡El archivo se ha cargado correctamente!',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        // Eliminar los parámetros de la URL
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    } else if (uploaded === 'false' && error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error,
        showConfirmButton: true
      }).then(() => {
        // Eliminar los parámetros de la URL
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  });
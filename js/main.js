let dataParsed;
let chartInstance;

fetch('planta.csv')
  .then(response => response.text())
  .then(data => {
    dataParsed = Papa.parse(data, { header: true, dynamicTyping: true }).data;
    // Obtener estamentos únicos
    const estamentosUnicos = [...new Set(dataParsed.map(row => row['Estamento']))];

    // Llenar el select con los estamentos únicos
    const filtroEstamento = document.getElementById('filtroEstamento');
    estamentosUnicos.forEach(estamento => {
      const option = document.createElement('option');
      option.value = estamento;
      option.textContent = estamento;
      filtroEstamento.appendChild(option);
    });
    actualizarGrafico();
    actualizarTabla();
  })
  .then(() => {
    filtroEstamento.addEventListener('change', actualizarGrafico);
  });

function actualizarGrafico() {
  const estamentoSeleccionado = document.getElementById('filtroEstamento').value;
  let datosFiltrados = dataParsed;

  if (estamentoSeleccionado) {
    datosFiltrados = datosFiltrados.filter(row => row['Estamento'] === estamentoSeleccionado);
  }

  const ctx = document.getElementById('myChart').getContext('2d');

  // Destruir el gráfico existente antes de crear uno nuevo
  if (typeof chartInstance !== 'undefined') {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: datosFiltrados.map(row => row['Cargo o función']),
      datasets: [{
        label: 'Remuneración Total',
        data: datosFiltrados.map(row => row['bruto']),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function actualizarTabla() {
  const tablaDetalles = document.getElementById('tablaDetalles');
  const tbody = tablaDetalles.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  const columnasMostrar = [
    'Estamento',
    'Nombre completo',
    'Cargo o función',
    'Grado EUS o jornada',
    'Calificación profesional o formación',
    // 'Región',
    // 'Asignaciones especiales',
    'Remuneración bruta mensualizada',
    // 'Remuneración líquida mensualizada',
    // 'Remuneraciones adicionales',
    'Monto mensual bonificaciones',
    'Derecho a horas extraordinarias',
    // 'Montos y horas extraordinarias diurnas',
    'Monto Horas extraordinarias Diurnas',
    'Hrs Extraordinaria Diurnas',
    // 'Montos y horas extraordinarias nocturnas',
    'Monto hrs extraordinaria nocturna',
    'Hrs extraordinaria Nocturna',
    // 'Montos y horas extraordinarias festivas',
    //'Monto hrs extraordinaria Festiva',
    //'Monto hrs extraordinaria Festiva',
    //'Fecha de inicio dd/mm/aa',
    //'Fecha de término dd/mm/aa',
    // 'Observaciones',
    'bruto'
  ];
  // Crear la cabecera de la tabla
  const thead = tablaDetalles.getElementsByTagName('thead')[0];
  thead.innerHTML = '';
  const trHead = document.createElement('tr');
  columnasMostrar.forEach(columna => {
    const th = document.createElement('th');
    th.textContent = columna;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead); // Agregar la fila de encabezado al encabezado

  dataParsed.forEach(row => {
    const tr = document.createElement('tr');
    columnasMostrar.forEach(columna => {
      const td = document.createElement('td');
      if (columna === 'Nombre completo' && typeof row[columna] === 'string') {
        const nombres = row[columna].split(' ');
        td.textContent = nombres[2];
      }else {
        td.textContent = row[columna];
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  $(document).ready(() => {
    $('#tablaDetalles').DataTable({
      columnDefs: [
        {
          targets: [5, 6, 8, 10,12],
          render: function (data, type) {
            var unformatted = parseFloat(data.replace(/,/g, ''));
            if (type === 'display') {
              return unformatted.toLocaleString('es-ES');
            } else {
              return unformatted;
            }
          },
          type: 'num'
        }
      ]
    });
  });


}

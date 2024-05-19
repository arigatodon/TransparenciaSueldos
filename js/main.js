let chartInstance;
let file;
let dataParsed = [];

document.getElementById('csvFile').addEventListener('change', function(evt) {
  file = evt.target.files[0];
});

document.getElementById('btnCargar').addEventListener('click', function() {
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    transformHeader: header => header.trim(),
    complete: function(results) {
      dataParsed = formatearDatos(results.data);
      cargarEstamentos();
      actualizarGrafico();
      actualizarTabla();
      actualizarTitulo();
    }
  });
});

function cargarEstamentos() {
  const filtroEstamento = document.getElementById('filtroEstamento');
  filtroEstamento.innerHTML = '<option value="">Todos los estamentos</option>';

  const estamentosUnicos = [...new Set(dataParsed.map(row => row['Estamento']))];
  estamentosUnicos.forEach(estamento => {
    const option = document.createElement('option');
    option.value = estamento;
    option.textContent = estamento;
    filtroEstamento.appendChild(option);
  });

  filtroEstamento.addEventListener('change', actualizarGrafico);
}

function actualizarGrafico() {
  const estamentoSeleccionado = document.getElementById('filtroEstamento').value;
  let datosFiltrados = estamentoSeleccionado 
    ? dataParsed.filter(row => row['Estamento'] === estamentoSeleccionado) 
    : dataParsed;

  const ctx = document.getElementById('myChart').getContext('2d');

  // Destruir el gráfico existente antes de crear uno nuevo
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: datosFiltrados.map(row => row['Cargo o funci�n']),
      datasets: [{
        label: 'Remuneración Total',
        data: datosFiltrados.map(row => row['Remuneraci�n bruta mensualizada']),
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
  if ($.fn.DataTable.isDataTable('#tablaDetalles')) {
    $('#tablaDetalles').DataTable().destroy();
  }
  const tablaDetalles = document.getElementById('tablaDetalles');
  const tbody = tablaDetalles.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  const columnasMostrar = [
    'Estamento',
    'Nombre completo',
    'Cargo o funci�n',
    'Grado EUS o jornada',
    'Calificaci�n profesional o formaci�n',
    'Remuneraci�n bruta mensualizada',
    'Monto mensual bonificaciones',
    'Derecho a horas extraordinarias',
    'Montos y horas extraordinarias diurnas',
    'Hrs Extraordinaria Diurnas',
    'Montos y horas extraordinarias nocturnas',
    'Hrs extraordinaria Nocturna',
    'sueldo liquido'
  ];

  const thead = tablaDetalles.getElementsByTagName('thead')[0];
  thead.innerHTML = '';
  const trHead = document.createElement('tr');
  columnasMostrar.forEach(columna => {
    const th = document.createElement('th');
    th.textContent = columna;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);

  dataParsed.forEach(row => {
    const tr = document.createElement('tr');
    columnasMostrar.forEach(columna => {
      const td = document.createElement('td');
      td.textContent = row[columna] !== undefined ? row[columna] : '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  $('#tablaDetalles').DataTable({
    destroy: true
  });
}

function actualizarTitulo() {
  if (dataParsed.length > 0) {
    const fecha = dataParsed[0][Object.keys(dataParsed[0])[1]] + ' ' + dataParsed[0][Object.keys(dataParsed[0])[0]];
    document.querySelector('h1').textContent = 'Sueldos Municipalidad Cartagena ' + fecha;
  }
}

function formatearDatos(datos) {
  return datos.map(d => {
    for (let key in d) {
      if (typeof d[key] === 'string') {
        let valorLimpiado = d[key].replace(/\$|\.|,/g, '').trim();
        d[key] = isNaN(valorLimpiado) ? d[key] : Number(valorLimpiado);
      }
    }
    return d;
  });
}

// Fetch inicial para cargar el archivo por defecto
fetch('planta.csv')
  .then(response => response.text())
  .then(data => {
    dataParsed = formatearDatos(Papa.parse(data, { header: true, dynamicTyping: true }).data);
    cargarEstamentos();
    actualizarGrafico();
    actualizarTabla();
    actualizarTitulo();
  });

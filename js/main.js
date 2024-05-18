fetch('planta.csv')
  .then(response => response.text())
  .then(data => Papa.parse(data, { header: true, dynamicTyping: true }))
  .then(data => {
    const ctx = document.getElementById('myChart').getContext('2d');
    console.log(data)
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.data.map(row => row['Cargo o función']),
        datasets: [{
          label: 'Remuneración Total',
          data: data.data.map(row => row['bruto']),
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
  });
document.addEventListener('DOMContentLoaded', () => {
    const seriesForm = document.getElementById('seriesForm');
    const comicForm = document.getElementById('comicForm');
    const volumeSelect = document.getElementById('volume');
  
    // Cargar series existentes
    fetch('http://localhost:5000/api/series')
      .then(response => response.json())
      .then(series => {
        series.forEach(serie => {
          const option = document.createElement('option');
          option.value = serie.name; // Usar el nombre de la serie como valor
          option.textContent = serie.name; // Mostrar el nombre de la serie
          volumeSelect.appendChild(option);
        });
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al cargar las series');
      });
  
  // Crear una nueva serie
  seriesForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitar que el formulario se envíe de forma tradicional

    const seriesName = document.getElementById('seriesName').value;
    const seriesDescription = document.getElementById('seriesDescription').value;

    // Realizar el POST para crear la serie
    const response = await fetch('http://localhost:5000/api/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: seriesName, description: seriesDescription })
    });

    if (response.ok) {
      alert('Serie creada con éxito');
      seriesForm.reset(); // Limpiar el formulario

      // Recargar la lista de series en el selector de cómics
      const newOption = document.createElement('option');
      newOption.value = seriesName;
      newOption.textContent = seriesName;
      volumeSelect.appendChild(newOption);
    } else {
      alert('Error al crear la serie');
    }
  });
  
  // Crear un nuevo cómic
  comicForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitar que el formulario se envíe de forma tradicional

    const formData = new FormData(comicForm);

    const data = {
      title: formData.get('title'),
      volume: formData.get('volume'), // Nombre de la serie (string)
      coverUrl: formData.get('coverUrl'),
      downloadUrls: formData.get('downloadUrls').split(','),
      editorial: formData.get('editorial'),
      corrector: formData.get('corrector'),
      descripcion: formData.get('descripcion'),
      maqueta: formData.get('maqueta'),
      traductor: formData.get('traductor'),
      pages: formData.get('pages').split(',')
    };

    // Realizar el POST para crear el cómic
    const response = await fetch('http://localhost:5000/api/comics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert('Cómic añadido con éxito');
      comicForm.reset(); // Limpiar el formulario
    } else {
      alert('Error al añadir el cómic');
    }
  });
  });
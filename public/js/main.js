document.addEventListener('DOMContentLoaded', () => {
  const seriesForm = document.getElementById('seriesForm');
  const comicForm = document.getElementById('comicForm');
  const volumeInput = document.getElementById('volume');
  const titleInput = document.getElementById('title');
  const volumeSuggestions = document.getElementById('volumeSuggestions');

  let debounceTimeout;
  let currentSeries = [];

  // Función para buscar series
  const searchSeries = async (query) => {
    try {
      const response = await fetch(`/api/series?search=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Error en la búsqueda');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  // Actualizar sugerencias
  const updateSuggestions = (series) => {
    volumeSuggestions.innerHTML = ''; // Limpiar sugerencias anteriores
    currentSeries = series;

    series.forEach(serie => {
      const option = document.createElement('option');
      option.value = serie.name; // El valor que se mostrará en el datalist
      option.dataset.id = serie._id; // Opcional: para usar el ID si es necesario
      volumeSuggestions.appendChild(option);
    });
  };

  // Búsqueda con debounce
  const debouncedSearch = debounce(async (query) => {
    if (query.length < 2) {
      volumeSuggestions.innerHTML = ''; // Limpiar si la búsqueda es muy corta
      return;
    }

    const results = await searchSeries(query);
    updateSuggestions(results);
  }, 300);

  // Eventos de entrada en el título
  titleInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    // Si el título coincide con una serie existente, sugerir automáticamente
    if (currentSeries.length > 0) {
      const matchingSerie = currentSeries.find(serie =>
        serie.name.toLowerCase().includes(query.toLowerCase())
      );

      if (matchingSerie) {
        volumeInput.value = matchingSerie.name;
      }
    }

    // Realizar búsqueda basada en el título
    debouncedSearch(query);
  });

  // Evento de entrada en el volumen (para búsqueda manual)
  volumeInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    debouncedSearch(query);
  });

  // Crear una nueva serie
  seriesForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const seriesName = document.getElementById('seriesName').value;
    const seriesDescription = document.getElementById('seriesDescription').value;

    const response = await fetch('/api/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: seriesName, description: seriesDescription })
    });

    if (response.ok) {
      alert('Serie creada con éxito');
      seriesForm.reset();

      // Actualizar sugerencias con la nueva serie
      const newSeries = await searchSeries(titleInput.value);
      updateSuggestions(newSeries);
    } else {
      alert('Error al crear la serie');
    }
  });

  // Crear un nuevo cómic
  comicForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(comicForm);
    const data = {
      title: formData.get('title'),
      volume: formData.get('volume'),
      coverUrl: formData.get('coverUrl'),
      downloadUrls: formData.get('downloadUrls').split(','),
      editorial: formData.get('editorial'),
      corrector: formData.get('corrector'),
      descripcion: formData.get('descripcion'),
      maqueta: formData.get('maqueta'),
      traductor: formData.get('traductor'),
      pages: formData.get('pages').split(',')
    };

    const response = await fetch('/api/comics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert('Cómic añadido con éxito');
      comicForm.reset();
    } else {
      alert('Error al añadir el cómic');
    }
  });

  // Función debounce
  function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
});
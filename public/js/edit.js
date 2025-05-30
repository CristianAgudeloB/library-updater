document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const suggestionsList = document.getElementById('suggestionsList');
  const searchTitle = document.getElementById('searchTitle');
  const editComicFormContainer = document.getElementById('editComicFormContainer');
  const editSeriesFormContainer = document.getElementById('editSeriesFormContainer');
  const editComicForm = document.getElementById('editComicForm');
  const editSeriesForm = document.getElementById('editSeriesForm');
  const editVolumeSelect = document.getElementById('editVolume');
  const comicEditBtn = document.getElementById('comicEditBtn');
  const seriesEditBtn = document.getElementById('seriesEditBtn');

  let debounceTimeout;
  let currentResults = [];
  let currentEditType = 'comic'; // 'comic' o 'series'
  let allSeries = []; // Cache para todas las series

  // Cambiar tipo de edición
  comicEditBtn.addEventListener('click', () => {
    currentEditType = 'comic';
    comicEditBtn.classList.add('active');
    seriesEditBtn.classList.remove('active');
    searchTitle.textContent = 'Buscar Cómic';
    searchInput.placeholder = 'Ingresa el título del cómic...';
    clearSearch();
  });

  seriesEditBtn.addEventListener('click', () => {
    currentEditType = 'series';
    seriesEditBtn.classList.add('active');
    comicEditBtn.classList.remove('active');
    searchTitle.textContent = 'Buscar Serie';
    searchInput.placeholder = 'Ingresa el nombre de la serie...';
    clearSearch();
  });

  function clearSearch() {
    searchInput.value = '';
    suggestionsList.style.display = 'none';
    editComicFormContainer.style.display = 'none';
    editSeriesFormContainer.style.display = 'none';
    currentResults = [];
  }

  // Función para obtener sugerencias
  const fetchSuggestions = async (query) => {
    try {
      suggestionsList.innerHTML = '<div class="loading-dots"></div>';
      suggestionsList.style.display = 'block';
      searchInput.classList.add('searching');

      if (currentEditType === 'comic') {
        const url = `/api/comics?title=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        
        const data = await response.json();
        currentResults = data;
        renderSuggestions(data);
      } else {
        // Para series, usamos el cache y filtramos localmente
        if (allSeries.length === 0) {
          const response = await fetch('/api/series');
          if (!response.ok) throw new Error('Error al cargar series');
          allSeries = await response.json();
        }
        
        // Filtrar series localmente
        const filteredSeries = allSeries.filter(series => 
          series.name.toLowerCase().includes(query.toLowerCase())
        );
        
        currentResults = filteredSeries;
        renderSuggestions(filteredSeries);
      }
      
    } catch (error) {
      console.error('Error:', error);
      suggestionsList.innerHTML = `<li class="error">🔍 Error en la búsqueda: ${error.message}</li>`;
    } finally {
      searchInput.classList.remove('searching');
    }
  };

  // Renderizar sugerencias
  const renderSuggestions = (results) => {
    suggestionsList.innerHTML = '';
    
    if (results.length === 0) {
      suggestionsList.innerHTML = `
        <li class="no-results">
          <div>
            <p>No se encontraron resultados</p>
            <small>Intenta con diferentes palabras</small>
          </div>
        </li>`;
      suggestionsList.style.display = 'block';
      return;
    }

    results.forEach((item, index) => {
      const li = document.createElement('li');
      
      if (currentEditType === 'comic') {
        li.innerHTML = `${item.title} <span class="item-type">Cómic</span>`;
      } else {
        li.innerHTML = `${item.name} <span class="item-type">Serie</span>`;
      }
      
      li.dataset.index = index;
      li.addEventListener('click', handleSuggestionClick);
      suggestionsList.appendChild(li);
    });

    suggestionsList.style.display = 'block';
  };

  // Manejar clic en sugerencia
  const handleSuggestionClick = (e) => {
    const index = e.currentTarget.dataset.index;
    const selectedItem = currentResults[index];
    
    if (currentEditType === 'comic') {
      searchInput.value = selectedItem.title;
      populateComicForm(selectedItem);
    } else {
      searchInput.value = selectedItem.name;
      populateSeriesForm(selectedItem);
    }
    
    suggestionsList.style.display = 'none';
  };

  // Llenar formulario de cómic
  const populateComicForm = (comic) => {
    if (!comic || !comic._id) {
      alert('El cómic seleccionado no es válido');
      return;
    }

    document.getElementById('comicId').value = comic._id;
    document.getElementById('editTitle').value = comic.title || '';
    document.getElementById('editVolume').value = comic.volume || '';
    document.getElementById('editCoverUrl').value = comic.coverUrl || '';
    document.getElementById('editDownloadUrls').value = comic.downloadUrls?.join(', ') || '';
    document.getElementById('editEditorial').value = comic.editorial || '';
    document.getElementById('editDescripcion').value = comic.descripcion || '';
    document.getElementById('editMaqueta').value = comic.maqueta || '';
    document.getElementById('editTraductor').value = comic.traductor || '';
    document.getElementById('editCorrector').value = comic.corrector || '';
    document.getElementById('editPages').value = comic.pages?.join(', ') || '';

    editComicFormContainer.style.display = 'block';
    editSeriesFormContainer.style.display = 'none';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // Llenar formulario de serie
  const populateSeriesForm = (series) => {
    if (!series || !series._id) {
      alert('La serie seleccionada no es válida');
      return;
    }

    document.getElementById('seriesId').value = series._id;
    document.getElementById('editName').value = series.name || '';
    document.getElementById('editSeriesDescription').value = series.description || '';
    document.getElementById('editSeriesEditorial').value = series.editorial || '';

    editSeriesFormContainer.style.display = 'block';
    editComicFormContainer.style.display = 'none';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // Debounce
  const debounceSearch = (func, delay) => {
    return (...args) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => func(...args), delay);
    };
  };

  // Manejar entrada de búsqueda
  const handleSearchInput = (e) => {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      suggestionsList.style.display = 'none';
      currentResults = [];
      return;
    }

    fetchSuggestions(query);
  };

  // Event Listeners
  searchInput.addEventListener('input', debounceSearch(handleSearchInput, 300));
  
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
      suggestionsList.style.display = 'none';
    }
  });

  // Cargar series para el select
  const loadSeries = async () => {
    try {
      const response = await fetch('/api/series');
      if (!response.ok) throw new Error('Error al cargar series');
      
      const series = await response.json();
      allSeries = series; // Guardar en cache
      editVolumeSelect.innerHTML = '<option value="">Seleccione un volumen</option>';
      
      series.forEach(serie => {
        const option = new Option(serie.name, serie.name);
        editVolumeSelect.add(option);
      });
    } catch (error) {
      console.error('Error:', error);
      editVolumeSelect.innerHTML = '<option>Error al cargar series</option>';
    }
  };

  // Manejar envío del formulario de cómic
  const handleComicFormSubmit = async (e) => {
    e.preventDefault();
    
    const comicId = document.getElementById('comicId').value;
    if (!comicId) {
      alert('Selecciona un cómic primero');
      return;
    }

    const formData = new FormData(editComicForm);
    const data = {
      title: formData.get('title'),
      volume: formData.get('volume'),
      coverUrl: formData.get('coverUrl'),
      downloadUrls: formData.get('downloadUrls').split(',').map(url => url.trim()),
      editorial: formData.get('editorial'),
      descripcion: formData.get('descripcion'),
      maqueta: formData.get('maqueta'),
      traductor: formData.get('traductor'),
      corrector: formData.get('corrector'),
      pages: formData.get('pages').split(',').map(page => page.trim())
    };

    try {
      const response = await fetch(`/api/comics/${comicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // Manejo mejorado de errores (solo una lectura del cuerpo)
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      alert('¡Cómic actualizado correctamente!');
      clearSearch();
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al actualizar: ${error.message}`);
    }
  };

  // CORRECCIÓN FINAL: Manejar envío del formulario de serie
  const handleSeriesFormSubmit = async (e) => {
    e.preventDefault();
    
    const seriesId = document.getElementById('seriesId').value;
    if (!seriesId) {
      alert('Selecciona una serie primero');
      return;
    }

    const formData = new FormData(editSeriesForm);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      editorial: formData.get('editorial')
    };

    try {
      // CORRECCIÓN DEFINITIVA: Usar la misma ruta que para cómics
      const response = await fetch(`/api/series/${seriesId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // Manejo de errores con una sola lectura del cuerpo
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      // Actualizar cache después de modificar
      const updatedSeries = await response.json();
      const index = allSeries.findIndex(s => s._id === seriesId);
      if (index !== -1) {
        allSeries[index] = updatedSeries;
      }

      alert('¡Serie actualizada correctamente!');
      clearSearch();
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al actualizar: ${error.message}`);
    }
  };

  // Inicialización
  loadSeries();
  editComicForm.addEventListener('submit', handleComicFormSubmit);
  editSeriesForm.addEventListener('submit', handleSeriesFormSubmit);
});
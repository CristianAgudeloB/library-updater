document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const suggestionsList = document.getElementById('suggestionsList');
    const editFormContainer = document.getElementById('editFormContainer');
    const editComicForm = document.getElementById('editComicForm');
    const editVolumeSelect = document.getElementById('editVolume');

    let debounceTimeout;
    let currentComics = []; // Almacena los cómics buscados

    // Función para obtener sugerencias
    const fetchSuggestions = async (query) => {
        try {
            // Mostrar estado de carga
            suggestionsList.innerHTML = '<div class="loading-dots"></div>';
            suggestionsList.style.display = 'block';
            
            // Añadir clase al input
            searchInput.classList.add('searching');
    
            const response = await fetch(`http://localhost:5000/api/comics?title=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            
            const comics = await response.json();
            currentComics = comics;
            renderSuggestions(comics);
            
        } catch (error) {
            console.error('Error:', error);
            suggestionsList.innerHTML = `<li class="error">🔍 Error en la búsqueda</li>`;
        } finally {
            // Quitar estado de carga
            searchInput.classList.remove('searching');
        }
    };

    // Renderizar sugerencias
    const renderSuggestions = (comics) => {
        suggestionsList.innerHTML = '';
        
        if (comics.length === 0) {
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

        comics.forEach((comic, index) => {
            const li = document.createElement('li');
            li.textContent = comic.title;
            li.dataset.index = index; // Almacenamos el índice en currentComics
            li.addEventListener('click', handleSuggestionClick);
            suggestionsList.appendChild(li);
        });

        suggestionsList.style.display = 'block';
    };

    // Manejar clic en sugerencia
    const handleSuggestionClick = (e) => {
        const index = e.target.dataset.index;
        const selectedComic = currentComics[index];
        
        searchInput.value = selectedComic.title;
        suggestionsList.style.display = 'none';
        populateEditForm(selectedComic);
    };

    // Llenar formulario de edición
    const populateEditForm = (comic) => {
        // Validar datos del cómic
        if (!comic || !comic._id) {
            alert('El cómic seleccionado no es válido');
            return;
        }

        // Llenar campos del formulario
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

        // Mostrar formulario
        editFormContainer.style.display = 'block';
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    // Debounce mejorado
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
            currentComics = [];
            return;
        }

        fetchSuggestions(query);
    };

    // Event Listeners
    searchInput.addEventListener('input', debounceSearch(handleSearchInput, 300));
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) {
            suggestionsList.style.display = 'none';
        }
    });

    // Cargar series para el select
    const loadSeries = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/series');
            if (!response.ok) throw new Error('Error al cargar series');
            
            const series = await response.json();
            series.forEach(serie => {
                const option = new Option(serie.name, serie.name);
                editVolumeSelect.add(option);
            });
        } catch (error) {
            console.error('Error:', error);
            editVolumeSelect.innerHTML = '<option>Error al cargar series</option>';
        }
    };

    // Manejar envío del formulario
    const handleFormSubmit = async (e) => {
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
            const response = await fetch(`http://localhost:5000/api/comics/${comicId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar');
            }

            alert('¡Cómic actualizado correctamente!');
            editFormContainer.style.display = 'none';
            searchInput.value = '';
        } catch (error) {
            console.error('Error:', error);
            alert(`Error al actualizar: ${error.message}`);
        }
    };

    // Inicialización
    loadSeries();
    editComicForm.addEventListener('submit', handleFormSubmit);
});
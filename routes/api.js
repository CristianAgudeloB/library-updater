const express = require('express');
const router = express.Router();
const Comic = require('../models/Comic');
const SeriesInfo = require('../models/SeriesInfo');

// Obtener todas las series
router.get('/series', async (req, res) => {
  try {
    const series = await SeriesInfo.find();
    res.json(series);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear una nueva serie
router.post('/series', async (req, res) => {
  const { name, description, editorial } = req.body; // Añadido editorial
  try {
    const newSeries = new SeriesInfo({ name, description, editorial });
    await newSeries.save();
    res.status(201).json(newSeries);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Actualizar una serie por ID
router.put('/series/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, editorial } = req.body;
  
  try {
    const updatedSeries = await SeriesInfo.findByIdAndUpdate(
      id,
      { name, description, editorial },
      { new: true, runValidators: true }
    );
    
    if (!updatedSeries) {
      return res.status(404).json({ message: 'Serie no encontrada' });
    }
    
    res.json(updatedSeries);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Crear un nuevo cómic
router.post('/comics', async (req, res) => {
  const { title, volume, coverUrl, downloadUrls, editorial, corrector, descripcion, maqueta, traductor, pages } = req.body;

  try {
    // Buscar la serie por su nombre
    const series = await SeriesInfo.findOne({ name: volume });

    if (!series) {
      return res.status(404).json({ message: 'La serie no existe' });
    }

    // Crear el nuevo cómic
    const newComic = new Comic({
      title,
      volume, // Nombre de la serie (string)
      coverUrl,
      downloadUrls,
      editorial,
      corrector,
      descripcion,
      maqueta,
      traductor,
      pages
    });
    await newComic.save();

    // Asociar el cómic a la serie
    series.comics.push(newComic._id);
    await series.save();

    res.status(201).json(newComic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtener cómics (si se pasa el query "title" se busca por similitud, de lo contrario se devuelven todos)
router.get('/comics', async (req, res) => {
  const { title } = req.query;
  try {
    let comics;
    if (title) {
      // Busca por título de manera parcial, sin importar mayúsculas/minúsculas
      comics = await Comic.find({ title: { $regex: title, $options: 'i' } });
    } else {
      comics = await Comic.find();
    }
    res.json(comics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar un cómic (PUT)
router.put('/comics/:id', async (req, res) => {
  const { id } = req.params;
  const { title, volume, coverUrl, downloadUrls, editorial, corrector, descripcion, maqueta, traductor, pages } = req.body;
  try {
    const updatedComic = await Comic.findByIdAndUpdate(
      id,
      { title, volume, coverUrl, downloadUrls, editorial, corrector, descripcion, maqueta, traductor, pages },
      { new: true, runValidators: true }
    );
    if (!updatedComic) {
      return res.status(404).json({ message: 'Cómic no encontrado' });
    }
    res.json(updatedComic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
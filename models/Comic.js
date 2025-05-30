const mongoose = require('mongoose');

const ComicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    volume: { type: String, required: true },
    coverUrl: { type: String, required: true },
    downloadUrls: [{ type: String, required: true }],
    corrector: { type: String, required: true },
    descripcion: { type: String, required: true },
    maqueta: { type: String, required: true },
    traductor: { type: String, required: true },
    pages: [{ type: String }]
  }, { collection: 'Library Info' });



module.exports = mongoose.model('Comic', ComicSchema);
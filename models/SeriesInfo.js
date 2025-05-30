const mongoose = require('mongoose');

const SeriesInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  comics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comic' }],
  editorial: { type: String, required: true }
},  { collection: 'series_info' });

module.exports = mongoose.model('SeriesInfo', SeriesInfoSchema);
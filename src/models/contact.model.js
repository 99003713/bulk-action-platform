const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  age: Number,
  status: String,
});

module.exports = mongoose.model('Contact', contactSchema);
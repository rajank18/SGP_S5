const mongoose = require('mongoose');

const demoSchema = new mongoose.Schema({
  name: String,
  age: Number
});

module.exports = mongoose.model('Demo', demoSchema);

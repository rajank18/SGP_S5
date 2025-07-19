// const mongoose = require('mongoose');

// const demoSchema = new mongoose.Schema({
//   name: String,
//   age: Number
// });

// module.exports = mongoose.model('Demo', demoSchema);

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Demo = sequelize.define('Demo', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Demo;
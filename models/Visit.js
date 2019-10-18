const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const visitSchema = new Schema({
  visit: Number,
},
{
  timestamps: true,
})

const Visit = mongoose.model('Visit', visitSchema);

module.exports = Visit;
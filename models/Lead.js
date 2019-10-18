const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leadSchema = new Schema({
  lead: Number,
},
{
  timestamps: true,
})

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
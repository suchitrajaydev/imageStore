const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const photoSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  modifiedDate: {
    type: Date,
    default: Date.now
  },
  album: {
      type: Schema.Types.ObjectId,
      ref: 'Album'
  }
});

module.exports = Photo = mongoose.model('photo', photoSchema);
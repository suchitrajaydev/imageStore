const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const albumSchema = new Schema({
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
  photos: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Photo'
    }
  ]
});

module.exports = Album = mongoose.model('album', albumSchema);

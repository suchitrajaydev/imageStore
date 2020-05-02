const mongoose = require('mongoose');
const Album = require('./models/Album');
const Photo = require('./models/Photo');

const express = require('express');
const bodyParser = require('body-parser');
const querystring = require('querystring');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

// Connect to MongoDB
// TODO: expose mogo url as env variable
mongoose
  .connect(
    'mongodb://mongo:27017/docker-node-mongo',
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Album services

app.get('/albums', async (req, res) => {
  res.json({
    albums: await Album.find()
  })
});

app.post('/album/create', async (req, res) => {
  const newAlbum = await new Album({
    name: req.body.name,
    createdDate: req.body.createdDate
  });

  newAlbum.save();
  res.json({
    albums: newAlbum
  });
});

app.delete('/album/:id', async (req, res) => {
  await Album.findById(req.params.id, async (err, album) => {
    await Photo.remove({
      "_id": {
        $in: album.photos
      }
    })
  });

  await Album.deleteOne({ _id: req.params.id }, function (err) {
    if(err) console.log(err);
    console.log("Successful deletion");
  });

  res.json({
    albums: await Album.find(),
    photos: await Photo.find()
  })
});

// Photo Services

app.get('/photos/:id', async (req, res) => {
  res.json({
    photosInAlbum: await Photo.find({ album: req.params.id })
  })
});

app.post('/photo/create', async (req, res) => {
  const newPhoto = await new Photo({
    name: req.body.name,
    createdDate: req.body.createdDate,
    album: await Album.findOne({name: req.body.albumName})
  });

  newPhoto.save();

  Album.findOne({name: req.body.albumName})
    .then(album => {
      album.photos.push(newPhoto);
      album.save();
    })

  res.json({
    photos: await Photo.find()
  });
});

app.delete('/photo/:photoId/:albumId', async (req, res) => {
  const photo = await Album.findByIdAndUpdate(
    req.params.albumId,
    {
      $pull: { photos: req.params.photoId },
    },
    { new: true }
  );

  if (!photo) {
    return res.status(400).send("photo not found");
  }

  await Photo.findByIdAndDelete(req.params.photoId);

  res.json({
    photo: await Photo.find()
  })
});

const port = 3000;

app.listen(port, () => console.log('Server running...'));

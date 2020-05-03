const kafka = require('kafka-node');
const mongoose = require('mongoose');
const Album = require('./models/Album');
const Photo = require('./models/Photo');

const express = require('express');
const bodyParser = require('body-parser');
const querystring = require('querystring');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

// Kafka
try {
  var Producer = kafka.Producer,
      Consumer = kafka.Consumer,
    client = new kafka.KafkaClient({kafkaHost: 'kafka:9092'}),
    producer = new Producer(client);

  var kafka_topic = "album";

  // var createTopics = [{
  //   topic: kafka_topic,
  //   partitions: 1,
  //   replicationFactor: 1
  // }]

  producer.on('ready', function () {
    console.log("Producer is ready to send message!");
  });

  producer.on('error', function (err) {
    console.log(err);
  })

  setTimeout(() => {
    consumer = new Consumer(
      client,
      [
          { topic: kafka_topic }
      ]
    );
  
    consumer.on('message', function (message) {
      console.log(`From Consumer ${JSON.stringify(message)}`);
    });
  
    consumer.on('error', function (e) {
      console.log(`From Consumer Error ${e}`);
    });
  }, 30000)


}catch (e) {
  console.log("Producer refuses to come up!!");
}

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
  try {
    const payloads = [{
      topic: kafka_topic,
      messages: `${req.body.name} album created!`,
      partition: 0
    }];
  
    const newAlbum = await new Album({
      name: req.body.name,
      createdDate: req.body.createdDate
    });

    await newAlbum.save();

    producer.send(payloads, (err, data) => {
      console.log("payload data!", JSON.stringify(data));
      res.json({
        albums: newAlbum
      });
    })
  }catch(e) {
    console.log("could not create an album!");
  }
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

"use strict";
const kafka = require('kafka-node');
const express = require("express");
let router = express.Router();

const Album = require('../models/Album');
const Photo = require('../models/Photo');

// Kafka
try {
	var Producer = kafka.Producer,
		Consumer = kafka.Consumer,
		client = new kafka.KafkaClient({kafkaHost: 'kafka:9092'}),
		producer = new Producer(client);

	var kafka_topic = "albumCreate";
  
	producer.on('ready', function () {
	  console.log("Producer is ready to send message!");
	});
  
	producer.on('error', function (err) {
	  console.log(err);
	})
  }catch (e) {
	console.log("Producer refuses to come up!!");
  }

// Album services
router.get('/', async (req, res) => {
	res.json({
		albums: await Album.find()
	})
});

router.post('/create', async (req, res) => {
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
	} catch (e) {
		console.log(`could not create an album! ${e}`);
	}
});

router.delete('/:id', async (req, res) => {
	await Album.findById(req.params.id, async (err, album) => {
		await Photo.remove({
			"_id": {
				$in: album.photos
			}
		})
	});

	await Album.deleteOne({
		_id: req.params.id
	}, function (err) {
		if (err) console.log(err);
		console.log("Successful deletion");
	});

	res.json({
		albums: await Album.find(),
		photos: await Photo.find()
	})
});

module.exports = router;
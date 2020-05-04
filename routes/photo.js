"use strict";
const express = require("express");
let router = express.Router();

const Album = require('../models/Album');
const Photo = require('../models/Photo');

// Photo Services
router.get('/:id', async (req, res) => {
	res.json({
		photosInAlbum: await Photo.find({
			album: req.params.id
		})
	})
});

router.post('/create', async (req, res) => {
	const newPhoto = await new Photo({
		name: req.body.name,
		createdDate: req.body.createdDate,
		album: await Album.findOne({
			name: req.body.albumName
		})
	});

	newPhoto.save();

	Album.findOne({
			name: req.body.albumName
		})
		.then(album => {
			album.photos.push(newPhoto);
			album.save();
		})

	res.json({
		photos: await Photo.find()
	});
});

router.delete('/:photoId/:albumId', async (req, res) => {
	const photo = await Album.findByIdAndUpdate(
		req.params.albumId, {
			$pull: {
				photos: req.params.photoId
			},
		}, {
			new: true
		}
	);

	if (!photo) {
		return res.status(400).send("photo not found");
	}

	await Photo.findByIdAndDelete(req.params.photoId);

	res.json({
		photo: await Photo.find()
	})
});

module.exports = router;
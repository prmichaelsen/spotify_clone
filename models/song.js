var mongoose = require('mongoose');

module.exports = mongoose.model('Song',{ 
	song_title: String,
	artist_title: String,
	album_title: String,
	id: Number
});

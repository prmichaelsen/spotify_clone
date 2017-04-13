var express = require('express');
var bodyParser = require('body-parser'); //require BEFORE express() call
var app = express();
var util  = require('util');
var spawn = require('child_process').spawn;
var http = require('http');
var request = require('request');
var uuid = require('uuid4'); 
var mongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var Songs = require('./models/song');
var passport = require('passport'); 
var flash = require('connect-flash');
var session = require('express-session');
var ejs = require('ejs');

//for parsing req body
app.use(bodyParser.urlencoded({extended: true}));

//teach app to read json
app.use(bodyParser.json());

//for setting the view engine template type
app.set('view engine','ejs');

app.use(session({secret: process.env.REGRETIT_SESSION_SECRET}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


//for mapping public route
app.use('/spotify', express.static(__dirname + '/public'))

require("jsdom").env("", function(err, window) {     
	if (err) {         
		console.error(err);         
		return;     
	}      
	var $ = require("jquery")(window); 

	const MONGO_USER = process.env.REGRETIT_MONGO_USER;
	const MONGO_PASSWORD = process.env.REGRETIT_MONGO_PASSWORD;
	const MONGO_HOST = process.env.REGRETIT_MONGO_HOST;
	const mongodbUri = 'mongodb://'+MONGO_USER+':'+MONGO_PASSWORD+'@'+MONGO_HOST;

	mongoose.connect(mongodbUri);


	app.get('/spotify/', function (req,res){
		var page = "master"
		res.render(page,{ name : page, view: req.body });
	}); 

	app.post('/spotify/reload/', function (req,res){
		var page = "reload"
		res.render(page, { name : page, view: req.body });
	}); 

	/* Handle get search data */
	app.get('/spotify/songs', function(req, res) { 
		Songs.find({},function(err, results) { 
			return res.json(results);
		});
	});

	app.post('/spotify/play', function(req,res){ 
		var view = req.body;
		Songs.findOne({"_id":view.current_song.id }, function(err, song) {
			// In case of any error, return using the done method
			if (err){
				console.log("err",err);
				return;
			}
			// already exists
			if (song) {
				view.current_song.song_title = song.song_title;
				view.current_song.album_title = song.album_title;
				view.current_song.artist_title = song.artist_title;
				view.current_song.id = song._id;
				console.log("song",song);
			} else {
				console.log("no such song");
			}
		});
		var page = "reload"
		res.render(page, { name : page, view: req.body });
	});

	app.listen(process.env.SPOTIFY_CLONE_PORT, function(){
		console.log(
			"Express server listening on port %d",process.env.SPOTIFY_CLONE_PORT)
	});

});

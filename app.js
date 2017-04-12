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
		console.log(req.body);
		res.render(page,{ name : page, view: req.body });
	}); 

	app.post('/spotify/content/', function (req,res){
		var page = "content"
		console.log(req.body);
		res.render(page, { name : page, view: req.body });
	}); 

	app.post('/spotify/navigation/', function (req,res){
		var page = "navigation"
		console.log(req.body);
		res.render(page, { name : page, view: req.body });
	}); 

	app.post('/spotify/player/', function (req,res){
		var page = "player"
		console.log(req.body);
		res.render(page, { name : page, view: req.body });
	}); 

	app.listen(process.env.SPOTIFY_CLONE_PORT, function(){
		console.log(
			"Express server listening on port %d",process.env.SPOTIFY_CLONE_PORT)
	});

});

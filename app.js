var express = require('express');
var app = express();
var util  = require('util');
var spawn = require('child_process').spawn;
var http = require('http');
var request = require('request');
var uuid = require('uuid4');
var passport = require('passport');
var RedditStrategy = require('passport-reddit').Strategy;
 

//for setting the view engine template type
app.set('view engine','ejs');


require("jsdom").env("", function(err, window) {     
	if (err) {         
		console.error(err);         
		return;     
	}      
	var $ = require("jquery")(window); 

	CLIENT_ID = process.env.REGRETIT_CLIENT_ID;
	CLIENT_SECRET =   process.env.REGRETIT_CLIENT_SECRET;
	REDIRECT_URI = "http://www.patrickmichaelsen.com/regretit/reddit_callback";

	passport.use(new RedditStrategy({     
		clientID: CLIENT_ID,     
		clientSecret: CLIENT_SECRET,     
		callbackURL: REDIRECT_URI   
	},  
	function(accessToken, refreshToken, profile, done) {     
		User.findOrCreate({ redditId: profile.id }, function (err, user) {       
			return done(err, user);     
		});   
	} 
	));

app.get('/regretit/', function (req,res){
	//build authorize request
	var state = uuid();
	var params = {"client_id": CLIENT_ID,
		"response_type": "code",
	"state": state,
	"redirect_uri": REDIRECT_URI,
	"duration": "permanent",
	"scope": "identity edit read history"};
	var login = "https://ssl.reddit.com/api/v1/authorize?" + $.param(params); 
	res.render("index.ejs", {login: login});
});

app.get('/regretit/run', function (req,res){
	var py = spawn('python',['/home/user/shreddit/shreddit.py','-r',req.query.refresh_token])
	py.stdout.on('data', function(data) { 
		console.log('stdout: '+ data);
		res.write('stdout: '+ data);
	});
py.on('close' , function(code){
	res.end();
});
});


app.get('/regretit/about', function (req, res){ 
	res.send(
		"<h3>Shreddit</h3>This is a webservice for deleting your reddit history. This webservice will delete reddit comments and submissions with less than 20 points excepting any gilded posts.<br>You must specifiy user and password as URL parameters.<br>e.g. patrickmichaelsen.com/shreddit?user=myname&password=mypass<br><br>The page will take a long time to load. Be patient to see the output.<br><br>See the source code here: <a href='https://github.com/x89/Shreddit'>https://github.com/x89/Shreddit</a> <br><br>"
		);
});


app.get('/regretit/reddit_callback', function (req, res) {
	//	passport.authenticate('reddit', {	
	//		successRedirect: '/regretit/welcome',
	//		failureRedirect: '/regretit/authorize'
	//	})(req, res, function(){
	//	});

	//res.write(req.query);

	if(req.query.code){
		var py = spawn('python',['/home/user/regretit/get_oauth.py',req.query.code]);
		py.stdout.on('data', function(data) { 
			console.log('stdout: '+ data);
			res.write("<a href='http://www.patrickmichaelsen.com/regretit/run?refresh_token="+data+ "'>Run</a>");
		});
		py.on('close' , function(code){
			res.end();
		});
	}
	else if(req.query.error)
{

	res.send("Login failed. Back to <a href='http://www.patrickmichaelsen.com/regretit'>Regretit</a>");
}else{
	res.send("Unknown error. Back to <a href='http://www.patrickmichaelsen.com/regretit'>Regretit</a>");
}

});

app.get('/regretit/welcome', function (req, res) {
	res.send(req);
});

app.get('/regretit/authorize', function (req, res) {

	var state = uuid();
	var params = {"client_id": CLIENT_ID,
		"response_type": "code",
	"state": state,
	"redirect_uri": REDIRECT_URI,
	"duration": "permanent",
	"scope": "identity edit read history"};
	url = "https://ssl.reddit.com/api/v1/authorize?" + $.param(params);

	res.send("<a href="+url+">Authorize Regretit</a>");
});



app.listen(4545, function() {
	console.log('Listening...');
});

});

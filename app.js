var express = require('express');
var app = express();
var util  = require('util');
var spawn = require('child_process').spawn;
var http = require('http');
var request = require('request');
var uuid = require('uuid4'); 

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


app.get('/regretit/reddit_callback', function (req, res) {
	if(req.query.code){
		var py = spawn('python',['/home/user/regretit/get_oauth.py',req.query.code]);
		py.stdout.on('data', function(data) { 
			res.render('settings', { refresh_token: data });
		});
	}
	else if(req.query.error)
	{
		res.redirect('/regretit/');
	}

});

app.listen(process.env.REGRETIT_PORT, function() {
	console.log('Listening...');
});

});

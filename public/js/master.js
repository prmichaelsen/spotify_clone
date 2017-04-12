
$(document).ready(()=>{ 

	app.set = function(prop, value){
		if(typeof(app.state[prop]) === 'undefined'){
			app.state[prop] = value;
		}
	}

	app.set("location", "Home");
	app.set("song_title", ""); 
	app.set("song_artist", "");
	app.set("my_item", "sup world"); 

	reload(app.state, function(){
		
		attach_events();
		
	});


});

var app = {
	state: {
		songs: [
			
			{
				song_title: "R U Mine?",
				artist_title: "Arctic Monkeys",
				album_title: "A.M.", 
			},
			
			{
				song_title: "Feel Good, Inc.",
				artist_title: "Gorillaz",
				album_title: "Demon Days", 
			},
			
			{
				song_title: "American Idiot",
				artist_title: "Green Day",
				album_title: "American Idiot", 
			},
		],
	},
};

var defined = function(variable){
	return !(typeof(variable) === 'undefined');
}

var reload = function(state, callback){
	render("content", state, callback ); 
	render("player", state, callback ); 
	render("navigation", state, callback ); 
};

var render = function(name, data, callback){
	data.name = name;
	$.ajax({
		url: "http://patrickmichaelsen.com/spotify/"+name,
		data, 
		type: "POST",
		success: (html)=>{
			$("."+name).html(html); 
			callback();
		}
	}); 
}


var attach_events = function(){
	$("#menu_btn").on('click', function(){ 
		app.state.location = "Menu";
		reload(app.state, attach_events);
	}); 

	$("#home_btn").on('click', function(){ 
		app.state.location = "Home";
		reload(app.state, attach_events);
	}); 
	$("#songs_btn").on('click', function(){ 
		app.state.location = "Songs";
		reload(app.state, attach_events);
	}); 

	$(".nav_back").on('click', function(){ 
		reload(app.state, attach_events);
	}); 

}

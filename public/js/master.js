
$(document).ready(()=>{ 

	app.set = function(prop, value){
		if(typeof(app.state[prop]) === 'undefined'){
			app.state[prop] = value;
		}
	}

	app.set("location", "Songs");

	reload(app.state, function(){
		attach_events(); 
	}); 

});

var app = {
	state: {
		current_song: {
			playing: false,
			song_title: "R U Mine?",
			artist_title: "Arctic Monkeys",
			album_title: "A.M.", 
			id: 0,
		},
		songs: [
			
			{
				song_title: "R U Mine?",
				artist_title: "Arctic Monkeys",
				album_title: "A.M.", 
				id: 0,
			},
			
			{
				song_title: "Feel Good, Inc.",
				artist_title: "Gorillaz",
				album_title: "Demon Days", 
				id: 1,
			},
			
			{
				song_title: "American Idiot",
				artist_title: "Green Day",
				album_title: "American Idiot", 
				id: 2,
			},

			{
				song_title: "You Probably Couldn't See for the Lights But You Were Looking Right at Me",
				artist_title: "Arctic Monkeys",
				album_title: "Whatever People Say That's What I'm Not", 
				id: 3,
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
			app.state.last_location = (app.state.location === "Menu")? app.state.last_location : app.state.location;
			app.state.location = "Menu" ;
			reload(app.state, attach_events);
		}); 

		$("#home_btn").on('click', function(){ 
			app.state.location = app.state.last_location;
			reload(app.state, attach_events);
		}); 

		$("#songs_btn").on('click', function(){ 
			app.state.location = "Songs";
			reload(app.state, attach_events);
		}); 

		$("#play_pause").on('click', function(){ 
			app.state.current_song.playing = !app.state.current_song.playing;
			reload(app.state, attach_events);
		}); 

		$(".play_song").on('click', function(){ 
			app.state.current_song.playing = !app.state.current_song.playing;
			reload(app.state, attach_events);
		}); 

		$(".nav_back").on('click', function(){ 
			reload(app.state, attach_events);
		}); 

}

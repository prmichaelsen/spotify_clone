
$(document).ready(()=>{ 

	app.set = function(prop, value){
		if(typeof(app.state[prop]) === 'undefined'){
			app.state[prop] = value;
		}
	}

	app.set("location", "Songs");

	call_get("songs", {}, function(data){
		app.state.songs = data;
		render();
	});

	reload("reload", app.state, function(){
		attach_events(); 
	}); 

});

var app = {
	state: {
		playing: false,
		current_song: {
			song_title: "R U Mine?",
			artist_title: "Arctic Monkeys",
			album_title: "A.M.", 
			id: 3,
		},
		songs: [], 
	},
};

var defined = function(variable){
	return !(typeof(variable) === 'undefined');
}

var reload = function(name, data, callback){
	data.name = "reload";
	$.ajax({
		url: "http://patrickmichaelsen.com/spotify/"+name,
		data, 
		type: "POST",
		success: (html)=>{
			$(".reload").html(html); 
			callback();
		}
	}); 
} 

var render = function(callback){ 
	reload("reload",app.state,callback);
}

var call_get = function(route, data, callback){
	$.ajax({
		url: "http://patrickmichaelsen.com/spotify/"+route,
		data: data, 
		type: "GET",
		success: (json)=>{
			callback(json);
		}
	}); 
}

var attach_events = function(){ 

		$("#menu_btn").on('click', function(){ 
			app.state.last_location = (app.state.location === "Menu")? app.state.last_location : app.state.location;
			app.state.location = "Menu" ;
			reload("reload", app.state, attach_events);
		}); 

		$("#home_btn").on('click', function(){ 
			app.state.location = app.state.last_location;
			reload("reload", app.state, attach_events);
		}); 

		$("#songs_btn").on('click', function(){ 
			app.state.location = "Songs";
			reload("reload", app.state, attach_events);
		}); 

		$("#play_pause").on('click', function(){ 
			app.state.playing = !app.state.playing;
			reload("reload", app.state, attach_events);
		}); 

		$(".play_song").on('click', function(event){ 
			app.state.playing = true;
			app.state.current_song._id = $(event.currentTarget).data("song-id");
			reload("play", app.state, attach_events);
		}); 

		$(".pause_song").on('click', function(event){ 
			app.state.playing = false;
			reload("reload", app.state, attach_events);
		}); 

		$(".nav_back").on('click', function(){ 
			reload("reload", app.state, attach_events);
		}); 
}

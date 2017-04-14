
$(document).ready(()=>{ 

	app.set = function(prop, value){
		if(typeof(app.state[prop]) === 'undefined'){
			app.state[prop] = value;
		}
	}

	app.set("location", "Songs");

	call_get("songs", {}, function(data){
		app.state.songs = (data)? data : [];
		render();
	});

	reload("reload", app.state, function(){
		attach_events(); 
	}); 

});

var app = {
	state: {
		playing: false,
		loop: false,
		current_song: {
			song_title: "R U Mine?",
			artist_title: "Arctic Monkeys",
			album_title: "A.M.", 
			_id: '58eee43c734d1d271d386885',
		},
		songs: [], 
	},
	audio: {},
};

var defined = function(variable){
	return !(typeof(variable) === 'undefined');
}

var reload = function(name, data, callback){
	data.name = "reload";
	var content_scroll = $('.content').scrollTop();
	$.ajax({
		url: "http://patrickmichaelsen.com/spotify/"+name,
		data, 
		type: "POST",
		success: (html)=>{
			$(".reload").html(html); 
			$('.content').scrollTop(content_scroll);
			
			var audio_src = "https://s3-us-west-1.amazonaws.com/patrickmichaelsen/" + app.state.current_song._id + ".mp3";
			if(typeof(app.audio) !== 'undefined' ){
				if (!(typeof(app.audio.play) !== 'undefined')){
					app.audio = new Audio(audio_src); 
				}
				if( audio_src !== app.audio.src ){
					app.audio.pause();
					delete app.audio; //jvm garbage should take care of this
					app.audio = new Audio(audio_src);
				} 
				if(app.state.playing){
					app.audio.play();
				}else{
					app.audio.pause();
				} 
				app.audio.loop = app.state.loop; 
			} 

			callback();
		}
	}); 
} 

var render = function(){ 
	reload("reload",app.state,attach_events);
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

var call_post = function(route, data, callback){
	$.ajax({
		url: "http://patrickmichaelsen.com/spotify/"+route,
		data: data, 
		type: "POST",
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

		/*
		$(".play_song").on('click', function(event){ 
			app.state.playing = true;
			app.state.current_song._id = $(event.currentTarget).data("song-id");
			call_post("song", app.state, function GetSong(song){
				app.state.current_song = song;
				render();
			});
		}); 
		*/

		$(".pause_song").on('click', function(event){ 
			app.state.playing = false;
			reload("reload", app.state, attach_events);
		}); 

		$(".nav_back").on('click', function(){ 
			reload("reload", app.state, attach_events);
		}); 
}

var play_song = function(event){
	event = event || window.event; // IE
	var target = event.target || event.srcElement; // IE
	var current = event.currentTarget;

	app.state.playing = true;
	app.state.current_song._id = $(current).data("song-id");
	call_post("song", app.state, function GetSong(song){
		app.state.current_song = song;
		render(); 
	}); 

}

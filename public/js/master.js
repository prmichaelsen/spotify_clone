$(document).ready(()=>{ 

	app.set = function(prop, value){
		if(typeof(app.state[prop]) === 'undefined'){
			app.state[prop] = value;
		}
	}

	//initialization
	app.set("location", "Songs");
	app.queue = new Queue();

	call_get("songs", {}, function(data){
		app.state.songs = (data)? data : [];
		app.queue.fill((data)? data : new Array());
		app.state.current_song = app.queue.pop();
		call_post("song", app.state, function GetSong(song){
			app.state.current_song = song;
			render();
		});
	});

	reload("reload", app.state, function(){
		attach_events(); 
	}); 

});

var app = {
	state: {
		playing: false,
		loop: false,
		shuffle: false,
		current_song: {},
		songs: [], 
	},
	queue: {},
	audio: {},
}; 


var defined = function(variable){
	return !(typeof(variable) === 'undefined');
}

var playNext = function( ){
	if(defined(app.queue)){
		app.state.current_song._id = app.queue.pop()._id;
		call_post("song", app.state, function GetSong(song){
			app.state.current_song = song;
			render();
		});
	} 
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
			

			if(defined(app.state.current_song._id)){
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
					app.audio.onended = playNext;
				} 
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

		$("#loop_btn").on('click', function(){ 
			app.state.loop = !app.state.loop;
			reload("reload", app.state, attach_events);
		}); 

		$("#shuffle_btn").on('click', function(){ 
			app.state.shuffle = !app.state.shuffle;
			reload("reload", app.state, attach_events);
		}); 

		$("#skip_forward_btn").on('click', function(){ 
			playNext();
			app.state.playing = true;
			call_post("song", app.state, function GetSong(song){
				app.state.current_song = song;
				render();
			});
		}); 

		$("#skip_back_btn").on('click', function(){ 
			//reload("reload", app.state, attach_events);
		}); 

		$(".play_song").on('click', function(event){ 
			app.state.playing = true;
			app.state.current_song._id = $(event.currentTarget).data("song-id");
			var index = app.state.songs.findIndex( song => song._id === app.state.current_song._id );
			app.queue.fill(app.state.songs.slice(index));
			playNext();
			call_post("song", app.state, function GetSong(song){
				app.state.current_song = song;
				render();
			});
		}); 

		$(".pause_song").on('click', function(event){ 
			app.state.playing = false;
			reload("reload", app.state, attach_events);
		}); 

		$(".nav_back").on('click', function(){ 
			reload("reload", app.state, attach_events);
		}); 
}

/*

Queue.js

A function to represent a queue

Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
the terms of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode

*/

/* Creates a new queue. A queue is a first-in-first-out (FIFO) data structure -
 * items are added to the end of the queue and removed from the front.
 */
function Queue() {

  // initialise the queue and offset
  this.queue  = [];
  this.offset = 0;

	this.fill = function(array){
		if(Array.isArray(array)){ 
			this.queue = array;
			this.offset = 0;
		}
		else {
			throw "Queue.fill() requires an array as a parameter";
		}
	}

  // Returns the length of the this.queue.
  this.length = function(){
    return (this.queue.length - this.offset);
  }

  // Returns true if the this.queue is empty, and false otherwise.
  this.empty = function(){
    return (this.queue.length == 0);
  }

  /* Enthis.queues the specified item. The parameter is:
   *
   * item - the item to enthis.queue
   */
  this.push = function(item){
    this.queue.push(item);
  }

  this.pop = function(){

    // if the this.queue is empty, return immediately
    if (this.queue.length == 0)  { return undefined; }

    // store the item at the front of the this.queue
    var item = this.queue[this.offset];

    // increment the this.offset and remove the free space if necessary
    if (++ this.offset * 2 >= this.queue.length){
      this.queue  = this.queue.slice(this.offset);
      this.offset = 0;
    }

    // return the dethis.queued item
    return item;

  }

  /* Returns the item at the front of the this.queue (without dequeuing it). If the
   * this.queue is empty then undefined is returned.
   */
  this.peek = function(){
    return (this.queue.length > 0 ? this.queue[this.offset] : undefined);
  }

}

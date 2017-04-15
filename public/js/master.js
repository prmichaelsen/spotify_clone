$(document).ready(()=>{ 

	app.set = function(prop, value){
		if(typeof(app.state[prop]) === 'undefined'){
			app.state[prop] = value;
		}
	}

	//initialization
	app.set("location", "Songs");
	app.queue = new Deque();
	app.history = new Array();

	call_get("songs", {}, function(data){
		app.state.songs = (data)? data : [];
		app.queue = new Deque((data)? data : new Array());
		app.state.current_song = app.queue.shift();
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
	history: {},
	audio: {},
}; 


var defined = function(variable){
	return !(typeof(variable) === 'undefined');
}

var playNext = function( ){
	if(defined(app.queue)){
		app.state.current_song._id = app.queue.shift()._id;
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
			app.history.push(app.state.current_song._id);
			playNext();
			app.state.playing = true;
			call_post("song", app.state, function GetSong(song){
				app.state.current_song = song;
				render();
			});
		}); 

		$("#skip_back_btn").on('click', function(){ 
			var song_id = app.history.pop();
			if( defined( song_id ) ){
				app.queue.unshift({_id: song_id});
				app.state.current_song._id = song_id;
				call_post("song", app.state, function GetSong(song){
					app.state.current_song = song;
					render();
				});
			}
		}); 

		$(".play_song").on('click', function(event){ 
			app.state.playing = true;
			var current_song_id = app.state.current_song._id;
			app.state.current_song._id = $(event.currentTarget).data("song-id");
			if( app.state.current_song._id !== current_song_id ){
				app.history.push(app.state.current_song._id);
				var index = app.state.songs.findIndex( song => song._id === app.state.current_song._id );
				app.queue = new Deque(app.state.songs.slice(index));
				playNext(); 
			}
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


var DEQUE_MAX_CAPACITY =  (1 << 30) | 0;
var DEQUE_MIN_CAPACITY  = 16;

function Deque(capacity) {
	this._capacity = getCapacity(capacity);
	this._length = 0;
	this._front = 0;
	if (isArray(capacity)) {
		var len = capacity.length;
		for (var i = 0; i < len; ++i) {
			this[i] = capacity[i];
		}
		this._length = len;
	}
}

Deque.prototype.toArray = function Deque$toArray() {
	var len = this._length;
	var ret = new Array(len);
	var front = this._front;
	var capacity = this._capacity;
	for (var j = 0; j < len; ++j) {
		ret[j] = this[(front + j) & (capacity - 1)];
	}
	return ret;
};

Deque.prototype.push = function Deque$push(item) {
	var argsLength = arguments.length;
	var length = this._length;
	if (argsLength > 1) {
		var capacity = this._capacity;
		if (length + argsLength > capacity) {
			for (var i = 0; i < argsLength; ++i) {
				this._checkCapacity(length + 1);
				var j = (this._front + length) & (this._capacity - 1);
				this[j] = arguments[i];
				length++;
				this._length = length;
			}
			return length;
		}
		else {
			var j = this._front;
			for (var i = 0; i < argsLength; ++i) {
				this[(j + length) & (capacity - 1)] = arguments[i];
				j++;
			}
			this._length = length + argsLength;
			return length + argsLength;
		}

	}

	if (argsLength === 0) return length;

	this._checkCapacity(length + 1);
	var i = (this._front + length) & (this._capacity - 1);
	this[i] = item;
	this._length = length + 1;
	return length + 1;
};

Deque.prototype.pop = function Deque$pop() {
	var length = this._length;
	if (length === 0) {
		return void 0;
	}
	var i = (this._front + length - 1) & (this._capacity - 1);
	var ret = this[i];
	this[i] = void 0;
	this._length = length - 1;
	return ret;
};

Deque.prototype.shift = function Deque$shift() {
	var length = this._length;
	if (length === 0) {
		return void 0;
	}
	var front = this._front;
	var ret = this[front];
	this[front] = void 0;
	this._front = (front + 1) & (this._capacity - 1);
	this._length = length - 1;
	return ret;
};

Deque.prototype.unshift = function Deque$unshift(item) {
	var length = this._length;
	var argsLength = arguments.length;


	if (argsLength > 1) {
		var capacity = this._capacity;
		if (length + argsLength > capacity) {
			for (var i = argsLength - 1; i >= 0; i--) {
				this._checkCapacity(length + 1);
				var capacity = this._capacity;
				var j = (((( this._front - 1 ) &
								( capacity - 1) ) ^ capacity ) - capacity );
				this[j] = arguments[i];
				length++;
				this._length = length;
				this._front = j;
			}
			return length;
		}
		else {
			var front = this._front;
			for (var i = argsLength - 1; i >= 0; i--) {
				var j = (((( front - 1 ) &
								( capacity - 1) ) ^ capacity ) - capacity );
				this[j] = arguments[i];
				front = j;
			}
			this._front = front;
			this._length = length + argsLength;
			return length + argsLength;
		}
	}

	if (argsLength === 0) return length;

	this._checkCapacity(length + 1);
	var capacity = this._capacity;
	var i = (((( this._front - 1 ) &
					( capacity - 1) ) ^ capacity ) - capacity );
	this[i] = item;
	this._length = length + 1;
	this._front = i;
	return length + 1;
};

Deque.prototype.peekBack = function Deque$peekBack() {
	var length = this._length;
	if (length === 0) {
		return void 0;
	}
	var index = (this._front + length - 1) & (this._capacity - 1);
	return this[index];
};

Deque.prototype.peekFront = function Deque$peekFront() {
	if (this._length === 0) {
		return void 0;
	}
	return this[this._front];
};

Deque.prototype.get = function Deque$get(index) {
	var i = index;
	if ((i !== (i | 0))) {
		return void 0;
	}
	var len = this._length;
	if (i < 0) {
		i = i + len;
	}
	if (i < 0 || i >= len) {
		return void 0;
	}
	return this[(this._front + i) & (this._capacity - 1)];
};

Deque.prototype.isEmpty = function Deque$isEmpty() {
	return this._length === 0;
};

Deque.prototype.clear = function Deque$clear() {
	var len = this._length;
	var front = this._front;
	var capacity = this._capacity;
	for (var j = 0; j < len; ++j) {
		this[(front + j) & (capacity - 1)] = void 0;
	}
	this._length = 0;
	this._front = 0;
};

Deque.prototype.toString = function Deque$toString() {
	return this.toArray().toString();
};

Deque.prototype.valueOf = Deque.prototype.toString;
Deque.prototype.removeFront = Deque.prototype.shift;
Deque.prototype.removeBack = Deque.prototype.pop;
Deque.prototype.insertFront = Deque.prototype.unshift;
Deque.prototype.insertBack = Deque.prototype.push;
Deque.prototype.enqueue = Deque.prototype.push;
Deque.prototype.dequeue = Deque.prototype.shift;
Deque.prototype.toJSON = Deque.prototype.toArray;

Object.defineProperty(Deque.prototype, "length", {
	get: function() {
		return this._length;
	},
	set: function() {
		throw new RangeError("");
	}
});

Deque.prototype._checkCapacity = function Deque$_checkCapacity(size) {
	if (this._capacity < size) {
		this._resizeTo(getCapacity(this._capacity * 1.5 + 16));
	}
};

Deque.prototype._resizeTo = function Deque$_resizeTo(capacity) {
	var oldCapacity = this._capacity;
	this._capacity = capacity;
	var front = this._front;
	var length = this._length;
	if (front + length > oldCapacity) {
		var moveItemsCount = (front + length) & (oldCapacity - 1);
		arrayMove(this, 0, this, oldCapacity, moveItemsCount);
	}
};


var isArray = Array.isArray;

function arrayMove(src, srcIndex, dst, dstIndex, len) {
	for (var j = 0; j < len; ++j) {
		dst[j + dstIndex] = src[j + srcIndex];
		src[j + srcIndex] = void 0;
	}
}

function pow2AtLeast(n) {
	n = n >>> 0;
	n = n - 1;
	n = n | (n >> 1);
	n = n | (n >> 2);
	n = n | (n >> 4);
	n = n | (n >> 8);
	n = n | (n >> 16);
	return n + 1;
}

function getCapacity(capacity) {
	if (typeof capacity !== "number") {
		if (isArray(capacity)) {
			capacity = capacity.length;
		}
		else {
			return DEQUE_MIN_CAPACITY;
		}
	}
	return pow2AtLeast(
			Math.min(
				Math.max(DEQUE_MIN_CAPACITY, capacity), DEQUE_MAX_CAPACITY)
			);
}


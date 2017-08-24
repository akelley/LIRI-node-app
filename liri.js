var command = process.argv;
var fs = require('fs');

fs.appendFile('log.txt', ("Command: " + command[2] + "\n"), function(err){
	if(err) 
		throw err;
}); 

//==========================================================================================
if(command[2] == 'movie-this'){
	var title = "";
	if(command[3] == null){
		title = "Mr. Nobody";
	}
	else{
		for(var i = 3; i < command.length; i++){
			title += command[i] + " ";
		}
	}

	var queryURL = "http://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=40e9cece";
	var request = require('request');

	request(queryURL, function (error, response, body) {
		if(error){
			console.log('error:', error);
		}

		else{
			fs.appendFile('log.txt', ("Title: " + JSON.parse(body).Title + "; Year: " + JSON.parse(body).Year + "; IMDB rating: " + 
													  		JSON.parse(body).Ratings[0].Value + "; Rotten Tomatoes rating: " + JSON.parse(body).Ratings[1].Value + 
													  		"; Country: " + JSON.parse(body).Country + "; Language: " + JSON.parse(body).Language + "; Plot: " +
													  		JSON.parse(body).Plot + "; Actors: " + JSON.parse(body).Actors + "\n\n"), function(err){
				if(err) 
					throw err;
				
	  		console.log("\nTitle: " + JSON.parse(body).Title);
	  		console.log("Year: " + JSON.parse(body).Year);
	  		console.log("IMDB rating: " + JSON.parse(body).Ratings[0].Value);
	  		console.log("Rotten Tomatoes rating: " + JSON.parse(body).Ratings[1].Value);
	  		console.log("Country: " + JSON.parse(body).Country);
	  		console.log("Language: " + JSON.parse(body).Language);
	  		console.log("Plot summary: " + JSON.parse(body).Plot);
	  		console.log("Actors/actresses: " + JSON.parse(body).Actors);
  		}); 
		}
	});
}

//===========================================================================================
else if(command[2] == 'my-tweets'){
	var keys = require('./keys.js');
	var Twitter = require('twitter');

	var client = new Twitter({
	  consumer_key: keys.consumer_key,
	  consumer_secret: keys.consumer_secret,
	  access_token_key: keys.access_token_key,
	  access_token_secret: keys.access_token_secret
	});
 
	var entry = "";
	var params = {screen_name: 'SenWarren', count: 20};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	  if(!error){
	  	for(var i = 0; i < 20; i++){
	  		fs.appendFile('log.txt', (tweets[i].created_at + " - " + tweets[i].text + "\n\n"), function(err){
					if(err) 
						throw err;
				});
	    	console.log(tweets[i].created_at + " - " + tweets[i].text);
	  	}
	  }
	});
}

//===========================================================================================
else if(command[2] == 'spotify-this-song'){			
	var title = "";
	if(command[3] == null){		
		title = "Strawberry Fields Forever";
	}

	else{
		for(var i = 3; i < command.length; i++){
			title += command[i] + " ";
		}
	}
	title = title.trim();
	getSong(title);
}

//===========================================================================================
else if(command[2] == 'do-what-it-says'){
	var fs = require('fs');

	fs.readFile('random.txt', 'utf8', function(err, data) {
	  if(err) 
	  	throw err;
	  
	  var inputs = data.split(";");

	  if(inputs[0] == 'spotify-this-song'){
	  	getSong(inputs[1]);
	  }
	}); 
}

//============================================================================================
function getSong(title){
	var keys = require('./keys.js');
	var Spotify = require('node-spotify-api');
	 
	var spotify = new Spotify({
	  id: keys.client_id,
	  secret: keys.client_secret
	});

	var limit = 20;
	spotify.search({ type: 'track', query: title, limit: limit}, function(err, data) {
	  if (err) {
	    return console.log('Error occurred: ' + err);
	  }
		//console.log(JSON.stringify(data, null, 2));

	 	for(var i = 0; i < limit; i++){
	 		if(data.tracks.items[i].name == title && data.tracks.items[i].album.album_type == 'album'){
			  console.log("\nSong title: " + data.tracks.items[i].name);
			  
			  var musicians = "";
			  for(var j = 0; j < data.tracks.items[i].artists.length; j++){
			  	musicians += data.tracks.items[i].artists[j].name + " ";
			  }
			  console.log("Artists: " + musicians);
			 	console.log("Album name: " + data.tracks.items[i].album.name);
			 	
			 	if(data.tracks.items[i].preview_url !== null){
			 		console.log("Preview URL: " + data.tracks.items[i].preview_url);
			 	}

			 	fs.appendFile('log.txt', ("Song title: " + data.tracks.items[i].name + "; Artists: " + musicians + "; Album name: " + 
			 														data.tracks.items[i].album.name + "; Preview URL: " + data.tracks.items[i].preview_url + "\n\n"), function(err){
					if(err) 
						throw err;
				});
			}
		}
	});
}
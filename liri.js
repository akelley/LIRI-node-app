var fs = require('fs');
var command = process.argv;
var entry = "";

//============================================================================================
switch(command[2]){
	case('movie-this'):
		var title = getTitle().trim();

		var queryURL = "http://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=40e9cece";
		var request = require('request');

		request(queryURL, function (error, response, body) {
			if(error){
				console.log('error:', error);
			}

			else{
				entry = body;
			}

			console.log("\nTitle: " + JSON.parse(entry).Title);
			console.log("Year: " + JSON.parse(entry).Year);
			console.log("IMDB rating: " + JSON.parse(entry).Ratings[0].Value);
			console.log("Rotten Tomatoes rating: " + JSON.parse(entry).Ratings[1].Value);
			console.log("Country: " + JSON.parse(entry).Country);
			console.log("Language: " + JSON.parse(entry).Language);
			console.log("Plot summary: " + JSON.parse(entry).Plot);
			console.log("Actors/actresses: " + JSON.parse(entry).Actors);

			writeFile(command[2]);
		});
		break;

//=====================================================================================================
	case('my-tweets'):
		var keys = require('./keys.js');
		var Twitter = require('twitter');

		var client = new Twitter({
		  consumer_key: keys.consumer_key,
		  consumer_secret: keys.consumer_secret,
		  access_token_key: keys.access_token_key,
		  access_token_secret: keys.access_token_secret
		});
	 
		var params = {screen_name: 'SenWarren', count: 20};
		client.get('statuses/user_timeline', params, function(error, tweets, response) {
		  if(!error){
		  	entry = tweets;

		  	for(var i = 0; i < 20; i++){
		    	console.log(tweets[i].created_at + " - " + tweets[i].text);
		  	}
		  }
		  writeFile(command[2]);
		});
		break;

//=====================================================================================================
	case('spotify-this-song'):	
		var title = getTitle().trim();
		getSong(title);
		break;

//=====================================================================================================
	case('do-what-it-says'):
		fs.readFile('random.txt', 'utf8', function(err, data) {
		  if(err) 
		  	throw err;
		  
		  var inputs = data.split(";");

		  if(inputs[0] == 'spotify-this-song'){
		  	getSong(inputs[1]);
		  }
		}); 
		break;

//====================================================================================================	
	default:
		console.log("Not a valid selection.");
		break;
}

//============================================================================================
function getTitle(){
	var title = "";

	if(command[3] == null && command[2] == "movie-this"){
		title = "Mr. Nobody";
	}

	else if(command[3] == null && command[2] == "spotify-this-song"){
		title = "Hey Jude";
	}

	else{
		for(var i = 3; i < command.length; i++){
			title += command[i] + " ";
		}
	}
	return title;
}

//============================================================================================
function getSong(title){
	var keys = require('./keys.js');
	var Spotify = require('node-spotify-api');
	 
	var spotify = new Spotify({
	  id: keys.client_id,
	  secret: keys.client_secret
	});

	spotify.search({ type: 'track', query: title}, function(err, data) {
	  if (err) {
	    return console.log('Error occurred: ' + err);
	  }
	  else{
	  	entry = data;
		 	for(var i = 0; i < 20; i++){
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
				}
			}
		}
		writeFile(command[2]);
	});
}

//============================================================================================
function writeFile(type){
	fs.appendFile('log.txt', ("Command: " + type + "\n"), function(err){
		if(err) 
			throw err;
	}); 

	switch(type){
		case("movie-this"):
			fs.appendFile("log.txt", ("Title: " + JSON.parse(entry).Title + "; Year: " + JSON.parse(entry).Year + "; IMDB rating: " +
								  		JSON.parse(entry).Ratings[0].Value + "; Rotten Tomatoes rating: " + JSON.parse(entry).Ratings[1].Value + 
								  		"; Country: " + JSON.parse(entry).Country + "; Language: " + JSON.parse(entry).Language + "; Plot: " +
								  		JSON.parse(entry).Plot + "; Actors: " + JSON.parse(entry).Actors + "\n\n"), function(err){
			if(err)
				throw err;
			});
			break;
		
		case("my-tweets"):
	  	for(var i = 0; i < 20; i++){
	    	fs.appendFile('log.txt', (entry[i].created_at + " - " + entry[i].text + "\n\n"), function(err){
				if(err) 
					throw err;
				});
	  	}
  		break;

  	case("spotify-this-song"):
  	case("do-what-it-says"):
  		var temp = "";
  		for(var i = 0; i < 20; i++){
		 		if(entry.tracks.items[i].album.album_type == 'album'){
		 			temp += "Song title: " + entry.tracks.items[i].name;
				  
				  temp += "\nMusicians: ";
				  for(var j = 0; j < entry.tracks.items[i].artists.length; j++){
				  	temp += entry.tracks.items[i].artists[j].name + " ";
				  }

				  temp += "\nAlbum name: " + entry.tracks.items[i].album.name;
				 	temp += "\nPreview URL: " + entry.tracks.items[i].preview_url + "\n\n";
				}
			}

			fs.appendFile('log.txt', temp, function(err){
				if(err) 
					throw err;
			});
			break;

		default:
			console.log("An error has occurred.");
			break;
	}
}
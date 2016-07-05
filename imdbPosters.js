var request = require('request'),
		http = require('http'),
    fs = require('fs'),
    path = require('path'),
    sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('movie.db');
db.serialize();

var moviesDB = [],
		ti = 1,
		t = 5; // threads
		step = 0,
		start = 0;

db.all("SELECT id, img FROM movies WHERE img is not null", function(err, row) {
  for (var i = row.length - 1; i >= 0; i--) {
  	var a = {};
  	a.id = row[i].id;
  	a.img = row[i].img;
    moviesDB.push(a);
  }

  step =  Math.floor(moviesDB.length/t);
	console.log("Total:" + moviesDB.length);
	console.log("Step:" + step);

	parse(start, moviesDB.length);

	// while(ti <= t) {
	//   console.log(start, start+step);
	//   setTimeout;
	//   start = start+step;
	//   ti++;
	// }
});

function save(i, total) {
	try {
		http.get(moviesDB[i].img, function(response) {
		  response.pipe(fs.createWriteStream('imdbPosters/'+moviesDB[i].id+'.jpg'));
			parse(i+1, total);
		});
	} catch(e) {
		console.log('Oh!');
		console.log(e);
		console.log(a);
		save(i, total);
	}
}

function parse(i, total) {
  if (i > total) {
    return false;
  }

  if (fs.existsSync('imdbPosters/' + moviesDB[i].id + '.jpg')) {
    if (i < total) {
      parse(i+1, total);
    }
    return;
  }

  console.log(moviesDB[i].img);
	save(i, total);
}

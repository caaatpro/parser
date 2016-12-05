var request = require('request'),
		http = require('http'),
    fs = require('fs-extra'),
    path = require('path'),
    sqlite3 = require('sqlite3').verbose(),
		download = require('./lib/downloader');

var db = new sqlite3.Database('movie.db');
db.serialize();

var moviesDB = [],
		ti = 1,
		t = 20; // threads
		step = 0,
		start = 0;

db.all("SELECT id, img, yaer FROM movies WHERE img is not null", function(err, row) {
  for (var i = row.length - 1; i >= 0; i--) {
  	var a = {};
  	a.id = row[i].id;
  	a.img = row[i].img;
  	a.yaer = row[i].yaer;
    moviesDB.push(a);
  }

  step =  Math.floor(moviesDB.length/t);
	console.log("Total:" + moviesDB.length);
	console.log("Step:" + step);


	// var end = start+step;
	// parse(start, end);
	//
	// start = end;
	// end = start+step;
	// parse(start, end);
	//
	// start = end;
	// end = start+step;
	// parse(start, end);
	while(ti < t) {
	  // console.log(start, start+step);
	  parse(start, start+step);
	  start = start+step;
	  ti++;
	}
});

function save(i, total) {
			if (!fs.existsSync('imdbPosters/' + moviesDB[i].yaer)) {
				fs.mkdirsSync('imdbPosters/' + moviesDB[i].yaer);
			}

			download(moviesDB[i].img, 'imdbPosters/temp/' + moviesDB[i].id + '.jpg', function (state) {
          console.log("progress", state);
      }, function (response) {
          console.log("status code", response.statusCode);
      }, function (error) {
          console.log("error", error);
      }, function () {
          console.log("done");
					fs.move('imdbPosters/' + 'temp/' + moviesDB[i].id + '.jpg', 'imdbPosters/' + moviesDB[i].yaer + '/' + moviesDB[i].id + '.jpg', function (err) {
						if (err) {
							return console.error(err);
						}
					});
					setTimeout(function(){ parse(i+1, total); }, 1);
      });

}

function parse(i, total) {
	console.log(i, total);
  if (i > total || !moviesDB[i]) {
    return false;
  }

	// console.log(moviesDB[i].img);

	// console.log(fs.existsSync('imdbPosters/' + moviesDB[i].yaer + '/' + moviesDB[i].id + '.jpg'));

  if (fs.existsSync('imdbPosters/' + moviesDB[i].id + '.jpg') || fs.existsSync('imdbPosters/' + moviesDB[i].yaer + '/' + moviesDB[i].id + '.jpg')) {
		if (fs.existsSync('imdbPosters/' + moviesDB[i].id + '.jpg')) {
			console.log(1);
			fs.move('imdbPosters/' + moviesDB[i].id + '.jpg', 'imdbPosters/' + moviesDB[i].yaer + '/' + moviesDB[i].id + '.jpg', function (err) {
			  if (err) {
					console.log(err.errno);
					if (err.errno === -2) {
						fs.unlink('imdbPosters/' + moviesDB[i].id + '.jpg');
					} else {
						return console.log(err);
					}
				}

				if (i < total) {
					setTimeout(function(){ parse(i+1, total); }, 1);
		    }
			});
		} else {
			if (i < total) {
				setTimeout(function(){ parse(i+1, total); }, 1);
	    }
		}

    return;
  } else {
		console.log(fs.existsSync('imdbPosters/' + moviesDB[i].yaer + '/' + moviesDB[i].id + '.jpg'));
		setTimeout(function(){ save(i, total); }, 1);
	}

}

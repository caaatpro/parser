var request = require('request'),
		http = require('http'),
    fs = require('fs.extra'),
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

	while(ti <= t) {
	  console.log(start, start+step);
	  setTimeout(parse(start, start+step), ti);
	  start = start+step;
	  ti++;
	}
});

function save(a) {
	try {
		http.get(a.img, function(response) {
		  response.pipe(fs.createWriteStream('posters/'+a.id+'.jpg'));
		});
	} catch(e) {
		console.log('Oh!');
		console.log(e);
		console.log(a);
		save(a);
	}
}

function parse(i, total) {
  if (i > total) {
    return false;
  }

  if (fs.existsSync('posters/' + moviesDB[i].id + '.jpg')) {
    if (i < total) {
      parse(i+1, total);
    }
    return;
  }

  console.log(moviesDB[i].img);
  try {
	  request.get(moviesDB[i].img, function (error, response, body) {
	  	if (error) {
	  		console.log(error);
	  		setInterval(function(){
	        parse(i, total);
	  		}, 50000);
	  		return;
	  	}
	  	console.log(response.request.href);
	    if (!error && response.statusCode == 200) {
	    	console.log(response.request.href);
	      if (response.request.href == "http://st.kinopoisk.ru/images/no-poster.gif") {
	      	fs.writeFile('posters/'+moviesDB[i].img+'.jpg', null);
	        if (i < total) {
	          parse(i+1, total);
	        }
	        return;
	      }

	      save(moviesDB[i]);

	      if (i < total) {
	        parse(i+1, total);
	      }
	    } else {
	      console.log("Error!" + i + " Status Code: "+ response.statusCode);

	    	if (response.statusCode == 500) {
	    		setInterval(function(){
	          parse(i, total);
	    		}, 50000);
	    	}
	    }

    	return;
  	});
	} catch(e) {
		console.log('Oh!');
		console.log(e);
	}
}
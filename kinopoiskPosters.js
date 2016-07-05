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

db.all("SELECT id FROM moviesKP", function(err, row) {
  for (var i = row.length - 1; i >= 0; i--) {
  	var a = {};
  	a.id = row[i].id;
  	a.img = 'http://st.kp.yandex.net/images/film_big/' +row[i].id+ '.jpg';
    moviesDB.push(a);
  }

  step =  Math.floor(moviesDB.length/t);
	console.log("Total:" + moviesDB.length);
	console.log("Step:" + step);

	parse(start, moviesDB.length);
});

function save(i, total) {
	try {
		http.get(moviesDB[i].img, function(response) {
		  response.pipe(fs.createWriteStream('postersKP/'+moviesDB[i].id+'.jpg'));
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

  if (fs.existsSync('postersKP/' + moviesDB[i].id + '.jpg')) {
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
	      	fs.writeFile('postersKP/'+moviesDB[i].img+'.jpg', null);
	        if (i < total) {
	          parse(i+1, total);
	        }
	        return;
	      }

	      save(i, total);
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

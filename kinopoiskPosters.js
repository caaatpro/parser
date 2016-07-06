var request = require('request'),
		http = require('http'),
		https = require('https'),
    fs = require('fs'),
    path = require('path'),
    sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('movie.db');
db.serialize();

var moviesDB = [],
		start = 0;

db.all("SELECT id FROM moviesKP", function(err, row) {
  for (var i = row.length - 1; i >= 0; i--) {
  	var a = {};
  	a.id = row[i].id;
  	a.img = 'https://st.kp.yandex.net/images/film_big/' +row[i].id+ '.jpg';
    moviesDB.push(a);
  }

	console.log("Total:" + moviesDB.length);

	parse(start, moviesDB.length);
});

function save(a) {
	try {
		https.get(a.img, function(response) {
		  response.pipe(fs.createWriteStream('postersKP/'+a.id+'.jpg'));
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

  if (fs.existsSync('postersKP/' + moviesDB[i].id + '.jpg')) {
    if (i < total) {
      parse(i+1, total);
    }
    return;
  }

	console.log(moviesDB[i].img);

	setTimeout(function () {
	  request.get(moviesDB[i].img, function (error, response, body) {
			// console.log(error, response, body);
	  	if (error) {
	  		console.log(error);
	  		setTimeout(function(){
	        parse(i, total);
	  		}, 50000);
	  		return;
	  	}
	  	console.log(response.request.href);
	    if (!error && response.statusCode == 200) {
	    	console.log(response.request.href);
	      if (response.request.href == "https://st.kinopoisk.ru/images/no-poster.gif") {
	      	fs.writeFile('postersKP/'+moviesDB[i].id+'.jpg', null);

					parse(i+1, total);
	        return;
	      }

	      save(moviesDB[i]);
	      parse(i+1, total);
	    } else {
	      console.log("Error!" + i + " Status Code: "+ response.statusCode);

	    	if (response.statusCode == 500) {
	    		setTimeout(function () {
	          parse(i, total);
	    		}, 50000);
	    	}
	    }

	  	return;
		});
	}, 1);
}

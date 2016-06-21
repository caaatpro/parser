var request = require('request'),
  cheerio = require('cheerio'),
  fs = require('fs'),
  Agent = require('socks5-http-client/lib/Agent'),
  TorControl = require('tor-control'),
  async= require('async'),
  sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('movie.db');
db.serialize();


var moviesDB = [],
    ti = 1,
    t = 1; // threads
    step = 0,
    start = 0;

db.all("SELECT * FROM peoples GROUP BY filed5 LIMIT 800000, 100000", function(err, peoples) {
  if (err != null) {
    console.log(err);
    return;
  }

  console.log(peoples.length);

  var text = '';

  for (var i = peoples.length - 1; i >= 0; i--) {
    console.log(peoples[i].filed5);

    var link = peoples[i].filed5;
    var filedName = '';
    var name = '';
    if (peoples[i].filed4 != '') {
      name = peoples[i].filed4;
      filedName = 'filed4';
    }
    if (peoples[i].filed3 != '') {
      name = peoples[i].filed3;
      filedName = 'filed3';
    }
    if (peoples[i].filed2 != '') {
      name = peoples[i].filed2;
      filedName = 'filed2';
    }
    if (peoples[i].filed1 != '') {
      name = peoples[i].filed1;
      filedName = 'filed1';
    }
    if (peoples[i].filed0 != '') {
      name = peoples[i].filed0;
      filedName = 'filed0';
    }

 		// text += 'INSERT INTO people (name, link) VALUES ("' + name + '", "' + link + '");\n';
 		db.run('INSERT INTO people (name, link) VALUES ("' + name + '", "' + link + '")');
    // save(name, link);
  }
  fs.writeFileSync('sql', text, {flag: 'a+'});
});

function restructure(argument) {
	var moviesDB = [],
    ti = 1,
    t = 1; // threads
    step = 0,
    start = 0;

	db.all("SELECT * FROM peoples GROUP BY filed5 LIMIT 1300000, 100000", function(err, peoples) {
	  if (err != null) {
	    console.log(err);
	    return;
	  }

	  console.log(peoples.length);

	  var text = '';

	  for (var i = peoples.length - 1; i >= 0; i--) {
	    console.log(peoples[i].filed5);

	    var link = peoples[i].filed5;
	    var filedName = '';
	    var name = '';
	    if (peoples[i].filed4 != '') {
	      name = peoples[i].filed4;
	      filedName = 'filed4';
	    }
	    if (peoples[i].filed3 != '') {
	      name = peoples[i].filed3;
	      filedName = 'filed3';
	    }
	    if (peoples[i].filed2 != '') {
	      name = peoples[i].filed2;
	      filedName = 'filed2';
	    }
	    if (peoples[i].filed1 != '') {
	      name = peoples[i].filed1;
	      filedName = 'filed1';
	    }
	    if (peoples[i].filed0 != '') {
	      name = peoples[i].filed0;
	      filedName = 'filed0';
	    }

	 		// text += 'INSERT INTO people (name, link) VALUES ("' + name + '", "' + link + '");\n';
	 		// db.run('INSERT INTO people (name, link) VALUES ("' + name + '", "' + link + '")');
	    // save(name, link);
	  }
	  // fs.writeFileSync('sql', text, {flag: 'a+'});
	});
}

function save(name, link) {
  // db.all("SELECT 1 FROM people WHERE link == '" + link +"' LIMIT 1", function(err, row) {
  //   if (err != null) {
  //     console.log(err);
  //     return;
  //   }
    console.log(link);
    // if (row.length == 0) {
      var stmt = db.prepare("INSERT INTO people (name, link) VALUES (?, ?)");
      stmt.run( name,
                link
              );
    // }
  // });
}
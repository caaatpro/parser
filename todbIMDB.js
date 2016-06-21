var request = require('request'),
    fs = require('fs.extra'),
    path = require('path'),
    sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('movie_imdb.db');
db.serialize();

var dir = __dirname + '\\m0\\3\\';

var files = fs.readdirSync(dir);
console.log(files.length);
var start = 0,
    step = 100,
    i = 0;


// file_read(start, files.length)
var i = 1;
while(start < files.length) {
  setTimeout(file_read(start, start+step), i);
  start += step;
  i++;
}

function file_read(i, total) {
  if (i >= total) {
    return false;
  }


  var contents = fs.readFileSync(dir+files[i], 'utf8');
  if (contents == 'null' || contents == '' || contents == '1') {
    file_read(i+1, total);
    fs.unlink(dir+'\\'+files[i]);
    return;
  }

  console.log(files[i]);

  try {
    var j = JSON.parse(contents);
  } catch (err) {
    console.log('err');
    fs.unlink(dir+'\\'+files[i]);
    file_read(i+1, total);
    return;
  }
  // console.log(j["title"]);

  db.get("SELECT id FROM movie WHERE id = " + u(j["id"]), function(err, row) {
    if (row === undefined) {
      var stmt = db.prepare("INSERT INTO movie (id, title, alternativeTitle, description, year, time) VALUES (?, ?, ?, ?, ?, ?)");
      stmt.run( u(j["id"]),
            u(j["title"]),
            u(j["alternativeTitle"]),
            u(j["description"]),
            u(j["year"]),
            u(j["time"])
          );

      stmt.finalize();
    }
    fs.unlink(dir+'\\'+files[i]);
    file_read(i+1, total);
  });
}

function u (value) {
  return value;
}
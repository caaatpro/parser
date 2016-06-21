/*
  Добавляет id файлов в базу
 */

var request = require('request'),
    fs = require('fs.extra'),
    path = require('path'),
    sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('movie.db');
db.serialize();

var files = [];


var dir = __dirname + '\\m0\\4\\';
var y = 1940;

getFiles(y);

function getFiles(y) {
  var d = dir + y.toString();
  files = fs.readdirSync(d);
  if (files.length == 0) {
    getFiles(y-1);
  } else {
    file_read(d, 0, files.length);
  }
}


function file_read(d, i, total) {
  if (i >= files.length) {
    getFiles(y-1);
    return false;
  }

  // console.log(files[i]);
  //
  db.get("SELECT id FROM movies WHERE id = " + files[i], function(err, row) {
    if (row === undefined) {
      var stmt = db.prepare("INSERT INTO movies (id) VALUES (?)");
      stmt.run( files[i] );

      stmt.finalize();
    }
    // console.log(d+'\\'+files[i]);
    fs.unlink(d+'\\'+files[i]);
    file_read(d, i+1, total);
  });
}
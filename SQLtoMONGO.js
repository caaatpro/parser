var mongoose = require('mongoose'),
    sqlite3 = require('sqlite3').verbose();

var sdb = new sqlite3.Database('movie.db');
sdb.serialize();

//setup mongoose
config = {

};
config.mongodb = {
  uri: 'mongodb://85.143.209.198:28345/movies'
};
db = mongoose.createConnection(config.mongodb.uri);
db.on('error', console.error.bind(console, 'mongoose connection error: '));
db.once('open', function () {
  //and... we have a data store
});

require('./schema/Index')(db, mongoose);
require('./schema/Movie')(db, mongoose);


var moviesDB = [];

// db.models.Movie.find({}).exec(function(err, movie) {
//  console.log(movie.length);
// });


var total = 0,
    tt = 4,
    ti = 0,
    s = 0,
    l1 = 191000,
    l2 =  10000;

select(l1, l2)

function select(l1, l2) {
  sdb.all("SELECT id, title, yaer, description, duration, type FROM movies LIMIT " + l1 + ", " + l2, function(err, movies) {
    if (err) {
      console.log('Error', err);
      return;
    }

    moviesDB = movies;
    
    total = moviesDB.length;
    step =  Math.floor(total/tt);

    console.log(step);

    while(s < total) {
      console.log(s);
      start(s, s+step);
      s = s+step;
    }
  });
}

function start(i, total) {
  if (i > total || moviesDB[i] === undefined) {
    return;
  }

  db.models.Movie.findOne({ 'imdbID': 'tt' + moviesDB[i].id}).exec(function(err, movie) {
    if (err) {
      console.log('Error', err);
      return;
    }

   console.log(i);

    if (movie != null) {
      start(i+1, total);
      return;
    }

    console.log(movie);

    var duration = moviesDB[i].duration;

    if (duration != null) {
      if (duration.indexOf('PT') != -1) {
        var runtime = duration.replace(' ', '').split('PT')[1].split('M')[0];
        // console.log(moviesDB[i].id);
        console.log(i);

        if (runtime % 1 !== 0) {
          console.log('ERORR!1');
          console.log(runtime + '2');
        }
      }
    }

    var fieldsToSet = {
        titles: [
            {
                country: 'origin',
                title: moviesDB[i].title
            }
        ],
        runtime: runtime,
        year: moviesDB[i].year,
        plot: moviesDB[i].description,
        imdbID: 'tt' + moviesDB[i].id,
        type: 'movie'
    };

    db.models.Movie.create(fieldsToSet, function(err, m) {
      if (err) {
        console.log('Error', err);
        return false;
      }
      return;
    });
    start(i+1, total);
  });
}
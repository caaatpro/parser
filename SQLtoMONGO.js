var mongoose = require('mongoose'),
    sqlite3 = require('sqlite3').verbose();

var sdb = new sqlite3.Database('movie.db');
sdb.serialize();

//setup mongoose
config = {

};
config.mongodb = {
  uri: 'mongodb://192.168.1.100:27017/movies'
};
db = mongoose.createConnection(config.mongodb.uri);
db.on('error', console.error.bind(console, 'mongoose connection error: '));
db.once('open', function () {
  //and... we have a data store
});

require('./schema/Index')(db, mongoose);
require('./schema/Movie')(db, mongoose);
require('./schema/People')(db, mongoose);


var moviesDB = [];
var peoplesDB = [];

var total = 0,
    tt = 1,
    ti = 0,
    s = 0,
    l1 = 0,
    l2 = 100000;

movies(l1, l2);
// peoples(l1, l2);

function movies(l1, l2) {
  sdb.all("SELECT id, title, yaer, description, duration, type, MPAA FROM movies LIMIT " + l1 + ", " + l2, function(err, movies) {
    if (err) {
      console.log('Error', err);
      return;
    }

    moviesDB = movies;

    total = moviesDB.length;
    step =  Math.floor(total/tt);

    startMovies(s, total);
  });
}

function startMovies(i, total) {
  if (i > total || moviesDB[i] === undefined) {
    db.close();
    return;
  }

  db.models.Movie.findOne({ 'imdbID': 'tt' + moviesDB[i].id}).exec(function(err, movie) {
    if (err) {
      console.log('Error', err);
      return;
    }


    if (movie != null) {
      startMovies(i+1, total);
      return;
    }

    console.log(i);
    // console.log(movie);

    var duration = moviesDB[i].duration;

    if (duration != null) {
      if (duration.indexOf('PT') != -1) {
        var runtime = duration.replace(' ', '').split('PT')[1].split('M')[0];
        // console.log(moviesDB[i].id);
        // console.log(i);

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
        year: moviesDB[i].yaer,
        plot: moviesDB[i].description,
        imdbID: 'tt' + moviesDB[i].id,
        MPAA: moviesDB[i].MPAA,
        type: moviesDB[i].type
    };

    db.models.Movie.create(fieldsToSet, function(err, m) {
      if (err) {
        console.log('Error', err);
        return false;
      }

      console.log(i);
      startMovies(i+1, total);
      return;
    });
  });
}

function peoples(l1, l2) {
  sdb.all("SELECT field_name, movieId, filed0, filed1, filed2, filed3, filed4, filed5 FROM peoples LIMIT " + l1 + ", " + l2, function(err, people) {
    if (err) {
      console.log('Error', err);
      return;
    }


    for (var i = 0; i < people.length; i++) {
      var p = {};

      if (people[i].filed0 == '') {
        p.name = people[i].filed1;
        p.role = people[i].filed3;
      } else {
        p.name = people[i].filed0;
        p.role = people[i].filed2;
      }
      p.imdbID = people[i].filed5;
      p.movieId = 'tt' + people[i].movieId;
      p.category = people[i].field_name;

      // console.log(p);
      peoplesDB.push(p);
    }

    total = peoplesDB.length;

    startPeoples(s, total);
  });
}

function startPeoples(i, total) {
  console.log(i);
  if (i > total || peoplesDB[i] === undefined) {
    db.close();
    return;
  }

  db.models.People.findOne({ 'imdbID': peoplesDB[i].imdbID}).exec(function(err, people) {
    if (err) {
      console.log('Error', err);
      return;
    }

    if (people === null) {
      var fieldsToSet = {
        name: {
          russian: '',
          original: peoplesDB[i].name
        },
        imdbID: peoplesDB[i].imdbID
      };

      db.models.People.create(fieldsToSet, function(err, people) {
        if (err) {
          console.log('Error', err);
          return false;
        }

        updatePeopleInMovie(i, total, people);
      });
    } else {
      updatePeopleInMovie(i, total, people);
    }
  });
}

function updatePeopleInMovie(i, total, people) {
  // console.log(people);
  // console.log('|' + peoplesDB[i].movieId + '|');

  db.models.Movie.findOne({ 'imdbID': peoplesDB[i].movieId }).exec(function(err, movie) {
    if (err) {
      console.log('Error', err);
      return;
    }

    if (movie != null) {
      console.log(movie);
    } else {
      // console.log('Error find movie. ', i, people, peoplesDB[i].movieId);
      startPeoples(i+1, total);
    }
  });
}

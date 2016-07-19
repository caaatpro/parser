var mongoose = require('mongoose'),
    sqlite3 = require('sqlite3').verbose(),
    ObjectID = require('mongodb').ObjectID;

var sdb = new sqlite3.Database('movie.db');
sdb.serialize();

//setup mongoose
config = {

};
config.mongodb = {
  uri: 'mongodb://85.143.222.142:28345/movies'
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
    tt = 4,
    ti = 0,
    s = 0,
    l1 = 30000,
    l2 =  10000;

// movies(l1, l2);
peoples(l1, l2);

function movies(l1, l2) {
  sdb.all("SELECT id, title, yaer, description, duration, type, MPAA FROM movies ORDER BY id DESC LIMIT " + l1 + ", " + l2, function(err, movies) {
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

    console.log(i);
    // console.log(movie);

    if (movie != null) {
      startMovies(i+1, total);
      return;
    }

    console.log(movie);

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

      startMovies(i+1, total);
      return;
    });
  });
}

function peoples(l1, l2) {
  sdb.all("SELECT field_name, movieId, filed0, filed1, filed2, filed3, filed4, filed5 FROM peoples ORDER BY movieId ASC LIMIT " + l1 + ", " + l2, function(err, people) {
    if (err) {
      console.log('Error', err);
      return;
    }

    for (var i = 0; i < people.length; i++) {
      var p = {};

      if (people[i].filed0 == '') {
        p.name = people[i].filed1.trim();
        p.role = people[i].filed3.trim();
      } else {
        p.name = people[i].filed0.trim();
        p.role = people[i].filed2.trim();
      }
      p.imdbID = people[i].filed5;
      p.movieId = 'tt' + people[i].movieId;
      p.category = people[i].field_name.trim();

      // console.log(p);
      peoplesDB.push(p);
    }

    total = peoplesDB.length;
    step = Math.floor(total/tt)

    while (s < total) {
      console.log(s, s+step);
      startPeoples(s, total);
      s = s+step;
    }
  });
}

function startPeoples(i, total) {
  console.log(i);
  if (i > total || peoplesDB[i] === undefined) {
    // db.close();
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

function updatePeopleInMovie(ii, total, people) {

  db.models.Movie.findOne({ 'imdbID': peoplesDB[ii].movieId })/*.populate('peoples.people')*/.exec(function(err, movie) {
    if (err) {
      console.log('Error', err);
      return;
    }

    if (movie != null) {
      // console.log(movie);

      for (var i = 0; i < movie.peoples.length; i++) {
        // console.log(people._id);
        // console.log(movie.peoples[i].people);
        // console.log(movie.peoples[i].people.equals(people._id) && movie.peoples[i].role === peoplesDB[ii].role && movie.peoples[i].category === peoplesDB[ii].category);

        if (movie.peoples[i].people.equals(people._id) && movie.peoples[i].role === peoplesDB[ii].role && movie.peoples[i].category === peoplesDB[ii].category) {
          // console.log(people);
          startPeoples(ii+1, total);
          return;
        }
      }
      console.log(1);

      var p = {
        people: people._id,
        role: peoplesDB[ii].role,
        category: peoplesDB[ii].category
      };

      movie.peoples.push(p);

      // var d = movie.peoples;

      db.models.Movie.update(
         { '_id': movie._id },
         {
           peoples: movie.peoples
         },
         { upsert: true }
      ).exec(function(err, movie) {
        if (err) {
          console.log(movie);
          // console.log(d);
          console.log(err);
          return;
        }

        // console.log(people);

        startPeoples(ii+1, total);
      });

    } else {
      // console.log('Error find movie. ', i, people, peoplesDB[i].movieId);
      console.log(ii+1);
      startPeoples(ii+1, total);
    }
  });
}

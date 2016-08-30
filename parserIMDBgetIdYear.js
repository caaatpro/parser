var request = require('request'),
  cheerio = require('cheerio'),
  fs = require('fs'),
  Agent = require('socks5-http-client/lib/Agent'),
  TorControl = require('tor-control'),
  sqlite3 = require('sqlite3'),
  async= require('async');

var control = new TorControl();

// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1971,1973&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1973,1975&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1975,1977&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1977,1979&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1979,1981&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1981,1983&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1983,1985&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1985,1987&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1987,1988&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1988,1989&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1989,1990&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1990,1991&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1991,1992&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1992,1993&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1993,1995&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1995,1996&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1996,1997&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1997,1998&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1998,1999&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=1999,2000&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2000,2001&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2001,2002&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2002,2003&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2003,2004&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2004,2005&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2005,2006&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2007,2007&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2008,2008&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2009,2009&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2010,2010&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2010,2010&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2011,2011&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2012,2012&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2013,2013&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2014,2014&view=advanced';
// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2015,2015&view=advanced';

// var FILM_URL = 'http://www.imdb.com/search/title?title_type=feature&year=2016,2016&view=advanced&sort=alpha,desc';
// var FILM_URL = 'http://www.imdb.com/search/title?title_type=feature&year=2016,2016&view=advanced&sort=user_rating,desc';
// var FILM_URL = 'http://www.imdb.com/search/title?title_type=feature&year=2016,2016&view=advanced&sort=user_rating,asc';
// var FILM_URL = 'http://www.imdb.com/search/title?title_type=feature&year=2016,2016&view=advanced&sort=num_votes,desc';
// var FILM_URL = 'http://www.imdb.com/search/title?title_type=feature&year=2016,2016&view=advanced&sort=num_votes,asc';
// var FILM_URL = 'http://www.imdb.com/search/title?title_type=feature&year=2016,2016&view=advanced&sort=boxoffice_gross_us,desc';
// var FILM_URL = 'http://www.imdb.com/search/title?title_type=feature&year=2016,2016&view=advanced&sort=boxoffice_gross_us,asc';
// var FILM_URL = 'http://www.imdb.com/search/title?title_type=feature&year=2016,2016&view=advanced&sort=runtime,desc';
// var FILM_URL = 'http://www.imdb.com/search/title?title_type=feature&year=2016,2016&view=advanced&sort=runtime,asc';
// var FILM_URL = 'http://www.imdb.com/search/title?title_type=feature&year=2016,2016&view=advanced&sort=year,desc';
// var FILM_URL = 'http://www.imdb.com/search/title?title_type=feature&year=2016,2016&view=advanced&sort=year,asc';
// var FILM_URL = 'http://www.imdb.com/search/title?title_type=feature&year=2016,2016&view=advanced&sort=release_date,desc';
var FILM_URL = 'http://www.imdb.com/search/title?title_type=feature&year=2016,2016&view=advanced&sort=release_date,asc';

// var FILM_URL = 'http://www.imdb.com/search/title?sort=moviemeter,asc&title_type=feature&year=2017,2024&view=advanced';


var getById = function (id, options, callback) {
  // console.log(id);

  var requestOptions = {
    url: FILM_URL + '&page=' + id,
    headers: {
      'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36'
    },
    agentClass: Agent,
    agentOptions: {
      socksHost: '127.0.0.1',
      socksPort: 9050
    },
    encoding: 'utf-8'
  };


  try {
    request.get(requestOptions, function (err, response, body) {
      if (err) {
        callback(new Error('Error while "' + FILM_URL + id + '" processing. ' + err.message));
      } else {
        var $ = cheerio.load(body);
        var title = $('title').text().trim();

        console.log(title);

        if (title == 'IMDb - D\'oh') {
          callback(new Error('500'));
        } else if (title == 'IMDb: Error') {
          callback(new Error('404'));
        } else{

          var links = $('#main .lister-item-header > a');

          console.log("Links on page: " + links.length);

          for (var i = links.length - 1; i >= 0; i--) {

            var id = parseInt($(links[i]).attr('href').split('/title/tt')[1].split('/')[0]);

            save(id);
          }
        }
      }
      callback(null, '');
    });
  } catch (err) {
    console.log(1);
    console.dir(err);
    console.dir(2);
  }
}


function getInfo($) {
  if ($.length) {
    return $.text().replace(/\s+/g," ").trim();
  } else {
    return null;
  }
}

function getInfoAttr($, attr) {
  if ($.length) {
    return $.attr(attr).replace(/\s+/g," ").trim();
  } else {
    return null;
  }
}

function save(id) {
    db.get('SELECT id FROM movies WHERE id = ' + id + ' LIMIT 1', function(err, row) {
        if (err) {
            console.log(err);
        }

        // console.log(row);

        if (row === undefined) {
            var stmt = db.prepare("INSERT INTO movies (id) VALUES (?)");
            stmt.run(id);
        }
    });
}

function parser(i, total, step) {
  getById(i, null, function(err, film){

    console.log("Page: " + i);

    if(err){
      if ('500' == err.message) {
        control.signalNewnym(function (err, status) { // Get a new circuit
          console.log('Get a new circuit');
          if(err) {
            console.log(err);
            return;
          }

          console.log(status);
          console.log(err);

          parser(i, total, step);
        });
      } else if ('404' == err.message) {
        cosnole.log('Stop');
        return;
      } else if ('stop' == err.message) {
        return;
      }
    } else {
      if (i < total) {
        parser(i+step, total, step);
      }
    }
  });
}
function u (value) {
  return value;
}

var db = new sqlite3.Database('movie.db');
db.serialize();

var start = 1,
  end =     201,
  step =       1,
  moviesDB = [];

parser(start, end, step);
// var i = 1;
// while(start <= end) {
//   setTimeout(prser(start, start+step), i);
//   start += step;
// }
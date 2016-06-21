var request = require('request'),
    cheerio = require('cheerio'),
    async = require('async'),
    fs = require('fs'),
    Agent = require('socks5-http-client/lib/Agent'),
    TorControl = require('tor-control'),
    async= require('async');
    // sqlite3 = require('sqlite3').verbose();

// var db = new sqlite3.Database('movie_imdb.db');
// db.serialize();

var control = new TorControl();

var FILM_URL = 'http://www.imdb.com/title/tt';
var DEFAULT_GET_OPTIONS = {
    title: true,
    rating: true,
    votes: true,
    alternativeTitle: true,
    description: true,
    type: true,
    actors: true,
    year: true,
    country: true,
    director: true,
    scenario: true,
    producer: true,
    operator: true,
    composer: true,
    cutting: true,
    genre: true,
    budget: true,
    boxoffice: true,
    time: true
};

var getById = function (id, options, callback) {
    var options = options || DEFAULT_GET_OPTIONS;
    var requestOptions = {
        url: FILM_URL + id + '/',
        headers: {
            'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36'
        },
        agentClass: Agent,
        agentOptions: {
            socksHost: '127.0.0.1', // Defaults to 'localhost'.
            socksPort: 9050 // Defaults to 1080.
        },
        encoding: 'utf-8'
    };

    try {
        request.get(requestOptions, function (err, response, body) {
            if (err) {
              console.log(err)
                callback(new Error('Error while "' + FILM_URL + id + '" processing. ' + err.message));
            } else {
          console.log(response.statusCode);
              if (response.statusCode == '503') {
                callback(new Error('503'));
                return;
              }

                body = body.toString();
                var $ = cheerio.load(body);
                var title = '';
                var titleElement = $('#title-overview-widget > div.vital > div.title_block > div > div.titleBar > div.title_wrapper > h1');
                if (titleElement.length > 0 && titleElement[0].children.length > 0) {
                    title = titleElement[0].children[0].data.trim();
                }
                //console.log(title);

                if (!title) {
                  if ($('title').text().trim() == '404 Error - IMDb') {
                    callback(new Error('404'));
                  } else {
                    callback(new Error('404'));
                  }
                } else {
                    var result = {
                        id: id
                    };

                    result.type =                          getInfoAttr($('meta[property="og:type"]'), 'content');
                    result.title =                         title;
                    result.alternativeTitle =              $('#title-overview-widget > div.vital > div.title_block > div > div.titleBar > div.title_wrapper > div.originalTitle').text().trim();
                    result.description =                   $('div.summary_text').text().trim();
                    result.year =                          $('#titleYear > a').text().trim();
                    result.time =                          $('#title-overview-widget > div.vital > div.title_block > div > div.titleBar > div.title_wrapper > div.subtext > time').text().trim();

                    callback(null, result);
                }
            }
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

function getMultiInfo($, fieldName) {
    return $('#infoTable td:contains("' + fieldName + '") ~ td').text().split(', ')
        .map(function (item) {
            return item.replace(/\r\n|\n|\r|слова$|сборы$/gm, "").trim();
        }).filter(function (item) {
            return item != '...' && item != '-';
        });
}

function getInfo($, fieldName) {
    return $('#infoTable td:contains("' + fieldName + '") ~ td a').first().text();
}

function getActors($) {
    return  $('#actorList ul').first().find('li[itemprop="actors"] a').toArray()
        .map(function (item) {
            if (item.children.length > 0) {
                return item.children[0].data;
            }
            return "";
        }).filter(function (item) {
            return item != '...';
        });
}

function getType($) {
    return $('#headerFilm .moviename-big span').text().indexOf('сериал') > -1 ? 'series' : 'film';
}
var dir = __dirname + '/m0/3/';

function prser(i, total) {
      if (fs.existsSync(dir + i) || i == 126805) {
        if (i < total) {
          prser(i+1, total);
        }
        return;
      }

      console.log(i);

      getById(i, null, function(err, film){
          if(err){
              //console.error(err.message);
              if ('503' == err.message) {
                setInterval(function () {
                  control.signalNewnym(function (err, status) { // Get a new circuit
                    console.log('Get a new circuit');

                    prser(i, total);
                  });
                }, 15000);
                return;
              }
              if ('500' == err.message) {
                //return;

                control.signalNewnym(function (err, status) { // Get a new circuit
                  console.log('Get a new circuit');
                  if(err) {
                    console.log(err);
                    return;
                  }

                  console.log(status);
                  console.log(err);

                  prser(i, total);
                });
                return;
              } else if ('404' == err.message) {
                fs.writeFileSync(dir + i, 'null');

                if (i < total) {
                  prser(i+1, total);
                }
                return;
              }
          } else {
              if (film['title'] == '') {
                console.log('error!');
                return;
              }
              //var j = film;
              fs.writeFileSync(dir + i, JSON.stringify(film));
              if (i < total) {
                prser(i+1, total);
              }
              return;

              // console.log(j);

              db.get("SELECT * FROM movie WHERE id = " + u(j["id"]), function(err, row) {
                //console.log('Check'+i);
                if (row === undefined) {
                  console.log('Save'+i);
                  console.log(j["title"]);
                  var stmt = db.prepare("INSERT INTO movie (id, title, alternativeTitle, description, year, time) VALUES (?, ?, ?, ?, ?, ?)");
                  stmt.run( u(j["id"]),
                        u(j["title"]),
                        u(j["alternativeTitle"]),
                        u(j["description"]),
                        u(j["year"]),
                        u(j["time"])
                      );

                  stmt.finalize();
                  fs.writeFileSync(dir + i, '1');

                  if (i < total) {
                    prser(i+1, total);
                  }
                } else {
                  fs.writeFileSync(dir + i, '1');
                  if (i < total) {
                    prser(i+1, total);
                  }
                  return;
                }
            });
          }
      });
    // });
}
function u (value) {
  return value;
}


var start =1100000,
    end =  2000000,
           //5000000
    step =    1000,
    moviesDB = [];

var i = 1;
while(start <= end) {
  setTimeout(prser(start, start+step), i);
  start += step;
}

// prser(start, end);
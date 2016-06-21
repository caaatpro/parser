var request = require('request'),
    cheerio = require('cheerio'),
    async = require('async'),
    fs = require('fs'),
    Iconv = require('iconv').Iconv('windows-1251', 'utf8'),
    Agent = require('socks5-http-client/lib/Agent'),
    TorControl = require('tor-control'),
    async= require('async'),
    sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('movie2.db');
db.serialize();

var control = new TorControl();

var FILM_URL = 'http://www.kinopoisk.ru/film/';
var SEARCH_URL = 'http://www.kinopoisk.ru/s/type/film/list/1/find/';
var LOGIN_URL = 'http://www.kinopoisk.ru/login/';
var DEFAULT_GET_OPTIONS = {
    loginData: [],
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
        url: FILM_URL + id,
        headers: {
            'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36'
        },
        agentClass: Agent,
        agentOptions: {
            socksHost: '127.0.0.1', // Defaults to 'localhost'.
            socksPort: 9050 // Defaults to 1080.
        },
        encoding: 'binary'
    };
    if (options.loginData && options.loginData.length > 0) {
        var jar = request.jar();
        for (var i = 0; i < options.loginData.length; i++) {
            jar.setCookie(request.cookie(options.loginData[i]), 'http://www.kinopoisk.ru/');
        }
        requestOptions['jar'] = jar;
    }

    try {
        request.get(requestOptions, function (err, response, body) {
            if (err) {
                callback(new Error('Error while "' + FILM_URL + id + '" processing. ' + err.message));
            } else {
                body = Iconv.convert(new Buffer(body, 'binary')).toString();
                var $ = cheerio.load(body);
                var title = '';
                var titleElement = $('#headerFilm .moviename-big');
                if (titleElement.length > 0 && titleElement[0].children.length > 0) {
                    title = titleElement[0].children[0].data.trim();
                }
                if (!title) {
                  if ($('title').text().trim() == 'КиноПоиск.ru - Все фильмы планеты') {
                    callback(new Error('500'));
                    //console.log(body);
                  } else {
                    callback(new Error('404'));
                  }
                }else{
                    var result = {
                        id: id
                    };

                    if (options.title) result.title =                        title;
                    if (options.rating) result.rating =                      parseFloat($('span.rating_ball').text());
                    if (options.votes) result.votes =                        parseFloat($('span.ratingCount').text().replace(/\s/g, ''));
                    if (options.alternativeTitle) result.alternativeTitle =  $('#headerFilm span[itemprop="alternativeHeadline"]').text();
                    if (options.description) result.description =            $('.brand_words[itemprop="description"]').text();
                    if (options.actors) result.actors =                      getActors($);
                    if (options.year) result.year =                          parseInt(getInfo($, 'год'));
                    if (options.country) result.country =                    getMultiInfo($, 'страна');
                    if (options.director) result.director =                  getMultiInfo($, 'режиссер');
                    if (options.scenario) result.scenario =                  getMultiInfo($, 'сценарий');
                    if (options.producer) result.producer =                  getMultiInfo($, 'продюсер');
                    if (options.operator) result.operator =                  getMultiInfo($, 'оператор');
                    if (options.composer) result.composer =                  getMultiInfo($, 'композитор');
                    if (options.cutting) result.cutting =                    getMultiInfo($, 'монтаж');
                    if (options.genre) result.genre =                        getMultiInfo($, 'жанр');
                    if (options.budget) result.budget =                      getInfo($, 'бюджет');
                    if (options.boxoffice) result.boxoffice =                getInfo($, 'сборы в мире');
                    if (options.time) result.time =                          $('.time').text();
                    if (options.type) result.type =                          getType($);

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

var dir = __dirname + '\\m0\\2\\';
function prser(i, total) {
    // db.get("SELECT * FROM movie2 WHERE id = " + i, function(err, row) {
    //   // console.log('Check1 '+i);
    //   if (row === undefined) {
        if (fs.existsSync(dir + i)) {
          if (i < total) {
            prser(i+1, total);
          }
          return;
        }
      // } else {
      //   fs.writeFileSync(dir + i, '1');
      //   if (i < total) {
      //     prser(i+1, total);
      //   }
      //   return;
      // }

      console.log(i);

      getById(i, null, function(err, film){
          if(err){
              //console.error(err.message);
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
              var j = film;

              fs.writeFileSync(dir + i, '1');
              db.get("SELECT * FROM movie2 WHERE id = " + u(j["id"]), function(err, row) {
                //console.log('Check'+i);
                if (row === undefined) {
                  console.log('Save'+i);
                  console.log(j["title"]);
                  var stmt = db.prepare("INSERT INTO movie2 (id,title, rating, votes, alternativeTitle, description, actors, year, country, director, scenario, producer, operator, composer, cutting, genre, budget, boxoffice, time, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                  stmt.run( u(j["id"]),
                        u(j["title"]),
                        u(j["rating"]),
                        u(j["votes"]),
                        u(j["alternativeTitle"]),
                        u(j["description"]),
                        u(j["actors"].join(',')),
                        u(j["year"]),
                        u(j["country"].join(',')),
                        u(j["director"].join(',')),
                        u(j["scenario"].join(',')),
                        u(j["producer"].join(',')),
                        u(j["operator"].join(',')),
                        u(j["composer"].join(',')),
                        u(j["cutting"].join(',')),
                        u(j["genre"].join(',')),
                        u(j["budget"]),
                        u(j["boxoffice"]),
                        u(j["time"]),
                        u(j["type"])
                      );

                  stmt.finalize();

                  if (i < total) {
                    prser(i+1, total);
                  }
                } else {
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


var start = 10000,
    end =   20000,
    step =   1000,
    moviesDB = [];

db.all("SELECT id FROM movie2", function(err, row) {
	for (var i = row.length - 1; i >= 0; i--) {
		moviesDB.push(row[i].id);
		// if (!fs.existsSync(dir + row[i].id)) {
	 //    fs.writeFileSync(dir + row[i].id, '1');
	 //  }
	}
	console.log(moviesDB.length);
});

// prser(start, end);
var i = 1;
while(start <= end) {
  setTimeout(prser(start, start+step), i);
  start += step;
}
// setTimeout(prser(end, end+1000), 2);
// setTimeout(prser(end+1000, end+2000), 3);
// setTimeout(prser(end+2000, end+3000), 4);
// setTimeout(prser(end+3000, end+4000), 5);
// setTimeout(prser(end+4000, end+5000), 6);
// setTimeout(prser(end+5000, end+6000), 7);
// setTimeout(prser(end+6000, end+7000), 8);
// setTimeout(prser(end+7000, end+8000), 9);
// setTimeout(prser(end+8000, end+9000), 10);
// setTimeout(prser(end+9000, end+10000), 11);
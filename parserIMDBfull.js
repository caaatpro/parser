var request = require('request'),
  cheerio = require('cheerio'),
  fs = require('fs'),
  Agent = require('socks5-http-client/lib/Agent'),
  TorControl = require('tor-control'),
  async= require('async'),
  sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('movie.db');
db.serialize();

var control = new TorControl();

var FILM_URL = 'http://www.imdb.com/title/tt';

var getById = function (id, options, callback) {

  var requestOptions = {
    url: FILM_URL + id,
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
    	console.log(FILM_URL + id);

      if (err) {
        callback(new Error('Error while "' + FILM_URL + id + '" processing. ' + err.message));
      } else {
        var $ = cheerio.load(body);
        var title = '';
        var titleElement = $('h1[itemprop="name"]');
        if (titleElement.length > 0 && titleElement[0].children.length > 0) {
          title = titleElement.text().trim();
        }

        if (!title) {
          if ($('title').text().trim() == "IMDb - D'oh") {
            callback(new Error('500'));
          } else {
            callback(new Error('404'));
          }
        }else{
          var result = {
            id: id
          };

          console.log(id);
          result.title =                       title.substring(0, title.length-7);

          result.yaer =                        title.substring(title.length-5, title.length-1);

          result.description =                 getInfo($('.summary_text[itemprop="description"]'));
          result.type =                        getInfoAttr($('meta[property="og:type"]'), 'content').split('.')[1];
          result.img =                         getInfoAttr($('.poster img[itemprop="image"]'), 'src');

          if (result.description == 'Add a Plot »') {
            result.description =                '';
          }
          if (result.img != null) {
            result.img =                       result.img.split('@.jpg')[0].split('@.')[0] + '@.jpg';
          }

          if (result.type == 'movie') {
            result.MPAA =                      getInfoAttr($('*[itemprop="contentRating"]'), 'content');
            result.duration =                  getInfoAttr($('*[itemprop="duration"]'), 'datetime');


          } else {
            console.log(result.type);
            return;
          }

          result.genres =                      [];

          var gElements = $('#titleStoryLine [itemprop="genre"] a');
          for (var i = gElements.length - 1; i >= 0; i--) {
            result.genres.push($(gElements[i]).text().trim());
          }

          //console.log(result);

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

function getByIdFullcredits(id, options, callback) {

  var requestOptions = {
    url: FILM_URL + id + '/fullcredits',
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
  console.log(requestOptions.url);


  try {
    request.get(requestOptions, function (err, response, body) {

      if (err) {
        callback(new Error('Error while "' + FILM_URL + id + '" processing. ' + err.message));
      } else {
        var $ = cheerio.load(body);
        var title = '';

        if ($('title').text().trim() == "IMDb - D'oh") {
          callback(new Error('500'));
        }
        var result = {
          id: id
        };

        var gElementsH4 = $('#fullcredits_content h4');
        var gElementsTable = $('#fullcredits_content table');
        // console.log(gElementsH4.length);
        // console.log(gElementsTable.length);
        for (var i = gElementsH4.length - 1; i >= 0; i--) {
          var h4 = $(gElementsH4[i]).text();
          if (h4.search(/^\s*Directed by\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Directed');
          } else if (h4.search(/^\s*Writing Credits\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Writing Credits');
          } else if (h4.search(/^\s*Cast\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Cast');
          } else if (h4.search(/^\s*Produced by\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Produced');
          } else if (h4.search(/^\s*Music by\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Music');
          } else if (h4.search(/^\s*Cinematography by\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Cinematography');
          } else if (h4.search(/^\s*Film Editing by\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Film Editing');
          } else if (h4.search(/^\s*Casting By\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Casting');
          } else if (h4.search(/^\s*Production Design by\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Production Design');
          } else if (h4.search(/^\s*Art Direction by\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Art Direction');
          } else if (h4.search(/^\s*Set Decoration by\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Set Decoration by');
          } else if (h4.search(/^\s*Costume Design by\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Costume Design by');
          } else if (h4.search(/^\s*Makeup Department\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Makeup Department');
          } else if (h4.search(/^\s*Production Management\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Production Management');
          } else if (h4.search(/^\s*Second Unit Director or Assistant Director\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Second Unit Director or Assistant Director');
          } else if (h4.search(/^\s*Art Department\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Art Department');
          } else if (h4.search(/^\s*Sound Department\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Sound Department');
          } else if (h4.search(/^\s*Special Effects by\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Special Effects by');
          } else if (h4.search(/^\s*Visual Effects by\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Visual Effects by');
          } else if (h4.search(/^\s*Stunts\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Stunts');
          } else if (h4.search(/^\s*Camera and Electrical Department\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Camera and Electrical Department');
          } else if (h4.search(/^\s*Animation Department\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Animation Department');
          } else if (h4.search(/^\s*Casting Department\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Casting Department');
          } else if (h4.search(/^\s*Costume and Wardrobe Department\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Costume and Wardrobe Department');
          } else if (h4.search(/^\s*Editorial Department\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Editorial Department');
          } else if (h4.search(/^\s*Music Department\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Music Department');
          } else if (h4.search(/^\s*Transportation Department\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Transportation Department');
          } else if (h4.search(/^\s*Other crew\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Other crew');
          } else if (h4.search(/^\s*Thanks\s+/i) != -1) {
            getPeople($, $(gElementsTable[i]), id, 'Thanks');
          } else {
            console.log('Stop!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
          }
        }

        //console.log(result);

        callback(null, result);
      }
    });
  } catch (err) {
    console.log(1);
    console.dir(err);
    console.dir(2);
  }
}

function getByIdReleaseinfo(id, options, callback) {

  var requestOptions = {
    url: FILM_URL + id + '/releaseinfo',
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
  console.log(requestOptions.url);


  try {
    request.get(requestOptions, function (err, response, body) {

      if (err) {
        callback(new Error('Error while "' + FILM_URL + id + '" processing. ' + err.message));
      } else {
        var $ = cheerio.load(body);
        var title = '';

        // console.log($('title').text().trim());

        if ($('title').text().trim() == "IMDb - D'oh") {
          callback(new Error('500'));
        }
        var result = {
          id: id
        };

        var release_dates = $('#release_dates tr');
        for (var i = 0; i < release_dates.length; i++) {
          var movieId = id;
          var fild0 = $($(release_dates[i]).find('td')[0]).text();
          var fild1 = $($(release_dates[i]).find('td')[1]).text();
          var fild2 = $($(release_dates[i]).find('td')[2]).text();

          save_release_dates(movieId, fild0, fild1, fild2);
        }


        var akas = $('#akas tr');
        for (var i = 0; i < akas.length; i++) {
          var movieId = id;
          var fild0 = $($(akas[i]).find('td')[0]).text();
          var fild1 = $($(akas[i]).find('td')[1]).text();
          var fild2 = $($(akas[i]).find('td')[2]).text();

          save_akas(movieId, fild0, fild1, fild2);
        }

        //console.log(result);

        callback(null, result);
      }
    });
  } catch (err) {
    console.log(1);
    console.dir(err);
    console.dir(2);
  }
}

function save_akas(movieId, fild0, fild1, fild2) {
  db.get('SELECT movieId FROM akas WHERE movieId = "'+movieId+'" AND filed0 = "'+fild0+'" AND filed1 = "'+fild1+'" AND filed2 = "'+fild2+'" LIMIT 1', function(err, row) {
    if (err) {
      console.log(err);
    }

    if (row === undefined) {
      console.log( movieId,
                fild0,
                fild1,
                fild2
              );
      var stmt = db.prepare("INSERT INTO akas (movieId, filed0, filed1, filed2) VALUES (?, ?, ?, ?)");
      stmt.run( movieId,
                fild0,
                fild1,
                fild2
              );
    }
  });
}
function save_release_dates(movieId, fild0, fild1, fild2) {
  db.get('SELECT movieId FROM release_dates WHERE movieId = "'+movieId+'" AND filed0 = "'+fild0+'" AND filed1 = "'+fild1+'" AND filed2 = "'+fild2+'" LIMIT 1', function(err, row) {
    if (err) {
      console.log(err);
    }

    // console.log(row);

    if (row === undefined) {
      console.log( movieId,
                fild0,
                fild1,
                fild2
              );

      var stmt = db.prepare("INSERT INTO release_dates (movieId, filed0, filed1, filed2) VALUES (?, ?, ?, ?)");
      stmt.run( movieId,
                fild0,
                fild1,
                fild2
              );
    }
  });
}

function getInfo($) {
  if ($.length) {
    return $.text().replace(/\s+/g," ").trim();
  } else {
    return null;
  }
}

function getPeople($, table, movieId, field_name) {

  var filed = [];

  var tr = table.find('tr');
  for (var j = tr.length - 1; j >= 0; j--) {
    filed[0] = '';
    filed[1] = '';
    filed[2] = '';
    filed[3] = '';
    filed[4] = '';
    filed[5] = '';

    var t = $(tr[j]).find('a');
    if (t.length) {
      filed[5] = t.attr('href').split('/')[2]; // id
    }

    // дополнительные поля
    var td = $(tr[j]).find('td');
    // console.log(td.length)
    for (var ii = 0; ii <= td.length - 1; ii++) {
      // console.log(ii);
      // console.log($(td[ii]).text().trim());
      filed[ii] = $(td[ii]).text().trim();
    }

    var stmt = db.prepare("INSERT INTO peoples (field_name, movieId, filed0, filed1, filed2, filed3, filed4, filed5) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run( field_name,
              movieId,
              filed[0],
              filed[1],
              filed[2],
              filed[3],
              filed[4],
              filed[5]
            );
  }
}

function getInfoAttr($, attr) {
  if ($.length) {
  	var t = $.attr(attr);
  	if (t == undefined) {
  		t = $.attr('content');
  	}

    return t.toString().replace(/\s+/g," ").trim();
  } else {
    return null;
  }
}

function prser(i, total) {
  getByIdFullcredits(moviesDB[i], null, function(err, film){
    if(err){
    	console.log(err.message);

      if ('500' == err.message) {
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
      } else if ('404' == err.message) {
        if (i < total) {
          prser(i+1, total);
        }
      }
    } else {

      db.run("UPDATE movies SET peoples = $peoples WHERE id = $id ", {
          $id: film['id'],
          $peoples: 1
      });

      if (i < total) {
        prser(i+1, total);
      }
    }
  });
}
function prser2(i, total) {
  // console.log(typeof(moviesDB[i]));
  // if (moviesDB[i] != 5583646 && i < total) {
  //     prser2(i+1, total);
  //     return;
  // }

  getByIdReleaseinfo(moviesDB[i], null, function(err, film){
    if(err){
    	console.log(err.message);

      if ('500' == err.message) {
        control.signalNewnym(function (err, status) { // Get a new circuit
          console.log('Get a new circuit');
          if(err) {
            console.log(err);
            return;
          }

          console.log(status);
          console.log(err);

          prser2(i, total);
        });
      } else if ('404' == err.message) {
        if (i < total) {
          prser2(i+1, total);
        }
      }
    } else {
      if (i < total) {
        prser2(i+1, total);
      }
    }
  });
}
function u (value) {
  return value;
}

var moviesDB = [],
		ti = 1,
		t = 20; // threads
		step = 0,
		start = 0;

db.all("SELECT id FROM movies LIMIT 10000, 10000", function(err, row) {
	console.log(err);
  for (var i = row.length - 1; i >= 0; i--) {
    moviesDB.push(row[i].id);
  }

  step =  Math.floor(moviesDB.length/t);
	console.log("Total:" + moviesDB.length);
	console.log("Step:" + step);

	while(ti <= t) {
	  console.log(start, start+step);
	  prser2(start, start+step);
	  start = start+step;
	  ti++;
	}
});

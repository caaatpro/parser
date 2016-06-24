var request = require('request'),
  cheerio = require('cheerio'),
  fs = require('fs'),
  Agent = require('socks5-http-client/lib/Agent'),
  TorControl = require('tor-control'),
  async= require('async'),
  iconv = require('iconv-lite'),
  sqlite3 = require('sqlite3').verbose();

var control = new TorControl();

var db = new sqlite3.Database('movie.db');
db.serialize();

var yaer = 2008; // 2000

var FILM_URL = 'http://www.kinopoisk.ru/lists/ord/name/m_act%5Byear%5D/' + yaer + '/m_act%5Ball%5D/ok/page/';

var getById = function (id, options, callback) {
  console.log(id);

  var requestOptions = {
    url: FILM_URL + id,
    headers: {
      'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36'
    },
    // agentClass: Agent,
    // agentOptions: {
    //   socksHost: '127.0.0.1',
    //   socksPort: 9050
    // },
    encoding: 'binary'
  };

  request.get(requestOptions, function (err, response, body) {
    if (err) {
      callback(new Error('Error while "' + FILM_URL + id + '" processing. ' + err.message));
    } else {
      body = iconv.decode(body, 'win1251');
      var $ = cheerio.load(body);

      console.log($('title').text());

      var list = $('#itemList>div');

      for (var i = list.length - 1; i >= 0; i--) {
        var title = $(list[i]).find('div.info > div > a').text();
        var titleO = $(list[i]).find('div.info > div > span').text();
        var id = parseInt($(list[i]).find('div.info > div > a').attr('href').split('/')[4]);
        // console.log(id);
        save(id, title, titleO, yaer);
      }

      if (list.length === 0) {
        return;
      }

      console.log(list.length);

      /*if ($('title').text().trim() == 'IMDb - D\'oh') {
        callback(new Error('500'));
      } else if ($('title').text().trim() == 'IMDb: Error') {
        callback(new Error('404'));
      } else{

        var links = $('#main td.title > a');
        var years = $('#main td.title > span.year_type');

        for (var i = links.length - 1; i >= 0; i--) {
          var d = dir;
          var year = $(years[i]).text();

          var id = $(links[i]).attr('href').split('/title/tt')[1].split('/')[0];
          console.log(id);

          if (year.length > 6) {

            var temp = year.split('(')[1];
            year = temp.substring(0,3)

            var type = temp.substring(5,temp.length-1);

            if (type == 'TV Series') {
              d = d + 'series';
            } else {
              console.log(type);
              callback(new Error('stop'));
            }
          } else {
            year = year.split('(')[1].split(')')[0];
          }

          d = d + year;
          fs.existsSync(d) || fs.mkdirSync(d);

          if (fs.existsSync(d + '/' + id)) {
            continue;
          }

          fs.writeFileSync(d + '/' + id, '1');
        }
      }*/
    }
    callback(null, '');
  });
}

function save(id, title, titleO, yaer) {
  db.get("SELECT id FROM moviesKP WHERE id = " + id, function(err, row) {
    if (err) {
      console.log(err);
    }

    if (row === undefined) {
      var stmt = db.prepare("INSERT INTO moviesKP (id, title, titleO, yaer) VALUES (?, ?, ?, ?);");
      stmt.run( id, title, titleO, yaer );

      stmt.finalize();
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

function getInfoAttr($, attr) {
  if ($.length) {
    return $.attr(attr).replace(/\s+/g," ").trim();
  } else {
    return null;
  }
}

var dir = __dirname + '\\m0\\4\\';
function parser(i, total, step) {
  getById(i, null, function(err, film){
    if(err){
      console.log(err.message);
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


var start = 1,
  end =     100000,
  step =       1,
  moviesDB = [];
//
// db.all("SELECT id FROM movie2", function(err, row) {
//   for (var i = row.length - 1; i >= 0; i--) {
//     moviesDB.push(row[i].id);
//     // if (!fs.existsSync(dir + row[i].id)) {
//     //    fs.writeFileSync(dir + row[i].id, '1');
//     //  }
//   }
//   console.log(moviesDB.length);
// });

parser(start, end, step);
// var i = 1;
// while(start <= end) {
//   setTimeout(prser(start, start+step), i);
//   start += step;
// }
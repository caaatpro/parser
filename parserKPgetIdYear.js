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

var yaer = 2050; // 2000
var FILM_URL = '';
startparse();

function startparse() {
  FILM_URL = 'http://www.kinopoisk.ru/lists/ord/name/m_act%5Byear%5D/' + yaer + '/m_act%5Ball%5D/ok/page/';

  var start = 1,
    end =     100000,
    step =       1,
    moviesDB = [];
  parser(start, end, step);
}

function getById (id, options, callback) {
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
        yaer -= 1;
        startparse()
        return;
      }

      console.log(list.length);
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
      console.log(id);

      type = '';
      duration = 0;

      if (~title.indexOf('(мини-сериал)')) {
        type = 'mini-serial';
        title = title.replace('(мини-сериал)', '');
      } else if (~title.indexOf('(сериал)')) {
        type = 'serial';
        title = title.replace('(сериал)', '');
      } else if (~title.indexOf('(видео)')) {
        type = 'video';
        title = title.replace('(видео)', '');
      } else if (~title.indexOf('(ТВ)')) {
        type = 'tv';
        title = title.replace('(ТВ)', '');
      } else {
        type = 'movie';
      }

      titleO = titleO.trim();

      var s = titleO.split(' ');

      if (s[s.length-1] === 'мин.') {
        duration = s[s.length-2];
      }

      titleO = titleO.replace(duration+' мин.', '');
      titleO = titleO.replace('('+yaer+')', '');

      title = title.trim();
      titleO = titleO.trim();


      var stmt = db.prepare("INSERT INTO moviesKP (id, title, titleO, yaer, duration, type) VALUES (?, ?, ?, ?, ?, ?);");
      stmt.run( id, title, titleO, yaer, duration, type );

      console.log(id, title, titleO, yaer, duration, type);

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

// var i = 1;
// while(start <= end) {
//   setTimeout(prser(start, start+step), i);
//   start += step;
// }

var sqlite3 = require('sqlite3').verbose();

var sdb = new sqlite3.Database('movie.db');
sdb.serialize();

select(450000, 50000);

function select(l1, l2) {
  sdb.all("SELECT id, title, titleO, yaer FROM moviesKP LIMIT " + l1 + ", " + l2, function(err, movies) {
    if (err) {
      console.log('Error', err);
      return;
    }

    for (var i = movies.length - 1; i >= 0; i--) {
      movies[i].type = '';
      movies[i].duration = 0;

      if (~movies[i].title.indexOf('(мини-сериал)')) {
        movies[i].type = 'mini-serial';
        movies[i].title = movies[i].title.replace('(мини-сериал)', '');
      } else if (~movies[i].title.indexOf('(сериал)')) {
        movies[i].type = 'serial';
        movies[i].title = movies[i].title.replace('(сериал)', '');
      } else if (~movies[i].title.indexOf('(видео)')) {
        movies[i].type = 'video';
        movies[i].title = movies[i].title.replace('(видео)', '');
      } else if (~movies[i].title.indexOf('(ТВ)')) {
        movies[i].type = 'tv';
        movies[i].title = movies[i].title.replace('(ТВ)', '');
      } else {
        movies[i].type = 'movie';
      }

      console.log(movies[i].titleO);
      movies[i].titleO = movies[i].titleO.trim();

      var s = movies[i].titleO.split(' ');

      // if ((~s[s.length-1].indexOf(')') & ~s[s.length-1].indexOf('('))) {
      //   var yaer = s[s.length-1].trim();
      //   if (yaer.length == 6) {
      //     yaer = yaer.substr(1,4);
      //   } else {
      //     yaer = '';
      //   }
      // } else if (~s[s.length-3].indexOf(')') & ~s[s.length-3].indexOf('(')) {
      //   var yaer = s[s.length-3].trim();
      //   if (yaer.length == 6) {
      //     yaer = yaer.substr(1,4);
      //   } else {
      //     yaer = '';
      //   }
      // }

      if (s[s.length-1] === 'мин.') {
        movies[i].duration = s[s.length-2];
      }

      movies[i].titleO = movies[i].titleO.replace(movies[i].duration+' мин.', '');
      movies[i].titleO = movies[i].titleO.replace('('+movies[i].yaer+')', '');

      movies[i].title = movies[i].title.trim();
      movies[i].titleO = movies[i].titleO.trim();

      console.log(movies[i].title);

      // sdb.run("DELETE FROM moviesKP WHERE id = $id;", {
      //     $id: movies[i].id
      // });
      sdb.run("UPDATE moviesKP SET title = $title, titleO = $titleO, duration = $duration, type = $type WHERE id = $id ", {
          $id: movies[i].id,
          $title: movies[i].title,
          $titleO: movies[i].titleO,
          $duration: movies[i].duration,
          $type: movies[i].type
      });
    }
  });
}

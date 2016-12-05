// https://github.com/nawa/node-kinopoisk-ru

var kinopoisk = require('./kinopoisk.js');

// kinopoisk.login('username', 'userpassword', function(err, loginData){
//     var options = {
//         loginData: loginData,
//         title: true
//     };
//     kinopoisk.getById('326', options, function(err, film){
//         if(err){
//             console.error(err.message);
//         }else{
//             console.dir(film);
//         }
//     });
// });

kinopoisk.getById('33453', null, function(err, film){
    if(err){
        console.error(err.message);
    }else{
        console.dir(film);
    }
});

var fs = require('fs');
var path = __dirname + '\\m0\\1\\';

var files = fs.readdirSync(path);
console.log(files.length);
var total = 0;
for (var i = files.length - 1; i >= 0; i--) {
	var contents = fs.readFileSync(path+'\\'+files[i], 'utf8');
	if (contents != 'null') {
		//console.log(contents);
		total++;
	}
}

console.log(total);
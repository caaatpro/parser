const spawn = require('child_process').spawn;
function start() {
	const child = spawn(process.argv[0], ['parser.js'], {
	  detached: true,
	  stdio: ['ignore']
	});
	child.stdout.on('data', (data) => {
	  console.log(data.toString());
	});

	child.stderr.on('data', (data) => {
	  console.log(data.toString());
	});

	child.on('exit', (code) => {
  	console.log(`Child exited with code ${code}`);
		start();
	});
}

start();
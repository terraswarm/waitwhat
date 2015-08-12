/* Simulate the phone app with node code
 */

var WebSocket = require('ws');
var argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('selection', 'Ask the robot for something')
    .command('finished', 'Done')
    .option('item', {
        alias: 'i',
        default: 'Twix',
        describe: 'what you want Twix|SquirtGun|BouncyBalls',
        type: 'string'
    })
    .option('host', {
        default: '141.212.11.243:8081',
        type: 'string'
    })
    .option('id', {
        default: 'F967525B-2A41-4261-A1E4-2C3EDBBD33AF',
        type: 'string'
    })
    .argv;

var command = argv._[0];

var conn_url = 'ws://' + argv.host;
console.log('Connecting to ' + conn_url);
var ws = new WebSocket(conn_url);

ws.on('open', function() {
	console.log('connection opened');

	var msg = {
		phone_id: argv.id,
		type: command,
        selection: argv.item
	}

    ws.send(JSON.stringify(msg));
});

ws.on('error', function (err) {
	console.log('err');
	console.log(err);
});


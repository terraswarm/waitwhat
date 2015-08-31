#!/usr/bin/env node

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
        default: '192.168.11.108:8082',
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

var num = 6;

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

ws.on('open', function() {
	console.log('connection opened');

    for (var i=0; i<num; i++) {
        var msg = {
            X: getRandomArbitrary(0,10),
            Y: getRandomArbitrary(0,10),
            Z: 0,
            id: i
        };

        ws.send(JSON.stringify(msg));
    }

    process.exit();

});

ws.on('error', function (err) {
	console.log('err');
	console.log(err);
});


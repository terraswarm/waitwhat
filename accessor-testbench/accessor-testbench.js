
var accessor_path = '../accessors/RoboCafeController';

// Constants for the accessor
var parameters = {
	'SpinRobotIndex': 2,
	'SpinRobotDuration': 7
};

// Testbench operations
var ops = [
	['UserChoice', {message: {phone_id: 'Bill', type: 'selection', selection: 'SquirtGun'}}, 2],
	['UserChoice', {message: {phone_id: 'Kate', type: 'selection', selection: 'SquirtGun'}}, 3],
	['UserChoice', {message: {phone_id: 'Bill', type: 'finished', selection: 'SquirtGun'}}, 6],
	['Applause', 'some_applause', 8],
	['UserChoice', {message: {phone_id: 'Alan', type: 'selection', selection: 'BouncyBalls'}}, 9],
	['UserChoice', {message: {phone_id: 'Bill', type: 'selection', selection: 'BouncyBalls'}}, 9.1],
	['UserChoice', {message: {phone_id: 'Kate', type: 'selection', selection: 'BouncyBalls'}}, 9.2],
	['UserChoice', {message: {phone_id: 'Bill', type: 'finished', selection: 'BouncyBalls'}}, 10],
	['UserChoice', {message: {phone_id: 'Alan', type: 'finished', selection: 'BouncyBalls'}}, 17],
	['UserChoice', {message: {phone_id: 'Alan', type: 'finished', selection: 'BouncyBalls'}}, 17.1],
	['UserChoice', {message: {phone_id: 'Alan', type: 'finished', selection: 'BouncyBalls'}}, 17.2],
	['UserChoice', {message: {phone_id: 'Alan', type: 'finished', selection: 'BouncyBalls'}}, 17.5],
	['UserChoice', {message: {phone_id: 'Alan', type: 'finished', selection: 'SquirtGun'}}, 18],
	['UserChoice', {message: {phone_id: 'Alan', type: 'finished', selection: 'Twix'}}, 19],
	['UserChoice', {message: {phone_id: 'Kate', type: 'selection', selection: 'BouncyBalls'}}, 20],
	['UserChoice', {message: {phone_id: 'Kate', type: 'selection', selection: 'BouncyBalls'}}, 21],
	['UserChoice', {message: {phone_id: 'Alan', type: 'selection', selection: 'Twix'}}, 23],
	['UserChoice', {message: {phone_id: 'Kent', type: 'selection', selection: 'Twix'}}, 24],
	['UserChoice', {message: {phone_id: 'Bear', type: 'selection', selection: 'Twix'}}, 25],
	['UserChoice', {message: {phone_id: 'Seal', type: 'selection', selection: 'Twix'}}, 26],
];

// State
var inputs = {};
var outputs = [];

var handlers = {};

// Whether or not a critical error has occurred
error_quit = false;


function now () {
	return new Date().getTime();
}

GLOBAL.send = function (name, val) {
	if (typeof val === 'object') {
		val = JSON.stringify(val);
	}
	var t = now()-start;
	console.log('## SEND ## (' + t + ') [' + name + ']: ' + val);
}

GLOBAL.get = function (name) {
	var t = now()-start;
	var val = inputs[name];
	if (typeof val === 'object') {
		val = JSON.stringify(val);
	}
	console.log('## GET  ## (' + t + ') [' + name + ']: ' + val);
	return inputs[name];
}

GLOBAL.getParameter = function (name) {
	return parameters[name];
}

GLOBAL.input = function (name) {
	inputs[name] = null;
}

GLOBAL.output = function (name) {
	outputs.push(name);
}

GLOBAL.parameter = function (name) {
	if (!(name in parameters)) {
		console.log('Please define the parameter "' + name + '".');
		error_quit = true;
	}
}

GLOBAL.addInputHandler = function (name, f) {
	handlers[name] = f;
}



var start = now();
var accessor = require(accessor_path);

accessor.setup();
if (error_quit) {
	process.exit(1);
}

accessor.initialize();
if (error_quit) {
	process.exit(1);
}



// Setup a bunch of events
ops.forEach(function (op, index) {
	var port = op[0];
	var val = op[1];
	var toffset = op[2];

	setTimeout(function () {
		inputs[port] = val;
		handlers[port]();
	}, toffset*1000);

});

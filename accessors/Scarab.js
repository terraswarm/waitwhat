// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Scarab Accessor. 
 *
 * Outputs battery charge percentage and 
 *
 *  @accessor Scarab
 */

var WebSocket = require('webSocket');

/** Set up the accessor by defining the parameters, inputs, and outputs. */
exports.setup = function() {
  parameter('server', {
    type: 'string',
    value: 'localhost'
  });
  parameter('port', {
    type: 'int',
    value: 8080
  });
  parameter('topicPrefix', {
    type: 'string',
    value: '/scarab/lucy'
  });
  input('cmd');
  output('battery', {
    type: 'int'
  });
  output('state', {
    type: 'string'
  });
  output('location');
}

var batteryClient = null;
var stateClient = null;
var locationClient = null;

var seq = 0;

/** Initializes accessor by attaching functions to inputs. */
exports.initialize = function() {

  // Retreive the current battery charge status
  batteryClient = new WebSocket.Client({
    host: getParameter('server'),
    port: getParameter('port')
  });
  batteryClient.on('open', function () {
    // Subscribe to /scarab/name/diagnostics
    batteryClient.send({
        op: "subscribe",
        topic: getParameter('topicPrefix') + '/diagnostics'
    });
  });
  batteryClient.on('message', function (msg) {
    // Quick hack to find the charge of the battery.
    // Ideally this would be done in some better way, but this is all we
    // need for now.
    s = msg.msg.status[1].message;
    charge = parseInt(s.substr(0, s.indexOf('%')));
    send('battery', charge);
  });
  batteryClient.on('error', function(message) {
    error(message)
  });

  // Keep track of what the robot is doing
  stateClient = new WebSocket.Client({
    host: getParameter('server'),
    port: getParameter('port')
  });
  stateClient.on('open', function () {
    // Subscribe to /scarab/name/diagnostics
    stateClient.send({
        op: "subscribe",
        topic: getParameter('topicPrefix') + '/state'
    });
  });
  stateClient.on('message', function (msg) {
    // one of: IDLE, BUSY, STUCK, FAILED
    send('state', msg.msg.state);
  });
  stateClient.on('error', function(message) {
    error(message)
  });

  // Get location updates from the robot
  locationClient = new WebSocket.Client({
    host: getParameter('server'),
    port: getParameter('port')
  });
  locationClient.on('open', function () {
    // Subscribe to /scarab/name/pose
    locationClient.send({
        op: "subscribe",
        topic: getParameter('topicPrefix') + '/pose'
    });
  });
  locationClient.on('message', function (msg) {
    send('location', msg.msg.pose.position);
  });
  locationClient.on('error', function(message) {
    error(message)
  });

  // Get location updates from the robot
  cmdClient = new WebSocket.Client({
    host: getParameter('server'),
    port: getParameter('port')
  });
  cmdClient.on('open', function () {
    // Subscribe to /scarab/name/pose
    cmdClient.send({
        op: 'advertise',
        topic: getParameter('topicPrefix') + '/goal',
        type: 'geometry_msgs/PoseStamped'
    });
  });
  cmdClient.on('error', function(message) {
    error(message)
  });
  addInputHandler('cmd', cmd_in);
} 

var cmd_in = function () {
  var v = get('cmd');

  out = {
    op: 'publish',
    topic: getParameter('topicPrefix') + '/goal',
    msg: {
      'header': {
        'seq': seq++,
        'stamp': {
          'secs': 0,
          'nsecs': 0
        },
        'frame_id': 'map_hokuyo'
      },
      'pose': v
    }
  };

  cmdClient.send(out);
}

exports.wrapup = function() {
  if (stateClient) {
    stateClient.removeAllListeners('open');
    stateClient.removeAllListeners('message');
    stateClient.removeAllListeners('close');
    stateClient.close();
    stateClient = null;
  }
  if (batteryClient) {
    batteryClient.removeAllListeners('open');
    batteryClient.removeAllListeners('message');
    batteryClient.removeAllListeners('close');
    batteryClient.close();
    batteryClient = null;
  }
  if (locationClient) {
    locationClient.removeAllListeners('open');
    locationClient.removeAllListeners('message');
    locationClient.removeAllListeners('close');
    locationClient.close();
    locationClient = null;
  }
  if (cmdClient) {
    cmdClient.removeAllListeners('open');
    cmdClient.removeAllListeners('message');
    cmdClient.removeAllListeners('close');
    cmdClient.close();
    cmdClient = null;
  }
}
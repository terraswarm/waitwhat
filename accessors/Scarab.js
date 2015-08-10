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
  output('battery', {
    type: 'int'
  });
  output('state', {
    type: 'string'
  });
}

var batteryClient = null;
var stateClient = null;

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
}

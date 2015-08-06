// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Generate a stream of made up location data.
 *
 *  Outputs an object that looks like:
 *
 *      {
 *        id: <unique id per thing being localized>
 *        X:  <x coordinate>
 *        Y:  <x coordinate>
 *        Z:  <x coordinate>
 *      }
 *
 *  @accessor FakeLocationStream
 *
*/

// Which ID we should be generating location data for
var current_id;

// Last location
var x;
var y;
var z;

/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  input('ID', {
    type: "string",
    value: "1"
  });
  output('Location', {
    type: 'JSON'
  });

  //
  // Parameters
  //
  // How often to generate a new location value in seconds
  parameter('Period', {
    value: 1,
    type: 'number'
  });

  // Bounds of generated locations in meters
  parameter('MinX', {value: 0, type: 'number'});
  parameter('MaxX', {value: 10, type: 'number'});
  parameter('MinY', {value: 0, type: 'number'});
  parameter('MaxY', {value: 10, type: 'number'});
  parameter('MinZ', {value: 1, type: 'number'});
  parameter('MaxZ', {value: 2, type: 'number'});

  // How much any one parameter can vary between updates
  parameter('MaxVariance', {value: 0.2, type: 'number'});
}

exports.initialize = function () {

  addInputHandler('ID', ID_in);

  current_id = get('ID');
  x = getParameter('MinX');
  y = getParameter('MinY');
  z = getParameter('MinZ');

  // Use the period parameter to setup the loop that generates fake
  // location data.
  setInterval(update_location, getParameter('Period')*1000);
}

function getRandomArbitrary (min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Generates a new location value and sends to output based on parameters set
function update_location () {

  var j = getParameter('MaxVariance');
  var alter = getRandomArbitrary(j/2, j);
  var neg = getRandomInt(1, 3);
  if (neg == 1) {
    alter *= -1;
  }

  // Choose which axis to change on this iteration
  var whichone = getRandomInt(0, 3);

  if (whichone == 0) {
    // ALTER X
    var new_x = x + alter;
    if (new_x < getParameter('MinX')) new_x = getParameter('MinX');
    if (new_x > getParameter('MaxX')) new_x = getParameter('MaxX');
    x = new_x;
  
  } else if (whichone == 1) {
    // ALTER Y
    var new_y = y + alter;
    if (new_y < getParameter('MinY')) new_y = getParameter('MinY');
    if (new_y > getParameter('MaxY')) new_y = getParameter('MaxY');
    y = new_y;

  } else if (whichone == 2) {
    // ALTER Z
    var new_z = z + alter;
    if (new_z < getParameter('MinZ')) new_z = getParameter('MinZ');
    if (new_z > getParameter('MaxZ')) new_z = getParameter('MaxZ');
    z = new_z;

  }

  var loc = {
    id: current_id,
    X: x,
    Y: y,
    Z: z
  };

  send('Location', loc);

}


var ID_in  = function () {
  current_id = get('ID');
}

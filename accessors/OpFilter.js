// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Outputs objects that match a key,value filter.
 *
 *  @accessor OpFilter
 *
*/

// Filter params
var key;
var value;

/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  input('Input', {
  });
  output('Output', {
  });

  //
  // Parameters
  //
  // key,value pair that has to be present to have a packet meet the filter
  parameter('key', {
    type: 'string'
  });
  parameter('value', {
    type: 'string'
  });
}

exports.initialize = function () {

  addInputHandler('Input', Input_in);

  key = getParameter('key');
  value = getParameter('value');
}

var Input_in = function () {
  var i = get('Input');

  if (typeof i === 'object' && key in i && i.hasOwnProperty(key) && i[key] == value) {
    send('Output', i);
  }
}

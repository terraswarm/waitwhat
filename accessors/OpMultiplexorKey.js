// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Outputs objects that match a key,value filter.
 *
 *  @accessor OpMultiplexorKey
 *
*/

// Filter params
var key;

/** Define inputs and outputs. */
exports.setup = function () {
  //
  // I/O
  //
  input('Input');
  input('Value');

  output('Output');

  //
  // Parameters
  //
  // key,value pair that has to be present to have a packet meet the filter
  parameter('key', {
    type: 'string'
  });
}

exports.initialize = function () {
  addInputHandler('Input', Input_in);
  key = getParameter('key');
}

var Input_in = function () {
  var i = get('Input');
  var v = get('Value');

  console.log(i);

  if (typeof i === 'object' && key in i && i.hasOwnProperty(key) && i[key] == v) {
    send('Output', i);
  }
}

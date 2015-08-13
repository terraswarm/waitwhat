// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Strips out a certain key's value from an object as a string.
 *
 *  @accessor OpStripString
 *
*/

// Filter params
var key;

/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  input('Input');
  output('Output', {
    type: 'string'
  });

  //
  // Parameters
  //
  // key to extract the value from
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

  if (typeof i === 'object' && key in i && i.hasOwnProperty(key)) {
    send('Output', ''+i[key]);
  }
}

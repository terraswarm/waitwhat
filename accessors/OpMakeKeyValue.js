// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Make a value into a key,value pair.
 *
 *
 *  @accessor OpmakeKeyValue
 *
*/

var key;

/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  input('Input');
  output('Output');

  parameter('Key', {
    type: 'string'
  });
}

exports.initialize = function () {
  key = getParameter('Key');

  addInputHandler('Input', Input_In);
}

var Input_In = function () {
  var i = get('Input');
  var out = {};
  out[key] = i;

  send('Output', out);
}

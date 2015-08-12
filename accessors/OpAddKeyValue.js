// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Add a key value pair to the input 
 *
 *
 *  @accessor OpAddKeyValue
 *
*/

var key;
var val;


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
  parameter('Value', {
    type: 'string'
  });
}

exports.initialize = function () {
  key = getParameter('Key');
  val = getParameter('Value');

  addInputHandler('Input', Input_In);
}

var Input_In = function () {
  var i = get('Input');

  i[key] = val;
  send('Output', i);
}

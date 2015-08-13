// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Output a constant key,value pair.
 *
 *
 *  @accessor ConstantKeyValue
 *
*/

var out = {};


/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  output('kv');

  parameter('Period', {
    type: 'number',
    value: 1
  });
  parameter('Key', {
    type: 'string'
  });
  parameter('Value', {
    type: 'string'
  });
}

exports.initialize = function () {
  out[getParameter('Key')] = getParameter('Value');

  setInterval(function () {
    send('kv', out);
  }, getParameter('Period')*1000);
}

// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Switching Network
 *
 * Takes in control assignments in the form of {input: key_value,
 *                                              output: output_index}
 * and maps inputs to outputs
 *
 *  @accessor OpSwitching
 *
*/

var key;

var matrix = {};


/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  input('Input');

  input('Select');

  output('Output0');
  output('Output1');
  output('Output2');
  output('Output3');
  output('Output4');
  output('Output5');

  parameter('Key', {
    type: 'string',
    value: 'id'
  });
}

exports.initialize = function () {
  key = getParameter('Key');

  addInputHandler('Select', Select_in);
  addInputHandler('Input', Input_in);
}

var Select_in = function () {
  var s = get('Select');

  var i = s['input'];
  var o = s['output'];

  if (typeof o == 'number' && o <= 5 && o >= 0) {
    matrix[i] = 'Output' + o;
  } else {
    matrix[i] = null;
  }
}

var Input_in = function () {
  var i = get('Input');

  if (typeof i === 'object' && key in i && i.hasOwnProperty(key)) {
    var val = i[key];
    if (val in matrix && matrix.hasOwnProperty(val)) {
      var out = matrix[val];
      if (out != null) {
        send(out, i);
      }
    }
  }
}


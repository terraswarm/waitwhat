// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Switching Network
 *
 * Takes in control assignments in the form of {input: key_value,
 *                                              output: output_index,
 *                                              type: add|remove}
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

  var t = s['type'];
  var i = s['input'];
  var o = 'Output' + s['output'];

  if (!(i in matrix && matrix.hasOwnProperty(i))) {
    // Create the array if it doesn't exist
    matrix[i] = [];
  }

  if (t == 'remove') {
    // Get rid of this connection
    var destarr = matrix[i];
    var index = destarr.indexOf(o);
    if (index > -1) {
        destarr.splice(index, 1);
    }
  
  } else if (t == 'add') {
    // New connection!
    var destarr = matrix[i];
    var index = destarr.indexOf(o);
    if (index == -1) {
      // Not already there, so let's add it
      destarr.push(o);
    }
  }

  console.log(matrix);
  
}

var Input_in = function () {
  var i = get('Input');

  if (typeof i === 'object' && key in i && i.hasOwnProperty(key)) {
    var val = i[key];
    if (val in matrix && matrix.hasOwnProperty(val)) {
      var out = matrix[val];
      // Send to all connected outputs
      for (var j=0; j<out.length; j++) {
        send(out[j], i);
      }
    }
  }
}


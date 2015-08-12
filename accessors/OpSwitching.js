// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Switching Network
 *
 * Takes in control assignments in the form of {input: input_index,
 *                                              output: output_index}
 * and maps inputs to outputs
 *
 *  @accessor OpSwitching
 *
*/


var matrix = {
  '0': null,
  '1': null,
  '2': null,
  '3': null,
  '4': null,
  '5': null
};


/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  input('Input0');
  input('Input1');
  input('Input2');
  input('Input3');
  input('Input4');
  input('Input5');

  input('Select');

  output('Output0');
  output('Output1');
  output('Output2');
  output('Output3');
  output('Output4');
  output('Output5');
}

exports.initialize = function () {

  addInputHandler('Select', Select_in);

  addInputHandler('Input0', I0);
  addInputHandler('Input1', I1);
  addInputHandler('Input2', I2);
  addInputHandler('Input3', I3);
  addInputHandler('Input4', I4);
  addInputHandler('Input5', I5);
}

var Select_in = function () {
  var s = get('Select');

  var i = s['input'];
  var o = s['output'];

  if (o == null) {
    matrix[''+i] = null;
  } else {
    matrix[''+i] = 'Output' + o;
  }
}

function switch_input (val, index) {
  if (matrix[index] != null) {
    send(matrix[index], val);
  }
}

var I0 = function () { switch_input(get('Input0'), '0'); }
var I1 = function () { switch_input(get('Input0'), '0'); }
var I2 = function () { switch_input(get('Input0'), '0'); }
var I3 = function () { switch_input(get('Input0'), '0'); }
var I4 = function () { switch_input(get('Input0'), '0'); }
var I5 = function () { switch_input(get('Input0'), '0'); }

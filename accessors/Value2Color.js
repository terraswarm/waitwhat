// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Take a value in a range and make it a hue, saturation color.
 *
 *
 *  @accessor Value2Color
 *
*/

/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  input('Value');
  output('Hue');
  output('Saturation');

  parameter('ValueMax', {
    type: 'number'
  });
  parameter('HueScale', {
    type: 'number'
  });
  parameter('SaturationScale', {
    type: 'number'
  });
}

exports.initialize = function () {
  addInputHandler('Value', Value_In);
}

var Value_In = function () {
  var v = parseFloat(get('Value'));
  var max = getParameter('ValueMax');
  if (v == max) {
    // no divide by zero
    v = max - 1;
  }


  var hue = Math.floor((max-v) * 120 / max);  // go from green to red
  var saturation = Math.abs(v - (max/2))/(max/2);

  var h = hue * getParameter('HueScale');
  var s = saturation * getParameter('SaturationScale');

  send('Hue', h);
  send('Saturation', s);
}

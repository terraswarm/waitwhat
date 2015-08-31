// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Take a value in [0,100] and make it a hue, saturation color.
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
  output('Hue', {
    type: 'number'
  });
  output('Saturation', {
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


// Fade from green to red
var Value_In = function () {
  var val = parseFloat(get('Value'));

  var hu = Math.floor((val/100) * 120)/360;
  var sa = Math.abs(val - 50)/50;

  var h = Math.round(hu * (getParameter('HueScale')/1));
  var s = Math.round(sa * getParameter('SaturationScale'));

  // hack, set saturation to 255, works a little better
  s = 255;

  if (h == 0) h = 1;
  if (s == 0) s = 1;

  send('Hue', h);
  send('Saturation', s);
}






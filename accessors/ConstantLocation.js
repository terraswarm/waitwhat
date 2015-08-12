// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Output a constant location.
 *
 *
 *  @accessor ConstantLocation
 *
*/

var pose = {
  X: 0,
  Y: 0,
  Z: 0.0
};


/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  output('pose');

  parameter('Period', {
    type: 'number',
    value: 1
  });
  parameter('X', {
    type: 'number',
    value: 0
  });
  parameter('Y', {
    type: 'number',
    value: 0
  });
}

exports.initialize = function () {
  pose.X = getParameter('X');
  pose.Y = getParameter('Y');

  setInterval(function () {
    send('pose', pose);
  }, getParameter('Period')*1000);
}

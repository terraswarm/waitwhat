// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Shifts X,Y,Z coordinates
 *
 *  @accessor CoordinateLinearTransform
 *
*/

var shifts = {
  X: 0,
  Y: 0,
  Z: 0
};

/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  input('Input', {
  });
  output('Output', {
  });

  //
  // Parameters
  //
  parameter('Xshift', {
    type: 'number',
    value: 0
  });
  parameter('Yshift', {
    type: 'number',
    value: 0
  });
  parameter('Zshift', {
    type: 'number',
    value: 0
  });
}

exports.initialize = function () {

  addInputHandler('Input', Input_in);

  shifts.X = getParameter('Xshift');
  shifts.Y = getParameter('Yshift');
  shifts.Z = getParameter('Zshift');
}

var Input_in = function () {
  var v = get('Input');

  var axes = ['X', 'Y', 'Z'];
  for (i=0; i<axes.length; i++) {
    var axis = axes[i];

    if (typeof v === 'object' && axis in v && v.hasOwnProperty(axis)) {
      v[axis] += shifts[axis];
    }
  }

  send('Output', v);
}

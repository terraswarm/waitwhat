// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Create a PoseStamped ROS message from an X,Y,Z coordinate.
 *
 *  @accessor GoalMessage
 *
*/

/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  input('Input', {
  });
  output('Output', {
  });
}

exports.initialize = function () {
  addInputHandler('Input', Input_in);
}

var Input_in = function () {
  var v = get('Input');

  var x = v.X || 0; 
  var y = v.Y || 0; 
  var z = v.Z || 0; 

  out = {
    'position': {
      'x': x,
      'y': y,
      'z': 0.0},
    'orientation': {
      'x': 0.0,
      'y': 0.0,
      'z': 0.0,
      'w': 1.0}
     }

  send('Output', out);
}

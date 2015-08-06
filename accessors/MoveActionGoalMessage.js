// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Create a MoveActionGoal ROS message from an X,Y,Z coordinate.
 *
 *  @accessor MoveActionGoalMessage
 *
*/

var seq = 0;

/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  input('Input', {
    type: 'JSON'
  });
  output('Output', {
    type: 'JSON'
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
    'header': {
      'seq': seq,
      'stamp': {
        'secs': 0,
        'nsecs': 0
      },
      'frame_id': 'map_hokuyo'
    },
    'goal_id': {
      'id': 'hi' + seq,
      'stamp': {
        'secs': 0,
        'nsecs': 0
      }
    },
    'goal': {
      'stop': false,
      'target_poses': [{
        'pose': {
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
          }
       ]
    }
  }

  seq++;

  send('Output', out);
}

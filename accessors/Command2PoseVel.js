// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Create a ROS message from an X,Y,Z coordinate.
 *
 *  @accessor Command2PoseVel
 *
*/

// Set default
var last_location = {
  position: {
    x: 0,
    y: 0,
    z: 0
  },
  orientation: {
    x: 0,
    y: 0,
    z: 0,
    w: 1
  }
};

// Variables for spin
var timer = null;
var currently_spinning;

/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  // Input command of what the robot should do.
  //  {
  //    command: Go|Spin
  //    X: Y: Z:   // only if Go command
  //  }
  input('Command');

  // Current location of the robot
  input('Location');

  // Direct the robot
  output('Pose');

  // Raw access
  output('CmdVel');
}

exports.initialize = function () {
  addInputHandler('Command', Command_in);
  addInputHandler('Location', Location_in);
}

// var QUANTERION_THIRD = {
//   x: 0,
//   y: 0,
//   z: 0.894427191,
//   w: 0.4472135955
// };

// function multiply_quanterions (q1, q2) {
//   ret = {
//     x:  q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x,
//     y: -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y,
//     z:  q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z,
//     w: -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w
//   }
//   return ret;
// }

// function normalize_quaternion (q) {
//   var n = Math.sqrt(q.x*q.x + q.y*q.y + q.z*q.z + q.w*q.w);
//   var ret = {
//     x: q.x/n,
//     y: q.y/n,
//     z: q.z/n,
//     w: q.w/n,
//   }
//   return ret;
// }


var Command_in = function () {
  // Now parse the incoming command
  var cmd = get('Command');

  if (cmd.command == 'Go') {

    // Upon new command we need to stop any internal timers
    if (timer != null) {
      clearTimeout(timer);
    }

    // Send the robot to the given location
  
    var x = cmd.X || 0; 
    var y = cmd.Y || 0; 
    var z = cmd.Z || 0; 

    out = {
      'position': {
        'x': x,
        'y': y,
        'z': 0.0
      },
      'orientation': last_location.orientation
    }
    send('Pose', out);

  } else if (cmd.command == 'Spin') {
    if (!currently_spinning) {
      // Start by stopping the current action by sending a location to go to
      // that happens to be the same position it is at.
      send('Pose', last_location);

      // Now power the wheels to spin
      var spin_vel = {
        linear: {
          x: 0,
          y: 0,
          z: 0
        },
        angular: {
          x: 0,
          y: 0,
          z: 0.7
        }
      };

      send('CmdVel', spin_vel);
      currently_spinning  = true;

      // Now stop the spin at some point
      timer = setTimeout(function () {
        var spin_no = {
          linear: {
            x: 0,
            y: 0,
            z: 0
          },
          angular: {
            x: 0,
            y: 0,
            z: 0
          }
        };

        send('CmdVel', spin_no);
        currently_spinning = false;
        timer = null;
      }, 2000);
    }
    
  }
}

// Save the last location
var Location_in = function () {
  last_location = get('Location');
}

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

  // How long to let the robot spin
  parameter('SpinDuration', {
    type: 'number'
  });
}

exports.initialize = function () {
  addInputHandler('Command', Command_in);
  addInputHandler('Location', Location_in);
}

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
          z: 1.0
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
      }, getParameter('SpinDuration')*1000);
    }
    
  }
}

// Save the last location
var Location_in = function () {
  last_location = get('Location');
}

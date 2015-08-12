// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Create a MoveActionGoal ROS message from an X,Y,Z coordinate.
 *
 *  @accessor MoveActionGoalMessage
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
var steps;
var last_location_spin;

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
}

exports.initialize = function () {
  addInputHandler('Command', Command_in);
  addInputHandler('Location', Location_in);
}

var QUANTERION_THIRD = {
  x: 0,
  y: 0,
  z: 0.894427191,
  w: 0.4472135955
};

function multiply_quanterions (q1, q2) {
  ret = {
    x:  q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x,
    y: -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y,
    z:  q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z,
    w: -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w
  }
  return ret;
}

function normalize_quaternion (q) {
  var n = Math.sqrt(q.x*q.x + q.y*q.y + q.z*q.z + q.w*q.w);
  var ret = {
    x: q.x/n,
    y: q.y/n,
    z: q.z/n,
    w: q.w/n,
  }
  return ret;
}


var Command_in = function () {
  // Upon new command we need to stop any internal timers
  if (timer != null) {
    clearInterval(timer);
    // workaround incase this doesnt work
    steps = 100;
    timer = null;
  }

  // Now parse the incoming command
  var cmd = get('Command');

  if (cmd.command == 'Go') {
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
    // Start the spin
    steps = 0;

    function set_orientation () {
      if (steps == 0) {
        // Save where we are at the start
        last_location_spin = last_location;
      }

      if (steps < 6) {
        // Rotate by 1/3 of a circle
        var rotated = multiply_quanterions(last_location_spin.orientation, QUANTERION_THIRD);
        rotated = normalize_quaternion(rotated);
        last_location_spin.orientation = rotated;

        send('Pose', last_location_spin);
      }

      steps++;
      if (steps >= 24) {
        clearInterval(timer);
      }
    }

    if (timer == null) {
      timer = setInterval(set_orientation, 5000);
      set_orientation();
    }
    
  }
}

// Save the last location
var Location_in = function () {
  last_location = get('Location');
}

// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** RoboCafe Controller
 *
 *  @accessor RoboCafeController
 *
*/


var NUM_ROBOTS = 3;

// STATES
var STATE_IDLE = 'IDLE'; // Robot is currently just sitting there.
var STATE_SERVING = 'SERVING'; // Robot has been requested and is going servering a person.

// MAPPING OF ITEM TO ROBOT NUM
var ITEMS = {
  Twix: 0,
  SquirtGun: 1,
  BouncyBalls: 2
}

// Array of robot structs
var robots = [];




/** Define inputs and outputs. */
exports.setup = function () {
  //
  // I/O
  //
  input('UserChoice');

  output('SelectPhoneRobot');
  output('RobotStatus');



  //
  // Parameters
  //
  // key,value pair that has to be present to have a packet meet the filter
  // parameter('key', {
  //   type: 'string'
  // });
}

exports.initialize = function () {

  // Initialize all robots
  for (var i=0; i<NUM_ROBOTS; i++) {
    var robot = {};
    robot.state = STATE_IDLE;
    robots[i] = robot;

    // Output initial status
    update_status(i, STATE_IDLE);
  }

  addInputHandler('UserChoice', Choice_in);
}

function set_source_and_robot (phone_id, robot_index, operation) {
  var out = {
    type: operation,
    input: phone_id,
    output: robot_index
  }
  send('SelectPhoneRobot', out);
}

function update_status (robot_index, state) {
  send('RobotStatus', {
    robotid: robot_index,
    status: state
  });
}


var Choice_in = function () {
  var ws_payload = get('UserChoice');

  console.log('got choice');
  console.log(ws_payload);

  // Check if this is a normal message from a client or a status message
  if ('message' in ws_payload) {
    var msg = ws_payload.message;

    // Get the unique identifier for what sent this packet
    var phone_id = msg.phone_id;

    // Do some common operations for choice selections, cancellations,
    // and done events
    if (msg.type == 'selection' ||
        msg.type == 'cancelled' ||
        msg.type == 'finished') {

      // What item/candy the user asked for
      var selection = msg.selection;

      // Now that we know what the user wants, figure out if we can satisfy
      // the request
      if (selection in ITEMS) {
        // Get the robot struct of the one that has what we are looking for
        var rbt_idx = ITEMS[selection];
        console.log('Got robot index: '+rbt_idx + ' for ' + selection);
        var rbt = robots[rbt_idx];


        // Now do what we want if this is a new selection
        if (msg.type == 'selection') {
          // We have a robot, check its state
          if (rbt.state == STATE_IDLE) {
            // Ok great!
            // Put this one into service
            rbt.state = STATE_SERVING;
            // Keep track of which user this robot is attached to
            rbt.servicing = phone_id;
            // And send the robot to the person
            set_source_and_robot(phone_id, rbt_idx, 'add');
            // And update output status
            update_status(rbt_idx, STATE_SERVING);
          }
        

        } else if (msg.type == 'cancelled' || msg.type == 'finished') {
          // We no longer need this robot to go to this person, send it
          // back home

          // Check that the correct robot was helping this person
          if (rbt.state == STATE_SERVING && rbt.servicing == phone_id) {
            // This checks out. Stop the robot from what it was doing
            // and send it home.
            rbt.state = STATE_IDLE;
            rbt.servicing = null;
            set_source_and_robot(phone_id, rbt_idx, 'remove');
            // Send the robot home.
            set_source_and_robot('Home', rbt_idx, 'add');
            // And in a couple seconds, stop telling it to go home
            setTimeout(function () {
              set_source_and_robot('Home', rbt_idx, 'remove');
            }, 3000);
            // And update output status
            update_status(rbt_idx, STATE_IDLE);
          }

        }


      } else {
        console.log('Could not find a robot that matched item ' + selection);
      }

    }

  }

}

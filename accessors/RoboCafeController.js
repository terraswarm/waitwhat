// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** RoboCafe Controller
 *
 *  @accessor RoboCafeController
 *
*/


var NUM_ROBOTS = 3;

// STATES
var STATE_IDLE = 0; // Robot is currently just sitting there.
var STATE_SERVING = 1; // Robot has been requested and is going servering a person.

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
  }




  addInputHandler('UserChoice', Choice_in);
}

function select_source_and_robot (phone_id, robot_index) {
  var out = {
    input: phone_id,
    output: robot_index
  }
  send('SelectPhoneRobot', out);
}


var Choice_in = function () {
  var ws_payload = get('UserChoice');

  console.log('got choice');
  console.log(ws_payload);

  // Check if this is a normal message from a client or a status message
  if ('message' in ws_payload) {
    var msg = ws_payload.message;

    var phone_id = msg.phone_id;

    // Check what type of message this is
    if (msg.type == 'selection') {
      console.log('GOT SELE')
      // Got a "GET ME A SNACK" message      
      var selection = msg.selection;

      // Now that we know what the user wants, figure out if we can satisfy
      // the request
      if (selection in ITEMS) {
        // Get the robot struct of the one that has what we are looking for
        var rbt_idx = ITEMS[selection];
        console.log(rbt_idx)
        var rbt = robots[rbt_idx];

        // Check its state
        if (rbt.state == STATE_IDLE) {
          // Ok great!
          // Put this one into service
          rbt.state = STATE_SERVING;
          // Keep track of which user this robot is attached to
          rbt.servicing = phone_id;
          // And send the robot to the person
          select_source_and_robot(phone_id, rbt_idx);
        }
      }

    } else if (msg.type == 'finished') {
      console.log("GOT FINI")
      // Got a "CANCEL" or "I GOT MY ITEM" message

      // Look up which robot was helping this user
      for (var i=0; i<NUM_ROBOTS; i++) {
        var rbt = robots[i];
        if (rbt.servicing == phone_id) {
          // got it
          rbt.state = STATE_IDLE;
          rbt.servicing = null;
          select_source_and_robot(phone_id, null);
        }
      }
    }
  }

}

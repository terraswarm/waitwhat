// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** RoboCafe Controller
 *
 *  @accessor RoboCafeController
 *
*/


var NUM_ROBOTS = 4;

// STATES
var STATE_IDLE = 'IDLE';         // Robot is currently just sitting there.
var STATE_SERVING = 'SERVING';   // Robot has been requested and is going to a person.
var STATE_SPINNING = 'SPINNING'; // Applause was detected and the robot is interrupted to spin.

// MAPPING OF ITEM TO ROBOTS and the queue for that item
var ITEMS = {
  Twix:        {
    robots: [0, 3],
    queue: []
  },
  SquirtGun:   {
    robots: [1],
    queue: []
  },
  BouncyBalls: {
    robots: [2],
    queue: []
  }
}

// Array of robot structs with state on each one.
var robots = [];


/** Define inputs and outputs. */
exports.setup = function () {
  //
  // I/O
  //
  input('UserChoice');
  input('Applause');

  output('SelectPhoneRobot');
  output('RobotStatus');
  output('AppState');

  //
  // Parameters
  //
  // Which robot to make spin.
  parameter('SpinRobotIndex', {
    type: 'number',
    value: 0
  });
  // Number of seconds the robot will spin for.
  parameter('SpinRobotDuration', {
    type: 'number',
    value: 5
  });
}

exports.initialize = function () {

  // Initialize all robots
  for (var i=0; i<NUM_ROBOTS; i++) {
    var robot = {};
    robot.state = STATE_IDLE;
    robot.servicing = null;
    robots[i] = robot;

    // Output initial status
    update_status(i, STATE_IDLE);
  }

  addInputHandler('UserChoice', Choice_in);
  addInputHandler('Applause', Applause_in);

  // in case more than one request is received before a 'spin','cancelled' or
  // 'finished' event, the second request ends up in the queue until the next
  // event. To avoid this, poll queues and process events if robots are free.
  setInterval(process_queue, 1000);
}


// Effectively connect an incoming location stream to a robot's
// /goal topic.
// operation is whether to connect ('add') or disconnect ('remove')
// the connection between the phone and robot.
function set_source_and_robot (phone_id, robot_index, operation) {
  var out = {
    type: operation,
    input: phone_id,
    output: robot_index
  }
  send('SelectPhoneRobot', out);
}

// Publish on the status output a robot's state change
function update_status (robot_index, state) {
  robots[robot_index].state = state;
  send('RobotStatus', {
    robotid: robot_index,
    status: state
  });
}

// Tell all listeners what's going on in the controller.
function publish_state () {
  send('AppState', {robots: robots, items: ITEMS});
}

function process_queue () {

  // Iterate over items, and in turn each robot
  for (var item in ITEMS) {
    var item_obj = ITEMS[item];

    // Each robot for the item
    for (var i=0; i<item_obj.robots.length; i++) {
      var rbt_idx = item_obj.robots[i];
      var rbt = robots[rbt_idx];

      // Our options are to send this robot to someone in the queue,
      // leave it alone, or send it home.
      if (rbt.state != STATE_IDLE) {
        // Robot is busy, leave it alone
        console.log('Robot ' + rbt_idx + ' is busy. Queue len: ' + item_obj.queue.length);

      } else {
        // Robot is idle.
        if (item_obj.queue.length > 0) {
          // Aha! Someone is waiting for this item, and this robot is idle.
          // Send it!
          var next_phone = item_obj.queue.shift();
          rbt.state = STATE_SERVING;
          // Keep track of which user this robot is attached to
          rbt.servicing = next_phone;
          // And send the robot to the person
          set_source_and_robot(next_phone, rbt_idx, 'add');
          // And update output status
          update_status(rbt_idx, STATE_SERVING);
          publish_state();

        } else {
          // This robot is idle and no one wants anything from it.
          // Make sure it is going home. It's entirely possible this line
          // of code gets called multiple times. This is OK as the switch
          // handles that.
          set_source_and_robot('Home'+rbt_idx, rbt_idx, 'add');
        }
      }
    }
  }
}

var Choice_in = function () {
  var ws_payload = get('UserChoice');

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

        // We know what this is. If the user wants it we add them to the queue
        // and we'll process the queue to dispatch a robot.
        if (msg.type == 'selection') {
          // Add the request to the queue for that item, if the user is not
          // already in the queue.
          if (ITEMS[selection].queue.indexOf(phone_id) == -1) {
            ITEMS[selection].queue.push(phone_id);
            publish_state();
          }

        } else if (msg.type == 'cancelled' || msg.type == 'finished') {
          // User got the item or doesn't want it

          // Get the list of robots that may have been navigating to the user
          var robot_indexes = ITEMS[selection].robots;

          // Iterate each robot, checking to see if it was heading for that
          // user. If so, stop the robot from doing that.
          for (var i=0; i<robot_indexes.length; i++) {
            var rbt_idx = robot_indexes[i];
            var rbt = robots[rbt_idx];

            // Check if this robot was helping this person
            if (rbt.state == STATE_SERVING && rbt.servicing == phone_id) {
              // This checks out. Stop the robot from what it was doing
              // and send it home.
              set_source_and_robot(phone_id, rbt_idx, 'remove');
              update_status(rbt_idx, STATE_IDLE);
              rbt.servicing = null;
              publish_state();
            }
          }

          // Now check that this user wasn't queued for a robot with that
          // item. If it was, remove it.
          var item_queue = ITEMS[selection].queue;
          if (item_queue.indexOf(phone_id) > -1) {
            item_queue.splice(item_queue.indexOf(phone_id), 1);
          }
        }

        // And take care of our queues to see if we should dispatch robots
        // anywhere.
        process_queue();

      } else {
        console.log('Could not find a robot that matched item ' + selection);
      }

    }

  } else {
    console.log('Not a valid web socket message');
  }

}

var Applause_in = function () {
  var a = get('Applause');

  if (a == 'no_applause') {
    // ignore

  } else if (a == 'some_applause') {
    // Make one robot spin

    var robot_index = parseInt(getParameter('SpinRobotIndex'));
    var robot = robots[robot_index];

    //unset the service status.
    // var old_servicing = robot.servicing;

    // Robot is busy with spinning!
    update_status(robot_index, STATE_SPINNING);

    if (robot.servicing != null) {
      console.log("Will queue " + robot.servicing + " to be processed later.");
      // Find which item this robot is carrying, and add this user to that
      // queue.
      for (var item in ITEMS) {
        if (ITEMS[item].robots.indexOf(robot_index) != -1) {
          ITEMS[item].queue.unshift(robot.servicing);
        }
      }

      // Stop what ever was controlling the robot before
      set_source_and_robot(robot.servicing, robot_index, 'remove');

      // Clear this
      robot.servicing = null;
    }

    // Make it spin
    set_source_and_robot('Spin', robot_index, 'add');

    // After the spin is done, put it back
    setTimeout(function () {
      // Stop the spin command
      set_source_and_robot('Spin', robot_index, 'remove');

      // Go idle for now
      update_status(robot_index, STATE_IDLE);

      // Keep all of the update logic in one place. Since we added the previous
      // user to the front of the queue we can just use that to reconfigure the
      // robot.
      process_queue();
    }, getParameter('SpinRobotDuration') * 1000);


  }
}

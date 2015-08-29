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
var STATE_SPINNING = 'SPINNING';

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
  input('Applause');

  output('SelectPhoneRobot');
  output('RobotStatus');
  output('AppState');

  //
  // Parameters
  //
  parameter('SpinRobotIndex', {
    type: 'number',
    value: 0
  });
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
    robot.queue = [];
    robots[i] = robot;

    // Output initial status
    update_status(i, STATE_IDLE);
  }

  addInputHandler('UserChoice', Choice_in);
  addInputHandler('Applause', Applause_in);

  // in case more than one request is received before a 'spin','cancelled' or
  // 'finished' event, the second request ends up in the queue until the next
  // event. To avoid this, poll queues and process events if robots are free.
  setInterval(function() {
    for (var i=0; i<NUM_ROBOTS; i++) {
    if (robots[i].state == STATE_IDLE) {
      process_from_queue(i);
      // check if there are more events. if not, send the robot home 
    }
  }
  }, 1000);
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

function queue_request (robot_index, phone_id, priorityIndex) {
  // We may want to queue
  rbt = robots[robot_index]; 
  if ((rbt.servicing == null || rbt.servicing != phone_id) && rbt.queue.indexOf(phone_id) == -1) {
    console.log("Queueing phone with id: " + phone_id);

    // if no priority has been specified, this is a reqular queueing event
    // if it is not null, however, means that the specified phone has been
    // interrupted by a spin, so put it at the top of the queue.
    if (priorityIndex == null) {
      // Robot not free, queue this request
      rbt.queue.push(phone_id);
    } else {
      rbt.queue.unshift(phone_id); 
    }
    return true;
  } else { 
    console.log("Could not queue " + phone_id  + ". Robot Servicing= " + rbt.servicing + 
    " Queue Contents: " + rbt.queue.toString()) ;
  }
  
  return false;
}

function process_from_queue(robot_index) {
  rbt = robots[robot_index];
  if (rbt.queue.length > 0 && rbt.state == STATE_IDLE) { 
    var next_phone = rbt.queue.shift();
    // Ok great!
    // Put this one into service
    rbt.state = STATE_SERVING;
    // Keep track of which user this robot is attached to
    rbt.servicing = next_phone;
    // And send the robot to the person
    set_source_and_robot(next_phone, robot_index, 'add');
    // And update output status
    update_status(robot_index, STATE_SERVING);
    publish_state();
    console.log("Processing event from the queue with id: " + next_phone);
    return true;
  }
  return false; 
}

// Tell all listeners what's going on in the controller.
function publish_state () {
  send('AppState', robots);
}

var Choice_in = function () {
  var ws_payload = get('UserChoice');

  //console.log('got choice');
  //console.log('ws_payload);

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
        console.log('Got robot index: '+rbt_idx + ' for ' + selection + ' on phone ' + phone_id);
        var rbt = robots[rbt_idx];

        // Now do what we want if this is a new selection
        if (msg.type == 'selection') {
          // We have a robot, check its state
          if (rbt.state == STATE_IDLE) {
            console.log("Robot " + rbt_idx + " was free, processing request");
            // Ok great!
            // Put this one into service
            rbt.state = STATE_SERVING;
            // Keep track of which user this robot is attached to
            rbt.servicing = phone_id;
            // And send the robot to the person
            set_source_and_robot(phone_id, rbt_idx, 'add');
            // And update output status
            update_status(rbt_idx, STATE_SERVING);
            publish_state();
          } else {
            // request to queue this request to be processed later
            queue_request(rbt_idx, phone_id, null);
          }
        

        } else if (msg.type == 'cancelled' || msg.type == 'finished') {
          // We no longer need this robot to go to this person, send it
          // back home

          // Check that the correct robot was helping this person
          if (rbt.state == STATE_SERVING && rbt.servicing == phone_id) {
            // This checks out. Stop the robot from what it was doing
            // and send it home.
            set_source_and_robot(phone_id, rbt_idx, 'remove');
            rbt.state = STATE_IDLE;
            update_status(rbt_idx, STATE_IDLE);
            publish_state();
            rbt.servicing = null;
            // if no more events to be processed, send robot home.
            if (rbt.queue.length == 0 && rbt.state == STATE_IDLE) { 
                // go back home 
                // Send the robot home.
                set_source_and_robot('Home'+rbt_idx, rbt_idx, 'add');  
            }
            
          } else {
            // Check if this phone is in queue and remove it
            if (rbt.queue.indexOf(phone_id) > -1) {
              rbt.queue.splice(rbt.queue.indexOf(phone_id), 1);
            }
          } 
        }


      } else {
        console.log('Could not find a robot that matched item ' + selection);
      }

    }

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
    var old_servicing = robot.servicing;
    

    // Robot is busy with spinning!
    robot.state = STATE_SPINNING;
    update_status(robot_index, STATE_SPINNING);

    if (old_servicing != null) { 
      console.log("Will queue " + old_servicing + " to be processed later.");
      robot.servicing = null;
      // queue the previous request to be processed later,
      // but  this should be the first thing to be processed since it was 
      // preempted by the spin so we add it to the top of the queue
      queue_request (robot_index, old_servicing, 0); 
      // Stop what ever was controlling the robot before
      set_source_and_robot(old_servicing, robot_index, 'remove');
    }

    // Make it spin
    set_source_and_robot('Spin', robot_index, 'add');

    // After the spin is done, put it back
    setTimeout(function () {
      set_source_and_robot('Spin', robot_index, 'remove');
      // if (old_servicing != null) {
      //   // Re setup what ever was controlling the robot before
      //   set_source_and_robot(old_servicing, robot_index, 'add');
      // }

      robot.state = STATE_IDLE;
      update_status(robot_index, robot.state);

      // robot is idle now, try to process from queue
      process_from_queue(robot_index);
      // if there are no more events to be processed for this robot, send it home.
      // otherwise, the poll will take care of the remaining events soon.
      if (robot.queue.length == 0 
        && robot.state == STATE_IDLE) { 
        // go back home 
        // Send the robot home.
        set_source_and_robot('Home'+robot_index, robot_index, 'add');  
      }
    }, getParameter('SpinRobotDuration') * 1000);

   

  }
}

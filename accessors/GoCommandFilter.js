// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Filter location updates that are close to each other
 *
 *
 *  @accessor GoCommandFilter
 *
*/

var thresh;

var last_sent_cmd = null;

/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  input('CommandIn');
  output('CommandOut');

  parameter('Threshold', {
    type: 'number'
  });
}

exports.initialize = function () {
  thresh = getParameter('Threshold');

  addInputHandler('CommandIn', CommandIn_In);
}

function dist (x1, y1, x2, y2) {
  var dx = x2-x1;
  var dy = y2-y1;
  return Math.sqrt(dx*dx + dy*dy);
}

var CommandIn_In = function () {
  var c = get('CommandIn');

  if (c.command == 'Go') {
    // We only care about filtering "Go" packets

    if (last_sent_cmd == null) {
      // Got first packet
      last_sent_cmd = c;
      send('CommandOut', c);
    
    } else {

      // See if this is too close to the last point we sent.
      // If it is, don't send it, otherwise do.
      var old_x = last_sent_cmd.X;
      var old_y = last_sent_cmd.Y;
      var new_x = c.X;
      var new_y = c.Y;

      var d = dist(old_x, old_y, new_x, new_y);

      if (d > thresh) {
        // Actually send this point
        last_sent_cmd = c;
        send('CommandOut', c);
      }

    }

  } else {
    // We just forward all other commands
    send('CommandOut', c);
  }

}


// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Filter location updates that are close to each other
 *
 *
 *  @accessor PoseFilter
 *
*/

var thresh;

var last_sent_pose = null;

/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  input('PoseIn');
  output('PoseOut');

  parameter('Threshold', {
    type: 'number'
  });
}

exports.initialize = function () {
  thresh = getParameter('Threshold');

  addInputHandler('PoseIn', PoseIn_In);
}

function dist (x1, y1, x2, y2) {
  var dx = x2-x1;
  var dy = y2-y1;
  return Math.sqrt(dx*dx + dy*dy);
}

var PoseIn_In = function () {
  var p = get('PoseIn');

  if (last_sent_pose == null) {
    // Got first packet
    last_sent_pose = p;
    send('PoseOut', p);
  
  } else {

    // See if this is too close to the last point we sent.
    // If it is, don't send it, otherwise do.
    var old_x = last_sent_pose.position.x;
    var old_y = last_sent_pose.position.y;
    var new_x = p.position.x;
    var new_y = p.position.y;

    var d = dist(old_x, old_y, new_x, new_y);

    if (d > thresh) {
      // Actually send this point
      last_sent_pose = p;
      send('PoseOut', p);
    }

  }

}


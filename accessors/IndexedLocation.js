// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Output a location given an index
 *
 *
 *  @accessor IndexedLocation
 *
*/

var pose = {
  X: 0,
  Y: 0,
  Z: 0.0
};

var locations = [
  [10, 10],
  [10, 20],
  [20, 20],
];

var currentIndex = 0;

/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  output('pose');

  parameter('SendPosePeriod', {
    type: 'number',
    value: 1
  });

  parameter('NewLocationPeriod', {
    type: 'number',
    value: 20
  });

  parameter('InitialPositionIndex', {
    type: 'number',
    value: 0
  });

  parameter('ReverseDirection', {
    type: 'boolean',
    value: false
  });
}

exports.initialize = function () {
  currentIndex = getParameter('InitialPositionIndex');

  setInterval(function () {
    sendPoseHandler();
  }, getParameter('SendPosePeriod')*1000);
  setInterval(function () {
    newLocationHandler();
  }, getParameter('NewLocationPeriod')*1000);
}

var newLocationHandler = function() {
  if (getParameter('ReverseDirection')) {
    currentIndex -= 1;
  } else {
    currentIndex += 1;
  }
  currentIndex = currentIndex % locations.length;
}

var triggerHandler = function() {
  pose.X = locations[currentIndex][0];
  pose.Y = locations[currentIndex][1];
  send('pose', pose);
}

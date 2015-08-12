// Copyright (c) 2014-2015 The Regents of the University of Michigan

/** Create a Command from a location. Make a Go command.
 *
 *  @accessor Location2Command
 *
*/


/** Define inputs and outputs. */
exports.setup = function() {
  //
  // I/O
  //
  input('Location');
  output('Command');
}

exports.initialize = function () {
  addInputHandler('Location', Location_in);
}

// Add command
var Location_in = function () {
  var l = get('Location');
  l.command = 'Go';
  send('Command', l);
}

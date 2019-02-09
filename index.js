/*
 * Copyright reelyActive 2018-2019
 * We believe in an open Internet of Things
 */

'use strict';

const tessel = require('tessel');
const dgram = require('dgram');
const Barnowl = require('barnowl');
const BarnowlReel = require('barnowl-reel');
const BarnowlTcpdump = require('barnowl-tcpdump');
const config = require('./config');

// Load the configuration parameters
const raddecTargets = config.raddecTargets;
const barnowlOptions = {
    enableMixing: config.enableMixing
};
const raddecOptions = {
    includeTimestamp: config.includeTimestamp,
    includePackets: config.includePackets
};

const REEL_BAUD_RATE = 230400;

// Create a UDP client
let client = dgram.createSocket('udp4');

// Create barnowl instance with the configuration options
let barnowl = new Barnowl(barnowlOptions);

// Have barnowl listen for reel data, if selected in configuration
if(config.listenToReel) {
  let uart = new tessel.port['A'].UART({ baudrate: REEL_BAUD_RATE });
  barnowl.addListener(BarnowlReel, {}, BarnowlReel.EventListener,
                      { path: uart });
}

// Have barnowl listen for tcpdump data, if selected in configuration
if(config.listenToTcpdump) {
  barnowl.addListener(BarnowlTcpdump, {}, BarnowlTcpdump.SpawnListener, {});
}

// Forward the raddec to each target while pulsing the green LED
barnowl.on('raddec', function(raddec) {
  tessel.led[2].on();
  raddecTargets.forEach(function(target) {
    forward(raddec, target);
  });
  tessel.led[2].off();
});

// Blue LED continuously toggles to indicate program is running
setInterval(function() { tessel.led[3].toggle(); }, 500);


/**
 * Forward the given raddec to the given target, observing the target protocol.
 * @param {Raddec} raddec The outbound raddec.
 * @param {Object} target The target host, port and protocol.
 */
function forward(raddec, target) {
  switch(target.protocol) {
    case 'udp':
      let raddecHex = raddec.encodeAsHexString(raddecOptions);
      client.send(new Buffer(raddecHex, 'hex'), target.port, target.host,
                  function(err) { });
      break;
  }
}

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

// Listen on UART (Port A) for reel data events
let uart = new tessel.port['A'].UART({ baudrate: REEL_BAUD_RATE });

// Configure barnowl to listen for both reel and tcpdump
let barnowl = new Barnowl(barnowlOptions);
barnowl.addListener(BarnowlReel, {}, BarnowlReel.EventListener,
                    { path: uart });
barnowl.addListener(BarnowlTcpdump, {}, BarnowlTcpdump.SpawnListener, {});

// Forward the raddec via UDP and pulse the green LED
barnowl.on('raddec', function(raddec) {
  tessel.led[2].on();
  let raddecHex = raddec.encodeAsHexString(raddecOptions);
  client.send(new Buffer(raddecHex, 'hex'), config.targetPort,
              config.targetAddress, function(err) { });
  tessel.led[2].off();
});

// Blue LED continuously toggles to indicate program is running
setInterval(function() { tessel.led[3].toggle(); }, 500);

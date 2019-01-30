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
const uartListener = require('./uartListener');

const raddecOptions = {
    includePackets: true,
    includeTimestamp: true
};

// Create a UDP client
let client = dgram.createSocket('udp4');

// Listen on UART (Port A) and generate events from the data stream
let uart = new uartListener('A');

// Configure barnowl to listen for both reel and tcpdump
let barnowl = new Barnowl({ enableMixing: true });
barnowl.addListener(BarnowlReel, {}, BarnowlReel.EventListener,
                    { path: uart });
barnowl.addListener(BarnowlTcpdump, {}, BarnowlTcpdump.SpawnListener, {});

// Forward the raddec via UDP
barnowl.on('raddec', function(raddec) {
  let raddecHex = raddec.encodeAsHexString(raddecOptions);
  client.send(new Buffer(raddecHex, 'hex'), config.targetPort,
              config.targetAddress, function(err) { });
});

// Blue LED continuously toggles to indicate program is running
setInterval(function() { tessel.led[3].toggle(); }, 500);

/*
 * Copyright reelyActive 2018
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

// Create a UDP client
let client = dgram.createSocket('udp4');

// Listen on UART (Port A) and generate events from the data stream
let uart = new uartListener('A');

let barnowl = new Barnowl({ enableMixing: false });

// Configure barnowl to listen for both reel and tcpdump
barnowl.addListener(BarnowlReel, {}, BarnowlReel.EventListener,
                    { path: uart });
barnowl.addListener(BarnowlTcpdump, {}, BarnowlTcpdump.SpawnListener, {});

// Forward the raddec via UDP
barnowl.on('raddec', function(raddec) {
  client.send(new Buffer(raddec.encodeAsHexString(), 'hex'), config.targetPort,
              config.targetAddress, function(err) {
    if(err) {
      console.log('UDP forwarding error', err);
    }
  });
});

// Blue LED continuously toggles to indicate program is running
setInterval(function() { tessel.led[3].toggle(); }, 500);

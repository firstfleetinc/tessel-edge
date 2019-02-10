/*
 * Copyright reelyActive 2018-2019
 * We believe in an open Internet of Things
 */

'use strict';

const tessel = require('tessel');
const dgram = require('dgram');
const http = require('http');
const https = require('https');
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

// Constants
const REEL_BAUD_RATE = 230400;
const DEFAULT_RADDEC_PATH = '/raddecs';

// Create a UDP client
let client = dgram.createSocket('udp4');

// Create HTTP and HTTPS agents for webhooks
let httpAgent = new http.Agent({ keepAlive: true });
let httpsAgent = new https.Agent({ keepAlive: true });

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
    case 'webhook':
      target.options = target.options || {};
      let raddecString = JSON.stringify(raddec);
      let options = {
          hostname: target.host,
          port: target.port,
          path: target.options.path || DEFAULT_RADDEC_PATH,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': raddecString.length
          }
      };
      let req;
      if(target.options.useHttps) {
        options.agent = httpsAgent;
        req = https.request(options, function(res) { });
      }
      else {
        options.agent = httpAgent;
        req = http.request(options, function(res) { });
      }
      req.on('error', function(err) {
        tessel.led[0].on();
        tessel.led[0].off();
      });
      req.write(raddecString);
      req.end();
      break;
  }
}

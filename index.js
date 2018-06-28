/*
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */

'use strict';

const tessel = require('tessel');
const dgram = require('dgram');
const reelay = require('reelay');
const config = require('./config');
const uartListener = require('./uartListener');
const wifiMonitor = require('./wifiMonitor');

// Create a UDP client
var client = dgram.createSocket('udp4');

// Listen on UART (Port A) and generate events from the data stream
var uart = new uartListener('A');

// Enable the relay
var relay = new reelay();
relay.addListener( { protocol: 'event', path: uart, enableMixing: false } );
relay.addForwarder({
  protocol: 'udp',
  port: config.targetPort,
  address: config.targetAddress,
  maxPayloadBytes: config.maxPayloadBytes,
  maxDelayMilliseconds: config.maxDelayMilliseconds
});

// Listen on WiFi and generate events from the data stream
var wifi = new wifiMonitor();

// Forward the raddec via UDP -> TODO: move port/address to config
wifi.on('raddec', function(packet) {
  client.send(packet, 50001, '127.0.0.1', function(err) {
    if(err) {
      console.log('UDP forwarding error', err);
    }
  });
});

// Blue LED continuously toggles to indicate program is running
setInterval(function() { tessel.led[3].toggle(); }, 500);

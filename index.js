/*
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */

'use strict';

const tessel = require('tessel');
const config = require('./config');
const uartListener = require('./uartListener');
const wifiMonitor = require('./wifiMonitor');

// Listen on UART (Port A) and generate events from the data stream
var uart = new uartListener('A');

// Listen on WiFi and generate events from the data stream
var wifi = new wifiMonitor();

uart.on('data', function(data, origin) {
  console.log(origin, data);
});

wifi.on('data', function(rssi, mac) {
  console.log(mac, rssi);
});

// Blue LED continuously toggles to indicate program is running
setInterval(function() { tessel.led[3].toggle(); }, 500);

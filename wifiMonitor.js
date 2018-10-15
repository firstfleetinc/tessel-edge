/*
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */

const tessel = require('tessel');
const util = require('util');
const events = require('events');
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;
const raddec = require('raddec');
const config = require('./config');


/**
 * WiFiMonitor Class
 * Listens for WiFi probe requests and emits the included data
 * @constructor
 * @extends {events.EventEmitter}
 */
function WiFiMonitor(port) {
  var self = this;
  var tcpdump;

  enableMonitor(function() {
    tcpdump = spawn('tcpdump', ['-i', 'mon0', '-elt', '-s', '0', 'type',
                                'mgt', 'subtype', 'probe-req']);

    tcpdump.stdout.setEncoding('utf8');
    tcpdump.stdout.on('data', function(data) {
      handleData(self, data);
    });
    tcpdump.on('close', handleClose);
  });

}
util.inherits(WiFiMonitor, events.EventEmitter);


function enableMonitor(callback) {
  spawnSync('iw', ['phy', 'phy0', 'interface', 'add', 'mon0', 'type',
                   'monitor']);
  spawnSync('ifconfig', ['mon0', 'up']);
  return callback();
}


function handleData(instance, data) {
  var rssiSuffixIndex = data.indexOf('dB signal');
  var macPrefixIndex = data.indexOf('SA:');
  if((rssiSuffixIndex >= 0) && (macPrefixIndex >= 0)) {
    var transmitter = {
      type: raddec.identifiers.TYPE_EUI48,
      id: data.substr(macPrefixIndex + 3, 17)
    };
    var receiver = {
      type: raddec.identifiers.TYPE_EUI48,
      id: config.wifiMacAddress,
      rssi: data.substr(rssiSuffixIndex - 3, 3)
    };
    tessel.led[2].on();
    instance.emit('raddec', raddec.encode(transmitter, [ receiver ]));
    tessel.led[2].off();
  }
}


function handleClose() {
  process.exit(1);
}


module.exports = WiFiMonitor;

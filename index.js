/*
 * Copyright reelyActive 2018-2020
 * We believe in an open Internet of Things
 */

'use strict';

const tessel = require('tessel');
const dgram = require('dgram');
const http = require('http');
const https = require('https');
const dns = require('dns');
const Barnowl = require('barnowl');
const BarnowlReel = require('barnowl-reel');
const BarnowlTcpdump = require('barnowl-tcpdump');
const DirActDigester = require('diract-digester');
const Raddec = require('raddec');
const { Client } = require('@elastic/elasticsearch');
const config = require('./config');

// Load the configuration parameters
const raddecTargets = config.raddecTargets;
const barnowlOptions = {
    enableMixing: config.enableMixing,
    mixingDelayMilliseconds: config.mixingDelayMilliseconds
};
const raddecOptions = {
    includeTimestamp: config.includeTimestamp,
    includePackets: config.includePackets
};
const useElasticsearch = (config.esNode !== null);
const useDigester = config.esWriteDirActProximity || config.esWriteDirActDigest;
let digesterOptions = {};
if(config.esWriteDirActProximity) {
  digesterOptions.handleDirActProximity = handleDirActProximity;
};
if(config.esWriteDirActDigest) {
  digesterOptions.handleDirActDigest = handleDirActDigest;
};

// Constants
const REEL_BAUD_RATE = 230400;
const DEFAULT_RADDEC_PATH = '/raddecs';
const INVALID_DNS_UPDATE_MILLISECONDS = 2000;
const STANDARD_DNS_UPDATE_MILLISECONDS = 60000;
const REEL_DECODING_OPTIONS = {
    maxReelLength: 1,
    minPacketLength: 8,
    maxPacketLength: 39
};
const ES_RADDEC_INDEX = 'raddec';
const ES_DIRACT_PROXIMITY_INDEX = 'diract-proximity';
const ES_DIRACT_DIGEST_INDEX = 'diract-digest';
const ES_MAPPING_TYPE = '_doc';

// Update DNS
updateDNS();

// Create a UDP client
let client = dgram.createSocket('udp4');
client.on('listening', function() {
  client.setBroadcast(config.isUdpBroadcast);
});

// Create HTTP and HTTPS agents for webhooks
let httpAgent = new http.Agent({ keepAlive: true });
let httpsAgent = new https.Agent({ keepAlive: true });

// Create Elasticsearch client
let esClient;
if(useElasticsearch) {
  esClient = new Client({ node: config.esNode });
}

// Create diract digester
let digester = new DirActDigester(digesterOptions);

// Create barnowl instance with the configuration options
let barnowl = new Barnowl(barnowlOptions);

// Have barnowl listen for reel data, if selected in configuration
if(config.listenToReel) {
  let uart = new tessel.port['A'].UART({ baudrate: REEL_BAUD_RATE });
  barnowl.addListener(BarnowlReel, {}, BarnowlReel.EventListener,
                      { path: uart, decodingOptions: REEL_DECODING_OPTIONS });
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
  if(useDigester) {
    digester.handleRaddec(raddec);
  }
  if(useElasticsearch && config.esWriteRaddec) {
    let id = raddec.timestamp + '-' + raddec.transmitterId + '-' +
             raddec.transmitterIdType;
    let esRaddec = raddec.toFlattened(raddecOptions);
    esRaddec.timestamp = new Date(esRaddec.timestamp).toISOString();
    let params = {
        index: ES_RADDEC_INDEX,
        type: ES_MAPPING_TYPE,
        id: id,
        body: esRaddec
    };
    esCreate(params);
  }
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
      if(target.isValidAddress) {
        let raddecHex = raddec.encodeAsHexString(raddecOptions);
        client.send(new Buffer(raddecHex, 'hex'), target.port, target.address,
                    function(err) { });
      }
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


/**
 * Create an entry in Elasticsearch.
 * @param {Object} params The parameters.
 */
function esCreate(params) {
  esClient.create(params, {}, function(err, result) {
    if(err) {
      tessel.led[0].on();
      tessel.led[0].off();
    }
  });
}


/**
 * Handle a DirAct proximity packet by writing to Elasticsearch.
 * @param {Object} proximity The DirAct proximity data.
 */
function handleDirActProximity(proximity) {
  // TODO: webhook

  if(useElasticsearch && config.esWriteDirActProximity) {
    let id = proximity.timestamp + '-' + proximity.instanceId;
    proximity.timestamp = new Date(proximity.timestamp).toISOString();
    let params = {
        index: ES_DIRACT_PROXIMITY_INDEX,
        type: ES_MAPPING_TYPE,
        id: id,
        body: proximity
    };
    esCreate(params);
  }
}


/**
 * Handle a DirAct digest packet by writing to Elasticsearch.
 * @param {Object} digest The DirAct digest data.
 */
function handleDirActDigest(digest) {
  // TODO: webhook

  if(useElasticsearch && config.esWriteDirActDigest) {
    let id = digest.timestamp + '-' + digest.instanceId;
    digest.timestamp = new Date(digest.timestamp).toISOString();
    let params = {
        index: ES_DIRACT_DIGEST_INDEX,
        type: ES_MAPPING_TYPE,
        id: id,
        body: digest
    };
    esCreate(params);
  }
}


/**
 * Perform a DNS lookup on all hostnames where the UDP protocol is used,
 * and self-set a timeout to repeat the process again.
 */
function updateDNS() {
  let nextUpdateMilliseconds = STANDARD_DNS_UPDATE_MILLISECONDS;

  // If there are invalid UDP addresses, shorten the update period
  raddecTargets.forEach(function(target) {
    if((target.protocol === 'udp') && !target.isValidAddress) {
      nextUpdateMilliseconds = INVALID_DNS_UPDATE_MILLISECONDS;
    }
  });

  // Perform a DNS lookup on each UDP target
  raddecTargets.forEach(function(target) {
    if(target.protocol === 'udp') {
      dns.lookup(target.host, {}, function(err, address, family) {
        if(err) {
          tessel.led[0].on();
          tessel.led[0].off();
          target.isValidAddress = false;
        }
        else {
          target.address = address;
          target.isValidAddress = true;
        }
      });
    }
  });

  // Schedule the next DNS update
  setTimeout(updateDNS, nextUpdateMilliseconds);
}

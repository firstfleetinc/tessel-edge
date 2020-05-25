/*
 * Copyright reelyActive 2018-2020
 * We believe in an open Internet of Things
 */


const Raddec = require('raddec');


// Begin configurable parameters
// -----------------------------

const RADDEC_TARGETS = [
    { protocol: "udp", host: "192.168.1.255", port: "50001" }
];
const DIRACT_PROXIMITY_TARGETS = [
];
const DIRACT_DIGEST_TARGETS = [
];
const ES_NODE = null;            // Example: 'http://192.168.1.10:9200'
const IS_UDP_BROADCAST = true;
const LISTEN_TO_REEL = true;
const LISTEN_TO_TCPDUMP = false;
const ENABLE_MIXING = true;
const MIXING_DELAY_MILLISECONDS = 1000;
const RADDEC_FILTER_PARAMETERS = {
    minRSSI: -90
};
const INCLUDE_TIMESTAMP = true;
const INCLUDE_PACKETS = false;
const IS_DEBUG_MODE = false;

// ---------------------------
// End configurable parameters


module.exports.raddecTargets = RADDEC_TARGETS;
module.exports.diractProximityTargets = DIRACT_PROXIMITY_TARGETS;
module.exports.diractDigestTargets = DIRACT_DIGEST_TARGETS;
module.exports.esNode = ES_NODE;
module.exports.isUdpBroadcast = IS_UDP_BROADCAST;
module.exports.listenToReel = LISTEN_TO_REEL;
module.exports.listenToTcpdump = LISTEN_TO_TCPDUMP;
module.exports.enableMixing = ENABLE_MIXING;
module.exports.mixingDelayMilliseconds = MIXING_DELAY_MILLISECONDS;
module.exports.raddecFilterParameters = RADDEC_FILTER_PARAMETERS;
module.exports.includeTimestamp = INCLUDE_TIMESTAMP;
module.exports.includePackets = INCLUDE_PACKETS;
module.exports.isDebugMode = IS_DEBUG_MODE;

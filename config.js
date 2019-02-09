/*
 * Copyright reelyActive 2018-2019
 * We believe in an open Internet of Things
 */


// Begin configurable parameters
// -----------------------------

const RADDEC_TARGETS = [
    { host: "192.168.0.100", port: "50001", protocol: "udp" }
];
const LISTEN_TO_REEL = true;
const LISTEN_TO_TCPDUMP = false;
const ENABLE_MIXING = true;
const INCLUDE_TIMESTAMP = true;
const INCLUDE_PACKETS = true;

// ---------------------------
// End configurable parameters


module.exports.raddecTargets = RADDEC_TARGETS;
module.exports.listenToReel = LISTEN_TO_REEL;
module.exports.listenToTcpdump = LISTEN_TO_TCPDUMP;
module.exports.enableMixing = ENABLE_MIXING;
module.exports.includeTimestamp = INCLUDE_TIMESTAMP;
module.exports.includePackets = INCLUDE_PACKETS;

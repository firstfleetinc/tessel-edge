/*
 * Copyright reelyActive 2018-2019
 * We believe in an open Internet of Things
 */


// Begin configurable parameters
// -----------------------------

const TARGET_ADDRESS = '192.168.0.100';
const TARGET_PORT = 50001;
const ENABLE_MIXING = true;
const INCLUDE_TIMESTAMP = true;
const INCLUDE_PACKETS = true;

// ---------------------------
// End configurable parameters


module.exports.targetAddress = TARGET_ADDRESS;
module.exports.targetPort = TARGET_PORT;
module.exports.enableMixing = ENABLE_MIXING;
module.exports.includeTimestamp = INCLUDE_TIMESTAMP;
module.exports.includePackets = INCLUDE_PACKETS;

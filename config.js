/*
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */


// Begin configurable parameters
// -----------------------------

const TARGET_ADDRESS = '192.168.0.100';
const TARGET_PORT = 50001;
const MAX_PAYLOAD_BYTES = 508;
const MAX_DELAY_MILLISECONDS = 500;

// ---------------------------
// End configurable parameters


module.exports.targetAddress = TARGET_ADDRESS;
module.exports.targetPort = TARGET_PORT;
module.exports.maxPayloadBytes = MAX_PAYLOAD_BYTES;
module.exports.maxDelayMilliseconds = MAX_DELAY_MILLISECONDS;

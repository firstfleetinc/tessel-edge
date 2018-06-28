/*
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */


// Begin configurable parameters
// -----------------------------

const WIFI_MAC_ADDRESS = '02:a3:51:62:27:b1';
const TARGET_ADDRESS = 'pareto.reelyactive.com';
const TARGET_PORT = 50000;
const MAX_PAYLOAD_BYTES = 508;
const MAX_DELAY_MILLISECONDS = 500;

// ---------------------------
// End configurable parameters


module.exports.wifiMacAddress = WIFI_MAC_ADDRESS;
module.exports.targetAddress = TARGET_ADDRESS;
module.exports.targetPort = TARGET_PORT;
module.exports.maxPayloadBytes = MAX_PAYLOAD_BYTES;
module.exports.maxDelayMilliseconds = MAX_DELAY_MILLISECONDS;

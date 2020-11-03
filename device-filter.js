'use strict';

/**
 * Class used to help filter ble and rfid devices
 */
class DeviceFilter {
    constructor(parameters) {
        if(parameters.hasOwnProperty('uuidFilter') && Array.isArray(parameters.uuidFilter)) {
            this.uuidFilter = parameters.uuidFilter;
        }
    }

    /**
     * Returns whether or not a device uuid filter has been set
     * @return {boolean} Does the device filter have a uuid filter
     */
    get hasUuidFilter() {
        return this.hasOwnProperty('uuidFilter')
    }

    /**
     * Returns true if the raddec passes all set filters, and false if it does not
     * @param raddec {Object} The raddec to test
     * @return {boolean} Whether it passes all the test
     */
    isPassing(raddec) {
       return !(this.hasUuidFilter && !testUuidInFilter(this, raddec));
    }
}

/**
 * Test if the raddec packet hex string contains a uuid that matches one of the uuid filters
 * @param instance {Object} Reference to the DeviceFilter instance
 * @param raddec {Object} The raddec we need to test
 * @return {boolean} Whether or not it matches the uuid's we are filtering for
 */
function testUuidInFilter(instance, raddec) {
    // Array of uuid's we want to match on
   let uuidFilter = instance.uuidFilter;

   // For each one, see if we have a match
   for(let x = 0; x < uuidFilter.length; x++) {
       // We found a match, break the loop and return true
       if (raddec.packets[0].indexOf(uuidFilter[x]) !== -1) {
           return true
       }
   }

   // No matches, return false
   return false;
}


module.exports = DeviceFilter;

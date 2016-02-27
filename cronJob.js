var express = require('express');
var router  = express.Router();

var request = require('request');


var databaseEntryUnlocked = true;

// Begin the job
function startJob () {
    // Implemented to make sure that the data isnt being saved and checked at the same time

    var CronJob = require('cron').CronJob;
    new CronJob('*/4 * * * * *', // Runs every 4 seconds
        actualJob, // Function for CRON Job
        null, // Function to be run after the CronJob ends
        true, // Start the job right now
        'America/Los_Angeles'
    );
}
module.exports.start = startJob;

// Code to be run
function actualJob () {
    console.log('Job wake up (4 seconds)');
    console.log('unlocked: ', databaseEntryUnlocked);

    if (databaseEntryUnlocked) {
        // Query to the RingCentralAPI to see if there are any new messages

        // Lock when you enter
        databaseEntryUnlocked = false;

        // Gather all of our users

        // Make request to RingCental
        var options = {
          url: 'http://www.SheldonTrotman.com'/*,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
          } */
        };

        request(options, handleRingCentralResponse);

    } else {
        // Still adding old data so do nothing
    }

}

// After a call is made determine what to do
function handleRingCentralResponse (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) // Print the body of response.
    }

    // Everything is done so unlock
    databaseEntryUnlocked = true;
}
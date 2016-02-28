var express = require('express');
var router  = express.Router();

var request = require('request');


var databaseEntryUnlocked = true;
var tokenTimeDelta = 0;
var tokenData = {};

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
    // Deduct how much time has passed
    tokenTimeDelta -= 5;

    if (databaseEntryUnlocked) {
        // Query to the RingCentralAPI to see if there are any new messages

        // Lock when you enter
        databaseEntryUnlocked = false;

        var options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }            
        };

        if (tokenTimeDelta <= 0) {
            // Requeest a new token from RingCentral
            options['url'] = 'https://platform.devtest.ringcentral.com/restapi/oauth/token';
            options['body'] = 'grant_type=password&password=1landlineOnlineOrNoLine&username=+16618789015';

            options.headers['Authorization'] = 'Basic V2R5YUc0OHZRRVN3eXR1VWROaXlnZzpLbjZvbURNalN3cVZaLS1CWlhNUGVBa1hsQm1qSWlRcldyOW1MWlMxRlpNdw==';
            request.post(options, handleTokenRefresh);

        } else {

            // Gather all of our users

            // Make request to RingCental

            options['url'] = 'https://platform.devtest.ringcentral.com/restapi/v1.0/account/~/extension/~/message-store';
console.log(tokenData);
            options.headers['Authorization'] = 'Bearer ' + tokenData.access_token;

            request(options, handleRingCentralResponse);
        }


    } else {
        // Still adding old data so do nothing
    }

}

// Periodically a new token will have to be generated
function handleTokenRefresh (error, response, body) {
    console.log("---------- ---------- ----------");
    console.log("< + > Token Refresh");
    if (!error && response.statusCode == 200) {
        console.log(body);

        tokenTimeDelta = body.expires_in;
        tokenData = body;

    } else {
        console.log("---> CRON ERROR:");
        console.log(error);
    }

    // Everything is done so unlock
    databaseEntryUnlocked = true;
}

// After a call is made determine what to do
function handleRingCentralResponse (error, response, body) {
    console.log("---------- ---------- ----------");
    console.log("< ~ > RingCentral Response");

    if (!error && response.statusCode == 200) {
        console.log(body);

    } else {
        console.log("---> CRON ERROR:");
        console.log(error);
        console.log();
        console.log(response);
        console.log();
        console.log(body);
        console.log();
    }

    // Everything is done so unlock
    databaseEntryUnlocked = true;
}
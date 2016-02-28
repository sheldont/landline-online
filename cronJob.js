var express = require('express');
var router  = express.Router();

var request = require('request');
var bot = require('./bot');


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

        if (tokenTimeDelta <= 0) {
            // Requeest a new token from RingCentral
            var options = {
                'headers' : {
                    'Content-Type' : 'application/x-www-form-urlencoded',
                    'Authorization' : 'Basic V2R5YUc0OHZRRVN3eXR1VWROaXlnZzpLbjZvbURNalN3cVZaLS1CWlhNUGVBa1hsQm1qSWlRcldyOW1MWlMxRlpNdw=='
                },
                'url' : 'https://platform.devtest.ringcentral.com/restapi/oauth/token',
                'body' : 'grant_type=password&password=1landlineOnlineOrNoLine&username=+16618789015'
            };

            request.post(options, handleTokenRefresh);

        } else {

            // Gather all of our users

            // Make request to RingCental
            var auth_token = 'Bearer '.concat(tokenData.access_token);

            var options = {
                'headers' : {
                    'Content-Type' : 'application/json',
                    'Authorization' : auth_token
                },
                'url' : 'https://platform.devtest.ringcentral.com/restapi/v1.0/account/~/extension/~/message-store',
            };

            request(options, handleRingCentralResponse(auth_token));
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
        tokenData = JSON.parse(body);

        tokenTimeDelta = tokenData.expires_in;

        console.log(tokenData);

    } else {
        console.log("---> CRON ERROR:");
        console.log(error);
    }

    // Everything is done so unlock
    databaseEntryUnlocked = true;
}

var done = false;

// After a call is made determine what to do
function handleRingCentralResponse (authHeader) {
    return function (error, response, body) {
        var responseData = JSON.parse(body);

        if (done) {
            return;
        }

        console.log("---------- ---------- ----------");
        console.log("< ~ > RingCentral Response");

        if (!error && response.statusCode == 200) {
            console.log(responseData.records.length);

            for (var recordingIndex in responseData.records) {
                var currentRecording = responseData.records[0];
                var recordingLink = currentRecording.attachments[0].uri;
                console.log();
                console.log(recordingLink);

                done = true;
                bot.convertAndUploadToYoutube(authHeader, recordingLink, youtubeResponse);
                break;
            }

        } else {
            console.log("---> CRON ERROR:");
        }

        // Everything is done so unlock
        databaseEntryUnlocked = true;
    }
}

function youtubeResponse (error, videoUrl) {
    console.log("------");
    console.log(error);

    console.log(videoUrl);

    setTimeout(function() {
        bot.sendMessage('Here is your voicemail: ' + videoUrl, 456, function() {
            console.log('yay');
        });
    }, 10000);
}
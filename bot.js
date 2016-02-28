var Botkit = require('./lib/Botkit.js');
var os = require('os');
var youtube = require('./youtube.js');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: 'xoxb-23399239702-twKN9pCT2lJLu2o0ZhD3Sgvb'
}).startRTM();

bot.configureIncomingWebhook({url: 'https://hooks.slack.com/services/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'});

controller.hears(['hello','hi','hey'],'direct_message,direct_mention,mention',function(bot, message) {
    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.token) {
            bot.reply(message,'Hello!');
        } else {
            bot.reply(message,'Hello! If you\'d like to use my capabilities, follow the setup HERE');
        }
    });
});

controller.hears(['login (.*)'],'direct_message,direct_mention,mention',function(bot, message) {
    var matches = message.text.match(/login (.*)/i);
    var token = matches[1];

    controller.storage.users.get(message.user,function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.token = token;
        user.channel = message.channel;

        controller.storage.users.save(user, function(err, id) {
            bot.reply(message,'You\'re all set to go!');
        });
    });
});

function sendMessage(message, token, callback) {
    controller.storage.users.all(function(err, users) {
        console.log('RETRIEVED USERS');
        for (var user in users) {
            console.log(Object.keys(users[user]) + ' ' + token);
            if (users[user]['token'] == token) {
                console.log('SENDING WEBHOOK');
                bot.sendWebhook({
                    text: message,
                    channel: user.channel,
                }, function(err, res) {
                    callback(err);
                });
            }
        }
    });
}

function convertAndUploadToYoutube(authHeader, audioUrl, callback) {
  youtube.convertAudioToVideo(authHeader, audioUrl, './logo.jpg', function(error, videoPath) {
      youtube.uploadVideo({title: 'Test', from: 'Alex', date: '4/12/2003'}, '/Users/trotman/Documents/contract_dev/Landline.Online/landline-online/' + videoPath, function(error, videoId) {
          if (error) return callback(error, null);
          callback(error, 'https://youtube.com/watch?v=' + videoId);
      });
  });
}

module.exports.convertAndUploadToYoutube = convertAndUploadToYoutube;
module.exports.sendMessage = sendMessage;

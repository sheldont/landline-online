var exec = require('child_process').exec;
var request = require('request');
var fs = require('fs');
var url = require('url');

var youtubeUploader = require('youtube-uploader');

function uploadVideo(data, path, callback) {
  console.log(path);
  youtubeUploader.configure({
    accessToken: 'ya29.lgKo1TyLdJDbXbeO0hsgZy9BDNXJfI12u5ix784CFBgpZUqRxN2KSOBFAjpe-Fj7NQ',  // string
    clientId: '636090948211-p4as5v7ebp5f8julgvj6m8ihrr4hu3ac.apps.googleusercontent.com',  // string
    clientSecret: 'Ur4ym4R59aLjmx78V1Wi6a2B',  // string
    expiresIn: 3600,  // string (default: '3600')
    idToken: '',  // string
    refreshToken: '1/b19O-AWeq3vn_icOLmp2RWil9aYjdofhFSJV5rigrG8MEudVrK5jSpoR30zcRFq6',  // string
    tokenType: 'Bearer'  // string (default: 'Bearer')
  }, function (err) {
    if (err) { return console.error(err.message); }
    youtubeUploader.upload({
      path: path,  // string
      title: data.title,  // string
      description: data.description,  // string
      keywords: [],  // array of string
      category: 22,  // string (refer to https://developers.google.com/youtube/v3/docs/videoCategories/list)
      privacy: 'unlisted'  // 'public', 'private', or 'unlisted'
    }, function (err, videoId) {
      if (err) console.log('Failed to upload to Youtube: ' + err);
      //callback(err, videoId);
      fs.unlink(path, function(error) {
          if (error) console.log('Failed to delete video: ' + error);
          callback(err, videoId);
      });
    });
  });
}

function convertAudioToVideo(authHeader, audioUrl, imagePath, callback) {
    downloadAudio(authHeader, audioUrl, function(err, audioPath) {
        if (err) return callback(err);
        var cmd = 'ffmpeg -i ' + imagePath;
        cmd += ' -i ' + audioPath + ' ' + audioPath.replace('.wav', '.mov')
        console.log(cmd);
        exec(cmd, function(error, stdout, stderr) {
            console.log(error + ' ' + stdout + ' ' + stderr);
            if (error) return callback(error, null);
            console.log('Successfully created video');
            fs.unlink(audioPath, function(error) {
                if (error) console.log('Failed to delete WAV file: ' + error);
                callback(error, audioPath.replace('.wav', '.mov'));
            });
        });
    });
}

function downloadAudio(authHeader, audioUrl, callback) {
    var audioPath = url.parse(audioUrl).pathname.split('/').pop().concat('.wav');

    var options = {
        'headers' : {
            'Content-Type' : 'audio/x-wav',
            'Authorization' : authHeader
        },
        'url' : audioUrl,
    };

    request(options).pipe(fs.createWriteStream(audioPath)).on('finish', function() {
        console.log('Downloaded AUDIO');
        callback(null, audioPath);
    });
}

module.exports.convertAudioToVideo = convertAudioToVideo;
module.exports.uploadVideo = uploadVideo;

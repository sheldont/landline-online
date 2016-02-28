var exec = require('child_process').exec;
var http = require('http');
var fs = require('fs');
var url = require('url');

var youtubeUploader = require('youtube-uploader');

function uploadVideo(data, path, callback) {
  console.log(path);
  youtubeUploader.configure({
    accessToken: 'ya29.lQL1BaeL3andVRPkXUEAfUXfJzcO8tyXXMzRPoCkQZOMFYqRzyv8kgZ4W4NjpnQAEw',  // string
    clientId: '636090948211-p4as5v7ebp5f8julgvj6m8ihrr4hu3ac.apps.googleusercontent.com',  // string
    clientSecret: 'Ur4ym4R59aLjmx78V1Wi6a2B',  // string
    expiresIn: 3600,  // string (default: '3600')
    idToken: '',  // string
    refreshToken: '1/n8wK-nenuI_KAjpvmER1zDpXwbOCprA93P9ODRM0cHkMEudVrK5jSpoR30zcRFq6',  // string
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
      fs.unlink(path, function(error) {
          if (error) console.log('Failed to delete video: ' + error);
          callback(err, videoId);
      });
    });
  });
}

function convertAudioToVideo(audioUrl, imagePath, callback) {
    downloadAudio(audioUrl, function(err, audioPath) {
        if (err) return callback(err);
        var cmd = 'ffmpeg -i ' + imagePath;
        cmd += ' -i ' + audioPath + ' ' + audioPath.replace('.wav', '.mp4');
        console.log(cmd);
        exec(cmd, function(error, stdout, stderr) {
            console.log(error + ' ' + stdout + ' ' + stderr);
            if (error) return callback(error, null);
            console.log('Successfully created video');
            fs.unlink(audioPath, function(error) {
                if (error) console.log('Failed to delete WAV file: ' + error);
                callback(error, audioPath.replace('.wav', '.mp4'));
            });
        });
    });
}

function downloadAudio(audioUrl, callback) {
    var audioPath = url.parse(audioUrl).pathname.split('/').pop();
    var audio = fs.createWriteStream(audioPath);
    var audioRequest = http.get(audioUrl, function(audioResponse) {
        audioResponse.pipe(audio);
        audio.on('finish', function() {
            audio.close(callback(null, audioPath));
        });
    }).on('error', function(err) { // Handle errors
        fs.unlink(file_name);
        callback(err, null);
    });
}

module.exports.convertAudioToVideo = convertAudioToVideo;
module.exports.uploadVideo = uploadVideo;

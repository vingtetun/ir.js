'use strict';

function setupAudio(options, data, callback) {
  new ScriptableGraph(data, 1, callback);
}

function getSampleDurationInMs() {
  return options.audio.fft / 44100 * 1000;
}

function getMicrophone(callback) {
  function success(stream) {
    callback && callback(stream);
  }

  function error(error) {
    console.log(error);
  }

  navigator.getUserMedia({ audio: {
    mediaSource: 'microphone',
    echoCancellation: false,
    mozNoiseSuppression: false,
    mozAutoGainControl: false,
    googEchoCancellation: false,
    googEchoCancellation2: false,
    googAutoGainControl: false,
    googAutoGainControl2: false,
    googNoiseSuppression: false,
    googHighpassFilter: false,
    googTypingNoiseDetection: false,
    googAudioMirroring: false
  } }, success, error);
}

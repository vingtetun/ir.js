'use strict';

function Deferred() {
  this.promise = new Promise((function(resolve, reject) {
    this.resolve = resolve;
    this.reject = reject;
  }).bind(this));
}

function ScriptableGraph(datasource, level, callback) {
  let context = new AudioContext();

  let source = null;

  let type = typeof datasource === 'object' ? datasource.constructor.name : datasource;
  switch (type) {
    case 'AudioBuffer':
      source = context.createBufferSource();
      source.buffer = datasource;
      source.start();
      break;

    case 'LocalMediaStream':
      source = context.createMediaStreamSource(datasource);
      break;

    case 'Tone':
      source = context.createOscillator();
      source.frequency.type = 'sine';
      source.frequency.value = 19000;
      source.start();
      break;

    default:
      throw new Error('Unknown type: ' + type);
      break;

  }

  let volume = context.createGain();
  volume.gain.value = level;

  let scriptNode = context.createScriptProcessor(options.audio.fft, 2, 2);
  scriptNode.onaudioprocess = function(buffer) {
    let leftBuffer = new Float32Array(buffer.inputBuffer.getChannelData(0));
    let rightBuffer = new Float32Array(buffer.inputBuffer.getChannelData(1));

    callback && callback(leftBuffer, rightBuffer);
  }

  source.connect(volume);
  volume.connect(scriptNode);
  scriptNode.connect(context.destination);

  this.disconnect = function() {
    source.disconnect(0);
    volume.disconnect(0);
    scriptNode.disconnect(0);
  }
}

'use strict';

let StereoBuffer = function(name) {
  this.name = name;
  this.left = [];
  this.right = [];
};

StereoBuffer.prototype.length = function() {
  return this.left.length;
};

StereoBuffer.prototype.clear = function() {
  this.stop();
  this.source = null;
  this.left = [];
  this.right = [];
};

StereoBuffer.prototype.duration = function() {
  if (!this.left.length) {
    return 0;
  }

  return this.left.length * this.left[0].length / 44100;
};

StereoBuffer.prototype.push = function(left, right) {
  this.left.push(left);
  this.right.push(right);
};

StereoBuffer.prototype.getAsAudioBuffer = function() {
  let context = new AudioContext();

  let buffer = context.createBuffer(2, this.length() * this.left[0].length, 44100);

  // Fill in the channel data
  let leftChannel = buffer.getChannelData(0);
  let rightChannel = buffer.getChannelData(1);

  let count = 0;
  for (let i = 0; i < this.length(); i++) {
    for (let j = 0; j < this.left[0].length; j++) {
      leftChannel[count] = this.left[i][j];
      rightChannel[count] = this.right[i][j];
      count ++;
    }
  }

  return buffer;
};

StereoBuffer.prototype.play = function() {
  let context = new AudioContext();
  let source = context.createBufferSource();
  source.buffer = this.getAsAudioBuffer();
  source.loop = true;
  source.connect(context.destination);
  source.start();

  this.source = source;
};

StereoBuffer.prototype.stop = function() {
  this.source && this.source.stop();
};

StereoBuffer.prototype.save = function() {
  // Will save a PCM 16 bits. Little Indian. Stereo Channels.
  let blob = getAsWav(this.left, this.right);
  download(blob, this.name + '.wav');
};


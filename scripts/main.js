'use strict';

let pause = false;

let kDefaultDuration = 1000;

navigator.getUserMedia = (
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia
);

const options = {
  audio: {
    sampleRate: 44100,
    fft: 512,
  },

  canvas: {
    width: innerWidth,
    height: innerHeight / 8,
    duration: kDefaultDuration,
    sliceWidth: 1
  }
};

function getSamplesLength() {
  return options.canvas.duration / getSampleDurationInMs();
}

function getSliceWidth() {
  return (options.canvas.width / getSamplesLength() / options.audio.fft);
}


let sourceBuffers = new StereoBuffer('source');
let reconstructBuffers = new StereoBuffer('reconstruct');
let replayBuffers = new StereoBuffer('replay');

let animationFrame = null;

function updateCanvas(leftChannel, rightChannel) {
  if (pause) {
    return;
  }

  if (sourceBuffers.length() >= Math.floor(getSamplesLength())) {
    sourceBuffers.left.shift();
    sourceBuffers.right.shift();
  }
  sourceBuffers.push(leftChannel, rightChannel);

  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(function() { 
    drawCanvas('source', sourceBuffers, options.canvas);
  });
}

function clearBuffers() {
  sourceBuffers.clear();
  reconstructBuffers.clear();
  replayBuffers.clear();
}

let microphoneStream = null;
function start() {
  reset();

  getMicrophone(function(stream) {
    microphoneStream = stream;
    setupAudio(options.audio, stream, updateCanvas);

    options.canvas.sliceWidth = getSliceWidth();
    setupCanvas('source', options.canvas);
    setupCanvas('reconstruct', options.canvas);
    setupCanvas('replay', options.canvas);
    showCanvas('source');
  });
}

function stop() {
  microphoneStream && microphoneStream.stop && microphoneStream.stop();
  pause = true;
  cancelAnimationFrame(animationFrame);
}

function resetZoom() {
  options.canvas.duration = kDefaultDuration;
  options.canvas.sliceWidth = getSliceWidth();
  drawCanvas('source', sourceBuffers, options.canvas);
  drawCanvas('reconstruct', reconstructBuffers, options.canvas);
  drawCanvas('replay', replayBuffers, options.canvas);
}

function zoomIn() {
  options.canvas.duration /= 2;
  options.canvas.sliceWidth = getSliceWidth();
  drawCanvas('source', sourceBuffers, options.canvas);
  drawCanvas('reconstruct', reconstructBuffers, options.canvas);
  drawCanvas('replay', replayBuffers, options.canvas);
}

function zoomOut() {
  options.canvas.duration *= 2;
  options.canvas.sliceWidth = getSliceWidth();
  drawCanvas('source', sourceBuffers, options.canvas);
  drawCanvas('reconstruct', reconstructBuffers, options.canvas);
  drawCanvas('replay', replayBuffers, options.canvas);
}

function replay() {
  showCanvas('replay');
  replayBuffers.clear();

  let buffer = null;
  if (reconstructBuffers.length()) {
    buffer = reconstructBuffers;
  } else {
    buffer = sourceBuffers;
  } 

  console.log('will play for: ', buffer.duration());
  process(buffer, replayBuffers).then(() => {
    console.log('replayed...');
    drawCanvas('replay', replayBuffers, options.canvas);
  });
}

function reset() {
  pause = false;
  hideCanvas('source');
  hideCanvas('replay');
  hideCanvas('reconstruct');
  options.canvas.duration = kDefaultDuration;
  options.canvas.sliceWidth = getSliceWidth();
  clearBuffers();
  cancelAnimationFrame(animationFrame);
}

function load(target) {
  reset();

  var reader = new FileReader();
  reader.onload = function(ev) {
    let context = new AudioContext();
    let data = context.decodeAudioData(ev.target.result, function(buffer) {
      setupAudio(options.audio, buffer, updateCanvas);

      options.canvas.sliceWidth = getSliceWidth();
      setupCanvas('source', options.canvas);
      setupCanvas('reconstruct', options.canvas);
      setupCanvas('replay', options.canvas);
      showCanvas('source');

      setTimeout(stop, options.canvas.duration);
    });
  };

  reader.readAsArrayBuffer(target.files[0]);
}

function startSourceSound() {
  sourceBuffers.play();
}

function stopSourceSound() {
  sourceBuffers.stop();
}

function startReplaySound() {
  replayBuffers.play();
}

function stopReplaySound() {
  replayBuffers.stop();
}

function save() {
  sourceBuffers.save();
}

function saveReplay() {
  replayBuffers.save();
}

function rebuild() {
  showCanvas('reconstruct');
  reconstructBuffers.clear();

  console.log('will play for: ', sourceBuffers.duration());

  reconstruct(sourceBuffers, reconstructBuffers).then(() => {
    console.log('replayed...');
    drawCanvas('reconstruct', reconstructBuffers, options.canvas);
  });
}

'use strict';

const kDrawingSteps = -1;

function setupCanvas(type, options) {
  setupParticularCanvas(getCanvas(type, 0), options);
  setupParticularCanvas(getCanvas(type, 1), options);
  hideCanvas(type);
}

function drawCanvas(type, stereoBuffers, options) {
  drawParticularCanvas(getCanvas(type, 0), stereoBuffers.left, options);
  drawParticularCanvas(getCanvas(type, 1), stereoBuffers.right, options);
}

function showCanvas(type) {
  getCanvas(type, 0).hidden = false;
  getCanvas(type, 1).hidden = false;
}

function hideCanvas(type) {
  getCanvas(type, 0).hidden = true;
  getCanvas(type, 1).hidden = true;
}

function setupParticularCanvas(canvas, options) {
  canvas.setAttribute('width', options.width);
  canvas.setAttribute('height', options.height);

  let context = canvas.getContext('2d');
  context.font = '20px serif';
}

function drawParticularCanvas(canvas, buffers, options) {
  let context = canvas.getContext('2d');
  context.clearRect(0, 0, options.width, options.height);
  context.fillStyle = 'rgb(200, 200, 200)';
  context.fillRect(0, 0, options.width, options.height);

  context.lineWidth = 1;
  context.strokeStyle = 'rgb(0, 0, 0)';

  let x = 0;
  context.beginPath();
  context.moveTo(0, 0);

  for (let i = 0; i < buffers.length; i++) {
    let buffer = buffers[i];

    let steps = kDrawingSteps === -1 ? buffer.length : kDrawingSteps;
    let increment = Math.floor(buffer.length / steps);
    for (let j = 0; j < buffer.length; j += increment) {
      let y = options.height / 2;
      y = y + (buffer[j]) * y * (-1); // canvas axis is reverted

      context.lineTo(x, y);

      x += (options.sliceWidth * increment);
    }
  };

  context.stroke();
}

function getCanvas(type, number) {
  return document.getElementById(type + '-canvas-' + number);
}

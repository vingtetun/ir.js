'use strict';

function mergeBuffers(channelBuffer, recordingLength){
  let result = new Float32Array(recordingLength);
  let offset = 0;
  let lng = channelBuffer.length;
  for (let i = 0; i < lng; i++){
    let buffer = channelBuffer[i];
    result.set(buffer, offset);
    offset += buffer.length;
  }
  return result;
}

function interleave(leftChannel, rightChannel){
  let length = leftChannel.length + rightChannel.length;
  let result = new Float32Array(length);

  let inputIndex = 0;

  for (let index = 0; index < length; ){
    result[index++] = leftChannel[inputIndex];
    result[index++] = rightChannel[inputIndex];
    inputIndex++;
  }
  return result;
}

function writeUTFBytes(view, offset, string){ 
  let lng = string.length;
  for (let i = 0; i < lng; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function getAsWav(leftChannel, rightChannel) {
  let recordingLength = (leftChannel.length + rightChannel.length) * options.audio.fft;

  // we flat the left and right channels down
  let leftBuffer = mergeBuffers(leftChannel, recordingLength);
  let rightBuffer = mergeBuffers(rightChannel, recordingLength);
  // we interleave both channels together
  let interleaved = interleave(leftBuffer, rightBuffer);

  // create the buffer and view to create the .WAV file
  let buffer = new ArrayBuffer(44 + interleaved.length * 2);
  let view = new DataView(buffer);

  // write the WAV container.

  // RIFF chunk descriptor
  writeUTFBytes(view, 0, 'RIFF');
  view.setUint32(4, 44 + interleaved.length * 2, true);
  writeUTFBytes(view, 8, 'WAVE');
  // FMT sub-chunk
  writeUTFBytes(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  // stereo (2 channels)
  view.setUint16(22, 2, true);
  view.setUint32(24, options.audio.sampleRate, true);
  view.setUint32(28, options.audio.sampleRate * 4, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 16, true);
  // data sub-chunk
  writeUTFBytes(view, 36, 'data');
  view.setUint32(40, interleaved.length * 2, true);

  // write the PCM samples
  let lng = interleaved.length;
  let index = 44;
  let volume = 1;
  for (let i = 0; i < lng; i++){
    view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
    index += 2;
  }

  // our final binary blob that we can hand off
  let blob = new Blob([view], { type : 'audio/wav' });
  return blob;
}

function download(blob, filename) {
  let link = document.createElement('a');
  document.body.appendChild(link);

  let url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    link.remove();
  }, 10000);
}


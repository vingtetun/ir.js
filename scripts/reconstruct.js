'use strict';

function reconstruct(inBuffers, outBuffers) {
  let deferred = new Deferred();

  let data = inBuffers.getAsAudioBuffer();

  let scriptable = new ScriptableGraph(data, 1, function(leftBuffer, rightBuffer) {
    if (inBuffers.length() > outBuffers.length()) {
      outBuffers.push(leftBuffer, rightBuffer);
      return;
    }

    // There is enough data, let's disconnect the graph.
    scriptable.disconnect();

    let unsmooth = function(value, previousValue) {
      if (value - previousValue < 0 && value > -0.2) {
        value = previousValue;
      } else if (value < 0.2) {
        value = -0.2;
      }
      return value;
    }

    let previousValue = 0;

    for (let i = 0; i < outBuffers.length(); i++) {
      for (let j = 0; j < outBuffers.left[i].length; j++) {
        let value = unsmooth(outBuffers.left[i][j], previousValue);
        outBuffers.left[i][j] = value;
        previousValue = value;
      }
    }

    previousValue = 0;
    for (let i = 0; i < outBuffers.length(); i++) {
      for (let j = 0; j < outBuffers.right[i].length; j++) {
        let value = unsmooth(outBuffers.right[i][j], previousValue);
        outBuffers.right[i][j] = value;
        previousValue = value;
      }
    }

    deferred.resolve();
  });

  return deferred.promise;
}
